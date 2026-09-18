package com.etulasetu.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CertificateService {

    public List<Object> getCertificates(String email) {
        // Stub implementation
        return List.of();
    }

    public Object getCertificate(UUID id, String email) {
        // Stub implementation
        return new Object();
    }

    public byte[] generateCertificatePdf(UUID id, String email) {
        // Stub implementation using iText7
        return new byte[0];
    }
}
