package com.nexusmart.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Maps incoming requests starting with /uploads/** to your local folder
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:D:/projects/NexusMart/uploads/");
    }
}