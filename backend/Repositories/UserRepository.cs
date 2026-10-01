namespace ServiceBooking.Api.Repositories;

using ServiceBooking.Api.Exceptions;
using ServiceBooking.Api.Helpers;
using ServiceBooking.Api.Interfaces;
using ServiceBooking.Api.Data;
using ServiceBooking.Api.Models;

using Microsoft.EntityFrameworkCore;
public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User> RegisterUserAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<User?> GetUserByIdAsync(int id)
    {
        return await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<User?> FindUserByEmailAsync(string email)
    {
        return await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User?> FindUserByRefreshTokenAsync(string refreshToken)
    {
        var hash = TokenHasher.Hash(refreshToken);

        return await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.RefreshTokenHash == hash);
    }

    public async Task SetRefreshTokenAsync(int userId, string refreshToken, DateTime expiresAt)
    {
        // Không dùng AsNoTracking vì cần ghi lại entity.
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw AppException.NotFound("Không tìm thấy người dùng");

        user.RefreshTokenHash = TokenHasher.Hash(refreshToken);
        user.RefreshTokenExpiresAt = expiresAt;

        await _context.SaveChangesAsync();
    }

    public async Task ClearRefreshTokenAsync(int userId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            return;
        }

        user.RefreshTokenHash = null;
        user.RefreshTokenExpiresAt = null;

        await _context.SaveChangesAsync();
    }
}