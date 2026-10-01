namespace ServiceBooking.Api.Exceptions;


public class AppException : Exception
{
    public int StatusCode { get; }

    public AppException(string message, int statusCode = StatusCodes.Status400BadRequest)
        : base(message)
    {
        StatusCode = statusCode;
    }

    public static AppException BadRequest(string message) =>
        new(message, StatusCodes.Status400BadRequest);

    public static AppException Unauthorized(string message) =>
        new(message, StatusCodes.Status401Unauthorized);

    public static AppException Forbidden(string message) =>
        new(message, StatusCodes.Status403Forbidden);

    public static AppException NotFound(string message) =>
        new(message, StatusCodes.Status404NotFound);

    public static AppException Conflict(string message) =>
        new(message, StatusCodes.Status409Conflict);
}
