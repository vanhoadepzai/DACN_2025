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
            string title,
            double rating,
            int type,
            string location,
            string comment,
            IFormFile pictureFile)
        {
            // Validate inputs
            if (string.IsNullOrWhiteSpace(location))
                throw new ArgumentException("Location is required.");
            if (type < 1 || type > 5)
                throw new ArgumentException("Type must be between 1 and 5.");
            if (pictureFile == null || pictureFile.Length == 0)
                throw new ArgumentException("Picture file is required.");
            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Title is required.");

            // Save picture to local machine
            var pictureUrl = await SavePictureAsync(pictureFile);

            // Create accident report entity
            var accidentReport = new AccidentReport
            {
                UserId = userId,
                Title = title,
                Rating = rating,
                Type = type,
                DeviceId="Luan",
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
                .Where(r => r.UserId == userId||r.EmployeeId==userId)
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

        public async Task<bool> UpdateAccidentReport(int accidentId,
            string title,
            double rating,
            int type,
            string location,
            string comment,
            IFormFile pictureFile)
        {
            if (string.IsNullOrWhiteSpace(location))
                throw new ArgumentException("Location is required.");
            if (type < 1 || type > 5)
                throw new ArgumentException("Type must be between 1 and 5.");
            if (pictureFile == null || pictureFile.Length == 0)
                throw new ArgumentException("Picture file is required.");
            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Title is required.");

            var pictureUrl = await SavePictureAsync(pictureFile);
            var accidentReport = _context.AccidentReports.FirstOrDefault(a => a.Id == accidentId);
            if (accidentReport == null)
                return false;
            else
            {
                accidentReport.Title = title;
                accidentReport.Rating = rating;
                accidentReport.Type = type;
                accidentReport.Location = location;
                accidentReport.PictureUrl = pictureUrl;
                accidentReport.Comment = comment;
                accidentReport.UpdatedAt = DateTime.UtcNow;
            }
            ;

            _context.AccidentReports.Add(accidentReport);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<bool> AssignEmployee(int accidentId, int employeeId)
        {
            var report = await _context.AccidentReports.FindAsync(accidentId);
            if (report == null)
                return false;
            report.EmployeeId = employeeId;
            report.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
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
        private AccidentReportDto MapToResponseDto(AccidentReport report)
        {
            return new AccidentReportDto
            {
                Id = report.Id,
                UserId = report.UserId,
                Title = report.Title,
                EmployeeId = report.EmployeeId,
                Rating = report.Rating,
                Type = report.Type,
                Location = report.Location,
                PictureUrl = report.PictureUrl,
                Comment = report.Comment,
                CreatedAt = report.CreatedAt,
                UpdatedAt = report.UpdatedAt
            };
        }
    }
}