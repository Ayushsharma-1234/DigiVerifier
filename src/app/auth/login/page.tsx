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
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["APPLICANT", "LMO", "GATC", "ADMIN"], {
    error: "Please select a role"
  }),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: undefined,
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      // Mocking the API response if the backend is not running, 
      // but making the actual call as requested.
      const response = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
        role: data.role,
      });

      const { token, user } = response.data;

      login(user, token);

      if (data.rememberMe) {
        // Typically handled by setting a longer cookie expiration, 
        // but here we just store standard localStorage (handled by store).
      }

      toast.success("Logged in successfully");

      // Redirect based on role
      switch (user.role) {
        case "APPLICANT":
          router.push("/dashboard/applicant");
          break;
        case "LMO":
          router.push("/dashboard/lmo");
          break;
        case "GATC":
          router.push("/dashboard/gatc");
          break;
        case "ADMIN":
          router.push("/dashboard/admin");
          break;
      }
    } catch (error: unknown) {
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Left Panel - Hidden on mobile */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-primary text-primary-foreground p-12">
        <div>
          <div className="flex items-center space-x-3 mb-6">
            {/* Using text-based logo as requested */}
            <h1 className="text-4xl font-extrabold tracking-tight">DigiVerifier</h1>
          </div>
          <p className="text-xl text-blue-200 max-w-md font-medium leading-relaxed">
            Legal Metrology Verification Platform
          </p>
        </div>

        <div className="mt-auto">
          <div className="h-1 w-16 bg-accent mb-6 rounded-full"></div>
          <p className="text-sm text-primary-foreground/80 font-medium">
            Ministry of Consumer Affairs, Food & Public Distribution
          </p>
          <p className="text-xs text-primary-foreground/60 mt-1">
            Government of India
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-2">
              Please enter your details to sign in.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-8">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                className={errors.email ? "border-danger focus-visible:ring-danger" : ""}
              />
              {errors.email && (
                <p className="text-sm text-danger">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
                className={errors.password ? "border-danger focus-visible:ring-danger" : ""}
              />
              {errors.password && (
                <p className="text-sm text-danger">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Sign in as</Label>
              <Select onValueChange={(val) => setValue("role", val as "APPLICANT" | "LMO" | "GATC" | "ADMIN")} defaultValue={watch("role")}>
                <SelectTrigger className={errors.role ? "border-danger focus-visible:ring-danger" : ""}>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPLICANT">Applicant / Instrument Owner</SelectItem>
                  <SelectItem value="LMO">Legal Metrology Officer</SelectItem>
                  <SelectItem value="GATC">Government Approved Test Centre</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-danger">{errors.role.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={watch("rememberMe")}
                onCheckedChange={(checked) => setValue("rememberMe", checked as boolean)}
              />
              <Label htmlFor="rememberMe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Remember me
              </Label>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don&apos;t have an account? </span>
            <Link href="/auth/register" className="text-primary hover:underline font-semibold">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
