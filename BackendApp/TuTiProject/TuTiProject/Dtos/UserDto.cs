namespace TuTiProject.Dtos
{
    public class UserRegisterDto
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Birthday { get; set; }
        public string PictureUrl { get; set; }
        public string Password { get; set; }
    }

    public class UserLoginDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class UserUpdateDto
    {
        public string Name { get; set; }
        public string PhoneNumber { get; set; }
        public string Birthday { get; set; }
        public string PictureUrl { get; set; }
    }

    public class UserChangePasswordDto
    {
        public string Email { get; set; }
        public string OldPassword { get; set; }
        public string NewPassword { get; set; }
    }

    public class UserResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Birthday { get; set; }
        public string PictureUrl { get; set; }
        public string Role { get; set; }
    }
}
