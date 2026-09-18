package com.etulasetu.service;

import com.etulasetu.dto.ApplicationRequest;
import com.etulasetu.dto.VerificationRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ApplicationService {

    public List<Object> getApplications(String email) {
        // Stub implementation
        return List.of();
    }

    public Object createApplication(ApplicationRequest request, String email) {
        // Stub implementation
        return new Object();
    }

    public Object getApplication(UUID id, String email) {
        // Stub implementation
        return new Object();
    }

    public void payApplication(UUID id, String email) {
        // Stub implementation
    }

    public void scheduleInspection(UUID id, String email) {
        // Stub implementation
    }

    public void submitVerification(UUID id, VerificationRequest request, String email) {
        // Stub implementation
    }
}
