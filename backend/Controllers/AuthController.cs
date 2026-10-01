using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ServiceBooking.Api.Controllers;

using ServiceBooking.Api.DTOs.Requests;
using ServiceBooking.Api.DTOs.Responses;
using ServiceBooking.Api.Exceptions;
using ServiceBooking.Api.Services;
using System.IdentityModel.Tokens.Jwt;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase

{
    private readonly AuthService _authService;
    private readonly JwtTokenService _jwtTokenService;

    public AuthController(AuthService authService, JwtTokenService jwtTokenService)
    {
        _authService = authService;
        _jwtTokenService = jwtTokenService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<RegisterResponseDTO>> Register(UserRegisterRequestDTO request)
    {
        var user = await _authService.RegisterUserAsync(request);

        return Ok(RegisterResponseDTO.From("Đăng ký thành công", UserResponseDTO.FromEntity(user)));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<MeResponseDTO>> Me()
    {
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub);

        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            throw AppException.Unauthorized("Token không hợp lệ");
        }

        var user = await _authService.GetUserByIdAsync(userId);
        if (user == null)
        {
            throw AppException.NotFound("Không tìm thấy người dùng");
        }

        return Ok(MeResponseDTO.FromEntity(user));
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDTO>> Login(UserLoginRequestDTO request)
    {
        var (accessToken, refreshToken, user) = await _authService.LoginAsync(request);

        _jwtTokenService.AppendAuthCookies(Response, accessToken, refreshToken);

        return Ok(LoginResponseDTO.From("Đăng nhập thành công", UserResponseDTO.FromEntity(user)));
    }


    [HttpPost("logout")]
    public async Task<ActionResult<MessageResponseDTO>> Logout()
    {
        try
        {
            var refreshToken = Request.Cookies["refreshToken"];
            var accessToken = Request.Cookies["accessToken"];

            if (!string.IsNullOrEmpty(refreshToken))
            {
                var jti = string.IsNullOrEmpty(accessToken)
                    ? null
                    : _jwtTokenService.ReadJtiFromAccessToken(accessToken);

                var remainingTime = string.IsNullOrEmpty(accessToken)
                    ? null
                    : _jwtTokenService.GetRemainingLifetime(accessToken);

                await _authService.LogoutAsync(refreshToken, remainingTime ?? TimeSpan.Zero, jti ?? string.Empty);
            }

            return Ok(MessageResponseDTO.From("Đăng xuất thành công"));
        }
        finally
        {
            _jwtTokenService.ClearAuthCookies(Response);
        }
    }


    [HttpPost("refresh-token")]
    public async Task<ActionResult<MessageResponseDTO>> RefreshToken()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshToken))
        {
            throw AppException.Unauthorized("Thiếu refresh token");
        }

        var (accessToken, newRefreshToken) = await _authService.RefreshTokenAsync(refreshToken);

        _jwtTokenService.AppendAuthCookies(Response, accessToken, newRefreshToken);

        return Ok(MessageResponseDTO.From("Làm mới token thành công"));
    }
}