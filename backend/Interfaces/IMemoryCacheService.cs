namespace ServiceBooking.Api.Interfaces;

public interface IMemoryCacheService
{
    void Set<TItem>(string key, TItem value, TimeSpan expiration);
    TItem? Get<TItem>(string key);

    bool Exists(string key);
    void Remove(string key);
}
