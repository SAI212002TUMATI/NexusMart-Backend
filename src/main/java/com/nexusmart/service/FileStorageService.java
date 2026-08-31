package com.nexusmart.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    // Define where files will be written on your local machine
    private final String uploadDir = "D:/projects/NexusMart/uploads/";

    public String storeFile(MultipartFile file) {
        // 1. Validate if the file is empty
        if (file.isEmpty()) {
            throw new RuntimeException("Failed to store empty file.");
        }

        try {
            // 2. Ensure the destination directory exists
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // 3. Generate a completely unique filename using a UUID to prevent duplicate
            // name overwrites
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

            // 4. Resolve destination path and save file bytes
            Path targetLocation = Paths.get(uploadDir + uniqueFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // 5. Return the relative URL string path that will be saved in MySQL
            return "/uploads/" + uniqueFilename;

        } catch (IOException ex) {
            throw new RuntimeException("Could not store file. Error: " + ex.getMessage(), ex);
        }
    }
}