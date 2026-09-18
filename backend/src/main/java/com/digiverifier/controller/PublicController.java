package com.digiverifier.controller;

import com.digiverifier.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/verify")
@RequiredArgsConstructor
public class PublicController {

    private final CertificateService certificateService;

    @GetMapping("/{certificateId}")
    public ResponseEntity<Object> verifyCertificate(@PathVariable UUID certificateId) {
        return ResponseEntity.ok(certificateService.getCertificate(certificateId, null));
    }
}
