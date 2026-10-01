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
        return Ok(await _authService.RegisterUserAsync(request));
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

        return Ok(await _authService.GetMeAsync(userId));
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDTO>> Login(UserLoginRequestDTO request)
    {
        var (accessToken, refreshToken, response) = await _authService.LoginAsync(request);

        _jwtTokenService.AppendAuthCookies(Response, accessToken, refreshToken);

        return Ok(response);
    }


    [HttpPost("logout")]
    public async Task<ActionResult<MessageResponseDTO>> Logout()
    {
        try
        {
            var refreshToken = Request.Cookies["refreshToken"];
            var accessToken = Request.Cookies["accessToken"];

            var jti = string.IsNullOrEmpty(accessToken)
                ? null
                : _jwtTokenService.ReadJtiFromAccessToken(accessToken);

            var remainingTime = string.IsNullOrEmpty(accessToken)
                ? null
                : _jwtTokenService.GetRemainingLifetime(accessToken);

            var response = await _authService.LogoutAsync(
                refreshToken,
                remainingTime ?? TimeSpan.Zero,
                jti ?? string.Empty);

            return Ok(response);
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

        var (accessToken, newRefreshToken, response) = await _authService.RefreshTokenAsync(refreshToken);

        _jwtTokenService.AppendAuthCookies(Response, accessToken, newRefreshToken);

        return Ok(response);
    }
}