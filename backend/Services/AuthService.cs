namespace ServiceBooking.Api.Services;

using ServiceBooking.Api.DTOs.Requests;
using ServiceBooking.Api.Exceptions;
using ServiceBooking.Api.Interfaces;
using ServiceBooking.Api.Models;
public class AuthService
{
    public const string LogoutCacheKeyPrefix = "auth:logout:";

    private readonly IUserRepository _userRepository;
    private readonly IMemoryCacheService _memoryCacheService;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(
        IUserRepository userRepository,
        IMemoryCacheService memoryCacheService,
        IJwtTokenService jwtTokenService)
    {
        _userRepository = userRepository;
        _memoryCacheService = memoryCacheService;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<User> RegisterUserAsync(UserRegisterRequestDTO request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var existed = await _userRepository.FindUserByEmailAsync(normalizedEmail);
        if (existed != null)
        {
            throw AppException.Conflict("Email đã tồn tại");
        }

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = normalizedEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        return await _userRepository.RegisterUserAsync(user);
    }


    public async Task<(string AccessToken, string RefreshToken, User User)> LoginAsync(UserLoginRequestDTO request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await FindUserByEmailAsync(normalizedEmail);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw AppException.Unauthorized("Email hoặc mật khẩu không chính xác");
        }

        var accessToken = _jwtTokenService.GenerateAccessToken(user.Id, user.Email, user.FullName, user.Role.ToString());
        var refreshToken = _jwtTokenService.GenerateRefreshToken(user.Id);

        await SetRefreshTokenAsync(user.Id, refreshToken);

        return (accessToken, refreshToken, user);
    }


    public async Task<(string AccessToken, string RefreshToken)> RefreshTokenAsync(string refreshToken)
    {
        // Tìm user ngay từ hash trong DB nên chỉ cần 1 truy vấn,
        // không cần gọi thêm GetUserByIdAsync như trước đây.
        var user = await _userRepository.FindUserByRefreshTokenAsync(refreshToken);

        if (user == null || user.RefreshTokenExpiresAt is null || user.RefreshTokenExpiresAt < DateTime.UtcNow)
        {
            // Token tồn tại nhưng đã hết hạn: dọn luôn để không tích tụ rác.
            if (user != null)
            {
                await _userRepository.ClearRefreshTokenAsync(user.Id);
            }

            throw AppException.Unauthorized("Refresh token không hợp lệ hoặc đã hết hạn");
        }

        var newAccessToken = _jwtTokenService.GenerateAccessToken(user.Id, user.Email, user.FullName, user.Role.ToString());
        var newRefreshToken = _jwtTokenService.GenerateRefreshToken(user.Id);

        await SetRefreshTokenAsync(user.Id, newRefreshToken);

        return (newAccessToken, newRefreshToken);
    }

    public async Task<User?> GetUserByIdAsync(int id)
    {
        return await _userRepository.GetUserByIdAsync(id);
    }

    private async Task<User?> FindUserByEmailAsync(string email)
    {
        return await _userRepository.FindUserByEmailAsync(email);
    }

    private async Task SetRefreshTokenAsync(int userId, string refreshToken)
    {
        await _userRepository.SetRefreshTokenAsync(
            userId,
            refreshToken,
            _jwtTokenService.GetRefreshTokenExpiryUtc());
    }


    public async Task LogoutAsync(string refreshToken, TimeSpan expiration, string jti)
    {
        var user = await _userRepository.FindUserByRefreshTokenAsync(refreshToken);

        if (user != null)
        {
            await _userRepository.ClearRefreshTokenAsync(user.Id);
        }

        if (expiration > TimeSpan.Zero && !string.IsNullOrEmpty(jti))
        {
            _memoryCacheService.Set($"{LogoutCacheKeyPrefix}{jti}", true, expiration);
        }
    }
}