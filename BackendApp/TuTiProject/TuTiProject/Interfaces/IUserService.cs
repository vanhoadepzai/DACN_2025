using TuTiProject.Models;
using TuTiProject.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace TuTiProject.Services
{
    public interface IUserService
    {
        Task<UserResponseDto> Register(UserRegisterDto dto);
        Task<UserResponseDto> Login(UserLoginDto dto);
        Task<UserResponseDto> UpdateProfile(int userId, UserUpdateDto dto);
        Task<bool> ChangePassword(UserChangePasswordDto dto);

    }
}
