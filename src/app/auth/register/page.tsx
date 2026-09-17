"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Store, ShieldCheck, TestTube, ShieldAlert, CheckCircle2, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { GATC_CATEGORIES } from "@/lib/constants";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

const ROLES = [
  { id: "APPLICANT", title: "Instrument Owner/Trader", desc: "For shopkeepers, businesses, and instrument owners", icon: Store },
  { id: "LMO", title: "Legal Metrology Officer", desc: "For government field officers and inspectors", icon: ShieldCheck },
  { id: "GATC", title: "Government Approved Test Centre", desc: "For authorized testing laboratories", icon: TestTube },
  { id: "ADMIN", title: "Administrator", desc: "For state and central regulators", icon: ShieldAlert },
] as const;

type RoleType = typeof ROLES[number]["id"];

// Create an intersection schema depending on the role, but for the form we use a union or just validate manually.
// To keep it simple in React Hook Form, we use a single big schema where role-specific fields are optional,
// then use a superRefine to enforce conditionally.

const registerSchema = z.object({
  role: z.enum(["APPLICANT", "LMO", "GATC", "ADMIN"]),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+91\s?\d{10}$/, "Phone must be in format +91 9999999999"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  
  // Applicant fields
  idType: z.enum(["AADHAAR", "GSTIN"]).optional(),
  idValue: z.string().optional(),
  
  // LMO fields
  employeeId: z.string().optional(),
  designation: z.string().optional(),
  
  // GATC fields
  organizationName: z.string().optional(),
  licenseNumber: z.string().optional(),
  authorizedCategories: z.array(z.string()).optional(),
  
  // Shared fields
  state: z.string().optional(),
  district: z.string().optional(),
  
  termsConfirmed: z.boolean().refine(val => val === true, "You must confirm accuracy of details"),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "Passwords don't match" });
  }

  if (data.role === "APPLICANT") {
    if (!data.idType) ctx.addIssue({ code: "custom", path: ["idType"], message: "Required" });
    if (!data.idValue || data.idValue.length < 5) ctx.addIssue({ code: "custom", path: ["idValue"], message: "Valid ID is required" });
  }

  if (data.role === "LMO") {
    if (!data.employeeId) ctx.addIssue({ code: "custom", path: ["employeeId"], message: "Required" });
    if (!data.designation) ctx.addIssue({ code: "custom", path: ["designation"], message: "Required" });
    if (!data.state) ctx.addIssue({ code: "custom", path: ["state"], message: "Required" });
    if (!data.district) ctx.addIssue({ code: "custom", path: ["district"], message: "Required" });
  }

  if (data.role === "GATC") {
    if (!data.organizationName) ctx.addIssue({ code: "custom", path: ["organizationName"], message: "Required" });
    if (!data.licenseNumber) ctx.addIssue({ code: "custom", path: ["licenseNumber"], message: "Required" });
    if (!data.authorizedCategories || data.authorizedCategories.length === 0) ctx.addIssue({ code: "custom", path: ["authorizedCategories"], message: "Select at least one" });
    if (!data.state) ctx.addIssue({ code: "custom", path: ["state"], message: "Required" });
    if (!data.district) ctx.addIssue({ code: "custom", path: ["district"], message: "Required" });
  }
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, trigger, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      phone: "+91 ",
      idType: "AADHAAR",
      authorizedCategories: [],
      termsConfirmed: false,
    },
    mode: "onChange"
  });

  const selectedRole = watch("role");
  const formValues = watch();

  const handleNext = async () => {
    if (step === 1) {
      if (!selectedRole) {
        toast.error("Please select an account type");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Trigger validation for step 2 fields
      const isValid = await trigger(["fullName", "email", "phone", "password", "confirmPassword"]);
      let roleValid = false;
      if (selectedRole === "APPLICANT") {
        roleValid = await trigger(["idType", "idValue"]);
      } else if (selectedRole === "LMO") {
        roleValid = await trigger(["employeeId", "designation", "state", "district"]);
      } else if (selectedRole === "GATC") {
        roleValid = await trigger(["organizationName", "licenseNumber", "authorizedCategories", "state", "district"]);
      } else {
        roleValid = true; // Admin just needs base details for now
      }

      if (isValid && roleValid) {
        setStep(3);
      } else {
        toast.error("Please fill all required fields correctly");
      }
    }
  };

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      // Mock API call to /api/auth/register
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Actual call would be: await api.post("/auth/register", data);
      
      toast.success("Registration submitted. Admin will verify your account.");
      router.push("/auth/login");
    } catch {
      toast.error("Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (cat: string) => {
    const current = watch("authorizedCategories") || [];
    if (current.includes(cat)) {
      setValue("authorizedCategories", current.filter(c => c !== cat), { shouldValidate: true });
    } else {
      setValue("authorizedCategories", [...current, cat], { shouldValidate: true });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white p-4 shadow-md sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/auth/login" className="text-xl font-bold tracking-tight">DigiVerifier</Link>
          <div className="text-sm font-medium">New Account Registration</div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 transition-all duration-300" style={{ width: `${(step - 1) * 50}%` }}></div>
            
            {[1, 2, 3].map((num) => (
              <div key={num} className={twMerge("flex flex-col items-center", step >= num ? "text-primary" : "text-gray-400")}>
                <div className={twMerge("w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mb-2 transition-colors duration-300", step >= num ? "bg-primary" : "bg-gray-300")}>
                  {step > num ? <CheckCircle2 className="w-6 h-6" /> : num}
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {num === 1 ? "Account Type" : num === 2 ? "Details" : "Review"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-xl shadow-sm border">
          <form onSubmit={handleSubmit(onSubmit)}>
            
            {/* STEP 1: Account Type */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Select Account Type</h2>
                  <p className="text-muted-foreground mt-2">Choose the role that best describes you or your organization.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ROLES.map((role) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole === role.id;
                    return (
                      <div 
                        key={role.id}
                        onClick={() => setValue("role", role.id as RoleType, { shouldValidate: true })}
                        className={twMerge(
                          "cursor-pointer border-2 rounded-xl p-6 transition-all duration-200 hover:shadow-md",
                          isSelected ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div className={twMerge("p-3 rounded-lg", isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-600")}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <h3 className="font-bold text-gray-900">{role.title}</h3>
                              {isSelected && <CheckCircle2 className="w-5 h-5 text-primary" />}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{role.desc}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: Personal Details */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Basic Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" {...register("fullName")} className={errors.fullName ? "border-danger" : ""} />
                      {errors.fullName && <p className="text-xs text-danger">{errors.fullName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" {...register("email")} className={errors.email ? "border-danger" : ""} />
                      {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" placeholder="+91 " {...register("phone")} className={errors.phone ? "border-danger" : ""} />
                      {errors.phone && <p className="text-xs text-danger">{errors.phone.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" {...register("password")} className={errors.password ? "border-danger" : ""} />
                      {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input id="confirmPassword" type="password" {...register("confirmPassword")} className={errors.confirmPassword ? "border-danger" : ""} />
                      {errors.confirmPassword && <p className="text-xs text-danger">{errors.confirmPassword.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Role Specific Fields */}
                {selectedRole === "APPLICANT" && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Identity Details</h2>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label>Identifier Type</Label>
                        <RadioGroup 
                          defaultValue={watch("idType")} 
                          onValueChange={(val) => setValue("idType", val as "AADHAAR" | "GSTIN")}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2 border p-3 rounded-md pr-6">
                            <RadioGroupItem value="AADHAAR" id="r-aadhaar" />
                            <Label htmlFor="r-aadhaar" className="cursor-pointer font-medium">Aadhaar Number</Label>
                          </div>
                          <div className="flex items-center space-x-2 border p-3 rounded-md pr-6">
                            <RadioGroupItem value="GSTIN" id="r-gstin" />
                            <Label htmlFor="r-gstin" className="cursor-pointer font-medium">GSTIN</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="space-y-2 max-w-md">
                        <Label htmlFor="idValue">{watch("idType") === "AADHAAR" ? "12-Digit Aadhaar Number" : "15-Digit GSTIN"}</Label>
                        <Input id="idValue" {...register("idValue")} className={errors.idValue ? "border-danger" : ""} />
                        {errors.idValue && <p className="text-xs text-danger">{errors.idValue.message}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {selectedRole === "LMO" && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Official Assignment</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="employeeId">Employee ID</Label>
                        <Input id="employeeId" {...register("employeeId")} className={errors.employeeId ? "border-danger" : ""} />
                        {errors.employeeId && <p className="text-xs text-danger">{errors.employeeId.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="designation">Designation</Label>
                        <Select onValueChange={(val) => setValue("designation", val as string)} defaultValue={watch("designation")}>
                          <SelectTrigger className={errors.designation ? "border-danger" : ""}>
                            <SelectValue placeholder="Select Designation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Inspector">Inspector</SelectItem>
                            <SelectItem value="Assistant Controller">Assistant Controller</SelectItem>
                            <SelectItem value="Deputy Controller">Deputy Controller</SelectItem>
                            <SelectItem value="Joint Controller">Joint Controller</SelectItem>
                            <SelectItem value="Controller">Controller</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.designation && <p className="text-xs text-danger">{errors.designation.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input id="state" {...register("state")} className={errors.state ? "border-danger" : ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="district">District</Label>
                        <Input id="district" {...register("district")} className={errors.district ? "border-danger" : ""} />
                      </div>
                    </div>
                  </div>
                )}

                {selectedRole === "GATC" && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Facility Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-2">
                        <Label htmlFor="organizationName">Organization Name</Label>
                        <Input id="organizationName" {...register("organizationName")} className={errors.organizationName ? "border-danger" : ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="licenseNumber">License Number</Label>
                        <Input id="licenseNumber" {...register("licenseNumber")} className={errors.licenseNumber ? "border-danger" : ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input id="state" {...register("state")} className={errors.state ? "border-danger" : ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="district">District</Label>
                        <Input id="district" {...register("district")} className={errors.district ? "border-danger" : ""} />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label>Authorized Categories</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 border p-4 rounded-md bg-gray-50 max-h-60 overflow-y-auto">
                        {GATC_CATEGORIES.map(cat => (
                          <div key={cat} className="flex items-center space-x-2 bg-white p-2 border rounded shadow-sm">
                            <Checkbox 
                              id={`cat-${cat}`} 
                              checked={(watch("authorizedCategories") || []).includes(cat)}
                              onCheckedChange={() => toggleCategory(cat)}
                            />
                            <Label htmlFor={`cat-${cat}`} className="text-xs font-normal cursor-pointer leading-tight truncate" title={cat}>{cat}</Label>
                          </div>
                        ))}
                      </div>
                      {errors.authorizedCategories && <p className="text-xs text-danger">{errors.authorizedCategories.message}</p>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Review & Submit */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>
                  <p className="text-muted-foreground mt-2">Please verify your details before final submission.</p>
                </div>

                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                      <div className="text-muted-foreground">Account Type</div>
                      <div className="font-semibold text-gray-900">{ROLES.find(r => r.id === formValues.role)?.title}</div>
                      
                      <div className="text-muted-foreground">Full Name</div>
                      <div className="font-medium text-gray-900">{formValues.fullName}</div>
                      
                      <div className="text-muted-foreground">Email Address</div>
                      <div className="font-medium text-gray-900">{formValues.email}</div>
                      
                      <div className="text-muted-foreground">Phone Number</div>
                      <div className="font-medium text-gray-900">{formValues.phone}</div>

                      {formValues.role === "APPLICANT" && (
                        <>
                          <div className="text-muted-foreground">{formValues.idType}</div>
                          <div className="font-medium text-gray-900">{formValues.idValue}</div>
                        </>
                      )}

                      {formValues.role === "LMO" && (
                        <>
                          <div className="text-muted-foreground">Employee ID</div>
                          <div className="font-medium text-gray-900">{formValues.employeeId}</div>
                          <div className="text-muted-foreground">Designation</div>
                          <div className="font-medium text-gray-900">{formValues.designation}</div>
                          <div className="text-muted-foreground">Location</div>
                          <div className="font-medium text-gray-900">{formValues.district}, {formValues.state}</div>
                        </>
                      )}

                      {formValues.role === "GATC" && (
                        <>
                          <div className="text-muted-foreground">Organization</div>
                          <div className="font-medium text-gray-900">{formValues.organizationName}</div>
                          <div className="text-muted-foreground">License</div>
                          <div className="font-medium text-gray-900">{formValues.licenseNumber}</div>
                          <div className="text-muted-foreground">Location</div>
                          <div className="font-medium text-gray-900">{formValues.district}, {formValues.state}</div>
                          <div className="text-muted-foreground">Authorized Categories</div>
                          <div className="font-medium text-gray-900">
                            {formValues.authorizedCategories?.length || 0} categories selected
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-start space-x-3 bg-blue-50 p-4 rounded-md border border-blue-100">
                  <Checkbox 
                    id="termsConfirmed" 
                    checked={watch("termsConfirmed")}
                    onCheckedChange={(val) => setValue("termsConfirmed", val as boolean, { shouldValidate: true })}
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="termsConfirmed" className="font-semibold text-blue-900">I confirm that the above information is accurate</Label>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      By submitting this registration, you declare that all details provided are true and correct to the best of your knowledge. False information may lead to account suspension under the Legal Metrology Act.
                    </p>
                  </div>
                </div>
                {errors.termsConfirmed && <p className="text-sm text-danger text-center">{errors.termsConfirmed.message}</p>}

              </div>
            )}

            {/* Navigation Actions */}
            <div className="mt-10 flex items-center justify-between pt-6 border-t">
              {step > 1 ? (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep((step - 1) as 1 | 2 | 3)}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              ) : (
                <Link href="/auth/login">
                  <Button variant="ghost" type="button" className="text-muted-foreground hover:text-gray-900">
                    Cancel
                  </Button>
                </Link>
              )}

              {step < 3 ? (
                <Button type="button" onClick={handleNext} className="bg-primary hover:bg-primary/90 text-white">
                  Next Step <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading || !watch("termsConfirmed")} className="bg-secondary hover:bg-secondary/90 text-white min-w-[150px]">
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4 mr-2" /> Complete Registration</>
                  )}
                </Button>
              )}
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
