package com.nexusmart.repository;

import com.nexusmart.entity.Order;
import com.nexusmart.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByMerchantIdAndStatusOrderByOrderDateDesc(Long merchantId, OrderStatus status);
    List<Order> findByMerchantIdOrderByOrderDateDesc(Long merchantId);
    List<Order> findByCustomerId(Long customerId);
}