package com.nexusmart.repository;

import com.nexusmart.entity.Order;
import com.nexusmart.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByMerchantIdAndStatusOrderByOrderDateDesc(Long merchantId, OrderStatus status);

    // 🚀 Required for the Delivered History tab to fetch both DELIVERED and
    // COMPLETED
    List<Order> findByMerchantIdAndStatusInOrderByOrderDateDesc(Long merchantId, List<OrderStatus> statuses);

    List<Order> findByMerchantIdOrderByOrderDateDesc(Long merchantId);

    List<Order> findByCustomerId(Long customerId);
}