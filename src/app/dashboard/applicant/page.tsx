"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { mockInstruments, mockApplications, mockCertificates, mockNotifications } from "@/lib/mockData";
import { differenceInDays, parseISO, format } from "date-fns";
import { AlertTriangle, Clock, Scale, CheckCircle2, Bell, FilePlus, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

export default function ApplicantDashboard() {
  const today = new Date();

  // Calculate expiring certificates (<= 30 days)
  const expiringCertificates = mockCertificates.filter(cert => {
    const daysLeft = differenceInDays(parseISO(cert.validUntil), today);
    return daysLeft >= 0 && daysLeft <= 30;
  });

  const pendingApps = mockApplications.filter(app => !["PASSED", "FAILED", "CERTIFICATE_ISSUED"].includes(app.status));
  const validCerts = mockCertificates.filter(cert => differenceInDays(parseISO(cert.validUntil), today) > 0);

  // Sorting upcoming renewals
  const sortedCerts = [...mockCertificates]
    .filter(cert => differenceInDays(parseISO(cert.validUntil), today) >= 0)
    .sort((a, b) => parseISO(a.validUntil).getTime() - parseISO(b.validUntil).getTime());

  // Recent 5 apps
  const recentApps = [...mockApplications]
    .sort((a, b) => parseISO(b.submittedDate).getTime() - parseISO(a.submittedDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Applicant Dashboard" 
        subtitle="Overview of your instruments, applications, and certificates."
      />

      {/* SECTION 1: Alert Banner */}
      {expiringCertificates.length > 0 && (
        <Alert className="bg-amber-50 border-amber-200 text-amber-900 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="font-bold text-amber-800 tracking-tight">Action Required</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <span>
              <span className="font-semibold">{expiringCertificates.length} instrument certificate(s)</span> are expiring within 30 days. Renew them to avoid penalties.
            </span>
            <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white whitespace-nowrap">
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
              <h3 className="text-3xl font-bold tracking-tight">{mockInstruments.length}</h3>
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
              <h3 className="text-3xl font-bold tracking-tight">{pendingApps.length}</h3>
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
              <h3 className="text-3xl font-bold tracking-tight">{validCerts.length}</h3>
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
              <h3 className="text-3xl font-bold tracking-tight text-red-600">{expiringCertificates.length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 3: Two Columns */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        
        {/* Left Column (60% equivalent -> 3 cols out of 5) */}
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
                  {recentApps.map((app) => {
                    const inst = mockInstruments.find(i => i.id === app.instrumentId) || { category: "Unknown", serialNo: "N/A" };
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
                          {format(parseISO(app.submittedDate), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-primary font-medium hover:bg-primary/10" asChild>
                            <Link href={`/applications/${app.id}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {recentApps.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No applications found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {recentApps.length > 0 && (
              <div className="p-4 border-t bg-slate-50/50 text-center">
                <Link href="/applications" className="text-sm font-semibold text-primary hover:underline">
                  View all applications &rarr;
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (40% equivalent -> 2 cols out of 5) */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Panel A - Upcoming Renewals */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold tracking-tight text-gray-900">Upcoming Renewals</h3>
            <Card className="shadow-sm">
              <CardContent className="p-0">
                {sortedCerts.length > 0 ? (
                  <div className="divide-y">
                    {sortedCerts.slice(0, 4).map((cert) => {
                      const daysLeft = differenceInDays(parseISO(cert.validUntil), today);
                      let colorClass = "text-green-600 bg-green-50";
                      if (daysLeft < 7) colorClass = "text-red-600 bg-red-50";
                      else if (daysLeft <= 30) colorClass = "text-amber-600 bg-amber-50";

                      return (
                        <div key={cert.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                          <div className="min-w-0 pr-4">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {(cert.instrumentDetails.name as string) || "Instrument"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              SN: {(cert.instrumentDetails.serialNo as string) || "N/A"}
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
              <Button variant="outline" className="h-12 justify-start px-4 border-primary text-primary hover:bg-primary/5 font-semibold text-md" asChild>
                <Link href="/instruments/new">
                  <FilePlus className="mr-3 h-5 w-5" />
                  Register a New Instrument
                </Link>
              </Button>
              <Button className="h-12 justify-start px-4 bg-secondary hover:bg-secondary/90 text-white shadow-sm font-semibold text-md" asChild>
                <Link href="/apply">
                  <Scale className="mr-3 h-5 w-5" />
                  Apply for Verification
                </Link>
              </Button>
              <Button variant="outline" className="h-12 justify-start px-4 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold text-md" asChild>
                <Link href="/certificates">
                  <Download className="mr-3 h-5 w-5" />
                  Download a Certificate
                </Link>
              </Button>
            </div>
          </section>

        </div>
      </div>

      {/* SECTION 4: Notifications Panel */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-tight text-gray-900">Recent Notifications</h3>
          <Button variant="link" className="text-primary font-semibold p-0 h-auto">Mark all read</Button>
        </div>
        
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {mockNotifications.length > 0 ? (
              <div className="divide-y">
                {mockNotifications.slice(0, 5).map(notif => (
                  <div 
                    key={notif.id} 
                    className={twMerge(
                      "p-4 flex items-start gap-4 transition-colors hover:bg-slate-50/80",
                      !notif.read ? "border-l-4 border-l-primary bg-primary/5" : ""
                    )}
                  >
                    <div className={twMerge("p-2 rounded-full mt-0.5 shrink-0", !notif.read ? "bg-white shadow-sm text-primary" : "bg-gray-100 text-gray-500")}>
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={twMerge("text-sm", !notif.read ? "font-semibold text-gray-900" : "text-gray-700")}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(parseISO(notif.sentDate), "MMM dd, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="shrink-0 flex items-center h-full pt-1">
                        <span className="h-2 w-2 bg-primary rounded-full"></span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                <p>No new notifications</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

    </div>
  );
}
