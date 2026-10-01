namespace ServiceBooking.Api.Interfaces;

using ServiceBooking.Api.Models;
public interface IUserRepository
{
    Task<User> RegisterUserAsync(User user);
    Task<User?> FindUserByEmailAsync(string email);

    Task<User?> GetUserByIdAsync(int id);

    Task<User?> FindUserByRefreshTokenAsync(string refreshToken);

    Task SetRefreshTokenAsync(int userId, string refreshToken, DateTime expiresAt);

    Task ClearRefreshTokenAsync(int userId);
}