"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { mockCertificates } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { format, parseISO, differenceInDays } from "date-fns";
import { twMerge } from "tailwind-merge";
import { Download, ExternalLink, ShieldCheck, FileBadge, CalendarClock, Clock } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

export default function CertificatesPage() {
  const today = new Date();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <PageHeader
        title="My Certificates"
        subtitle="View and download all your issued verification certificates."
      />

      {mockCertificates.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileBadge className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Certificates Found</h3>
          <p className="text-gray-500 mt-1 mb-6 max-w-md mx-auto">
            You don&apos;t have any issued certificates yet. Certificates will appear here once your applications are approved.
          </p>
          <Button asChild className="bg-secondary hover:bg-secondary/90 text-white font-semibold">
            <Link href="/apply">Apply for Verification</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {mockCertificates.map(cert => {
            const issueDate = parseISO(cert.issueDate);
            const validUntil = parseISO(cert.validUntil);
            
            const daysLeft = differenceInDays(validUntil, today);
            const totalDays = differenceInDays(validUntil, issueDate);
            const isExpired = daysLeft < 0;
            
            // Calculate progress (100 = full valid period consumed, 0 = just issued)
            // Wait, standard progress bar: 100 = full, 0 = empty. Let's show remaining time as progress.
            const progress = Math.max(0, Math.min(100, (daysLeft / totalDays) * 100));

            return (
              <Card key={cert.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="p-6 flex flex-col sm:flex-row gap-6 relative">
                    {/* QR Code Column */}
                    <div className="shrink-0 flex flex-col items-center justify-center space-y-3">
                      <div className="p-2 bg-white border-2 border-gray-100 rounded-xl shadow-sm">
                        <QRCodeSVG 
                          value={cert.qrCodeUrl} 
                          size={100} 
                          level="M" 
                          includeMargin={false} 
                        />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">SCAN TO VERIFY</span>
                    </div>

                    {/* Details Column */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md font-mono text-lg font-bold tracking-wider border border-blue-100 shadow-sm inline-block">
                          {cert.certificateNo}
                        </div>
                        {isExpired ? (
                          <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-red-200">
                            <Clock className="w-3.5 h-3.5" /> EXPIRED
                          </span>
                        ) : (
                          <span className={twMerge(
                            "text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border",
                            daysLeft < 30 ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-green-100 text-green-800 border-green-200"
                          )}>
                            <ShieldCheck className="w-3.5 h-3.5" /> {daysLeft} DAYS LEFT
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mt-4 leading-tight">
                        {cert.instrumentDetails.name as string}
                      </h3>
                      <p className="text-gray-500 font-mono text-sm mt-1 mb-6">SN: {cert.instrumentDetails.serialNo as string}</p>

                      <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                            <CalendarClock className="w-3.5 h-3.5" /> Issued On
                          </p>
                          <p className="font-semibold text-gray-900">{format(issueDate, "dd MMM, yyyy")}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                            <CalendarClock className="w-3.5 h-3.5" /> Valid Until
                          </p>
                          <p className={twMerge("font-semibold", isExpired ? "text-red-600" : "text-gray-900")}>
                            {format(validUntil, "dd MMM, yyyy")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Validity Progress Bar */}
                  <div className="px-6 py-3 bg-gray-50 border-t border-b">
                    <div className="flex justify-between text-xs font-semibold mb-2">
                      <span className="text-gray-500 uppercase tracking-wider">Validity Period</span>
                      <span className={twMerge(isExpired ? "text-red-500" : daysLeft < 30 ? "text-amber-600" : "text-green-600")}>
                        {isExpired ? "0%" : `${Math.round(progress)}% Remaining`}
                      </span>
                    </div>
                    <Progress 
                      value={progress} 
                      className="h-1.5 bg-gray-200" 
                      indicatorColor={isExpired ? "bg-red-500" : daysLeft < 30 ? "bg-amber-500" : "bg-green-500"} 
                    />
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-white flex justify-end gap-3">
                    <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                      <Download className="w-4 h-4 mr-2" /> Download PDF
                    </Button>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                      <Link href={`/verify/${cert.id}`}>
                        <ExternalLink className="w-4 h-4 mr-2" /> View Certificate
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
