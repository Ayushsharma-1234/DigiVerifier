package com.etulasetu.controller;

import com.etulasetu.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/applicant")
    public ResponseEntity<Object> getApplicantDashboard(Authentication authentication) {
        return ResponseEntity.ok(dashboardService.getApplicantStats(authentication.getName()));
    }

    @GetMapping("/lmo")
    public ResponseEntity<Object> getLmoDashboard(Authentication authentication) {
        return ResponseEntity.ok(dashboardService.getLmoStats(authentication.getName()));
    }

    @GetMapping("/admin")
    public ResponseEntity<Object> getAdminDashboard(
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            Authentication authentication) {
        return ResponseEntity.ok(dashboardService.getAdminStats(authentication.getName(), state, district));
    }
}
