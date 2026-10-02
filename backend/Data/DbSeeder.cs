using Microsoft.EntityFrameworkCore;
using ServiceBooking.Api.Models;

namespace ServiceBooking.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await using var transaction = await db.Database.BeginTransactionAsync();

        if (await db.Users.AnyAsync()
            || await db.Staffs.AnyAsync()
            || await db.Services.AnyAsync()
            || await db.WorkSchedules.AnyAsync()
            || await db.Bookings.AnyAsync())
        {
            return;
        }

        var users = new[]
        {
            new User
            {
                Email = "admin@servicebooking.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                FullName = "Quản trị viên",
                Role = UserRole.Admin
            },
            new User
            {
                Email = "nguyenvana@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Customer@123"),
                FullName = "Nguyễn Văn A",
                Role = UserRole.Customer
            },
            new User
            {
                Email = "tranthib@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Customer@123"),
                FullName = "Trần Thị B",
                Role = UserRole.Customer
            }
        };

        var staff = new[]
        {
            new Staff { FullName = "Ngộ Không", Email = "ngo.khong@servicebooking.com" },
            new Staff { FullName = "Bát Giới", Email = "bat.gioi@servicebooking.com" },
            new Staff { FullName = "Sa Ngộ Tịnh", Email = "sa-ngo-tinh@servicebooking.com" },
            new Staff { FullName = "Đường Tam Tạng", Email = "duong.tam.tang@servicebooking.com" },
            new Staff
            {
                FullName = "Bạch Long Mã",
                Email = "bach.long.ma@servicebooking.com",
                IsActive = false
            }
        };

        var services = new[]
        {
            new Service
            {
                Name = "Cắt tóc cơ bản",
                Description = "Cắt tóc và tạo kiểu cơ bản.",
                DurationMinutes = 30,
                Price = 100_000
            },
            new Service
            {
                Name = "Gội đầu thư giãn",
                Description = "Gội đầu kết hợp massage thư giãn.",
                DurationMinutes = 45,
                Price = 150_000
            },
            new Service
            {
                Name = "Chăm sóc da mặt",
                Description = "Làm sạch và chăm sóc da mặt.",
                DurationMinutes = 60,
                Price = 250_000
            },
            new Service
            {
                Name = "Massage toàn thân",
                Description = "Liệu trình massage toàn thân.",
                DurationMinutes = 90,
                Price = 500_000
            },
            new Service
            {
                Name = "Chăm sóc chuyên sâu",
                Description = "Liệu trình chăm sóc chuyên sâu.",
                DurationMinutes = 120,
                Price = 750_000
            },
            new Service
            {
                Name = "Dịch vụ tạm khóa",
                Description = "Dịch vụ mẫu đang tạm khóa.",
                DurationMinutes = 60,
                Price = 200_000,
                IsActive = false
            }
        };

        db.Users.AddRange(users);
        db.Staffs.AddRange(staff);
        db.Services.AddRange(services);
        await db.SaveChangesAsync();

        var timeZone = GetBusinessTimeZone();
        var today = DateOnly.FromDateTime(
            TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZone));
        var activeStaff = staff.Where(item => item.IsActive).ToArray();
        var schedules = new List<WorkSchedule>();

        for (var dayOffset = -1; dayOffset < 6; dayOffset++)
        {
            var workDate = today.AddDays(dayOffset);
            foreach (var employee in activeStaff)
            {
                schedules.Add(new WorkSchedule
                {
                    StaffId = employee.Id,
                    WorkDate = workDate,
                    StartTime = new TimeOnly(8, 0),
                    EndTime = new TimeOnly(12, 0)
                });
                schedules.Add(new WorkSchedule
                {
                    StaffId = employee.Id,
                    WorkDate = workDate,
                    StartTime = new TimeOnly(13, 0),
                    EndTime = new TimeOnly(17, 0)
                });
            }
        }

        db.WorkSchedules.AddRange(schedules);

        var bookingSeeds = new[]
        {
            new BookingSeed(-1, 0, 0, 2, new TimeOnly(9, 0), BookingStatus.Completed),
            new BookingSeed(-1, 1, 1, 3, new TimeOnly(14, 0), BookingStatus.Completed),
            new BookingSeed(1, 0, 1, 0, new TimeOnly(8, 0), BookingStatus.Pending),
            new BookingSeed(1, 1, 0, 1, new TimeOnly(13, 0), BookingStatus.Confirmed),
            new BookingSeed(2, 2, 0, 2, new TimeOnly(10, 0), BookingStatus.Confirmed),
            new BookingSeed(2, 3, 1, 4, new TimeOnly(15, 0), BookingStatus.Cancelled),
            new BookingSeed(3, 0, 1, 3, new TimeOnly(8, 0), BookingStatus.Pending),
            new BookingSeed(3, 1, 0, 0, new TimeOnly(13, 0), BookingStatus.Cancelled),
            new BookingSeed(4, 2, 0, 4, new TimeOnly(9, 0), BookingStatus.Confirmed),
            new BookingSeed(4, 3, 1, 2, new TimeOnly(13, 0), BookingStatus.Pending)
        };

        for (var index = 0; index < bookingSeeds.Length; index++)
        {
            var seed = bookingSeeds[index];
            var startLocal = DateTime.SpecifyKind(
                today.AddDays(seed.DayOffset).ToDateTime(seed.StartTime),
                DateTimeKind.Unspecified);
            var startUtc = TimeZoneInfo.ConvertTimeToUtc(startLocal, timeZone);
            var service = services[seed.ServiceIndex];

            db.Bookings.Add(new Booking
            {
                BookingCode = $"BK-SEED-{index + 1:000}",
                CustomerId = users[seed.CustomerIndex + 1].Id,
                StaffId = activeStaff[seed.StaffIndex].Id,
                ServiceId = service.Id,
                StartTime = startUtc,
                EndTime = startUtc.AddMinutes(service.DurationMinutes),
                Status = seed.Status,
                CustomerNote = "Booking mẫu",
                CancellationReason = seed.Status == BookingStatus.Cancelled
                    ? "Khách hàng thay đổi kế hoạch."
                    : null,
                CreatedAt = seed.Status == BookingStatus.Completed
                    ? startUtc.AddDays(-3)
                    : DateTime.UtcNow
            });
        }

        await db.SaveChangesAsync();
        await transaction.CommitAsync();
    }

    private static TimeZoneInfo GetBusinessTimeZone()
    {
        var timeZoneId = OperatingSystem.IsWindows()
            ? "SE Asia Standard Time"
            : "Asia/Ho_Chi_Minh";
        return TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
    }

    private sealed record BookingSeed(
        int DayOffset,
        int StaffIndex,
        int CustomerIndex,
        int ServiceIndex,
        TimeOnly StartTime,
        BookingStatus Status);
}
