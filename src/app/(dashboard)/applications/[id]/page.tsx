"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { mockApplications, mockInstruments, mockCertificates } from "@/lib/mockData";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  Download, 
  FileText, 
  AlertCircle,
  Building,
  MapPin,
  Clock,
  Phone,
  User
} from "lucide-react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { useParams } from "next/navigation";
import { twMerge } from "tailwind-merge";

export default function ApplicationDetailPage() {
  const params = useParams();
  const appId = params.id as string;
  
  const application = mockApplications.find(a => a.id === appId);
  
  if (!application) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-bold text-gray-900">Application Not Found</h2>
        <p className="text-gray-500 mt-2">The requested application ID does not exist.</p>
        <Button className="mt-6">
          <Link href="/applications">Return to Applications</Link>
        </Button>
      </div>
    );
  }

  const instrument = mockInstruments.find(i => i.id === application.instrumentId);
  const certificate = mockCertificates.find(c => c.verificationRecordId === `VR-${appId.split('-')[2]}` || c.id.includes(appId.split('-')[2])); // Mock relation

  // Timeline logic
  const statusOrder = ["SUBMITTED", "FEE_PAID", "SCHEDULED", "INSPECTED", "PASSED", "FAILED", "CERTIFICATE_ISSUED"];
  const currentIndex = statusOrder.indexOf(application.status);
  
  const isCompleted = (stepIndex: number) => {
    // Map step indices (0-4) to status milestones
    // 0: Submitted
    // 1: Fee Paid
    // 2: Scheduled
    // 3: Inspected/Passed/Failed
    // 4: Certificate Issued
    
    if (stepIndex === 0) return currentIndex >= 0;
    if (stepIndex === 1) return currentIndex >= 1;
    if (stepIndex === 2) return currentIndex >= 2;
    if (stepIndex === 3) return currentIndex >= 3;
    if (stepIndex === 4) return currentIndex >= 6; // Only if CERTIFICATE_ISSUED
    return false;
  };

  const isCurrent = (stepIndex: number) => {
    if (currentIndex === 0 && stepIndex === 0) return true;
    if (currentIndex === 1 && stepIndex === 1) return true;
    if (currentIndex === 2 && stepIndex === 2) return true;
    if ((currentIndex >= 3 && currentIndex <= 5) && stepIndex === 3) return true;
    if (currentIndex === 6 && stepIndex === 4) return true;
    return false;
  };

  const TimelineNode = ({ step, title, desc, date, isLast }: { step: number, title: string, desc: React.ReactNode, date?: string, isLast?: boolean }) => {
    const completed = isCompleted(step);
    const current = isCurrent(step);
    
    return (
      <div className="relative flex gap-6 pb-8">
        {!isLast && (
          <div 
            className={twMerge(
              "absolute left-4 top-8 bottom-0 w-0.5",
              completed ? "bg-green-500" : "bg-gray-200"
            )} 
          />
        )}
        
        <div className="relative z-10 shrink-0">
          {completed && !current ? (
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          ) : current ? (
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center ring-4 ring-blue-50">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
              <Circle className="w-3 h-3 text-gray-300 fill-current" />
            </div>
          )}
        </div>
        
        <div className="pt-1">
          <div className="flex items-center gap-3">
            <h4 className={twMerge("font-bold", current ? "text-blue-900" : completed ? "text-gray-900" : "text-gray-400")}>
              {title}
            </h4>
            {date && <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded">{format(parseISO(date), "dd MMM yyyy, hh:mm a")}</span>}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {completed || current ? desc : <span className="text-gray-400 italic">Pending</span>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <div className="mb-6">
        <Button variant="ghost" className="text-gray-500 hover:text-gray-900 -ml-4">
          <Link href="/applications"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Applications</Link>
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel - 60% */}
        <div className="flex-1 lg:max-w-[60%] space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold font-mono text-blue-900 mb-2">{application.id}</h1>
                <p className="text-gray-500 text-sm">
                  Submitted on {format(parseISO(application.submittedDate), "MMMM dd, yyyy")}
                </p>
              </div>
              <StatusBadge status={application.status} className="text-sm px-3 py-1" />
            </div>
          </div>

          {/* Timeline Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
            <h3 className="font-bold text-gray-900 text-lg mb-8">Application Progress</h3>
            
            <div className="pl-2">
              <TimelineNode 
                step={0} 
                title="Application Submitted" 
                date={application.submittedDate}
                desc={
                  <div className="text-gray-600">
                    Application successfully submitted for {instrument?.category}.
                  </div>
                }
              />
              
              <TimelineNode 
                step={1} 
                title="Fee Paid" 
                desc={
                  <div className="text-gray-600">
                    Verification fee of <span className="font-semibold">₹{application.fee}</span> received. <br/>
                    Transaction ID: <span className="font-mono text-xs bg-gray-100 px-1 rounded">TXN-{Math.floor(100000+Math.random()*900000)}</span>
                  </div>
                }
              />

              <TimelineNode 
                step={2} 
                title="Scheduled for Inspection" 
                date={application.scheduledDate}
                desc={
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mt-2">
                    <p className="text-blue-900 font-medium text-sm flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4" /> 
                      {application.scheduledDate ? format(parseISO(application.scheduledDate), "dd MMM yyyy, 10:00 AM") : "Pending"}
                    </p>
                    <p className="text-blue-700 text-xs flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> 
                      {application.routedTo === 'LMO' ? "Premises of the applicant" : "State Metrology Lab, Ahmedabad"}
                    </p>
                  </div>
                }
              />

              <TimelineNode 
                step={3} 
                title="Inspection Completed" 
                desc={
                  <div className="space-y-2">
                    <p className="text-gray-600 flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" /> Inspected by: Inspector R.K. Sharma
                    </p>
                    {application.status === 'PASSED' || application.status === 'CERTIFICATE_ISSUED' ? (
                      <span className="inline-flex bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">RESULT: PASSED</span>
                    ) : application.status === 'FAILED' ? (
                      <span className="inline-flex bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">RESULT: FAILED</span>
                    ) : (
                      <span className="text-sm text-gray-500">Inspection ongoing or result pending upload.</span>
                    )}
                  </div>
                }
              />

              <TimelineNode 
                step={4} 
                title="Certificate Issued" 
                isLast
                desc={
                  certificate ? (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-3">
                        Digital certificate <span className="font-mono font-bold text-gray-900">{certificate.certificateNo}</span> has been generated.
                      </p>
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Download className="w-4 h-4 mr-2" /> Download PDF Certificate
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Certificate generation is in progress.</span>
                  )
                }
              />
            </div>
          </div>

          {/* Instrument Details */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-bold text-gray-900 mb-4">Instrument Details</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Category</p>
                <p className="font-semibold text-gray-900">{instrument?.category}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Serial Number</p>
                <p className="font-mono font-medium text-gray-900">{instrument?.serialNo}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Manufacturer</p>
                <p className="font-medium text-gray-900">{instrument?.manufacturer}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Accuracy Class</p>
                <p className="font-medium text-gray-900">{instrument?.accuracyClass}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-bold text-gray-900 mb-4">Uploaded Documents</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Instrument_Photograph.jpg</p>
                    <p className="text-xs text-gray-500">2.4 MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">Download</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - 40% */}
        <div className="w-full lg:w-[40%] space-y-6">
          
          {/* Assignment Details */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className={twMerge("p-4 border-b", application.routedTo === 'GATC' ? "bg-indigo-50 border-indigo-100" : "bg-blue-50 border-blue-100")}>
              <div className="flex items-center gap-2">
                <Building className={twMerge("w-5 h-5", application.routedTo === 'GATC' ? "text-indigo-600" : "text-blue-600")} />
                <h3 className="font-bold text-gray-900">
                  {application.routedTo === 'GATC' ? "Assigned Test Centre" : "Assigned Authority"}
                </h3>
              </div>
            </div>
            <div className="p-5 text-sm space-y-4">
              {application.routedTo === 'GATC' ? (
                <>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Centre Name</p>
                    <p className="font-bold text-gray-900 text-base">State Metrology Lab</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">License No</p>
                    <p className="font-mono text-gray-900">GATC-GJ-2023-04</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Address</p>
                    <p className="text-gray-900">GIDC, Vatva, Ahmedabad, Gujarat 382445</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Contact</p>
                    <p className="text-gray-900 flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400" /> +91 79 2345 6789</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Officer Details</p>
                    <p className="font-bold text-gray-900 text-base">Mr. R.K. Sharma</p>
                    <p className="text-gray-600">Legal Metrology Officer</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Jurisdiction</p>
                    <p className="text-gray-900">Ahmedabad District (Zone 2)</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Contact Email</p>
                    <p className="text-gray-900">lmo.ahd.z2@gujarat.gov.in</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Fee & Payment Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-bold text-gray-900 mb-4">Fee Details</h3>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Verification Fee</span>
                <span className="font-medium text-gray-900">₹{application.fee}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="font-bold text-gray-900">Total Paid</span>
                <span className="text-lg font-bold text-gray-900">₹{application.fee}</span>
              </div>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg border border-green-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4" /> Payment Successful
              </div>
              <span className="text-xs text-green-600 font-mono">TXN-884920</span>
            </div>
          </div>

          {/* Help Card */}
          <div className="bg-gray-50 rounded-xl border p-6 border-dashed border-gray-300">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-gray-400" />
              <h3 className="font-bold text-gray-700">Need Help?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">If you are facing issues with this application, you can raise a grievance with the department.</p>
            <Button variant="outline" className="w-full mb-3 bg-white">Raise a Concern</Button>
            <p className="text-xs text-center text-gray-400">Or call toll-free <span className="font-bold text-gray-600">1967</span></p>
          </div>

        </div>
      </div>
    </div>
  );
}
