namespace ServiceBooking.Api.Services;

using Microsoft.Extensions.Caching.Memory;
using ServiceBooking.Api.Interfaces;

public class MemoryCacheService : IMemoryCacheService
{
    private readonly IMemoryCache _cache;

    public MemoryCacheService(IMemoryCache cache)
    {
        _cache = cache;
    }

    public void Set<TItem>(string key, TItem value, TimeSpan expiration)
    {
        if (string.IsNullOrWhiteSpace(key) || expiration <= TimeSpan.Zero)
        {
            return;
        }

        _cache.Set(key, value, new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = expiration
        });
    }

    public TItem? Get<TItem>(string key)
    {
        if (string.IsNullOrWhiteSpace(key))
        {
            return default;
        }

        return _cache.TryGetValue<TItem>(key, out var value) ? value : default;
    }

    public bool Exists(string key)
    {
        if (string.IsNullOrWhiteSpace(key))
        {
            return false;
        }

        return _cache.TryGetValue(key, out object? _);
    }

    public void Remove(string key)
    {
        if (string.IsNullOrWhiteSpace(key))
        {
            return;
        }

        _cache.Remove(key);
    }
}
