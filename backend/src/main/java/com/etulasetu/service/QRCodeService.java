package com.etulasetu.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.Base64;

@Service
public class QRCodeService {

    @Value("${app.base-url}")
    private String baseUrl;

    public byte[] generateQRCode(String certificateId, int width, int height) {
        try {
            QRCodeWriter writer = new QRCodeWriter();
            String verifyUrl = baseUrl + "/verify/" + certificateId;
            BitMatrix bitMatrix = writer.encode(verifyUrl, BarcodeFormat.QR_CODE, width, height);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR Code", e);
        }
    }

    public String generateQRCodeBase64(String certificateId) {
        byte[] qrCodeBytes = generateQRCode(certificateId, 250, 250);
        return Base64.getEncoder().encodeToString(qrCodeBytes);
    }
}
