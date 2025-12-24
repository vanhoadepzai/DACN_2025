using TuTiProject.Models;
using TuTiProject.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace TuTiProject.Services
{
    public interface IAdminService
    {
        Task<bool> DeleteAccidentReportAsync(int id);
        Task<bool> ChangeAccidentStatus(string accidentId);
        Task<UserResponseDto> GetUsersInformationById(int userId);
        Task<List<UserResponseDto>> GetAllUsersAsync();
        Task<bool> ChangeUserRole(int userId, string newRole);
        Task<bool> DeleteUserAsync(int userId);
        Task<bool> AssignEmployee (int accidentId, int employeeId);
    }
}
