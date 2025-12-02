using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using TuTiProject.Data;
using TuTiProject.Dtos;
using TuTiProject.Models;

namespace TuTiProject.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        // Register a new user
        public async Task<UserResponseDto> Register(UserRegisterDto dto)
        {
            var existing = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (existing != null) return null; // Email already exists

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                Birthday = dto.Birthday,
                PictureUrl = dto.PictureUrl,
                Role = "0", // default role
                Password = dto.Password // plaintext for now
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return MapToDto(user);
        }

        // Login user
        public async Task<UserResponseDto> Login(UserLoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.Email == dto.Email && u.Password == dto.Password
            );

            return user == null ? null : MapToDto(user);
        }

        // Update profile
        public async Task<UserResponseDto> UpdateProfile(int userId, UserUpdateDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return null;

            user.Name = dto.Name;
            user.PhoneNumber = dto.PhoneNumber;
            user.Birthday = dto.Birthday;
            user.PictureUrl = dto.PictureUrl;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return MapToDto(user);
        }

        // Change password
        public async Task<bool> ChangePassword(UserChangePasswordDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.Email == dto.Email && u.Password == dto.OldPassword
            );

            if (user == null) return false;

            user.Password = dto.NewPassword;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return true;
        }

        // Map User to DTO
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
