namespace ServiceBooking.Api.DTOs.Responses;

public class PagedResponseDTO<T>
{
    public List<T> Items { get; init; } = [];

    public int TotalCount { get; init; }

    public int Offset { get; init; }

    public int Limit { get; init; }

    public int TotalPages => Limit <= 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)Limit);

    public bool HasNext => Offset + Items.Count < TotalCount;

    public bool HasPrevious => Offset > 0;
}