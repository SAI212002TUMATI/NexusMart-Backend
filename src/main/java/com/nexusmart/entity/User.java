package com.nexusmart.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

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

    @Column(unique = true, length = 15)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 50)
    private Role role;

    @Column(name = "is_verified", nullable = false)
    private boolean isVerified = false;

    @Column(name = "otp", length = 6)
    private String otp;

    @Column(name = "otp_Expiry")
    private java.time.LocalDateTime otpExpiry;

    // --- Added for Kirana / Street Store Owners ---

    @Column(name = "shop_name")
    private String shopName;

    @Column(name = "shop_address", length = 500)
    private String shopAddress;

    @Column(name = "pincode", length = 10)
    private String pincode;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    private String resetToken;

    private LocalDateTime resetTokenExpiry;

    public Long getId() {
        return this.id;
    }
}