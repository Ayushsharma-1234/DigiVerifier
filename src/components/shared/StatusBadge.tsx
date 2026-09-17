import { twMerge } from "tailwind-merge";
import { CheckCircle2 } from "lucide-react";

export type ApplicationStatus = 
  | "SUBMITTED" 
  | "FEE_PAID" 
  | "SCHEDULED" 
  | "INSPECTED" 
  | "PASSED" 
  | "FAILED" 
  | "CERTIFICATE_ISSUED";

interface StatusBadgeProps {
  status: ApplicationStatus | string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  SUBMITTED: "bg-gray-100 text-gray-800 border-gray-200",
  FEE_PAID: "bg-blue-100 text-blue-800 border-blue-200",
  SCHEDULED: "bg-purple-100 text-purple-800 border-purple-200",
  INSPECTED: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PASSED: "bg-green-100 text-green-800 border-green-200",
  FAILED: "bg-red-100 text-red-800 border-red-200",
  CERTIFICATE_ISSUED: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const statusLabels: Record<string, string> = {
  SUBMITTED: "Submitted",
  FEE_PAID: "Fee Paid",
  SCHEDULED: "Scheduled",
  INSPECTED: "Inspected",
  PASSED: "Passed",
  FAILED: "Failed",
  CERTIFICATE_ISSUED: "Certificate Issued",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toUpperCase();
  const style = statusStyles[normalizedStatus] || "bg-gray-100 text-gray-800 border-gray-200";
  const label = statusLabels[normalizedStatus] || status;

  return (
    <span
      className={twMerge(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        style,
        className
      )}
    >
      {normalizedStatus === "CERTIFICATE_ISSUED" && (
        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
      )}
      {label}
    </span>
  );
}
