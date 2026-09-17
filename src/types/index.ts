export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'APPLICANT' | 'LMO' | 'GATC' | 'ADMIN';
  aadhaarOrGstin?: string;
  jurisdictionId?: string;
}

export interface Instrument {
  id: string;
  stakeholderId: string;
  category: string;
  serialNo: string;
  manufacturer: string;
  accuracyClass: string;
  model: string;
  purchaseYear: number;
}

export interface Application {
  id: string;
  instrumentId: string;
  stakeholderId: string;
  officerId?: string;
  gatcId?: string;
  status: string;
  submittedDate: string;
  scheduledDate?: string;
  verificationType: 'NEW' | 'RE_VERIFICATION';
  routedTo: 'LMO' | 'GATC';
  fee: number;
  paymentStatus: string;
}

export interface VerificationRecord {
  id: string;
  applicationId: string;
  inspectorId: string;
  result: 'PASS' | 'FAIL';
  observations: string;
  inspectionDate: string;
  gpsLocation: string;
  photos: string[];
}

export interface Certificate {
  id: string;
  verificationRecordId: string;
  certificateNo: string;
  qrCodeUrl: string;
  issueDate: string;
  validUntil: string;
  instrumentDetails: Record<string, unknown>; // Ideally more specific, but left generic for varying metadata
}

export interface Notification {
  id: string;
  stakeholderId: string;
  type: string;
  message: string;
  channel: string;
  sentDate: string;
  read: boolean;
}
