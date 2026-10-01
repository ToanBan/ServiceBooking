namespace ServiceBooking.Api.Interfaces;

using ServiceBooking.Api.Models;
public interface IUserRepository
{
    Task<User> RegisterUserAsync(User user);
    Task<User?> FindUserByEmailAsync(string email);

    Task<User?> GetUserByIdAsync(int id);

    /// <summary>Tìm user theo refresh token thô (đã hash bên trong).</summary>
    Task<User?> FindUserByRefreshTokenAsync(string refreshToken);

    /// <summary>Ghi refresh token mới cho user. Đăng nhập lại sẽ ghi đè token cũ.</summary>
    Task SetRefreshTokenAsync(int userId, string refreshToken, DateTime expiresAt);

    /// <summary>Xoá refresh token (đăng xuất) — tương đương set NULL trong DB.</summary>
    Task ClearRefreshTokenAsync(int userId);
}