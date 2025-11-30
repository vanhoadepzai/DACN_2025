using Microsoft.AspNetCore.Mvc;
using TuTiProject.Dtos;
using TuTiProject.Interfaces;

namespace TuTiProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccidentReportsController : ControllerBase
    {
        private readonly IAccidentReportService _accidentReportService;
        private readonly ILogger<AccidentReportsController> _logger;

        public AccidentReportsController(
            IAccidentReportService accidentReportService,
            ILogger<AccidentReportsController> logger)
        {
            _accidentReportService = accidentReportService;
            _logger = logger;
        }

        /// <summary>
        /// Create a new accident report with image upload
        /// </summary>
        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<AccidentReportDto>> CreateAccidentReport([FromForm] AccidentReportCreateRequest request)
        {
            try
            {
                _logger.LogInformation($"Creating accident report for user {request.UserId}");

                var result = await _accidentReportService.CreateAccidentReportAsync(
                    request.UserId,
                    request.Rating,
                    request.Type,
                    request.Location,
                    request.Comment,
                    request.Picture);

                return CreatedAtAction(nameof(GetAccidentReportById), new { id = result.Id }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while creating the accident report." });
            }
        }


        /// <summary>
        /// Get accident report by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<AccidentReportDto>> GetAccidentReportById(int id)
        {
            try
            {
                var result = await _accidentReportService.GetAccidentReportByIdAsync(id);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning($"Accident report not found: {ex.Message}");
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving accident report: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while retrieving the accident report." });
            }
        }

        /// <summary>
        /// Get all accident reports by user ID
        /// </summary>
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<AccidentReportDto>>> GetAccidentReportsByUserId(int userId)
        {
            try
            {
                var result = await _accidentReportService.GetAccidentReportsByUserIdAsync(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving accident reports: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while retrieving accident reports." });
            }
        }

        /// <summary>
        /// Get all accident reports
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AccidentReportDto>>> GetAllAccidentReports()
        {
            try
            {
                var result = await _accidentReportService.GetAllAccidentReportsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving all accident reports: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while retrieving accident reports." });
            }
        }

        /// <summary>
        /// Update accident report (without picture)
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<AccidentReportDto>> UpdateAccidentReport(
            int id,
            [FromBody] AccidentReportDto updateDto)
        {
            try
            {
                var result = await _accidentReportService.UpdateAccidentReportAsync(id, updateDto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning($"Accident report not found: {ex.Message}");
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating accident report: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while updating the accident report." });
            }
        }

        /// <summary>
        /// Delete accident report
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAccidentReport(int id)
        {
            try
            {
                var result = await _accidentReportService.DeleteAccidentReportAsync(id);

                if (!result)
                    return NotFound(new { message = "Accident report not found." });

                _logger.LogInformation($"Accident report {id} deleted successfully");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting accident report: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while deleting the accident report." });
            }
        }
    }
}