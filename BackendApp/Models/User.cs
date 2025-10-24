namespace BackendApp.Models
{
    public class User
    {
        public int Id { get; set; }                 // Khóa chính
        public string Username { get; set; } = "";  // Tên đăng nhập
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
