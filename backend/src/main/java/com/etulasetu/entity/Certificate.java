package com.etulasetu.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "certificates")
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verification_record_id", nullable = false)
    private VerificationRecord verificationRecord;

    @Column(unique = true, nullable = false)
    private String certificateNo;

    private String qrCodeUrl;
    
    @Column(columnDefinition="TEXT")
    private String qrCodeBase64;
    
    private LocalDate issueDate;
    private LocalDate validUntil;

    @Builder.Default
    private boolean isRevoked = false;

    private LocalDateTime createdAt;
}
