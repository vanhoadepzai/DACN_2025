using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using TuTiProject.Data;
using TuTiProject.Dtos;
using TuTiProject.Interfaces;
using TuTiProject.Models;

namespace TuTiProject.Services
{
    public class AccidentReportService : IAccidentReportService
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _hostEnvironment;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private const string UploadsFolder = "uploads/accident-reports";

        public AccidentReportService(
            AppDbContext context,
            IWebHostEnvironment hostEnvironment,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _hostEnvironment = hostEnvironment;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<AccidentReportDto> CreateAccidentReportAsync(
            int userId,
            double rating,
            int type,
            string location,
            string comment,
            IFormFile pictureFile)
        {
            // Validate inputs
            if (string.IsNullOrWhiteSpace(location))
                throw new ArgumentException("Location is required.");

            if (rating < 0 || rating > 5)
                throw new ArgumentException("Rating must be between 0 and 5.");

            if (type < 1 || type > 5)
                throw new ArgumentException("Type must be between 1 and 5.");

            if (pictureFile == null || pictureFile.Length == 0)
                throw new ArgumentException("Picture file is required.");

            // Save picture to local machine
            var pictureUrl = await SavePictureAsync(pictureFile);

            // Create accident report entity
            var accidentReport = new AccidentReport
            {
                UserId = userId,
                Rating = rating,
                Type = type,
                Location = location,
                PictureUrl = pictureUrl,
                Comment = comment,
                CreatedAt = DateTime.UtcNow
            };

            _context.AccidentReports.Add(accidentReport);
            await _context.SaveChangesAsync();

            return MapToResponseDto(accidentReport);
        }

        public async Task<AccidentReportDto> GetAccidentReportByIdAsync(int id)
        {
            var report = await _context.AccidentReports.FindAsync(id);

            if (report == null)
                throw new KeyNotFoundException($"Accident report with ID {id} not found.");

            return MapToResponseDto(report);
        }

        public async Task<IEnumerable<AccidentReportDto>> GetAccidentReportsByUserIdAsync(int userId)
        {
            var reports = await _context.AccidentReports
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return reports.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<AccidentReportDto>> GetAllAccidentReportsAsync()
        {
            var reports = await _context.AccidentReports
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return reports.Select(MapToResponseDto);
        }

        public async Task<bool> DeleteAccidentReportAsync(int id)
        {
            var report = await _context.AccidentReports.FindAsync(id);

            if (report == null)
                return false;

            // Delete picture file
            if (!string.IsNullOrWhiteSpace(report.PictureUrl))
            {
                await DeletePictureAsync(report.PictureUrl);
            }

            _context.AccidentReports.Remove(report);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<AccidentReportDto> UpdateAccidentReportAsync(int id, AccidentReportDto updateDto)
        {
            var report = await _context.AccidentReports.FindAsync(id);

            if (report == null)
                throw new KeyNotFoundException($"Accident report with ID {id} not found.");

            if (!string.IsNullOrWhiteSpace(updateDto.Location))
                report.Location = updateDto.Location;

            if (updateDto.Rating >= 0 && updateDto.Rating <= 5)
                report.Rating = updateDto.Rating;

            if (updateDto.Type >= 1 && updateDto.Type <= 5)
                report.Type = updateDto.Type;

            if (!string.IsNullOrWhiteSpace(updateDto.Comment))
                report.Comment = updateDto.Comment;

            _context.AccidentReports.Update(report);
            await _context.SaveChangesAsync();

            return MapToResponseDto(report);
        }

        // Helper Methods
        private async Task<string> SavePictureAsync(IFormFile pictureFile)
        {
            // Validate file
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var fileExtension = Path.GetExtension(pictureFile.FileName).ToLower();

            if (!allowedExtensions.Contains(fileExtension))
                throw new ArgumentException("Only image files (jpg, jpeg, png, gif) are allowed.");

            if (pictureFile.Length > 5 * 1024 * 1024) // 5MB
                throw new ArgumentException("File size must not exceed 5MB.");

            // Create uploads folder if it doesn't exist
            var uploadsPath = Path.Combine(_hostEnvironment.WebRootPath, UploadsFolder);
            if (!Directory.Exists(uploadsPath))
            {
                Directory.CreateDirectory(uploadsPath);
            }

            // Generate unique filename
            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsPath, fileName);

            // Save file
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await pictureFile.CopyToAsync(fileStream);
            }

            // Return relative URL
            var baseUrl = $"{_httpContextAccessor.HttpContext.Request.Scheme}://{_httpContextAccessor.HttpContext.Request.Host}";
            return $"{baseUrl}/{UploadsFolder}/{fileName}";
        }

        private async Task DeletePictureAsync(string pictureUrl)
        {
            try
            {
                // Extract filename from URL
                var fileName = Path.GetFileName(pictureUrl);
                var filePath = Path.Combine(_hostEnvironment.WebRootPath, UploadsFolder, fileName);

                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }

                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                // Log error but don't throw - file deletion failure shouldn't break the operation
                Console.WriteLine($"Error deleting picture: {ex.Message}");
            }
        }

        private AccidentReportDto MapToResponseDto(AccidentReport report)
        {
            return new AccidentReportDto
            {
                Id = report.Id,
                UserId = report.UserId,
                Rating = report.Rating,
                Type = report.Type,
                Location = report.Location,
                PictureUrl = report.PictureUrl,
                Comment = report.Comment,
                CreatedAt = report.CreatedAt
            };
        }
    }
}