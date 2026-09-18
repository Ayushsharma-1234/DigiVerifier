"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { mockApplications, mockInstruments } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INSTRUMENT_CATEGORIES, APPLICATION_STATUSES } from "@/lib/constants";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SearchIcon, Filter, X, Eye, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

export default function ApplicationsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  
  // Basic date filter state (mock strings for simplicity)
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const toggleStatus = (statusValue: string) => {
    setSelectedStatuses(prev => 
      prev.includes(statusValue) 
        ? prev.filter(s => s !== statusValue)
        : [...prev, statusValue]
    );
  };

  // Enriched applications data (joining with instruments)
  const enrichedApplications = mockApplications.map(app => {
    const inst = mockInstruments.find(i => i.id === app.instrumentId);
    return {
      ...app,
      instrumentName: inst ? `${inst.manufacturer} ${inst.model}` : "Unknown",
      instrumentCategory: inst?.category || "Unknown",
    };
  });

  // Filter logic
  let filtered = enrichedApplications.filter(app => {
    const matchSearch = app.id.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "ALL" || app.instrumentCategory === category;
    const matchStatus = selectedStatuses.length === 0 || selectedStatuses.includes(app.status);
    
    // Basic date filtering based on string comparison (YYYY-MM-DD)
    let matchDate = true;
    if (dateFrom && dateTo) {
      const appDate = app.submittedDate.split('T')[0];
      matchDate = appDate >= dateFrom && appDate <= dateTo;
    }

    return matchSearch && matchCategory && matchStatus && matchDate;
  });

  // Sort by submitted date descending
  filtered = filtered.sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());

  const resetFilters = () => {
    setSearch("");
    setCategory("ALL");
    setSelectedStatuses([]);
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters = search || category !== "ALL" || selectedStatuses.length > 0 || dateFrom || dateTo;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="My Applications"
        subtitle="Track and manage all your verification and certification applications."
        action={
          <Button className="bg-secondary hover:bg-secondary/90 text-white shadow-sm font-semibold">
            <Link href="/apply">
              <FileText className="mr-2 h-4 w-4" />
              New Application
            </Link>
          </Button>
        }
      />

      {/* Filters Bar */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-700">
          <Filter className="w-4 h-4" />
          Filter Applications
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Search</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Application ID..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 bg-gray-50/50"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</label>
            <Select value={category} onValueChange={(val: any) => setCategory(val)}>
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

          {/* Date Range (Mock Simple Inputs) */}
          <div className="space-y-1.5 md:col-span-2">
             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Range (Submitted)</label>
             <div className="flex items-center gap-2">
               <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-10 bg-gray-50/50" />
               <span className="text-gray-400 text-sm">to</span>
               <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-10 bg-gray-50/50" />
             </div>
          </div>
        </div>

        {/* Status Chips */}
        <div className="mt-5 space-y-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStatuses([])}
              className={twMerge(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                selectedStatuses.length === 0 
                  ? "bg-gray-900 text-white border-gray-900" 
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              )}
            >
              All
            </button>
            {APPLICATION_STATUSES.map(s => {
              const isSelected = selectedStatuses.includes(s.value);
              return (
                <button
                  key={s.value}
                  onClick={() => toggleStatus(s.value)}
                  className={twMerge(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    isSelected 
                      ? "bg-blue-100 text-blue-800 border-blue-200" 
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  )}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t flex justify-end">
             <Button variant="ghost" size="sm" onClick={resetFilters} className="text-red-500 hover:text-red-600 hover:bg-red-50">
               <X className="w-4 h-4 mr-1" /> Clear All Filters
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
                <th className="px-6 py-4">Application ID</th>
                <th className="px-6 py-4">Instrument</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Routed To</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Submitted Date</th>
                <th className="px-6 py-4">Scheduled Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    No applications found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <Link href={`/applications/${app.id}`} className="font-mono text-blue-600 hover:underline font-medium">
                        {app.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{app.instrumentName}</td>
                    <td className="px-6 py-4 text-gray-600">{app.instrumentCategory}</td>
                    <td className="px-6 py-4 text-gray-600">{app.verificationType === 'NEW' ? 'New' : 'Re-verify'}</td>
                    <td className="px-6 py-4 text-gray-600">{app.routedTo === 'LMO' ? 'LMO - Ahmedabad' : 'GATC - Test Centre'}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {format(parseISO(app.submittedDate), "dd MMM, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {app.scheduledDate ? format(parseISO(app.scheduledDate), "dd MMM, yyyy") : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/applications/${app.id}`}>
                          <Eye className="w-4 h-4 mr-2" /> View
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-900">1</span> to <span className="font-medium text-gray-900">{filtered.length}</span> of <span className="font-medium text-gray-900">{filtered.length}</span> results
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
