"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import api from "@/lib/api";

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
  role: z.enum(["APPLICANT", "LMO", "GATC", "ADMIN"], {
    error: "Please select an account type"
  }),
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
    if (!data.idValue) {
      ctx.addIssue({ code: "custom", path: ["idValue"], message: "Valid ID is required" });
    } else if (data.idType === "AADHAAR" && !/^\d{12}$/.test(data.idValue)) {
      ctx.addIssue({ code: "custom", path: ["idValue"], message: "Aadhaar must be exactly 12 digits" });
    } else if (data.idType === "GSTIN") {
      if (data.idValue.length !== 15) {
        ctx.addIssue({ code: "custom", path: ["idValue"], message: "GSTIN must be exactly 15 characters" });
      } else if (!/^\d{2}[A-Za-z]{5}\d{4}[A-Za-z]{1}[1-9A-Za-z]{1}[Zz][0-9A-Za-z]{1}$/.test(data.idValue)) {
        ctx.addIssue({ code: "custom", path: ["idValue"], message: "Invalid GSTIN format (e.g. 27ABCDE1234F1Z5)" });
      }
    }
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

  const { register, handleSubmit, setValue, watch, trigger, control, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: undefined,
      fullName: "",
      email: "",
      phone: "+91 ",
      password: "",
      confirmPassword: "",
      idType: "AADHAAR",
      idValue: "",
      employeeId: "",
      designation: "",
      state: "",
      district: "",
      organizationName: "",
      licenseNumber: "",
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

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const payload = {
        name: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
        aadhaarOrGstin: data.idValue || data.employeeId || data.licenseNumber || "N/A",
        state: data.state,
        district: data.district
      };
      await api.post("/auth/register", payload);
      toast.success("Registration submitted successfully.");
      router.push("/auth/login");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to register. Please try again.");
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
            <div className={step === 1 ? "space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" : "hidden"}>
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

            {/* STEP 2: Personal Details */}
            <div className={step === 2 ? "space-y-8 animate-in fade-in slide-in-from-right-4 duration-500" : "hidden"}>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Basic Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <input id="fullName" {...register("fullName")} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.fullName ? "border-danger ring-danger/20 ring-2" : ""}`} />
                      {errors.fullName && <p className="text-xs text-danger">{errors.fullName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <input id="email" type="email" {...register("email")} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.email ? "border-danger ring-danger/20 ring-2" : ""}`} />
                      {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <input id="phone" placeholder="+91 " {...register("phone")} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.phone ? "border-danger ring-danger/20 ring-2" : ""}`} />
                      {errors.phone && <p className="text-xs text-danger">{errors.phone.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <input id="password" type="password" {...register("password")} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.password ? "border-danger ring-danger/20 ring-2" : ""}`} />
                      {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <input id="confirmPassword" type="password" {...register("confirmPassword")} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.confirmPassword ? "border-danger ring-danger/20 ring-2" : ""}`} />
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
                        <div className="flex space-x-4">
                          <label className={`flex items-center space-x-2 border p-3 rounded-md pr-6 cursor-pointer ${watch("idType") === "AADHAAR" ? "border-primary bg-primary/5" : ""}`}>
                            <input 
                              type="radio" 
                              value="AADHAAR" 
                              {...register("idType")}
                              className="size-4 text-primary focus:ring-primary border-input accent-primary" 
                            />
                            <span className="font-medium">Aadhaar Number</span>
                          </label>
                          <label className={`flex items-center space-x-2 border p-3 rounded-md pr-6 cursor-pointer ${watch("idType") === "GSTIN" ? "border-primary bg-primary/5" : ""}`}>
                            <input 
                              type="radio" 
                              value="GSTIN" 
                              {...register("idType")}
                              className="size-4 text-primary focus:ring-primary border-input accent-primary" 
                            />
                            <span className="font-medium">GSTIN</span>
                          </label>
                        </div>
                      </div>
                      <div className="space-y-2 max-w-md">
                        <Label htmlFor="idValue">ID Number</Label>
                        <input id="idValue" {...register("idValue")} placeholder="Enter ID number" maxLength={watch("idType") === "AADHAAR" ? 12 : 15} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.idValue ? "border-danger ring-danger/20 ring-2" : ""}`} />
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
                        <input id="employeeId" {...register("employeeId")} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.employeeId ? "border-danger ring-danger/20 ring-2" : ""}`} />
                        {errors.employeeId && <p className="text-xs text-danger">{errors.employeeId.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="designation">Designation</Label>
                        <input id="designation" {...register("designation")} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.designation ? "border-danger ring-danger/20 ring-2" : ""}`} />
                        {errors.designation && <p className="text-xs text-danger">{errors.designation.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <input id="state" {...register("state")} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.state ? "border-danger ring-danger/20 ring-2" : ""}`} />
                        {errors.state && <p className="text-xs text-danger">{errors.state.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="district">District</Label>
                        <input id="district" {...register("district")} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.district ? "border-danger ring-danger/20 ring-2" : ""}`} />
                        {errors.district && <p className="text-xs text-danger">{errors.district.message}</p>}
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
                        <input id="organizationName" {...register("organizationName")} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.organizationName ? "border-danger ring-danger/20 ring-2" : ""}`} />
                        {errors.organizationName && <p className="text-xs text-danger">{errors.organizationName.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="licenseNumber">License Number</Label>
                        <input id="licenseNumber" {...register("licenseNumber")} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.licenseNumber ? "border-danger ring-danger/20 ring-2" : ""}`} />
                        {errors.licenseNumber && <p className="text-xs text-danger">{errors.licenseNumber.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <input id="state" {...register("state")} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.state ? "border-danger ring-danger/20 ring-2" : ""}`} />
                        {errors.state && <p className="text-xs text-danger">{errors.state.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="district">District</Label>
                        <input id="district" {...register("district")} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.district ? "border-danger ring-danger/20 ring-2" : ""}`} />
                        {errors.district && <p className="text-xs text-danger">{errors.district.message}</p>}
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

            {/* STEP 3: Review & Submit */}
            <div className={step === 3 ? "space-y-8 animate-in fade-in slide-in-from-right-4 duration-500" : "hidden"}>
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
