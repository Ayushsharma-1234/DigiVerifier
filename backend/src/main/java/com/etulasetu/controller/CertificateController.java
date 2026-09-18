package com.etulasetu.controller;

import com.etulasetu.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    @GetMapping
    public ResponseEntity<List<Object>> getCertificates(Authentication authentication) {
        return ResponseEntity.ok(certificateService.getCertificates(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getCertificate(@PathVariable UUID id, Authentication authentication) {
        return ResponseEntity.ok(certificateService.getCertificate(id, authentication.getName()));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadCertificate(@PathVariable UUID id, Authentication authentication) {
        byte[] pdfBytes = certificateService.generateCertificatePdf(id, authentication.getName());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"certificate_" + id + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
