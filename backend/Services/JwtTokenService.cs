namespace ServiceBooking.Api.Services;

using ServiceBooking.Api.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    private string AccessSecret =>
      _configuration["Authentication:AccessToken:SecretKey"] ?? "";

    private string RefreshSecret =>
        _configuration["Authentication:RefreshToken:SecretKey"] ?? "";

    private string Issuer => _configuration["Authentication:Issuer"] ?? "";
    private string Audience => _configuration["Authentication:Audience"] ?? "";

    private int AccessExpiryMinutes =>
        int.Parse(_configuration["Authentication:AccessToken:ExpirationMinutes"] ?? "15");

    private int RefreshExpiryDays =>
        int.Parse(_configuration["Authentication:RefreshToken:ExpirationDays"] ?? "7");

    public string GenerateAccessToken(int userId, string email, string username, string role)
    {
        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(AccessSecret)),
            SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(JwtRegisteredClaimNames.UniqueName, username),
            // Dùng đúng chuỗi "role" và khai báo RoleClaimType tường minh ở Program.cs,
            // vì MapInboundClaims = false sẽ không tự map ngược lại ClaimTypes.Role.
            new Claim("role", role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat,
                DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(),
                ClaimValueTypes.Integer64),
           }.ToList();


        var token = new JwtSecurityToken(
            issuer: Issuer,
            audience: Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(AccessExpiryMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }


    public string GenerateRefreshToken(int userId)
    {
        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(RefreshSecret)),
            SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: Issuer,
            audience: Audience,
            claims: claims,
            expires: GetRefreshTokenExpiryUtc(),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }


    public DateTime GetRefreshTokenExpiryUtc() => DateTime.UtcNow.AddDays(RefreshExpiryDays);


    public string? ReadJtiFromAccessToken(string accessToken)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            if (!handler.CanReadToken(accessToken))
            {
                return null;
            }

            return handler.ReadJwtToken(accessToken).Id;
        }
        catch
        {
            return null;
        }
    }

    public TimeSpan? GetRemainingLifetime(string accessToken)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            if (!handler.CanReadToken(accessToken))
            {
                return null;
            }

            var remaining = handler.ReadJwtToken(accessToken).ValidTo - DateTime.UtcNow;
            return remaining > TimeSpan.Zero ? remaining : null;
        }
        catch
        {
            return null;
        }
    }

    public void AppendAuthCookies(HttpResponse response, string accessToken, string refreshToken)
    {
        response.Cookies.Append("accessToken", accessToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTimeOffset.UtcNow.AddMinutes(AccessExpiryMinutes)
        });

        response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTimeOffset.UtcNow.AddDays(RefreshExpiryDays)
        });
    }



    public void ClearAuthCookies(HttpResponse response)
    {
        response.Cookies.Delete("accessToken");
        response.Cookies.Delete("refreshToken");
    }
}