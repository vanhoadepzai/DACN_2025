using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using TuTiProject.Interfaces;
using TuTiProject.Services;

namespace TuTiProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly ILogger<AdminController> _logger;

        public AdminController(
            IAdminService adminService,
            ILogger<AdminController> logger)
        {
            _adminService = adminService;
            _logger = logger;
        }

        // =======================
        // USERS
        // =======================

        // GET api/admin/users/5
        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUsersInforById(int id)
        {
            var user = await _adminService.GetUsersInformationById(id);

            if (user == null)
                return NotFound(new { message = "User not found." });

            return Ok(user);
        }

        // GET api/admin/users
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _adminService.GetAllUsersAsync();
            return Ok(users);
        }

        // PATCH api/admin/users/5/role
        [HttpPost("users/{id}/role")]
        public async Task<IActionResult> ChangeUserRole(int id, [FromQuery] string newRole)
        {
            if (string.IsNullOrWhiteSpace(newRole))
                return BadRequest(new { message = "New role must not be empty." });

            var success = await _adminService.ChangeUserRole(id, newRole);

            if (!success)
                return NotFound(new { message = "User not found." });

            _logger.LogInformation($"User {id} role changed to {newRole}");

            return Ok(new { message = "Role updated successfully." });
        }

        // DELETE api/admin/users/5
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var deleted = await _adminService.DeleteUserAsync(id);

                if (!deleted)
                    return NotFound(new { message = "User not found." });

                _logger.LogInformation($"User {id} deleted successfully.");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting user ID {id}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        // =======================
        // ACCIDENT REPORTS
        // =======================

        // DELETE api/admin/accident-reports/10
        [HttpDelete("accident-reports/{id}")]
        public async Task<IActionResult> DeleteAccidentReport(int id)
        {
            try
            {
                var deleted = await _adminService.DeleteAccidentReportAsync(id);

                if (!deleted)
                    return NotFound(new { message = "Accident report not found." });

                _logger.LogInformation($"Accident report {id} deleted successfully.");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting accident report ID {id}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        // PATCH api/admin/accident-reports/10/status
        [HttpPost("accident-reports/{accidentId}/status")]
        public async Task<IActionResult> ChangeAccidentStatus(string accidentId)
        {
            var success = await _adminService.ChangeAccidentStatus(accidentId);

            if (!success)
                return NotFound(new { message = "Accident report not found." });

            _logger.LogInformation($"Accident report {accidentId} status updated.");

            return Ok(new { message = "Accident status updated successfully." });
        }
        [HttpPost("assign/{id}")]
        public async Task<IActionResult> AssignAccidentToEmployee(int id, [FromQuery] int employee)
        {
            var success = await _adminService.AssignEmployee(id, employee);
            if (!success)
                return NotFound(new { message = "Accident report or user not found." });
            _logger.LogInformation($"Accident report {id} assigned to user {employee}.");
            return Ok(new { message = "Accident report assigned successfully." });
        }
        [HttpGet("employee")]
        public async Task<IActionResult> GetAllEmployee()
        {
            var users = await _adminService.GetAllUsersAsync();
            var employees = users.FindAll(u => u.Role == "1");
            return Ok(employees);
        }

    }
}
