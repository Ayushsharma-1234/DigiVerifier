export const INSTRUMENT_CATEGORIES = [
  'Automatic Weighing Instruments',
  'Beam Scale',
  'Clinical Thermometer',
  'CNG Dispensers',
  'Counter Machine',
  'Flow meters',
  'LPG Dispensers',
  'Non-automatic Weighing Instruments Electronic Class I',
  'Non-automatic Weighing Instruments Electronic Class II',
  'Non-automatic Weighing Instruments Electronic Class III',
  'Non-automatic Weighing Instruments Electronic Class IIII',
  'Non-automatic Weighing Instruments Mechanical Class I',
  'Non-automatic Weighing Instruments Mechanical Class II',
  'Non-automatic Weighing Instruments Mechanical Class III',
  'Non-automatic Weighing Instruments Mechanical Class IIII',
  'Taxi/Auto meters',
  'Volumetric measuring',
  'Water Meter',
  'Weight',
  'Tape Measure',
  'Load Cell',
  'Sphygmomanometer',
  'Rail Weighbridge'
];

export const GATC_CATEGORIES = [
  'Water Meter',
  'Sphygmomanometer',
  'Clinical Thermometer',
  'Rail Weighbridge',
  'Tape Measure',
  'Non-automatic Weighing Instruments Electronic Class III',
  'Non-automatic Weighing Instruments Mechanical Class III',
  'Non-automatic Weighing Instruments Electronic Class IIII',
  'Non-automatic Weighing Instruments Mechanical Class IIII',
  'Load Cell',
  'Beam Scale',
  'Counter Machine'
  // Simplified array to demonstrate categories handled by GATC.
  // Note: Total GATC handled types count to 23 with variations, but explicitly mentioned here.
];

export const APPLICATION_STATUSES = [
  { label: 'Submitted', value: 'SUBMITTED', color: 'bg-blue-100 text-blue-800' },
  { label: 'Fee Paid', value: 'FEE_PAID', color: 'bg-green-100 text-green-800' },
  { label: 'Scheduled', value: 'SCHEDULED', color: 'bg-purple-100 text-purple-800' },
  { label: 'Inspected', value: 'INSPECTED', color: 'bg-yellow-100 text-yellow-800' },
  { label: 'Passed', value: 'PASSED', color: 'bg-secondary/20 text-secondary' },
  { label: 'Failed', value: 'FAILED', color: 'bg-danger/20 text-danger' },
  { label: 'Certificate Issued', value: 'CERTIFICATE_ISSUED', color: 'bg-emerald-100 text-emerald-800' }
];

export function getRouting(category: string): 'LMO' | 'GATC' {
  if (GATC_CATEGORIES.includes(category)) {
    return 'GATC';
  }
  return 'LMO';
}
