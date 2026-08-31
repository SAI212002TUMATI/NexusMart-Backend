package com.nexusmart.config;

import com.nexusmart.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/protected/**").permitAll()

                        .requestMatchers("/api/cart/**").permitAll()

                        .requestMatchers("/api/categories/**").permitAll()

                        .requestMatchers("/api/orders/**").permitAll()

                        .requestMatchers("/api/ai-search", "/api/ai-search/**").permitAll()

                        .requestMatchers("/api/ai-assistant", "/api/ai-assistant/**").permitAll()

                        // 🌍 Allow viewing the catalog (Both the root list and specific product IDs)
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/products", "/api/products/**")
                        .permitAll()

                        // 📥 Allow adding products for testing (Both the root endpoint and any
                        // sub-paths)
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/products", "/api/products/**")
                        .permitAll()

                        .anyRequest().authenticated())

                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}