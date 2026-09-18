"use client";

import { RoleGuard } from "@/components/shared/RoleGuard";
import { PageHeader } from "@/components/shared/PageHeader";
import { mockApplications, mockInstruments } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Clock, AlertTriangle, CheckCircle, ArrowRight, MapPin, Play } from "lucide-react";
import Link from "next/link";
import { format, parseISO, isToday, isBefore, startOfToday } from "date-fns";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from "recharts";
import { twMerge } from "tailwind-merge";

// Mock stats data for charts
const weeklyInspections = [
  { name: 'Week 1', count: 42 },
  { name: 'Week 2', count: 38 },
  { name: 'Week 3', count: 55 },
  { name: 'Week 4', count: 48 },
  { name: 'Week 5', count: 60 },
  { name: 'Week 6', count: 52 },
  { name: 'Week 7', count: 65 },
  { name: 'Week 8', count: 58 },
];

const resultsBreakdown = [
  { name: 'Passed', value: 85, color: '#10b981' },
  { name: 'Failed', value: 15, color: '#ef4444' },
];

const turnaroundTime = [
  { name: 'W1', days: 4.5 },
  { name: 'W2', days: 4.2 },
  { name: 'W3', days: 3.8 },
  { name: 'W4', days: 4.0 },
  { name: 'W5', days: 3.5 },
  { name: 'W6', days: 3.2 },
  { name: 'W7', days: 2.8 },
  { name: 'W8', days: 2.5 },
];

export default function LMODashboard() {
  const today = startOfToday();
  
  // Filter for LMO applications
  const lmoApps = mockApplications.filter(a => a.routedTo === 'LMO');

  // Calculate summary stats
  const scheduledToday = lmoApps.filter(a => a.scheduledDate && isToday(parseISO(a.scheduledDate)) && a.status === 'SCHEDULED');
  const pendingQueue = lmoApps.filter(a => ['SUBMITTED', 'FEE_PAID', 'SCHEDULED'].includes(a.status));
  const overdue = lmoApps.filter(a => a.scheduledDate && isBefore(parseISO(a.scheduledDate), today) && a.status === 'SCHEDULED');
  const completedThisMonth = lmoApps.filter(a => ['CERTIFICATE_ISSUED'].includes(a.status)); // Mocking month

  const getInstrumentInfo = (id: string) => mockInstruments.find(i => i.id === id);

  return (
    <RoleGuard allowedRoles={['LMO']}>
      <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        <PageHeader 
          title="Officer Dashboard" 
          subtitle="Welcome back. Here is your overview for today."
          action={
            <Button asChild className="bg-primary hover:bg-primary/90 text-white">
              <Link href="/lmo/queue">View Full Work Queue</Link>
            </Button>
          }
        />

        {/* Section 1: Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Assigned Today</p>
                  <h3 className="text-3xl font-bold text-gray-900">{scheduledToday.length}</h3>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                  <ClipboardList className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Pending Queue</p>
                  <h3 className="text-3xl font-bold text-gray-900">{pendingQueue.length}</h3>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Overdue Inspections</p>
                  <h3 className="text-3xl font-bold text-red-600">{overdue.length}</h3>
                </div>
                <div className="p-3 bg-red-50 rounded-lg text-red-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Completed This Month</p>
                  <h3 className="text-3xl font-bold text-gray-900">{completedThisMonth.length + 42}</h3>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-green-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 2: Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (65%) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b bg-gray-50/50 pb-4">
                <CardTitle className="text-lg flex items-center justify-between text-gray-800">
                  <span>Today&apos;s Schedule</span>
                  <span className="text-sm font-medium text-gray-500">{format(new Date(), "dd MMM yyyy")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {scheduledToday.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-lg font-medium text-gray-900">No inspections scheduled for today.</p>
                    <p className="text-sm mt-1">Check your pending queue to assign applications to yourself.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {scheduledToday.map((app, index) => {
                      const inst = getInstrumentInfo(app.instrumentId);
                      // Mock times for the schedule
                      const times = ["10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM"];
                      const time = times[index % times.length];
                      
                      return (
                        <div key={app.id} className="p-5 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                          <div className="flex gap-4 items-start">
                            <div className="bg-blue-50 text-blue-700 font-bold px-3 py-2 rounded-lg border border-blue-100 text-sm whitespace-nowrap">
                              {time}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-gray-900 text-lg">Applicant Name</h4>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono border border-gray-200">{app.id}</span>
                              </div>
                              <p className="text-gray-700 font-medium">{inst?.category}</p>
                              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" /> Sector 24, Gandhinagar
                              </p>
                            </div>
                          </div>
                          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto mt-2 sm:mt-0 shrink-0">
                            <Link href={`/lmo/inspect/${app.id}`}>
                              <Play className="w-4 h-4 mr-2" /> Start Inspection
                            </Link>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column (35%) */}
          <div className="space-y-6">
            <Card className="shadow-sm border-gray-200 h-full flex flex-col">
              <CardHeader className="border-b bg-gray-50/50 pb-4">
                <CardTitle className="text-lg flex items-center justify-between text-gray-800">
                  Pending Queue
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">{pendingQueue.length} Total</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col">
                <div className="divide-y overflow-y-auto max-h-[400px]">
                  {pendingQueue.slice(0, 5).map(app => {
                    const inst = getInstrumentInfo(app.instrumentId);
                    const isOverdue = app.scheduledDate && isBefore(parseISO(app.scheduledDate), today);
                    
                    return (
                      <div key={app.id} className={twMerge("p-4 hover:bg-gray-50 transition-colors flex justify-between items-center", isOverdue ? "bg-red-50/50 hover:bg-red-50" : "")}>
                        <div>
                          <Link href={`/applications/${app.id}`} className="font-mono text-sm text-blue-600 font-bold hover:underline mb-1 inline-block">{app.id}</Link>
                          <p className="text-sm text-gray-900 font-medium truncate max-w-[200px]">{inst?.category}</p>
                          {app.scheduledDate ? (
                            <p className={twMerge("text-xs font-semibold mt-1", isOverdue ? "text-red-600" : "text-gray-500")}>
                              {isOverdue ? "Overdue: " : "Scheduled: "} {format(parseISO(app.scheduledDate), "MMM dd")}
                            </p>
                          ) : (
                            <p className="text-xs text-orange-600 font-semibold mt-1">Needs Scheduling</p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" asChild className={twMerge(isOverdue ? "text-red-600 hover:text-red-700 hover:bg-red-100" : "")}>
                          <Link href={`/lmo/queue`}>View</Link>
                        </Button>
                      </div>
                    )
                  })}
                </div>
                <div className="p-3 border-t bg-gray-50 mt-auto text-center">
                  <Link href="/lmo/queue" className="text-sm font-semibold text-blue-600 hover:underline inline-flex items-center">
                    View full queue <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section 3: Performance Stats */}
        <h3 className="text-xl font-bold text-gray-900 pt-4">Performance Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500 uppercase tracking-wider">Inspections per week</CardTitle>
            </CardHeader>
            <CardContent className="h-64 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyInspections}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                  <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2 text-center">
              <CardTitle className="text-sm text-gray-500 uppercase tracking-wider">Results Breakdown (Month)</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex flex-col items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resultsBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {resultsBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-6">
                <div className="text-center">
                  <span className="block text-3xl font-bold text-gray-900">85%</span>
                  <span className="block text-xs font-semibold text-green-600">PASS RATE</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500 uppercase tracking-wider">Avg Turnaround Time (Days)</CardTitle>
            </CardHeader>
            <CardContent className="h-64 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={turnaroundTime}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} domain={[0, 6]} />
                  <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Line type="monotone" dataKey="days" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

      </div>
    </RoleGuard>
  );
}
