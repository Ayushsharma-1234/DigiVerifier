"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { INSTRUMENT_CATEGORIES } from "@/lib/constants";
import { mockInstruments, mockCertificates, mockApplications } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Scale, X, Thermometer, Droplet, Activity, SearchIcon, Plus } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { differenceInDays, parseISO, format } from "date-fns";
import Link from "next/link";

export default function InstrumentsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const today = new Date();

  // Helper to determine instrument status
  const getInstrumentStatus = (serialNo: string, instId: string) => {
    // Check certificates first
    const cert = mockCertificates.find((c) => (c.instrumentDetails.serialNo as string) === serialNo);
    if (cert) {
      const daysLeft = differenceInDays(parseISO(cert.validUntil), today);
      if (daysLeft > 0) {
        // Total duration is roughly 365 days for the calculation of progress
        const totalDays = differenceInDays(parseISO(cert.validUntil), parseISO(cert.issueDate));
        const progress = Math.max(0, Math.min(100, ((totalDays - daysLeft) / totalDays) * 100));
        return {
          status: "VALID",
          validUntil: cert.validUntil,
          daysLeft,
          progress,
          color: "bg-green-100 text-green-800",
          progressColor: daysLeft < 30 ? "bg-amber-500" : "bg-green-500"
        };
      } else {
        return { status: "EXPIRED", color: "bg-red-100 text-red-800" };
      }
    }

    // Check applications if no cert
    const app = mockApplications.find((a) => a.instrumentId === instId);
    if (app && app.status !== "PASSED" && app.status !== "FAILED") {
      return { status: "PENDING VERIFICATION", color: "bg-blue-100 text-blue-800" };
    }

    return { status: "NOT VERIFIED", color: "bg-gray-100 text-gray-800" };
  };

  // Icon mapping based on category
  const getIcon = (cat: string) => {
    if (cat.toLowerCase().includes("water")) return <Droplet className="h-8 w-8 text-blue-500" />;
    if (cat.toLowerCase().includes("thermo")) return <Thermometer className="h-8 w-8 text-red-500" />;
    if (cat.toLowerCase().includes("sphygmo")) return <Activity className="h-8 w-8 text-purple-500" />;
    return <Scale className="h-8 w-8 text-emerald-500" />;
  };

  // Filtering
  let filtered = mockInstruments.filter((inst) => {
    const searchMatch = inst.model?.toLowerCase().includes(search.toLowerCase()) ||
                        inst.serialNo.toLowerCase().includes(search.toLowerCase()) ||
                        inst.category.toLowerCase().includes(search.toLowerCase());
    const categoryMatch = category === "ALL" || inst.category === category;
    return searchMatch && categoryMatch;
  });

  if (status !== "ALL") {
    filtered = filtered.filter((inst) => {
      const instStatus = getInstrumentStatus(inst.serialNo, inst.id).status;
      if (status === "VALID") return instStatus === "VALID";
      if (status === "EXPIRED") return instStatus === "EXPIRED";
      if (status === "PENDING") return instStatus === "PENDING VERIFICATION";
      if (status === "NOT_VERIFIED") return instStatus === "NOT VERIFIED";
      return true;
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="My Instruments"
        subtitle="Manage all your registered measuring and weighing instruments."
        action={
          <Button className="bg-secondary hover:bg-secondary/90 text-white shadow-sm font-semibold">
            <Link href="/instruments/new">
              <Plus className="mr-2 h-4 w-4" />
              Register New Instrument
            </Link>
          </Button>
        }
      />

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col sm:flex-row gap-4 items-end">
        <div className="space-y-1.5 flex-1 w-full">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Search</label>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search by name or serial..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
        </div>

        <div className="space-y-1.5 flex-1 w-full sm:max-w-xs">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</label>
          <Select value={category} onValueChange={(val: any) => setCategory(val)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {INSTRUMENT_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 flex-1 w-full sm:max-w-[200px]">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
          <Select value={status} onValueChange={(val: any) => setCategory(val)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="VALID">Valid</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
              <SelectItem value="PENDING">Pending Verification</SelectItem>
              <SelectItem value="NOT_VERIFIED">Not Verified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(search || category !== "ALL" || status !== "ALL") && (
          <Button 
            variant="ghost" 
            className="h-10 text-gray-500 hover:text-gray-900"
            onClick={() => { setSearch(""); setCategory("ALL"); setStatus("ALL"); }}
          >
            <X className="mr-2 h-4 w-4" />
            Reset
          </Button>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((inst) => {
              const st = getInstrumentStatus(inst.serialNo, inst.id);
              
              return (
                <Card key={inst.id} className="overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                  <CardContent className="p-0 flex-1 flex flex-col">
                    <div className="p-6 pb-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform">
                          {getIcon(inst.category)}
                        </div>
                        <span className={twMerge("px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase", st.color)}>
                          {st.status}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2" title={inst.category}>
                        {inst.category}
                      </h3>
                      <p className="text-gray-500 font-mono text-sm mt-1">{inst.serialNo}</p>
                      
                      <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
                        <div className="text-gray-500">Manufacturer</div>
                        <div className="font-medium text-gray-900 text-right truncate" title={inst.manufacturer}>{inst.manufacturer}</div>
                        <div className="text-gray-500">Accuracy</div>
                        <div className="font-medium text-gray-900 text-right">{inst.accuracyClass}</div>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      {st.status === "VALID" && st.validUntil && (
                        <div className="px-6 py-4 bg-slate-50 border-t border-b">
                          <div className="flex justify-between text-xs font-semibold mb-2">
                            <span className="text-gray-600">Valid until {format(parseISO(st.validUntil), "dd/MM/yyyy")}</span>
                            <span className={st.daysLeft! < 30 ? "text-amber-600" : "text-green-600"}>
                              {st.daysLeft} days left
                            </span>
                          </div>
                          <Progress value={st.progress} className="h-1.5" indicatorColor={st.progressColor} />
                        </div>
                      )}

                      <div className="p-4 bg-gray-50 flex gap-3 border-t">
                        <Button variant="outline" className="flex-1 text-primary border-primary/20 hover:bg-primary/5">
                          View History
                        </Button>
                        <Button className="flex-1 bg-secondary text-white hover:bg-secondary/90">
                          {st.status === "VALID" ? "Re-verify" : "Apply Now"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500 pt-4">
            <span>Showing 1-{filtered.length} of {filtered.length} instruments</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-24 bg-white rounded-lg border border-dashed border-gray-300">
          <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Scale className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No instruments found</h3>
          <p className="text-gray-500 mt-1 mb-6">You haven&apos;t registered any instruments matching these filters.</p>
          <Button className="bg-secondary hover:bg-secondary/90 text-white font-semibold shadow-sm">
            <Link href="/instruments/new">
              <Plus className="mr-2 h-4 w-4" />
              Register your first instrument
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
