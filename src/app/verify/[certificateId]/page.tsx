"use client";

import { format, parseISO, differenceInDays } from "date-fns";
import { ShieldCheck, XCircle, AlertTriangle, Building2, Calendar, MapPin, Scale, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";

export default function VerificationPage() {
  const params = useParams();
  const certId = params.certificateId as string;
  
  const [isMounted, setIsMounted] = useState(false);
  const [scanTime, setScanTime] = useState("");
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setScanTime(format(new Date(), "dd MMM yyyy, hh:mm:ss a"));
    
    publicApi.verifyCertificate(certId)
      .then(data => {
        setCertificate(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [certId]);

  const today = new Date();
  
  let status: "VALID" | "EXPIRED" | "NOT_FOUND" = "NOT_FOUND";
  
  if (error || (!loading && !certificate)) {
    status = "NOT_FOUND";
  } else if (certificate) {
    const validUntil = parseISO(certificate.validUntil);
    const daysLeft = differenceInDays(validUntil, today);
    status = daysLeft >= 0 ? "VALID" : "EXPIRED";
  }

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-8 h-8 text-blue-700" />
            <div>
              <h1 className="font-bold text-xl text-blue-900 leading-tight tracking-tight">DigiVerifier</h1>
              <p className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">Verification Portal</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-gray-800">Ministry of Consumer Affairs,</p>
            <p className="text-xs text-gray-500">Food & Public Distribution</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 py-12">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border overflow-hidden">
          
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600 font-medium animate-pulse">Verifying certificate...</p>
            </div>
          ) : (
            <>
              <div className={twMerge(
                "p-8 text-center",
                status === "VALID" ? "bg-green-50 border-b border-green-100" :
                status === "EXPIRED" ? "bg-red-50 border-b border-red-100" :
                "bg-amber-50 border-b border-amber-100"
              )}>
                {status === "VALID" && (
                  <>
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-4 border-white ring-4 ring-green-50">
                      <ShieldCheck className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-green-700 uppercase tracking-wide">✓ Verified and Valid</h2>
                    <p className="text-green-600 mt-2 font-medium">This certificate is authentic and currently active.</p>
                  </>
                )}

                {status === "EXPIRED" && (
                  <>
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-4 border-white ring-4 ring-red-50">
                      <XCircle className="w-12 h-12 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-red-700 uppercase tracking-wide">✗ Certificate Expired</h2>
                    <p className="text-red-600 mt-2 font-medium">The validity period for this certificate has lapsed.</p>
                  </>
                )}

                {status === "NOT_FOUND" && (
                  <>
                    <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-4 border-white ring-4 ring-amber-50">
                      <AlertTriangle className="w-12 h-12 text-amber-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-amber-700 uppercase tracking-wide">Not Found</h2>
                    <p className="text-amber-700 mt-2 font-medium">Certificate not found. This QR code may be invalid or tampered.</p>
                  </>
                )}
              </div>

              {(status === "VALID" || status === "EXPIRED") && certificate && (
                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Certificate Number</p>
                    <div className="inline-block bg-gray-100 text-gray-800 font-mono text-lg font-bold px-3 py-1 rounded">
                      {certificate.certificateNo}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="mt-1 p-2 bg-blue-50 rounded text-blue-600"><Scale className="w-5 h-5" /></div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Instrument Details</p>
                        <p className="font-bold text-gray-900 text-lg">{certificate.verificationRecord?.application?.instrument?.category || "Unknown"}</p>
                        <p className="text-gray-500 font-mono text-sm mt-0.5">SN: {certificate.verificationRecord?.application?.instrument?.serialNo || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="mt-1 p-2 bg-blue-50 rounded text-blue-600"><Building2 className="w-5 h-5" /></div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Verified By</p>
                        <p className="font-bold text-gray-900">{certificate.verificationRecord?.application?.officer?.user?.name || "Legal Metrology Officer"}</p>
                        <p className="text-gray-500 text-sm">State Metrology Department</p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="mt-1 p-2 bg-blue-50 rounded text-blue-600"><Calendar className="w-5 h-5" /></div>
                      <div className="w-full grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Verification Date</p>
                          <p className="font-bold text-gray-900">{certificate.issueDate ? format(parseISO(certificate.issueDate), "dd MMM yyyy") : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Valid Until</p>
                          <p className={twMerge("font-bold", status === "EXPIRED" ? "text-red-600" : "text-gray-900")}>
                            {certificate.validUntil ? format(parseISO(certificate.validUntil), "dd MMM yyyy") : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 items-start">
                      <div className="mt-1 p-2 bg-blue-50 rounded text-blue-600"><MapPin className="w-5 h-5" /></div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Place of Use</p>
                        <p className="font-bold text-gray-900">{certificate.verificationRecord?.application?.instrument?.addressLine1 || "Market Yard"}</p>
                      </div>
                    </div>
                  </div>

                  {status === "EXPIRED" && (
                    <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                      <p className="text-red-800 font-semibold text-sm">
                        The instrument owner must apply for re-verification immediately to comply with the Legal Metrology Act.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {status === "NOT_FOUND" && (
                <div className="p-8 text-center bg-white">
                  <p className="text-gray-600 mb-6">If you believe this is an error, please ensure you scanned the correct QR code or contact the Legal Metrology Department.</p>
                  <Link href="/" className="text-blue-600 font-semibold hover:underline">
                    Return to DigiVerifier Home
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="mt-8 text-center text-xs text-gray-400 space-y-1">
          <p>Scan time: {scanTime}</p>
          <p>Powered by DigiVerifier — Ministry of Consumer Affairs, Government of India</p>
        </div>
      </main>
    </div>
  );
}
