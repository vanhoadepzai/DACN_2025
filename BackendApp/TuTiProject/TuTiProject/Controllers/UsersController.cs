using Microsoft.AspNetCore.Mvc;
using TuTiProject.Dtos;
using TuTiProject.Services;
using System.Threading.Tasks;

namespace TuTiProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto dto)
        {
            var user = await _userService.Register(dto);
            if (user == null) return BadRequest("Email already exists");
            return Ok(user);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto dto)
        {
            var user = await _userService.Login(dto);
            if (user == null) return BadRequest("Invalid credentials");
            return Ok(user);
        }

        [HttpPut("{id}/update-profile")]
        public async Task<IActionResult> UpdateProfile(int id, UserUpdateDto dto)
        {
            var user = await _userService.UpdateProfile(id, dto);
            if (user == null) return NotFound("User not found");
            return Ok(user);
        }

        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword(UserChangePasswordDto dto)
        {
            var result = await _userService.ChangePassword(dto);
            if (!result) return BadRequest("Invalid email or old password");
            return Ok(new { message = "Password changed successfully" });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _userService.GetById(id);
            if (user == null) return NotFound();
            return Ok(user);
        }
    }
}
