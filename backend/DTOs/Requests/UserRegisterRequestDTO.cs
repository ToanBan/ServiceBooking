using System.ComponentModel.DataAnnotations;

namespace ServiceBooking.Api.DTOs.Requests;

public class UserRegisterRequestDTO
{
    [Required(ErrorMessage = "Họ tên không được để trống")]
    [StringLength(200, MinimumLength = 2, ErrorMessage = "Họ tên phải từ 2 đến 200 ký tự")]
    public required string FullName { get; set; }

    [Required(ErrorMessage = "Email không được để trống")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ")]
    [StringLength(256, ErrorMessage = "Email tối đa 256 ký tự")]
    public required string Email { get; set; }

    [Required(ErrorMessage = "Mật khẩu không được để trống")]
    [MinLength(9, ErrorMessage = "Mật khẩu phải dài hơn 8 ký tự")]
    [RegularExpression(
        @"^(?=.*[A-Z])(?=.*\d)(?=.*@).{9,}$",
        ErrorMessage = "Mật khẩu phải có ít nhất 1 chữ hoa, 1 số, 1 ký tự @, và dài hơn 8 ký tự"
    )]
    public required string Password { get; set; }

    [Required(ErrorMessage = "Xác nhận mật khẩu không được để trống")]
    [Compare(nameof(Password), ErrorMessage = "Mật khẩu xác nhận không khớp")]
    public required string ConfirmPassword { get; set; }
}
