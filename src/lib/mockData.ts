import { Instrument, Application, Certificate, Notification } from "@/types";
import { addDays, subDays, formatISO } from "date-fns";

const today = new Date();

export const mockInstruments: Instrument[] = [
  {
    id: "INST-1001",
    stakeholderId: "usr-1",
    category: "Non-automatic Weighing Scale (Class III)",
    serialNo: "WS-2023-8942",
    manufacturer: "Essae Teraoka",
    accuracyClass: "Class III",
    model: "DS-252",
    purchaseYear: 2023,
  },
  {
    id: "INST-1002",
    stakeholderId: "usr-1",
    category: "Water Meter",
    serialNo: "WM-X9-5510",
    manufacturer: "Kranti Meters",
    accuracyClass: "Class B",
    model: "Multi-jet",
    purchaseYear: 2021,
  },
  {
    id: "INST-1003",
    stakeholderId: "usr-1",
    category: "Clinical Thermometer",
    serialNo: "CT-22-104",
    manufacturer: "Hicks",
    accuracyClass: "±0.1°C",
    model: "Digital DT-11",
    purchaseYear: 2022,
  }
];

export const mockApplications: Application[] = [
  {
    id: "APP-2024-001",
    instrumentId: "INST-1001",
    stakeholderId: "usr-1",
    status: "PASSED",
    submittedDate: formatISO(subDays(today, 45)),
    verificationType: "NEW",
    routedTo: "LMO",
    fee: 500,
    paymentStatus: "PAID"
  },
  {
    id: "APP-2024-002",
    instrumentId: "INST-1002",
    stakeholderId: "usr-1",
    status: "FEE_PAID",
    submittedDate: formatISO(subDays(today, 5)),
    verificationType: "RE_VERIFICATION",
    routedTo: "GATC",
    fee: 250,
    paymentStatus: "PAID"
  },
  {
    id: "APP-2024-003",
    instrumentId: "INST-1003",
    stakeholderId: "usr-1",
    status: "SUBMITTED",
    submittedDate: formatISO(subDays(today, 1)),
    verificationType: "RE_VERIFICATION",
    routedTo: "GATC",
    fee: 100,
    paymentStatus: "PENDING"
  },
  {
    id: "APP-2024-004",
    instrumentId: "INST-1004", // Edge case mock
    stakeholderId: "usr-1",
    status: "INSPECTED",
    submittedDate: formatISO(subDays(today, 12)),
    scheduledDate: formatISO(subDays(today, 2)),
    verificationType: "NEW",
    routedTo: "LMO",
    fee: 1000,
    paymentStatus: "PAID"
  }
];

export const mockCertificates: Certificate[] = [
  {
    id: "CERT-2024-8831",
    verificationRecordId: "VR-2024-001",
    certificateNo: "LM-CERT-8831",
    qrCodeUrl: "https://example.com/verify/CERT-2024-8831",
    issueDate: formatISO(subDays(today, 40)),
    validUntil: formatISO(addDays(today, 325)), // Valid
    instrumentDetails: {
      name: "Non-automatic Weighing Scale",
      serialNo: "WS-2023-8942"
    }
  },
  {
    id: "CERT-2023-1102",
    verificationRecordId: "VR-2023-992",
    certificateNo: "LM-CERT-1102",
    qrCodeUrl: "https://example.com/verify/CERT-2023-1102",
    issueDate: formatISO(subDays(today, 350)),
    validUntil: formatISO(addDays(today, 15)), // Expiring soon (in 15 days)
    instrumentDetails: {
      name: "Water Meter (Kranti)",
      serialNo: "WM-X9-5510"
    }
  }
];

export const mockNotifications: Notification[] = [
  {
    id: "NOTIF-1",
    stakeholderId: "usr-1",
    type: "ALERT",
    message: "Your certificate LM-CERT-1102 for Water Meter is expiring in 15 days.",
    channel: "SYSTEM",
    sentDate: formatISO(subDays(today, 1)),
    read: false
  },
  {
    id: "NOTIF-2",
    stakeholderId: "usr-1",
    type: "INFO",
    message: "Application APP-2024-002 payment of ₹250 was successful.",
    channel: "SYSTEM",
    sentDate: formatISO(subDays(today, 5)),
    read: false
  },
  {
    id: "NOTIF-3",
    stakeholderId: "usr-1",
    type: "INFO",
    message: "Application APP-2024-004 has been scheduled for inspection.",
    channel: "SYSTEM",
    sentDate: formatISO(subDays(today, 10)),
    read: true
  },
  {
    id: "NOTIF-4",
    stakeholderId: "usr-1",
    type: "SUCCESS",
    message: "Certificate LM-CERT-8831 has been generated and is available for download.",
    channel: "SYSTEM",
    sentDate: formatISO(subDays(today, 40)),
    read: true
  },
  {
    id: "NOTIF-5",
    stakeholderId: "usr-1",
    type: "INFO",
    message: "Welcome to DigiVerifier! Please complete your profile.",
    channel: "SYSTEM",
    sentDate: formatISO(subDays(today, 50)),
    read: true
  }
];
