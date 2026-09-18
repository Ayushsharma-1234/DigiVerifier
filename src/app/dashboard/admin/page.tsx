"use client";

import { useState } from "react";
import { RoleGuard } from "@/components/shared/RoleGuard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, Building, FileBarChart, ShieldAlert, ArrowUpRight, ArrowDownRight, 
  MapPin, Clock, FileText, ChevronRight, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend, ComposedChart
} from "recharts";
import { twMerge } from "tailwind-merge";

// --- Mock Data ---

const sparklineData1 = [{v: 10},{v: 12},{v: 15},{v: 14},{v: 18},{v: 22},{v: 24}];
const sparklineData2 = [{v: 24},{v: 20},{v: 18},{v: 15},{v: 10},{v: 12},{v: 8}];

const statePendencyData = [
  { state: "Maharashtra", pending: 85 },
  { state: "Gujarat", pending: 42 },
  { state: "Karnataka", pending: 15 },
  { state: "Delhi", pending: 8 },
  { state: "Tamil Nadu", pending: 65 },
  { state: "Kerala", pending: 25 },
];

const trendData = [
  { month: "Jan", applications: 400, certificates: 240 },
  { month: "Feb", applications: 300, certificates: 280 },
  { month: "Mar", applications: 550, certificates: 350 },
  { month: "Apr", applications: 450, certificates: 400 },
  { month: "May", applications: 600, certificates: 450 },
  { month: "Jun", applications: 700, certificates: 500 },
  { month: "Jul", applications: 850, certificates: 600 },
  { month: "Aug", applications: 750, certificates: 650 },
  { month: "Sep", applications: 900, certificates: 700 },
];

const categoryData = [
  { name: "Non-auto Weighing", value: 4500, color: "#3b82f6" },
  { name: "Fuel Dispensers", value: 2100, color: "#10b981" },
  { name: "Weighbridges", value: 1500, color: "#f59e0b" },
  { name: "Water Meters", value: 950, color: "#8b5cf6" },
  { name: "Taxi Meters", value: 650, color: "#ec4899" },
  { name: "Others", value: 800, color: "#64748b" },
];

const slaBreaches = [
  { id: "APP-2024-819", state: "Maharashtra", district: "Mumbai", category: "Weighbridge", days: 16, assignee: "LMO-MUM-01" },
  { id: "APP-2024-902", state: "Gujarat", district: "Ahmedabad", category: "Fuel Dispenser", days: 15, assignee: "LMO-AHD-03" },
  { id: "APP-2024-110", state: "Karnataka", district: "Bengaluru", category: "Non-auto Weighing", days: 12, assignee: "LMO-BLR-02" },
  { id: "APP-2024-442", state: "Delhi", district: "Central", category: "Taxi Meter", days: 9, assignee: "LMO-DEL-01" },
  { id: "APP-2024-551", state: "Tamil Nadu", district: "Chennai", category: "Water Meter", days: 8, assignee: "GATC-TN-04" },
];

const recentActivity = [
  { id: 1, text: "Certificate CERT-2024-992 issued for Fuel Dispenser in Ahmedabad", time: "10 mins ago", type: "success" },
  { id: 2, text: "New application APP-2024-993 submitted by Reliance Retail in Mumbai", time: "25 mins ago", type: "info" },
  { id: 3, text: "Application APP-2024-781 marked FAILED by Inspector Sharma", time: "1 hour ago", type: "danger" },
  { id: 4, text: "Fee payment received for 15 applications in Bengaluru", time: "2 hours ago", type: "info" },
  { id: 5, text: "Certificate CERT-2024-991 issued for Weighbridge in Chennai", time: "3 hours ago", type: "success" },
];

// --- Components ---

const Sparkline = ({ data, color }: { data: any[], color: string }) => (
  <div className="h-10 w-24">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const KPITile = ({ 
  title, value, trend, isPositive, colorClass, sparklineData 
}: { 
  title: string, value: string, trend: string, isPositive: boolean, colorClass: string, sparklineData: any[] 
}) => {
  const sparklineColor = colorClass.includes('blue') ? '#3b82f6' : 
                         colorClass.includes('purple') ? '#8b5cf6' : 
                         colorClass.includes('green') ? '#10b981' : 
                         colorClass.includes('orange') ? '#f97316' : 
                         colorClass.includes('red') ? '#ef4444' : '#6b7280';
  
  return (
    <Card className={twMerge("border-l-4 shadow-sm hover:shadow-md transition-shadow", colorClass)}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <Sparkline data={sparklineData} color={sparklineColor} />
        </div>
        <div className="flex items-end justify-between mt-2">
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          <div className={twMerge("flex items-center text-sm font-semibold", isPositive ? "text-green-600" : "text-red-600")}>
            {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
            {trend}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function AdminDashboard() {
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("ALL");
  const [district, setDistrict] = useState("ALL");

  const handleStateClick = (data: any) => {
    if (data && data.state) {
      setState(data.state);
      setDistrict("ALL"); // Reset district when state changes
    }
  };

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <div className="space-y-6 animate-in fade-in duration-500 pb-12">
        
        {/* Header & Jurisdiction Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <PageHeader 
            title="National Command Center" 
            subtitle="Oversight and monitoring dashboard for Legal Metrology."
            className="mb-0 pb-0"
          />
          
          <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-lg border shadow-sm">
            <MapPin className="w-5 h-5 text-gray-400 ml-2" />
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="w-[120px] h-9 border-none bg-transparent shadow-none focus:ring-0 font-semibold text-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="India">All India</SelectItem>
              </SelectContent>
            </Select>

            <span className="text-gray-300">/</span>
            
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="w-[140px] h-9 border-none bg-transparent shadow-none focus:ring-0 font-semibold text-gray-700">
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All States</SelectItem>
                <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                <SelectItem value="Gujarat">Gujarat</SelectItem>
                <SelectItem value="Karnataka">Karnataka</SelectItem>
                <SelectItem value="Delhi">Delhi</SelectItem>
                <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
              </SelectContent>
            </Select>

            <span className="text-gray-300">/</span>

            <Select value={district} onValueChange={setDistrict} disabled={state === "ALL"}>
              <SelectTrigger className="w-[140px] h-9 border-none bg-transparent shadow-none focus:ring-0 font-semibold text-gray-700">
                <SelectValue placeholder="All Districts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Districts</SelectItem>
                {state === "Gujarat" && (
                  <>
                    <SelectItem value="Ahmedabad">Ahmedabad</SelectItem>
                    <SelectItem value="Surat">Surat</SelectItem>
                    <SelectItem value="Vadodara">Vadodara</SelectItem>
                  </>
                )}
                {/* Expand other states as needed for demo */}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Section 2: KPI Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <KPITile 
            title="Registered Instruments" 
            value="1.24M" 
            trend="12.5%" 
            isPositive={true} 
            colorClass="border-l-blue-500" 
            sparklineData={sparklineData1} 
          />
          <KPITile 
            title="Applications (This Month)" 
            value="45,210" 
            trend="8.2%" 
            isPositive={true} 
            colorClass="border-l-purple-500" 
            sparklineData={sparklineData1} 
          />
          <KPITile 
            title="Certificates Issued (Month)" 
            value="38,900" 
            trend="5.1%" 
            isPositive={true} 
            colorClass="border-l-green-500" 
            sparklineData={sparklineData1} 
          />
          <KPITile 
            title="Pending Queue (Risk)" 
            value="12,450" 
            trend="2.4%" 
            isPositive={false} 
            colorClass="border-l-orange-500" 
            sparklineData={sparklineData2} 
          />
          <KPITile 
            title="Overdue Inspections" 
            value="3,120" 
            trend="14.5%" 
            isPositive={false} 
            colorClass="border-l-red-500" 
            sparklineData={sparklineData2} 
          />
          <KPITile 
            title="Avg Turnaround Time" 
            value="4.2 Days" 
            trend="0.8 Days" 
            isPositive={true} 
            colorClass="border-l-gray-500" 
            sparklineData={sparklineData2.map(d => ({v: 10 - d.v}))} 
          />
        </div>

        {/* Section 3: Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          
          {/* Chart 1: State Pendency */}
          <Card className="lg:col-span-4 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500 uppercase tracking-wider">State-wise Pendency</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statePendencyData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                  <YAxis dataKey="state" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#374151', fontWeight: 500}} width={80} />
                  <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="pending" radius={[0, 4, 4, 0]} onClick={handleStateClick} className="cursor-pointer">
                    {statePendencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pending > 50 ? '#ef4444' : entry.pending > 10 ? '#f59e0b' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-center text-gray-400 mt-2">Click a bar to filter dashboard by state</p>
            </CardContent>
          </Card>

          {/* Chart 2: Apps vs Certificates */}
          <Card className="lg:col-span-3 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500 uppercase tracking-wider">Processing Backlog Gap</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                  <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                  <Line type="monotone" name="Applications" dataKey="applications" stroke="#3b82f6" strokeWidth={3} dot={false} />
                  <Line type="monotone" name="Certificates" dataKey="certificates" stroke="#10b981" strokeWidth={3} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 3: Category Breakdown */}
          <Card className="lg:col-span-3 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500 uppercase tracking-wider">Verification by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-72 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{fontSize: '11px', marginTop: '10px'}} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Section 4: Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* SLA Breach Alerts */}
          <Card className="shadow-sm border-red-100 flex flex-col">
            <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-red-900">SLA Breach Alerts</h3>
              <span className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">{slaBreaches.length} Critical</span>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-gray-500 uppercase font-semibold text-xs border-b">
                  <tr>
                    <th className="px-4 py-3">Application ID</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Pending</th>
                    <th className="px-4 py-3">Assigned To</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {slaBreaches.map(breach => (
                    <tr key={breach.id} className="hover:bg-red-50/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-blue-600 font-bold">{breach.id}</td>
                      <td className="px-4 py-3">
                        <span className="block font-medium text-gray-900">{breach.state}</span>
                        <span className="text-xs text-gray-500">{breach.district}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={twMerge("font-bold", breach.days > 14 ? "text-red-600" : "text-amber-600")}>
                          {breach.days} Days
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{breach.assignee}</td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="outline" className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50">
                          Escalate
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-sm flex flex-col">
            <CardHeader className="border-b bg-gray-50/50 pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                <Clock className="w-5 h-5 text-gray-400" /> Recent Activity Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="p-6 space-y-6">
                {recentActivity.map((activity, index) => (
                  <div key={activity.id} className="flex gap-4 relative">
                    {/* Timeline line */}
                    {index !== recentActivity.length - 1 && (
                      <div className="absolute left-2.5 top-6 bottom-[-24px] w-0.5 bg-gray-100" />
                    )}
                    
                    {/* Dot */}
                    <div className={twMerge(
                      "w-5 h-5 rounded-full shrink-0 border-4 border-white shadow-sm relative z-10",
                      activity.type === 'success' ? "bg-green-500" :
                      activity.type === 'danger' ? "bg-red-500" : "bg-blue-500"
                    )} />
                    
                    <div className="pb-1">
                      <p className="text-sm font-medium text-gray-900 leading-snug">{activity.text}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 5: Quick Actions */}
        <h3 className="text-xl font-bold text-gray-900 pt-4">Administration & Reports</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/users" className="block group">
            <Card className="border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all h-full bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Manage Users</h4>
                  <p className="text-xs text-gray-500 mt-1">LMOs, GATCs, and Applicants</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/officers?type=GATC" className="block group">
            <Card className="border border-gray-200 hover:border-indigo-400 hover:shadow-md transition-all h-full bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
              <div className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Approve GATCs</h4>
                  <p className="text-xs text-gray-500 mt-1">12 Pending Approvals</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/reports" className="block group">
            <Card className="border border-gray-200 hover:border-green-400 hover:shadow-md transition-all h-full bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                  <FileBarChart className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Export Reports</h4>
                  <p className="text-xs text-gray-500 mt-1">Download national & state reports</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/audit-logs" className="block group">
            <Card className="border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all h-full bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Audit Logs</h4>
                  <p className="text-xs text-gray-500 mt-1">System activity and security</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

      </div>
    </RoleGuard>
  );
}
