"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { mockNotifications } from "@/lib/mockData";
import { differenceInDays, parseISO, format } from "date-fns";
import { AlertTriangle, Clock, Scale, CheckCircle2, Bell, FilePlus, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { useInstruments } from "@/hooks/useInstruments";
import { useApplications } from "@/hooks/useApplications";
import { useCertificates } from "@/hooks/useCertificates";

export default function ApplicantDashboard() {
  const { data: instruments = [], isLoading: isLoadingInstruments, isError: isErrorInstruments, refetch: refetchInstruments } = useInstruments();
  const { data: applications = [], isLoading: isLoadingApps, isError: isErrorApps, refetch: refetchApps } = useApplications();
  const { data: certificates = [], isLoading: isLoadingCerts, isError: isErrorCerts, refetch: refetchCerts } = useCertificates();

  const isLoading = isLoadingInstruments || isLoadingApps || isLoadingCerts;
  const isError = isErrorInstruments || isErrorApps || isErrorCerts;

  const handleRetry = () => {
    refetchInstruments();
    refetchApps();
    refetchCerts();
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertTriangle className="h-10 w-10 text-red-500" />
        <h2 className="text-xl font-semibold">Failed to load data</h2>
        <Button onClick={handleRetry} variant="outline">Retry?</Button>
      </div>
    );
  }

  const today = new Date();

  // Calculate expiring certificates (<= 30 days)
  const expiringCertificates = certificates.filter((cert: any) => {
    const daysLeft = differenceInDays(parseISO(cert.validUntil), today);
    return daysLeft >= 0 && daysLeft <= 30;
  });

  const pendingApps = applications.filter((app: any) => !["PASSED", "FAILED", "CERTIFICATE_ISSUED"].includes(app.status));
  const validCerts = certificates.filter((cert: any) => differenceInDays(parseISO(cert.validUntil), today) > 0);

  // Sorting upcoming renewals
  const sortedCerts = [...certificates]
    .filter((cert: any) => differenceInDays(parseISO(cert.validUntil), today) >= 0)
    .sort((a, b) => parseISO(a.validUntil).getTime() - parseISO(b.validUntil).getTime());

  // Recent 5 apps
  const recentApps = [...applications]
    .sort((a, b) => parseISO(b.submittedDate).getTime() - parseISO(a.submittedDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Applicant Dashboard" 
        subtitle="Overview of your instruments, applications, and certificates."
      />

      {/* SECTION 1: Alert Banner */}
      {!isLoading && expiringCertificates.length > 0 && (
        <Alert className="bg-amber-50 border-amber-200 text-amber-900 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="font-bold text-amber-800 tracking-tight">Action Required</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <span>
              <span className="font-semibold">{expiringCertificates.length} instrument certificate(s)</span> are expiring within 30 days. Renew them to avoid penalties.
            </span>
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white whitespace-nowrap">
              <Link href="/apply?filter=renewal">
                Renew now &rarr;
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* SECTION 2: Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">My Instruments</p>
              {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <h3 className="text-3xl font-bold tracking-tight">{instruments.length}</h3>}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Apps</p>
              {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <h3 className="text-3xl font-bold tracking-tight">{pendingApps.length}</h3>}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Valid Certificates</p>
              {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <h3 className="text-3xl font-bold tracking-tight">{validCerts.length}</h3>}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-full">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
              {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <h3 className="text-3xl font-bold tracking-tight text-red-600">{expiringCertificates.length}</h3>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 3: Two Columns */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        
        {/* Left Column */}
        <div className="xl:col-span-3 space-y-4">
          <h3 className="text-lg font-bold tracking-tight text-gray-900">Recent Applications</h3>
          <Card className="shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-600">ID</TableHead>
                    <TableHead className="font-semibold text-gray-600">Instrument</TableHead>
                    <TableHead className="font-semibold text-gray-600">Type</TableHead>
                    <TableHead className="font-semibold text-gray-600">Status</TableHead>
                    <TableHead className="font-semibold text-gray-600">Submitted</TableHead>
                    <TableHead className="font-semibold text-gray-600 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-16 mt-1" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : recentApps.map((app: any) => {
                    const inst = instruments.find((i: any) => i.id === app.instrumentId) || { category: "Unknown", serialNo: "N/A" };
                    return (
                      <TableRow key={app.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-medium text-sm">{app.id}</TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]" title={inst.category}>{inst.category}</div>
                          <div className="text-xs text-muted-foreground">{inst.serialNo}</div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {app.verificationType === "NEW" ? "New" : "Renewal"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={app.status} />
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                          {app.submittedDate ? format(parseISO(app.submittedDate), "MMM dd, yyyy") : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-primary font-medium hover:bg-primary/10">
                            <Link href={`/applications/${app.id}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!isLoading && recentApps.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No applications found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {!isLoading && recentApps.length > 0 && (
              <div className="p-4 border-t bg-slate-50/50 text-center">
                <Link href="/applications" className="text-sm font-semibold text-primary hover:underline">
                  View all applications &rarr;
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Panel A - Upcoming Renewals */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold tracking-tight text-gray-900">Upcoming Renewals</h3>
            <Card className="shadow-sm">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-4 space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : sortedCerts.length > 0 ? (
                  <div className="divide-y">
                    {sortedCerts.slice(0, 4).map((cert: any) => {
                      const daysLeft = differenceInDays(parseISO(cert.validUntil), today);
                      let colorClass = "text-green-600 bg-green-50";
                      if (daysLeft < 7) colorClass = "text-red-600 bg-red-50";
                      else if (daysLeft <= 30) colorClass = "text-amber-600 bg-amber-50";

                      return (
                        <div key={cert.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                          <div className="min-w-0 pr-4">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {(cert.instrumentDetails?.name as string) || "Instrument"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              SN: {(cert.instrumentDetails?.serialNo as string) || "N/A"}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={twMerge("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider", colorClass)}>
                                {daysLeft} days left
                              </span>
                              <span className="text-[11px] text-gray-500">
                                Exp: {format(parseISO(cert.validUntil), "dd MMM yyyy")}
                              </span>
                            </div>
                          </div>
                          <Button size="sm" variant={daysLeft <= 30 ? "default" : "outline"} className={twMerge(daysLeft <= 30 ? "bg-amber-600 hover:bg-amber-700 text-white" : "")}>
                            Apply
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center flex flex-col items-center">
                    <CheckCircle2 className="h-10 w-10 text-green-500 mb-3" />
                    <p className="font-semibold text-gray-900">All your certificates are valid</p>
                    <p className="text-sm text-muted-foreground mt-1">No upcoming renewals required.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Panel B - Quick Actions */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold tracking-tight text-gray-900">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <Button variant="outline" className="h-12 justify-start px-4 border-primary text-primary hover:bg-primary/5 font-semibold text-md">
                <Link href="/instruments/new">
                  <FilePlus className="mr-3 h-5 w-5" />
                  Register a New Instrument
                </Link>
              </Button>
              <Button className="h-12 justify-start px-4 bg-secondary hover:bg-secondary/90 text-white shadow-sm font-semibold text-md">
                <Link href="/apply">
                  <Scale className="mr-3 h-5 w-5" />
                  Apply for Verification
                </Link>
              </Button>
              <Button variant="outline" className="h-12 justify-start px-4 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold text-md">
                <Link href="/certificates">
                  <Download className="mr-3 h-5 w-5" />
                  Download a Certificate
                </Link>
              </Button>
            </div>
          </section>

        </div>
      </div>

    </div>
  );
}
