package com.digiverifier.service;

import com.digiverifier.dto.InstrumentRequest;
import com.digiverifier.dto.InstrumentResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class InstrumentService {

    public List<InstrumentResponse> getInstrumentsForUser(String email) {
        // Stub implementation
        return List.of();
    }

    public InstrumentResponse createInstrument(InstrumentRequest request, String email) {
        // Stub implementation
        return InstrumentResponse.builder().build();
    }

    public InstrumentResponse getInstrument(UUID id, String email) {
        // Stub implementation
        return InstrumentResponse.builder().id(id).build();
    }
    
    public Object getInstrumentHistory(UUID id, String email) {
        // Stub implementation returning applications
        return List.of();
    }
}
