package com.nexusmart.dto;

import com.nexusmart.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserRegistrationDto {
    @NotBlank(message = "Name cannot be blank")
    private String name;

    @NotBlank(message = "email cannot be blank")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "password cannot be blank")
    @Size(min = 6, message = "password must be at least 6 characters long")
    private String password;

    @NotNull(message = "Role is Required")
    private Role role;

}
