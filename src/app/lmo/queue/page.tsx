"use client";

import { useState } from "react";
import { RoleGuard } from "@/components/shared/RoleGuard";
import { PageHeader } from "@/components/shared/PageHeader";
import { mockApplications, mockInstruments } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INSTRUMENT_CATEGORIES, APPLICATION_STATUSES } from "@/lib/constants";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SearchIcon, Filter, X, Eye, Play, ListTodo, Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { format, parseISO, isToday, isBefore, startOfToday } from "date-fns";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/hooks/useAuth";

type TabType = "ALL" | "TODAY" | "OVERDUE" | "SCHEDULED" | "COMPLETED";

export default function LMOQueuePage() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  
  const today = startOfToday();

  // Enriched applications data specifically for LMO
  const lmoApplications = mockApplications
    .filter(a => a.routedTo === 'LMO')
    .map(app => {
      const inst = mockInstruments.find(i => i.id === app.instrumentId);
      const isOverdue = app.scheduledDate && isBefore(parseISO(app.scheduledDate), today) && app.status === 'SCHEDULED';
      const isScheduledToday = app.scheduledDate && isToday(parseISO(app.scheduledDate)) && app.status === 'SCHEDULED';
      
      return {
        ...app,
        instrumentName: inst ? `${inst.manufacturer} ${inst.model}` : "Unknown",
        instrumentCategory: inst?.category || "Unknown",
        applicantName: "Mock Applicant Corp.", // Mocking applicant name since it's not in the data structure
        isOverdue,
        isScheduledToday
      };
    });

  // Filter logic
  let filtered = lmoApplications.filter(app => {
    // Tab filtering
    if (activeTab === "TODAY" && !app.isScheduledToday) return false;
    if (activeTab === "OVERDUE" && !app.isOverdue) return false;
    if (activeTab === "SCHEDULED" && app.status !== "SCHEDULED") return false;
    if (activeTab === "COMPLETED" && !['PASSED', 'FAILED', 'CERTIFICATE_ISSUED'].includes(app.status)) return false;

    // Search and specific filters
    const matchSearch = app.id.toLowerCase().includes(search.toLowerCase()) || 
                        app.applicantName.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "ALL" || app.instrumentCategory === category;
    const matchStatus = status === "ALL" || app.status === status;
    
    // Date filtering (Submitted date for simplicity)
    let matchDate = true;
    if (dateFrom && dateTo) {
      const appDate = app.submittedDate.split('T')[0];
      matchDate = appDate >= dateFrom && appDate <= dateTo;
    }

    return matchSearch && matchCategory && matchStatus && matchDate;
  });

  // Sort: Overdue first, then by scheduled date, then submitted
  filtered = filtered.sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    if (a.scheduledDate && b.scheduledDate) {
      return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
    }
    return new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime();
  });

  const resetFilters = () => {
    setSearch("");
    setCategory("ALL");
    setStatus("ALL");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters = search || category !== "ALL" || status !== "ALL" || dateFrom || dateTo;

  return (
    <RoleGuard allowedRoles={['LMO']}>
      <div className="space-y-6 animate-in fade-in duration-500 pb-12">
        <PageHeader
          title="Work Queue"
          subtitle="Manage your assigned applications and perform inspections."
        />

        {/* Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab("ALL")}
            className={twMerge("px-6 py-3 font-semibold text-sm border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors", activeTab === "ALL" ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50")}
          >
            <ListTodo className="w-4 h-4" /> All Applications
          </button>
          <button
            onClick={() => setActiveTab("TODAY")}
            className={twMerge("px-6 py-3 font-semibold text-sm border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors", activeTab === "TODAY" ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50")}
          >
            <Calendar className="w-4 h-4" /> Today's Schedule
          </button>
          <button
            onClick={() => setActiveTab("OVERDUE")}
            className={twMerge("px-6 py-3 font-semibold text-sm border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors", activeTab === "OVERDUE" ? "border-red-600 text-red-600 bg-red-50/50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50")}
          >
            <AlertTriangle className="w-4 h-4" /> Overdue
          </button>
          <button
            onClick={() => setActiveTab("SCHEDULED")}
            className={twMerge("px-6 py-3 font-semibold text-sm border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors", activeTab === "SCHEDULED" ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50")}
          >
            <Clock className="w-4 h-4" /> Scheduled
          </button>
          <button
            onClick={() => setActiveTab("COMPLETED")}
            className={twMerge("px-6 py-3 font-semibold text-sm border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors", activeTab === "COMPLETED" ? "border-green-600 text-green-600 bg-green-50/50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50")}
          >
            <CheckCircle className="w-4 h-4" /> Completed
          </button>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            
            {/* Jurisdiction (Disabled, auto-filled) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">District</label>
              <Input value="Ahmedabad (Zone 2)" disabled className="h-10 bg-gray-100 text-gray-600" />
            </div>

            {/* Search */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Search</label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="ID or Applicant..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-10 bg-gray-50/50"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-10 bg-gray-50/50">
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

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-10 bg-gray-50/50">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  {APPLICATION_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-1.5">
               <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</label>
               <div className="flex items-center gap-1">
                 <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-10 bg-gray-50/50 px-2" />
                 <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-10 bg-gray-50/50 px-2" />
               </div>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t flex justify-end">
               <Button variant="ghost" size="sm" onClick={resetFilters} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                 <X className="w-4 h-4 mr-1" /> Clear Filters
               </Button>
            </div>
          )}
        </div>

        {/* Datatable */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs border-b">
                <tr>
                  <th className="px-5 py-4">Application ID</th>
                  <th className="px-5 py-4">Applicant</th>
                  <th className="px-5 py-4 min-w-[200px]">Instrument Category</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Submitted</th>
                  <th className="px-5 py-4">Scheduled</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right min-w-[220px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <ListTodo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-base font-medium">No applications found in this queue.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(app => (
                    <tr 
                      key={app.id} 
                      className={twMerge(
                        "transition-colors group",
                        app.isOverdue ? "bg-red-50 hover:bg-red-100/60" : "hover:bg-gray-50/50"
                      )}
                    >
                      <td className="px-5 py-4">
                        <Link href={`/applications/${app.id}`} className="font-mono text-blue-600 hover:underline font-bold">
                          {app.id}
                        </Link>
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-900">{app.applicantName}</td>
                      <td className="px-5 py-4 text-gray-700 font-medium">
                        {app.instrumentCategory}
                        <p className="text-xs text-gray-500 font-normal font-mono mt-0.5">{app.instrumentName}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{app.verificationType === 'NEW' ? 'New' : 'Re-verify'}</td>
                      <td className="px-5 py-4 text-gray-600">
                        {format(parseISO(app.submittedDate), "dd MMM yy")}
                      </td>
                      <td className="px-5 py-4">
                        {app.scheduledDate ? (
                          <span className={twMerge("font-medium", app.isOverdue ? "text-red-600" : "text-gray-700")}>
                            {format(parseISO(app.scheduledDate), "dd MMM yy")}
                            {app.isOverdue && <span className="block text-xs font-bold uppercase mt-0.5">Overdue</span>}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap">
                        <Button asChild variant="outline" size="sm" className="bg-white">
                          <Link href={`/applications/${app.id}`}>
                            <Eye className="w-4 h-4 mr-2" /> View
                          </Link>
                        </Button>
                        {app.status === 'SCHEDULED' && (
                          <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            <Link href={`/lmo/inspect/${app.id}`}>
                              <Play className="w-4 h-4 mr-2" /> Inspect
                            </Link>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{filtered.length > 0 ? 1 : 0}</span> to <span className="font-medium text-gray-900">{filtered.length}</span> of <span className="font-medium text-gray-900">{filtered.length}</span> results
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
