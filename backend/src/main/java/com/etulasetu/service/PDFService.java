package com.etulasetu.service;

import com.etulasetu.entity.Certificate;
import com.etulasetu.entity.Instrument;
import com.etulasetu.entity.User;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class PDFService {

    private final QRCodeService qrCodeService;

    public byte[] generateCertificatePDF(Certificate certificate, Instrument instrument, User officer, User applicant) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Header
            Paragraph govHeader = new Paragraph("Government of India, Ministry of Consumer Affairs, Food & Public Distribution")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(10);
            document.add(govHeader);

            Paragraph mainHeader = new Paragraph("LEGAL METROLOGY VERIFICATION CERTIFICATE")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(16)
                    .setBold();
            document.add(mainHeader);
            
            document.add(new Paragraph("\n"));

            // Certificate Number
            Paragraph certNo = new Paragraph("Certificate No: " + certificate.getCertificateNo())
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setFontSize(12)
                    .setBold();
            document.add(certNo);
            
            document.add(new Paragraph("\n"));

            // Details Table
            float[] columnWidths = {200f, 300f};
            Table table = new Table(columnWidths);
            table.setWidth(UnitValue.createPercentValue(100));

            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd-MM-yyyy");

            addTableRow(table, "Instrument Category:", instrument.getCategory().name());
            addTableRow(table, "Serial No:", instrument.getSerialNo() != null ? instrument.getSerialNo() : "N/A");
            addTableRow(table, "Manufacturer:", instrument.getManufacturer() != null ? instrument.getManufacturer() : "N/A");
            addTableRow(table, "Accuracy Class:", instrument.getAccuracyClass() != null ? instrument.getAccuracyClass().name() : "N/A");
            addTableRow(table, "Owner Name:", applicant.getName());
            addTableRow(table, "Owner Address:", instrument.getAddressLine1() + ", " + instrument.getDistrict() + ", " + instrument.getState());
            addTableRow(table, "Verified By:", officer != null ? officer.getName() : "System");
            addTableRow(table, "Designation:", officer != null && officer.getRole() != null ? officer.getRole().name() : "Officer");
            addTableRow(table, "Verification Date:", certificate.getIssueDate().format(dtf));
            addTableRow(table, "Valid Until:", certificate.getValidUntil().format(dtf));

            document.add(table);
            
            document.add(new Paragraph("\n"));

            // QR Code
            byte[] qrBytes = qrCodeService.generateQRCode(certificate.getId().toString(), 150, 150);
            ImageData imageData = ImageDataFactory.create(qrBytes);
            Image qrImage = new Image(imageData);
            qrImage.setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.RIGHT);
            document.add(qrImage);

            document.add(new Paragraph("\n"));

            // Footer
            Paragraph footer = new Paragraph("This certificate is valid until " + certificate.getValidUntil().format(dtf) + ". " +
                    "Scan QR code to verify online at etulasetu.gov.in")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(10);
            document.add(footer);

            // Digital signature placeholder
            String officerName = officer != null ? officer.getName() : "Officer";
            Paragraph signature = new Paragraph("Digitally signed by " + officerName + " on " + certificate.getIssueDate().format(dtf))
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setFontSize(10)
                    .setItalic();
            document.add(signature);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    private void addTableRow(Table table, String label, String value) {
        table.addCell(new Cell().add(new Paragraph(label).setBold()));
        table.addCell(new Cell().add(new Paragraph(value)));
    }
}
