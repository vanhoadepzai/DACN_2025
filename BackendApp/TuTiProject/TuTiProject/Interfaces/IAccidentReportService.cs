using Microsoft.AspNetCore.Http;
using TuTiProject.Dtos;

namespace TuTiProject.Interfaces
{
    public interface IAccidentReportService
    {
        Task<AccidentReportDto> CreateAccidentReportAsync(
            int userId,
            double rating,
            int type,
            string location,
            string comment,
            IFormFile pictureFile);

        Task<AccidentReportDto> GetAccidentReportByIdAsync(int id);
        Task<IEnumerable<AccidentReportDto>> GetAccidentReportsByUserIdAsync(int userId);
        Task<IEnumerable<AccidentReportDto>> GetAllAccidentReportsAsync();
        Task<bool> DeleteAccidentReportAsync(int id);
        Task<AccidentReportDto> UpdateAccidentReportAsync(int id, AccidentReportDto updateDto);
    }
}