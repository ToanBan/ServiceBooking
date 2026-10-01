namespace ServiceBooking.Api.DTOs.Responses;

using ServiceBooking.Api.Models;

public class WorkScheduleResponseDTO
{
    public int Id { get; init; }

    public int StaffId { get; init; }

    public DateOnly WorkDate { get; init; }

    public TimeOnly StartTime { get; init; }

    public TimeOnly EndTime { get; init; }

    public static WorkScheduleResponseDTO FromEntity(WorkSchedule schedule) => new()
    {
        Id = schedule.Id,
        StaffId = schedule.StaffId,
        WorkDate = schedule.WorkDate,
        StartTime = schedule.StartTime,
        EndTime = schedule.EndTime
    };
}