package com.nexusmart.service;

import com.nexusmart.entity.Role;
import com.nexusmart.entity.User;
import com.nexusmart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class StoreService {
    @Autowired
    private UserRepository userRepository;

    public List<User> getNearbyStores(double lat, double lng, double radius) {
        return userRepository.findNearbyShops(lat, lng, radius);
    }

    public List<User> getStoresByPincode(String pincode) {
        return userRepository.findByRoleAndPincode(Role.MERCHANT, pincode);
    }
}