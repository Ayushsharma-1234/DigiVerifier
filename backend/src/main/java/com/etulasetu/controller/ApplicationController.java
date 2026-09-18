package com.etulasetu.controller;

import com.etulasetu.dto.ApplicationRequest;
import com.etulasetu.dto.VerificationRequest;
import com.etulasetu.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @GetMapping
    public ResponseEntity<List<Object>> getApplications(Authentication authentication) {
        return ResponseEntity.ok(applicationService.getApplications(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<Object> createApplication(@Valid @RequestBody ApplicationRequest request, Authentication authentication) {
        return ResponseEntity.ok(applicationService.createApplication(request, authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getApplication(@PathVariable UUID id, Authentication authentication) {
        return ResponseEntity.ok(applicationService.getApplication(id, authentication.getName()));
    }

    @PatchMapping("/{id}/pay")
    public ResponseEntity<String> payApplication(@PathVariable UUID id, Authentication authentication) {
        applicationService.payApplication(id, authentication.getName());
        return ResponseEntity.ok("Payment successful");
    }

    @PatchMapping("/{id}/schedule")
    public ResponseEntity<String> scheduleInspection(@PathVariable UUID id, Authentication authentication) {
        applicationService.scheduleInspection(id, authentication.getName());
        return ResponseEntity.ok("Inspection scheduled");
    }

    @PostMapping("/{id}/inspect")
    public ResponseEntity<String> submitVerification(@PathVariable UUID id, @Valid @RequestBody VerificationRequest request, Authentication authentication) {
        applicationService.submitVerification(id, request, authentication.getName());
        return ResponseEntity.ok("Verification submitted");
    }
}
