namespace TuTiProject.Models
{
    public class AccidentReport
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; }
        public string EmployeeId { get; set; }  
        public double Rating { get; set; }
        public int Type { get; set; } 
        public string Location { get; set; }
        public string PictureUrl { get; set; }
        public string Comment { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
