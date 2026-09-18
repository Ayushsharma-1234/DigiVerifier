package com.digiverifier.service;

import com.digiverifier.entity.Application;
import com.digiverifier.entity.Certificate;
import com.digiverifier.entity.Instrument;
import com.digiverifier.entity.User;
import com.digiverifier.entity.VerificationRecord;
import com.digiverifier.repository.CertificateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final QRCodeService qrCodeService;
    private final PDFService pdfService;

    @Value("${app.base-url}")
    private String baseUrl;

    public Certificate generateCertificate(Application application, VerificationRecord record) {
        String stateCode = application.getInstrument().getState() != null ? application.getInstrument().getState().substring(0, 2).toUpperCase() : "XX";
        String year = String.valueOf(LocalDate.now().getYear());
        long sequenceNumber = certificateRepository.count() + 1; // Basic sequence generator
        String certificateNo = String.format("LM-%s-%s-%05d", stateCode, year, sequenceNumber);

        LocalDate issueDate = LocalDate.now();
        LocalDate validUntil = issueDate.plusMonths(12);

        Certificate certificate = Certificate.builder()
                .verificationRecord(record)
                .certificateNo(certificateNo)
                .issueDate(issueDate)
                .validUntil(validUntil)
                .isRevoked(false)
                .createdAt(LocalDateTime.now())
                .build();

        // Save first to generate UUID
        certificate = certificateRepository.save(certificate);

        String verifyUrl = baseUrl + "/verify/" + certificate.getId();
        certificate.setQrCodeUrl(verifyUrl);
        certificate.setQrCodeBase64(qrCodeService.generateQRCodeBase64(certificate.getId().toString()));
        
        return certificateRepository.save(certificate);
    }

    public List<Object> getCertificates(String email) {
        // Stub implementation
        return List.of();
    }

    public Object getCertificate(UUID id, String email) {
        return certificateRepository.findById(id).orElseThrow(() -> new RuntimeException("Certificate not found"));
    }

    public byte[] generateCertificatePdf(UUID id, String email) {
        Certificate certificate = certificateRepository.findById(id).orElseThrow();
        VerificationRecord record = certificate.getVerificationRecord();
        Application application = record.getApplication();
        Instrument instrument = application.getInstrument();
        User officer = application.getOfficer() != null ? application.getOfficer().getUser() : null;
        User applicant = application.getStakeholder();

        return pdfService.generateCertificatePDF(certificate, instrument, officer, applicant);
    }
}
