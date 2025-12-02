using Microsoft.AspNetCore.Http;
using TuTiProject.Dtos;

namespace TuTiProject.Interfaces
{
    public interface IAccidentReportService
    {
        Task<AccidentReportDto> CreateAccidentReportAsync(
            int userId,
            string title,
            double rating,
            int type,
            string location,
            string comment,
            IFormFile pictureFile);

        Task<AccidentReportDto> GetAccidentReportByIdAsync(int id);
        Task<IEnumerable<AccidentReportDto>> GetAccidentReportsByUserIdAsync(int userId);
        Task<IEnumerable<AccidentReportDto>> GetAllAccidentReportsAsync();
        Task<bool> UpdateAccidentReport(int accidentId,
            string title,
            double rating,
            int type,
            string location,
            string comment,
            IFormFile pictureFile);
    }
}