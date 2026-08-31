package com.nexusmart.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 50)
    private Role role;

    @Column(name = "is_verified", nullable = false)
    private boolean isVerified = false;

    @Column(name = "otp", length = 6)
    private String otp;

    @Column(name = "otp_Expiry")
    private java.time.LocalDateTime otpExpiry;

    public Long getId() {
        return this.id;
    }
}
