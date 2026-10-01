namespace ServiceBooking.Api.Interfaces;

public interface IJwtTokenService
{
    string GenerateAccessToken(int userId, string email, string username, string role);
    string GenerateRefreshToken(int userId);

    DateTime GetRefreshTokenExpiryUtc();

    string? ReadJtiFromAccessToken(string accessToken);
    TimeSpan? GetRemainingLifetime(string accessToken);
    void AppendAuthCookies(HttpResponse response, string accessToken, string refreshToken);
    void ClearAuthCookies(HttpResponse response);
}