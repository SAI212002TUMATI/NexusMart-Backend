package com.nexusmart.repository;

import com.nexusmart.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p WHERE " +
            "(:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND "
            +
            "(:category IS NULL OR LOWER(p.category.name) = LOWER(:category)) AND " +
            "(:maxPrice IS NULL OR p.price <= :maxPrice)")
    List<Product> searchProductsDynamic(
            @Param("keyword") String keyword,
            @Param("category") String category,
            @Param("maxPrice") Double maxPrice);
}