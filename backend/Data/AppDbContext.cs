using Microsoft.EntityFrameworkCore;
using ServiceBooking.Api.Models;

namespace ServiceBooking.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();

    public DbSet<Staff> Staffs => Set<Staff>();
    public DbSet<Service> Services => Set<Service>();

    public DbSet<WorkSchedule> WorkSchedules => Set<WorkSchedule>();
    public DbSet<Booking> Bookings => Set<Booking>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).HasMaxLength(256).IsRequired();
            e.Property(u => u.FullName).HasMaxLength(200).IsRequired();
            e.Property(u => u.PasswordHash).IsRequired();

            e.Property(u => u.RefreshTokenHash).HasMaxLength(64);

            e.HasIndex(u => u.RefreshTokenHash)
             .IsUnique()
             .HasFilter("\"RefreshTokenHash\" IS NOT NULL");
        });

        modelBuilder.Entity<Staff>(e =>
        {
            e.HasIndex(s => s.Email).IsUnique();
            e.Property(s => s.Email).HasMaxLength(256).IsRequired();
            e.Property(s => s.FullName).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<Service>(e =>
        {
            e.Property(s => s.Name).HasMaxLength(200).IsRequired();
            e.Property(s => s.Description).HasMaxLength(1000);
            e.Property(s => s.Price).HasPrecision(18, 2);
        });
    }
}