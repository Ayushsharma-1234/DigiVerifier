package com.digiverifier.controller;

import com.digiverifier.dto.InstrumentRequest;
import com.digiverifier.dto.InstrumentResponse;
import com.digiverifier.service.InstrumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/instruments")
@RequiredArgsConstructor
public class InstrumentController {

    private final InstrumentService instrumentService;

    @GetMapping
    public ResponseEntity<List<InstrumentResponse>> getInstruments(Authentication authentication) {
        return ResponseEntity.ok(instrumentService.getInstrumentsForUser(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<InstrumentResponse> createInstrument(@Valid @RequestBody InstrumentRequest request, Authentication authentication) {
        return ResponseEntity.ok(instrumentService.createInstrument(request, authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InstrumentResponse> getInstrument(@PathVariable UUID id, Authentication authentication) {
        return ResponseEntity.ok(instrumentService.getInstrument(id, authentication.getName()));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<Object> getInstrumentHistory(@PathVariable UUID id, Authentication authentication) {
        return ResponseEntity.ok(instrumentService.getInstrumentHistory(id, authentication.getName()));
    }
}
