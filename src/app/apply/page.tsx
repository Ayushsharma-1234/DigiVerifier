"use client";

import { useState } from "react";
import { mockInstruments, mockCertificates } from "@/lib/mockData";
import { getRouting } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Scale, 
  Droplet, 
  Thermometer, 
  Activity, 
  AlertCircle,
  Building,
  MapPin,
  Clock,
  IndianRupee,
  Upload,
  FileText,
  X,
  CreditCard,
  Smartphone,
  Wallet,
  Info
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { differenceInDays, parseISO, format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Mock GATC data for step 3
const mockGATCs = [
  { id: "gatc-1", name: "State Metrology Lab, Ahmedabad", address: "GIDC, Vatva", tat: "2-3 days" },
  { id: "gatc-2", name: "Precision Testing Centre", address: "Sarkhej, Ahmedabad", tat: "1-2 days" },
];

export default function ApplyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<string | null>(null);
  const [verificationType, setVerificationType] = useState<"NEW" | "RE_VERIFICATION">("NEW");
  const [selectedGatc, setSelectedGatc] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);

  // Document states
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [manualFile, setManualFile] = useState<File | null>(null);
  const [additionalFile, setAdditionalFile] = useState<File | null>(null);

  const selectedInstrument = mockInstruments.find(i => i.id === selectedInstrumentId);
  const instrumentCert = selectedInstrument 
    ? mockCertificates.find(c => (c.instrumentDetails.serialNo as string) === selectedInstrument.serialNo)
    : null;

  const routing = selectedInstrument ? getRouting(selectedInstrument.category) : null;
  const isGATC = routing === "GATC";
  const feeAmount = isGATC ? 250 : 500;
  
  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(c => c + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
  };

  const simulatePayment = () => {
    setIsSimulatingPayment(true);
    setTimeout(() => {
      setIsPaid(true);
      setIsSimulatingPayment(false);
    }, 1500);
  };

  const getIcon = (cat: string) => {
    if (cat.toLowerCase().includes("water")) return <Droplet className="h-6 w-6 text-blue-500" />;
    if (cat.toLowerCase().includes("thermo")) return <Thermometer className="h-6 w-6 text-red-500" />;
    if (cat.toLowerCase().includes("sphygmo")) return <Activity className="h-6 w-6 text-purple-500" />;
    return <Scale className="h-6 w-6 text-emerald-500" />;
  };

  const renderStepIndicator = () => {
    const steps = [
      { num: 1, label: "Instrument" },
      { num: 2, label: "Type" },
      { num: 3, label: "Authority & Fee" },
      { num: 4, label: "Documents & Pay" },
      { num: 5, label: "Confirmation" }
    ];

    return (
      <div className="mb-10 relative">
        {/* Connecting Lines Container */}
        <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-gray-200 z-0">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-in-out" 
            style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
          />
        </div>
        
        {/* Step Circles */}
        <div className="relative z-10 flex justify-between">
          {steps.map((step) => {
            const isCompleted = step.num < currentStep;
            const isCurrent = step.num === currentStep;
            return (
              <div key={step.num} className="flex flex-col items-center">
                <div 
                  className={twMerge(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ring-4 ring-white shadow-sm",
                    isCompleted ? "bg-green-500 text-white" : 
                    isCurrent ? "bg-blue-600 text-white shadow-md scale-110" : 
                    "bg-gray-100 text-gray-400"
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : step.num}
                </div>
                <span className={twMerge(
                  "mt-3 text-xs font-semibold uppercase tracking-wider hidden sm:block",
                  isCompleted ? "text-green-600" : 
                  isCurrent ? "text-blue-600" : 
                  "text-gray-400"
                )}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Which instrument do you want to get verified?</h2>
      
      {mockInstruments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <Scale className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No instruments found</h3>
          <p className="text-gray-500 mb-6 mt-2">You need to register an instrument before applying for verification.</p>
          <Button asChild>
            <Link href="/instruments/new">Register an Instrument First</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockInstruments.map(inst => (
            <div 
              key={inst.id}
              onClick={() => setSelectedInstrumentId(inst.id)}
              className={twMerge(
                "relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 group flex items-start gap-4 bg-white",
                selectedInstrumentId === inst.id 
                  ? "border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-600/20" 
                  : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
              )}
            >
              <div className="p-3 bg-gray-50 rounded-lg group-hover:scale-105 transition-transform">
                {getIcon(inst.category)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 line-clamp-1">{inst.category}</h3>
                <p className="text-sm text-gray-500 mt-1 font-mono">{inst.serialNo}</p>
                <div className="mt-2 text-xs text-gray-500 flex gap-2">
                  <span className="bg-gray-100 px-2 py-0.5 rounded">{inst.manufacturer}</span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded">{inst.accuracyClass}</span>
                </div>
              </div>
              {selectedInstrumentId === inst.id && (
                <div className="absolute top-3 right-3 text-blue-600 bg-white rounded-full">
                  <CheckCircle2 className="w-6 h-6 fill-current text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t see your instrument? <Link href="/instruments/new" className="text-blue-600 font-semibold hover:underline">Register it now</Link>
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleNext} disabled={!selectedInstrumentId} size="lg" className="px-8 text-white">
          Next Step <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => {
    let warning = null;
    if (instrumentCert) {
      const daysLeft = differenceInDays(parseISO(instrumentCert.validUntil), new Date());
      if (daysLeft > 0) {
        warning = (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-amber-800">Active Certificate Exists</h4>
              <p className="text-sm text-amber-700 mt-1">
                This instrument has a valid certificate until <span className="font-bold">{format(parseISO(instrumentCert.validUntil), "dd MMM, yyyy")}</span>. 
                Are you sure you want to apply for re-verification?
              </p>
            </div>
          </div>
        );
      }
    }

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Type of verification</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div 
            onClick={() => setVerificationType("NEW")}
            className={twMerge(
              "p-6 rounded-xl border-2 cursor-pointer transition-all",
              verificationType === "NEW" 
                ? "border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-600/20" 
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg text-gray-900">New Verification</h3>
              <div className={twMerge("w-5 h-5 rounded-full border-2 flex items-center justify-center", verificationType === "NEW" ? "border-blue-600" : "border-gray-300")}>
                {verificationType === "NEW" && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
              </div>
            </div>
            <p className="text-sm text-gray-500">For instruments being verified and stamped for the very first time.</p>
          </div>

          <div 
            onClick={() => setVerificationType("RE_VERIFICATION")}
            className={twMerge(
              "p-6 rounded-xl border-2 cursor-pointer transition-all",
              verificationType === "RE_VERIFICATION" 
                ? "border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-600/20" 
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg text-gray-900">Re-verification</h3>
              <div className={twMerge("w-5 h-5 rounded-full border-2 flex items-center justify-center", verificationType === "RE_VERIFICATION" ? "border-blue-600" : "border-gray-300")}>
                {verificationType === "RE_VERIFICATION" && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
              </div>
            </div>
            <p className="text-sm text-gray-500">For instruments whose validity has expired or is expiring soon.</p>
          </div>
        </div>

        {warning}

        <div className="mt-8 bg-gray-50 rounded-xl p-5 border">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Selected Instrument</h4>
          <div className="flex items-center gap-4">
             <div className="p-3 bg-white rounded-lg shadow-sm border">
               {selectedInstrument && getIcon(selectedInstrument.category)}
             </div>
             <div>
               <h3 className="font-bold text-gray-900">{selectedInstrument?.category}</h3>
               <p className="text-sm text-gray-600 font-mono">SN: {selectedInstrument?.serialNo}</p>
             </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <Button onClick={handleBack} variant="outline" size="lg">
            <ArrowLeft className="mr-2 w-4 h-4" /> Back
          </Button>
          <Button onClick={handleNext} size="lg" className="px-8 text-white">
            Next Step <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Authority & Fee</h2>
      <p className="text-gray-500 mb-6">Your application routing is automatically determined based on the Legal Metrology rules.</p>
      
      <div className="bg-white rounded-xl border overflow-hidden shadow-sm mb-8">
        <div className={twMerge("p-4 border-b", isGATC ? "bg-indigo-50 border-indigo-100" : "bg-blue-50 border-blue-100")}>
          <div className="flex items-center gap-2">
            <Building className={twMerge("w-5 h-5", isGATC ? "text-indigo-600" : "text-blue-600")} />
            <h3 className="font-bold text-gray-900">
              Routed to: {isGATC ? "Government Approved Test Centre (GATC)" : "State Legal Metrology Department (LMO)"}
            </h3>
          </div>
          <p className="text-sm text-gray-600 mt-2 ml-7">
            {isGATC 
              ? `${selectedInstrument?.category} is a GATC-verified category under the Legal Metrology GATC Rules, 2013, Fifth Schedule.`
              : `${selectedInstrument?.category} falls under the jurisdiction of the State Legal Metrology Officer.`}
          </p>
        </div>
        
        <div className="p-5">
          {isGATC ? (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Select a GATC in your district:</h4>
              <div className="space-y-3">
                {mockGATCs.map(gatc => (
                  <div 
                    key={gatc.id}
                    onClick={() => setSelectedGatc(gatc.id)}
                    className={twMerge(
                      "p-4 rounded-lg border cursor-pointer transition-all flex items-center justify-between",
                      selectedGatc === gatc.id ? "border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600" : "hover:border-gray-300"
                    )}
                  >
                    <div>
                      <h5 className="font-bold text-gray-900">{gatc.name}</h5>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {gatc.address}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> TAT: {gatc.tat}</span>
                      </div>
                    </div>
                    <div className={twMerge("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0", selectedGatc === gatc.id ? "border-indigo-600" : "border-gray-300")}>
                      {selectedGatc === gatc.id && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-6">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-bold text-gray-900">Ahmedabad District</h4>
                <p className="text-sm text-gray-500 mt-1">Your application will be assigned to the Legal Metrology Officer for your registered jurisdiction.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <h3 className="font-bold text-gray-900 mb-4">Fee Calculation</h3>
      <div className="bg-gray-50 rounded-xl p-5 border space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Instrument Category</span>
          <span className="font-medium text-gray-900 text-right w-1/2 line-clamp-1" title={selectedInstrument?.category}>{selectedInstrument?.category}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Applicable Schedule</span>
          <span className="font-medium text-gray-900">{isGATC ? "Fifth Schedule (GATC)" : "State Fee Schedule"}</span>
        </div>
        <div className="flex justify-between text-sm pt-3 border-t">
          <span className="text-gray-600">Verification Fee</span>
          <span className="font-medium text-gray-900">₹{feeAmount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Late Fee</span>
          <span className="font-medium text-gray-900">₹0</span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t mt-3">
          <span className="font-bold text-gray-900">Total Payable</span>
          <span className="text-xl font-bold text-green-600">₹{feeAmount}</span>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Button onClick={handleBack} variant="outline" size="lg">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={isGATC && !selectedGatc}
          size="lg" 
          className="px-8 text-white"
        >
          Next Step <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => {
    // Mock file upload handler
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
      if (e.target.files && e.target.files[0]) {
        setter(e.target.files[0]);
      }
    };

    const FileUploadUI = ({ 
      label, 
      required, 
      file, 
      setter, 
      accept 
    }: { 
      label: string, 
      required?: boolean, 
      file: File | null, 
      setter: React.Dispatch<React.SetStateAction<File | null>>,
      accept: string
    }) => (
      <div className="mb-4">
        <Label className="text-sm font-semibold mb-2 block text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        {!file ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors relative group">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              accept={accept}
              onChange={(e) => handleFileUpload(e, setter)}
            />
            <div className="text-center flex flex-col items-center pointer-events-none">
              <Upload className="w-8 h-8 text-gray-400 mb-2 group-hover:text-blue-500 transition-colors" />
              <p className="text-sm text-gray-600 font-medium">Click or drag file to upload</p>
              <p className="text-xs text-gray-400 mt-1">Accepts {accept}</p>
            </div>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg p-3 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 bg-blue-100 text-blue-600 rounded">
                <FileText className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setter(null)} className="text-gray-400 hover:text-red-500 shrink-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    );

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500 grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Documents</h2>
          <FileUploadUI 
            label="Recent photograph of the instrument" 
            required 
            file={photoFile} 
            setter={setPhotoFile} 
            accept="image/*" 
          />
          <FileUploadUI 
            label="Instrument manual/specification sheet" 
            file={manualFile} 
            setter={setManualFile} 
            accept=".pdf" 
          />
          <FileUploadUI 
            label="Any additional supporting document" 
            file={additionalFile} 
            setter={setAdditionalFile} 
            accept=".pdf,.doc,.docx" 
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Options</h2>
          <div className="bg-gray-50 p-6 rounded-xl border h-[calc(100%-3rem)] flex flex-col">
            <div className="mb-6 pb-6 border-b text-center">
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-2">Total Amount to Pay</p>
              <p className="text-4xl font-bold text-gray-900 flex items-center justify-center">
                <IndianRupee className="w-8 h-8 mr-1 text-gray-700" /> {feeAmount}
              </p>
            </div>
            
            {isPaid ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Payment Successful</h3>
                <p className="text-sm text-gray-500 mt-2">Your fee has been received.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="space-y-3 mb-6">
                  {[
                    { id: 'upi', name: 'UPI', icon: <Smartphone className="w-5 h-5" /> },
                    { id: 'card', name: 'Credit / Debit Card', icon: <CreditCard className="w-5 h-5" /> },
                    { id: 'netbanking', name: 'Net Banking', icon: <Wallet className="w-5 h-5" /> },
                  ].map(method => (
                    <div 
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={twMerge(
                        "p-3 rounded-lg border bg-white cursor-pointer flex items-center gap-3 transition-colors",
                        paymentMethod === method.id ? "border-green-600 ring-1 ring-green-600 shadow-sm" : "hover:border-gray-300"
                      )}
                    >
                      <div className={twMerge("p-2 rounded", paymentMethod === method.id ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                        {method.icon}
                      </div>
                      <span className="font-medium text-gray-900">{method.name}</span>
                      <div className="ml-auto">
                        <div className={twMerge("w-4 h-4 rounded-full border-2", paymentMethod === method.id ? "border-green-600 bg-green-600" : "border-gray-300")}>
                          {paymentMethod === method.id && <Check className="w-full h-full text-white scale-75" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-auto">
                  <Button 
                    onClick={simulatePayment} 
                    disabled={!photoFile || !paymentMethod || isSimulatingPayment} 
                    className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold text-lg relative overflow-hidden group"
                  >
                    {isSimulatingPayment ? (
                      <span className="flex items-center">
                        <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2" />
                        Processing...
                      </span>
                    ) : (
                      "Simulate Payment"
                    )}
                    {/* Shine effect */}
                    <div className="absolute inset-0 -translate-x-full bg-white/20 skew-x-12 group-hover:animate-[shine_1s_ease-in-out]" />
                  </Button>
                  <p className="text-xs text-center text-gray-500 mt-3 font-medium">
                    {!photoFile ? "Upload required photograph first" : !paymentMethod ? "Select a payment method" : "This is a mock payment for demonstration"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 mt-4 pt-6 border-t flex justify-between">
          <Button onClick={handleBack} variant="outline" size="lg">
            <ArrowLeft className="mr-2 w-4 h-4" /> Back
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={!isPaid}
            size="lg" 
            className="px-8 text-white bg-blue-600 hover:bg-blue-700"
          >
            Submit Application <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderStep5 = () => {
    // Generate mock reference
    const refNum = `LM-GJ-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const gatcName = mockGATCs.find(g => g.id === selectedGatc)?.name;

    return (
      <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-4 border-white ring-4 ring-green-50">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Application Submitted Successfully!</h2>
          <p className="text-gray-500 mt-2 text-lg">Your application for verification has been received.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
          
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Application Reference Number</p>
            <div className="inline-block bg-blue-50 border border-blue-200 text-blue-700 font-mono text-2xl font-bold py-3 px-6 rounded-lg tracking-wider shadow-sm">
              {refNum}
            </div>
            <p className="text-xs text-gray-400 mt-3">Please save this number for future correspondence.</p>
          </div>

          <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm relative z-10">
            <div>
              <p className="text-gray-500 mb-1">Instrument</p>
              <p className="font-bold text-gray-900">{selectedInstrument?.category}</p>
              <p className="text-xs text-gray-500 font-mono mt-0.5">{selectedInstrument?.serialNo}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Verification Type</p>
              <p className="font-bold text-gray-900">{verificationType === "NEW" ? "New Verification" : "Re-verification"}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Assigned To</p>
              <p className="font-bold text-gray-900">{isGATC ? gatcName : "State LMO (Ahmedabad)"}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Fee Paid</p>
              <p className="font-bold text-green-600 text-lg">₹{feeAmount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 border mb-8">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" /> What happens next?
          </h3>
          <div className="space-y-4">
            {[
              "Your application will be reviewed within 3 working days.",
              isGATC 
                ? "You need to bring the instrument to the selected GATC on the scheduled date." 
                : "You will receive an SMS/email with your inspection date and time from the LMO.",
              "After successful inspection, your digital certificate will be issued instantly."
            ].map((text, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-gray-700 leading-snug">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline" size="lg" className="sm:flex-1 h-12 bg-white">
            <Link href="/dashboard/applicant">Go to Dashboard</Link>
          </Button>
          <Button asChild size="lg" className="sm:flex-1 h-12 text-white shadow-md hover:shadow-lg transition-shadow">
            <Link href={`/applications/${refNum}`}>Track Application</Link>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Application for Verification</h1>
        <p className="text-gray-500 mt-2 max-w-xl mx-auto">Complete the wizard below to submit your measuring instrument for verification and stamping.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-10">
        {renderStepIndicator()}
        
        <div className="mt-8 pt-8 border-t min-h-[400px]">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </div>
      </div>
    </div>
  );
}
