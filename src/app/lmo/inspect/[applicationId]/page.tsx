"use client";

import { useState } from "react";
import { RoleGuard } from "@/components/shared/RoleGuard";
import { PageHeader } from "@/components/shared/PageHeader";
import { mockApplications, mockInstruments } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, CheckCircle2, XCircle, MapPin, Upload, FileText, X, AlertTriangle, ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import toast from "react-hot-toast";

// Mock Test Points for a 20kg Scale (Class III)
const maxPermissibleError = "± 10g";
const testPoints = [
  { capacity: "10%", weight: "2 kg" },
  { capacity: "25%", weight: "5 kg" },
  { capacity: "50%", weight: "10 kg" },
  { capacity: "75%", weight: "15 kg" },
  { capacity: "100%", weight: "20 kg" }
];

export default function InspectionFormPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.applicationId as string;
  
  const application = mockApplications.find(a => a.id === appId);
  const instrument = mockInstruments.find(i => i.id === application?.instrumentId);

  // Form State - Section A
  const [descMatch, setDescMatch] = useState<"YES" | "NO">("YES");
  const [condition, setCondition] = useState<"GOOD" | "DAMAGED" | "MODIFIED">("GOOD");
  const [seal, setSeal] = useState<"INTACT" | "TAMPERED" | "MISSING">("INTACT");
  const [serialMatch, setSerialMatch] = useState<"YES" | "NO">("YES");
  const [beforePhoto, setBeforePhoto] = useState<File | null>(null);

  // Form State - Section B (Readings)
  const [readings, setReadings] = useState<Record<number, string>>({});
  
  // Form State - Section C
  const [decision, setDecision] = useState<"PASS" | "FAIL" | null>(null);
  const [observations, setObservations] = useState("");
  const [stampApplied, setStampApplied] = useState(false);
  const [afterPhoto, setAfterPhoto] = useState<File | null>(null);
  const [location, setLocation] = useState<{lat: string, lng: string, address: string} | null>(null);
  const [isCapturingLoc, setIsCapturingLoc] = useState(false);

  // Form State - Section D
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!application || !instrument) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-bold text-gray-900">Application Not Found</h2>
        <Button asChild className="mt-6"><Link href="/lmo/queue">Return to Queue</Link></Button>
      </div>
    );
  }

  const handleCaptureLocation = () => {
    setIsCapturingLoc(true);
    // Simulate GPS fetch delay
    setTimeout(() => {
      setLocation({
        lat: "23.2156",
        lng: "72.6369",
        address: "Sector 24, Gandhinagar, Gujarat 382024"
      });
      setIsCapturingLoc(false);
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (e.target.files && e.target.files[0]) setter(e.target.files[0]);
  };

  const calculateError = (index: number) => {
    const reading = parseFloat(readings[index]);
    if (isNaN(reading)) return null;
    
    const standardWeight = parseFloat(testPoints[index].weight);
    const error = reading - standardWeight;
    const errorGrams = error * 1000; // Convert to grams
    
    // Simple mock tolerance check (± 10g)
    const isWithinTolerance = Math.abs(errorGrams) <= 10;
    
    return {
      value: errorGrams > 0 ? `+${errorGrams.toFixed(1)}g` : `${errorGrams.toFixed(1)}g`,
      isWithinTolerance
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision) {
      toast.error("Please select an overall verification decision (PASS/FAIL).");
      return;
    }
    if (decision === "FAIL" && !observations) {
      toast.error("Observations are required when failing an inspection.");
      return;
    }
    if (pin.length !== 4) {
      toast.error("Please enter your 4-digit officer PIN to sign the report.");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      if (decision === "PASS") {
        toast.success("Inspection submitted successfully. Certificate will be generated automatically.");
      } else {
        toast.error("Inspection submitted as FAILED. Applicant will be notified.", { icon: '❌' });
      }
      router.push("/lmo/queue");
    }, 1500);
  };

  const RadioCard = ({ 
    selected, 
    onClick, 
    label, 
    color = "blue" 
  }: { 
    selected: boolean, 
    onClick: () => void, 
    label: string, 
    color?: "blue" | "green" | "red" | "amber" 
  }) => {
    const colorStyles = {
      blue: selected ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600 text-blue-700" : "border-gray-200 hover:border-blue-300",
      green: selected ? "border-green-600 bg-green-50 ring-1 ring-green-600 text-green-700" : "border-gray-200 hover:border-green-300",
      red: selected ? "border-red-600 bg-red-50 ring-1 ring-red-600 text-red-700" : "border-gray-200 hover:border-red-300",
      amber: selected ? "border-amber-500 bg-amber-50 ring-1 ring-amber-500 text-amber-700" : "border-gray-200 hover:border-amber-300"
    };

    return (
      <div 
        onClick={onClick}
        className={twMerge(
          "px-4 py-3 rounded-lg border-2 cursor-pointer font-bold text-center transition-all flex-1",
          colorStyles[color],
          !selected && "text-gray-600 bg-white"
        )}
      >
        {label}
      </div>
    );
  };

  return (
    <RoleGuard allowedRoles={['LMO']}>
      <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500 pb-24">
        
        <div className="mb-6 flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/lmo/queue"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Field Inspection Report</h1>
            <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
              <span className="font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">{appId}</span>
              <span className="text-gray-300">•</span>
              <span className="font-medium text-gray-700">Mock Applicant Corp.</span>
              <span className="text-gray-300">•</span>
              <span>{instrument.category}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section A */}
          <Card className="shadow-sm border-gray-200 overflow-hidden">
            <div className="bg-blue-50 border-b border-blue-100 p-4">
              <h2 className="font-bold text-blue-900 text-lg flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-blue-200 text-blue-800 flex items-center justify-center text-sm">A</span>
                Instrument Identification
              </h2>
            </div>
            <CardContent className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-base text-gray-800">Is the instrument as described in the application?</Label>
                  <div className="flex gap-3">
                    <RadioCard selected={descMatch === "YES"} onClick={() => setDescMatch("YES")} label="Yes, Matches" color="green" />
                    <RadioCard selected={descMatch === "NO"} onClick={() => setDescMatch("NO")} label="No, Differs" color="red" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base text-gray-800">Does the serial number match?</Label>
                  <div className="flex gap-3">
                    <RadioCard selected={serialMatch === "YES"} onClick={() => setSerialMatch("YES")} label="Yes" color="green" />
                    <RadioCard selected={serialMatch === "NO"} onClick={() => setSerialMatch("NO")} label="No" color="red" />
                  </div>
                  <p className="text-xs text-gray-500">Declared SN: <span className="font-mono font-bold text-gray-700">{instrument.serialNo}</span></p>
                </div>

                <div className="space-y-3">
                  <Label className="text-base text-gray-800">Instrument Condition on Arrival</Label>
                  <div className="flex gap-3">
                    <RadioCard selected={condition === "GOOD"} onClick={() => setCondition("GOOD")} label="Good" color="green" />
                    <RadioCard selected={condition === "DAMAGED"} onClick={() => setCondition("DAMAGED")} label="Damaged" color="red" />
                    <RadioCard selected={condition === "MODIFIED"} onClick={() => setCondition("MODIFIED")} label="Modified" color="amber" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base text-gray-800">Physical Stamp / Seal Condition (Previous)</Label>
                  <div className="flex gap-3">
                    <RadioCard selected={seal === "INTACT"} onClick={() => setSeal("INTACT")} label="Intact" color="green" />
                    <RadioCard selected={seal === "TAMPERED"} onClick={() => setSeal("TAMPERED")} label="Tampered" color="red" />
                    <RadioCard selected={seal === "MISSING"} onClick={() => setSeal("MISSING")} label="Missing" color="amber" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Label className="text-base text-gray-800 mb-3 block">Pre-Inspection Photograph (Required) <span className="text-red-500">*</span></Label>
                {!beforePhoto ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:bg-gray-50 transition-colors relative group max-w-md">
                    <input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setBeforePhoto)}
                      required
                    />
                    <div className="text-center flex flex-col items-center pointer-events-none">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                        <Upload className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="text-sm font-bold text-blue-600">Tap to upload or take photo</p>
                      <p className="text-xs text-gray-400 mt-1">Ensure serial number is visible</p>
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between bg-blue-50/50 max-w-md">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Before_Inspection.jpg</p>
                        <p className="text-xs text-gray-500">{(beforePhoto.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setBeforePhoto(null)} className="text-gray-400 hover:text-red-500">
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </div>

            </CardContent>
          </Card>

          {/* Section B */}
          <Card className="shadow-sm border-gray-200 overflow-hidden">
            <div className="bg-indigo-50 border-b border-indigo-100 p-4">
              <h2 className="font-bold text-indigo-900 text-lg flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-indigo-200 text-indigo-800 flex items-center justify-center text-sm">B</span>
                Verification Test Results
              </h2>
            </div>
            <CardContent className="p-0">
              <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Test Procedure: Non-automatic Weighing Instruments</span>
                <span className="text-sm font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200">
                  MPE: {maxPermissibleError}
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white text-gray-500 uppercase font-semibold text-xs border-b">
                    <tr>
                      <th className="px-6 py-4 w-1/4">Capacity</th>
                      <th className="px-6 py-4 w-1/4">Standard Weight</th>
                      <th className="px-6 py-4 w-1/4">Reading Obtained (kg)</th>
                      <th className="px-6 py-4 w-1/4 text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {testPoints.map((point, index) => {
                      const errorData = calculateError(index);
                      
                      return (
                        <tr key={index} className="bg-white">
                          <td className="px-6 py-4 font-medium text-gray-700">{point.capacity}</td>
                          <td className="px-6 py-4 font-bold text-gray-900">{point.weight}</td>
                          <td className="px-6 py-3">
                            <Input 
                              type="number"
                              step="0.001"
                              placeholder="e.g. 2.000"
                              value={readings[index] || ""}
                              onChange={(e) => setReadings({...readings, [index]: e.target.value})}
                              className="w-32 bg-gray-50 border-gray-300 focus:border-indigo-500 font-mono"
                            />
                          </td>
                          <td className="px-6 py-4 text-right">
                            {errorData ? (
                              <div className="flex items-center justify-end gap-3">
                                <span className="font-mono text-gray-600">{errorData.value}</span>
                                {errorData.isWithinTolerance ? (
                                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4" />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                    <XCircle className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs italic">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Repeatability Test (Mock minimal) */}
              <div className="p-6 border-t bg-gray-50/50">
                <Label className="text-base text-gray-800 mb-3 block">Repeatability Test (at 50% capacity)</Label>
                <div className="flex gap-4">
                  <Input placeholder="Reading 1 (kg)" className="bg-white" type="number" step="0.001" />
                  <Input placeholder="Reading 2 (kg)" className="bg-white" type="number" step="0.001" />
                  <Input placeholder="Reading 3 (kg)" className="bg-white" type="number" step="0.001" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section C */}
          <Card className="shadow-sm border-gray-200 overflow-hidden">
            <div className="bg-purple-50 border-b border-purple-100 p-4">
              <h2 className="font-bold text-purple-900 text-lg flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-purple-200 text-purple-800 flex items-center justify-center text-sm">C</span>
                Verification Decision
              </h2>
            </div>
            <CardContent className="p-6 space-y-8">
              
              <div>
                <Label className="text-lg font-bold text-gray-900 mb-4 block">Overall Result <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setDecision("PASS")}
                    className={twMerge(
                      "p-6 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-3",
                      decision === "PASS" ? "border-green-500 bg-green-50 shadow-md ring-4 ring-green-500/20" : "border-gray-200 hover:border-green-300 bg-white"
                    )}
                  >
                    <div className={twMerge("w-16 h-16 rounded-full flex items-center justify-center", decision === "PASS" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400")}>
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <span className={twMerge("text-2xl font-black tracking-wider", decision === "PASS" ? "text-green-700" : "text-gray-500")}>PASS</span>
                  </div>

                  <div 
                    onClick={() => setDecision("FAIL")}
                    className={twMerge(
                      "p-6 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-3",
                      decision === "FAIL" ? "border-red-500 bg-red-50 shadow-md ring-4 ring-red-500/20" : "border-gray-200 hover:border-red-300 bg-white"
                    )}
                  >
                    <div className={twMerge("w-16 h-16 rounded-full flex items-center justify-center", decision === "FAIL" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-400")}>
                      <XCircle className="w-8 h-8" />
                    </div>
                    <span className={twMerge("text-2xl font-black tracking-wider", decision === "FAIL" ? "text-red-700" : "text-gray-500")}>FAIL</span>
                  </div>
                </div>
              </div>

              {decision === "PASS" && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
                  <Checkbox 
                    id="stamp" 
                    checked={stampApplied} 
                    onCheckedChange={(c) => setStampApplied(c as boolean)}
                    className="mt-1 w-5 h-5 border-green-600 data-[state=checked]:bg-green-600"
                  />
                  <div>
                    <Label htmlFor="stamp" className="text-base font-bold text-green-900 cursor-pointer">Verification Stamp / Seal Applied</Label>
                    <p className="text-sm text-green-700 mt-1">I confirm that the physical verification stamp and/or lead seal has been securely affixed to the instrument.</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Label className="text-base text-gray-800">
                  Observations / Remarks {decision === "FAIL" && <span className="text-red-500">*</span>}
                </Label>
                <Textarea 
                  placeholder={decision === "FAIL" ? "Please detail the reasons for failure..." : "Optional remarks..."}
                  className="min-h-[100px] text-base bg-gray-50 focus:bg-white"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  required={decision === "FAIL"}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
                <div>
                  <Label className="text-base text-gray-800 mb-3 block">Post-Inspection Photograph <span className="text-red-500">*</span></Label>
                  {!afterPhoto ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:bg-gray-50 transition-colors relative group">
                      <input 
                        type="file" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setAfterPhoto)}
                        required
                      />
                      <div className="text-center flex flex-col items-center pointer-events-none">
                        <Upload className="w-8 h-8 text-gray-400 mb-2 group-hover:text-blue-500" />
                        <p className="text-sm font-medium text-gray-600">Upload photo (with seal if passed)</p>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between bg-blue-50/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded"><FileText className="w-5 h-5" /></div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">After_Inspection.jpg</p>
                          <p className="text-xs text-gray-500">{(afterPhoto.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => setAfterPhoto(null)} className="text-red-500"><X className="w-5 h-5" /></Button>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-base text-gray-800 mb-3 block">Inspection Location (GPS) <span className="text-red-500">*</span></Label>
                  {!location ? (
                    <Button 
                      type="button"
                      onClick={handleCaptureLocation} 
                      disabled={isCapturingLoc}
                      variant="outline" 
                      className="w-full h-24 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-blue-600 text-base"
                    >
                      {isCapturingLoc ? (
                        <span className="flex items-center"><span className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mr-2" /> Acquiring GPS...</span>
                      ) : (
                        <span className="flex items-center flex-col gap-2"><MapPin className="w-6 h-6" /> Capture Current Location</span>
                      )}
                    </Button>
                  ) : (
                    <div className="border border-green-200 bg-green-50 rounded-xl p-4 flex gap-3">
                      <MapPin className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-green-900">Location Captured Successfully</p>
                        <p className="text-xs text-green-700 font-mono mt-1">Lat: {location.lat}, Lng: {location.lng}</p>
                        <p className="text-xs text-green-700 mt-1">{location.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Section D */}
          <Card className="shadow-lg border-gray-200 bg-slate-50 overflow-hidden">
            <CardContent className="p-6 md:p-10 space-y-8">
              <div className="flex gap-4 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Officer Declaration</h3>
                  <p className="text-gray-600 mt-2 leading-relaxed">
                    I, <span className="font-bold text-gray-900 border-b border-gray-300 pb-0.5">Inspector R.K. Sharma</span>, 
                    Legal Metrology Officer for <span className="font-bold text-gray-900 border-b border-gray-300 pb-0.5">Ahmedabad District (Zone 2)</span>, 
                    hereby certify that the above verification was conducted by me as per the procedures laid down in the 
                    <span className="italic"> Legal Metrology General Rules, 2011</span>. The information provided is true and accurate to the best of my knowledge.
                  </p>
                </div>
              </div>

              <div className="max-w-sm mx-auto text-center space-y-4">
                <Label className="text-base font-bold text-gray-800">Enter Digital PIN to Sign Report <span className="text-red-500">*</span></Label>
                <div className="flex justify-center">
                  <Input 
                    type="password" 
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className="w-32 text-center text-2xl tracking-[0.5em] font-mono h-14 bg-white border-2 border-gray-300 focus:border-blue-600"
                    placeholder="****"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">Demo PIN: Any 4 digits</p>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !location}
                  className="w-full h-14 text-lg font-bold shadow-md bg-blue-700 hover:bg-blue-800 text-white relative overflow-hidden group"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2" />
                      Submitting Securely...
                    </span>
                  ) : (
                    "Digitally Sign & Submit Inspection Report"
                  )}
                  {/* Shine effect */}
                  <div className="absolute inset-0 -translate-x-full bg-white/20 skew-x-12 group-hover:animate-[shine_1.5s_ease-in-out_infinite]" />
                </Button>
              </div>

            </CardContent>
          </Card>

        </form>
      </div>
    </RoleGuard>
  );
}
