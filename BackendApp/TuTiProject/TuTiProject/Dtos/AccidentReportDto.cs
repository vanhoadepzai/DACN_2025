namespace TuTiProject.Dtos
{
    public class AccidentReportDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public double Rating { get; set; }
        public int Type { get; set; }
        public string Location { get; set; }
        public string PictureUrl { get; set; }
        public string Comment { get; set; }
        public DateTime CreatedAt { get; set; }
    }
    public class AccidentReportCreateRequest
    {
        public int UserId { get; set; }
        public double Rating { get; set; }
        public int Type { get; set; }
        public string Location { get; set; }
        public string Comment { get; set; }
        public IFormFile Picture { get; set; }
    }
}