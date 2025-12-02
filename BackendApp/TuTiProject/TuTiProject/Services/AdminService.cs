using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using System.Threading.Tasks;
using TuTiProject.Data;
using TuTiProject.Dtos;
using TuTiProject.Models;

namespace TuTiProject.Services
{
    public class AdminService : IAdminService
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _hostEnvironment;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private const string UploadsFolder = "uploads/accident-reports";

        public AdminService(
            AppDbContext context,
            IWebHostEnvironment hostEnvironment,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _hostEnvironment = hostEnvironment;
            _httpContextAccessor = httpContextAccessor;
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

        public async Task<bool> ChangeAccidentStatus(string accidentId)
        {
            var accident = await _context.AccidentReports.FirstOrDefaultAsync(a => a.Id.ToString() == accidentId);
            if (accident == null)
                return false;
            if (accident.Rating == 3)
                accident.Rating = 1;
            if (accident.Rating == 5)
                accident.Rating = 3;
            accident.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<bool> ChangeUserRole(int userId, string newRole)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return false;
            user.Role = newRole;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteUserAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return false;
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<bool> AssignEmployee(int accidentId, int employeeId)
        {
            var report = await _context.AccidentReports.FindAsync(accidentId);
            if (report == null)
                return false;
            report.EmployeeId = employeeId;
            await _context.SaveChangesAsync();
            return true;
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
                Console.WriteLine($"Error deleting picture: {ex.Message}");
            }
        }
        public async Task<UserResponseDto> GetUsersInformationById(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            return user == null ? null : MapToDto(user);
        }
        public async Task<List<UserResponseDto>> GetAllUsersAsync()
        {
            var users = await _context.Users.ToListAsync();
            return users.Select(MapToDto).ToList();
        }  
        private UserResponseDto MapToDto(User user)
        {
            return new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Birthday = user.Birthday,
                PictureUrl = user.PictureUrl,
                Role = user.Role
            };
        }
    }
}
