using Microsoft.EntityFrameworkCore;
using TuTiProject.Models;

namespace TuTiProject.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // Add this DbSet for AccidentReport
        public DbSet<User> Users { get; set; }
        public DbSet<AccidentReport> AccidentReports { get; set; }

        // Add other DbSets for your existing entities here
        // public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure AccidentReport entity
            modelBuilder.Entity<AccidentReport>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.UserId)
                    .IsRequired();

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.EmployeeId)
                    .IsRequired();

                entity.Property(e => e.Rating)
                    .IsRequired();

                entity.Property(e => e.Type)
                    .IsRequired();

                entity.Property(e => e.Location)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.PictureUrl)
                    .IsRequired()
                    .HasMaxLength(500);

                entity.Property(e => e.Comment)
                    .HasMaxLength(1000);

                entity.Property(e => e.DeviceId)
                    .HasMaxLength(200);

                entity.Property(e => e.CreatedAt)
                    .IsRequired()
                    .HasDefaultValueSql("GETUTCDATE()");

                entity.Property(e => e.UpdatedAt);

                // Index for faster queries
                entity.HasIndex(e => e.UserId);
            });
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);

                entity.Property(u => u.Name)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(u => u.Email)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(u => u.PhoneNumber)
                    .HasMaxLength(20);

                entity.Property(u => u.Birthday)
                    .HasMaxLength(50);

                entity.Property(u => u.PictureUrl)
                    .HasMaxLength(500);

                entity.Property(u => u.Role)
                    .IsRequired()
                    .HasDefaultValue("0"); // default role is "0" for normal user

                // Optional: add unique index for Email if needed
                entity.HasIndex(u => u.Email).IsUnique();
            });
        }
    }
}