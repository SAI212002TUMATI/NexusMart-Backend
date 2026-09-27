package com.nexusmart.repository;

import com.nexusmart.entity.Role;
import com.nexusmart.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    List<User> findByRoleAndPincode(Role role, String pincode);

    @Query(value = "SELECT *, (6371 * acos(cos(radians(:userLat)) * cos(radians(u.latitude)) * " +
                   "cos(radians(u.longitude) - radians(:userLng)) + sin(radians(:userLat)) * " +
                   "sin(radians(u.latitude)))) AS distanceInKm FROM users u WHERE u.role = 'ROLE_MERCHANT' " +
                   "HAVING distanceInKm <= :radiusInKm ORDER BY distanceInKm ASC", nativeQuery = true)
    List<User> findNearbyShops(@Param("userLat") double userLat, 
                               @Param("userLng") double userLng, 
                               @Param("radiusInKm") double radiusInKm);
}