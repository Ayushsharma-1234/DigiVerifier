"use client";

import { useState } from "react";
import { RoleGuard } from "@/components/shared/RoleGuard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchIcon, CheckCircle, XCircle, Eye, ShieldCheck, User, Building, UserCog, Filter, X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import toast from "react-hot-toast";
import Link from "next/link";

// Mock User Data
type UserStatus = "ACTIVE" | "PENDING" | "SUSPENDED";
type UserRole = "ADMIN" | "LMO" | "GATC" | "APPLICANT";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  jurisdiction: string;
  registeredDate: string;
}

const mockUsers: UserProfile[] = [
  { id: "USR-001", name: "R.K. Sharma", email: "rk.sharma@gujarat.gov.in", role: "LMO", status: "ACTIVE", jurisdiction: "Gujarat / Ahmedabad", registeredDate: "2023-11-12" },
  { id: "USR-002", name: "State Metrology Lab", email: "contact@sml-guj.in", role: "GATC", status: "ACTIVE", jurisdiction: "Gujarat / Ahmedabad", registeredDate: "2024-01-05" },
  { id: "USR-003", name: "Reliance Retail Ltd", email: "compliance@reliance.in", role: "APPLICANT", status: "ACTIVE", jurisdiction: "India / National", registeredDate: "2024-02-20" },
  { id: "USR-004", name: "Amit Patel", email: "amit.patel@gov.in", role: "LMO", status: "PENDING", jurisdiction: "Gujarat / Surat", registeredDate: "2024-08-15" },
  { id: "USR-005", name: "National Scales Co.", email: "info@nationalscales.com", role: "GATC", status: "SUSPENDED", jurisdiction: "Maharashtra / Mumbai", registeredDate: "2023-09-10" },
  { id: "USR-006", name: "Delhi LMO Dept", email: "lmo.central@delhi.gov.in", role: "LMO", status: "ACTIVE", jurisdiction: "Delhi / Central", registeredDate: "2022-05-14" },
  { id: "USR-007", name: "Admin Manager", email: "admin@digiverifier.gov.in", role: "ADMIN", status: "ACTIVE", jurisdiction: "India / National", registeredDate: "2021-01-01" },
  { id: "USR-008", name: "Kiran Store", email: "kiran@gmail.com", role: "APPLICANT", status: "PENDING", jurisdiction: "Karnataka / Bengaluru", registeredDate: "2024-09-01" },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>(mockUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Filtering
  const filteredUsers = users.filter(user => {
    const matchSearch = user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "ALL" || user.role === roleFilter;
    const matchStatus = statusFilter === "ALL" || user.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const handleAction = (id: string, action: "APPROVE" | "SUSPEND") => {
    setUsers(users.map(u => {
      if (u.id === id) {
        return { ...u, status: action === "APPROVE" ? "ACTIVE" : "SUSPENDED" };
      }
      return u;
    }));
    toast.success(`User successfully ${action === "APPROVE" ? 'approved' : 'suspended'}.`);
  };

  const getRoleIcon = (role: UserRole) => {
    switch(role) {
      case 'ADMIN': return <ShieldCheck className="w-4 h-4 mr-1 text-purple-600" />;
      case 'LMO': return <UserCog className="w-4 h-4 mr-1 text-blue-600" />;
      case 'GATC': return <Building className="w-4 h-4 mr-1 text-indigo-600" />;
      case 'APPLICANT': return <User className="w-4 h-4 mr-1 text-gray-600" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch(role) {
      case 'ADMIN': return "bg-purple-50 text-purple-700 border-purple-200";
      case 'LMO': return "bg-blue-50 text-blue-700 border-blue-200";
      case 'GATC': return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case 'APPLICANT': return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusColor = (status: UserStatus) => {
    switch(status) {
      case 'ACTIVE': return "bg-green-100 text-green-800";
      case 'PENDING': return "bg-amber-100 text-amber-800";
      case 'SUSPENDED': return "bg-red-100 text-red-800";
    }
  };

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <div className="space-y-6 animate-in fade-in duration-500 pb-12">
        <PageHeader 
          title="User Management" 
          subtitle="Manage system users, approve registrations, and oversee access."
        />

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 w-full"
            />
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
                <Select value={roleFilter} onValueChange={(val: any) => setRoleFilter(val)}>
              <SelectTrigger className="w-full md:w-[160px] h-10">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="APPLICANT">Applicant</SelectItem>
                <SelectItem value="LMO">LMO</SelectItem>
                <SelectItem value="GATC">GATC</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>

                <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
              <SelectTrigger className="w-full md:w-[160px] h-10">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(search || roleFilter !== "ALL" || statusFilter !== "ALL") && (
            <Button variant="ghost" size="icon" onClick={() => { setSearch(""); setRoleFilter("ALL"); setStatusFilter("ALL"); }}>
              <X className="w-5 h-5 text-gray-500" />
            </Button>
          )}
        </div>

        {/* User Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs border-b">
                <tr>
                  <th className="px-5 py-4">User Details</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Jurisdiction</th>
                  <th className="px-5 py-4">Registered Date</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No users match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-bold text-gray-900">{user.name}</p>
                        <p className="text-gray-500 text-xs">{user.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={twMerge("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border", getRoleColor(user.role))}>
                          {getRoleIcon(user.role)} {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={twMerge("inline-flex items-center px-2 py-0.5 rounded text-xs font-bold", getStatusColor(user.status))}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-700 font-medium">{user.jurisdiction}</td>
                      <td className="px-5 py-4 text-gray-500">{user.registeredDate}</td>
                      <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap">
                        
                        {user.status === "PENDING" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                            onClick={() => handleAction(user.id, "APPROVE")}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                          </Button>
                        )}
                        
                        {user.status === "ACTIVE" && user.role !== "ADMIN" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-white text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleAction(user.id, "SUSPEND")}
                          >
                            <XCircle className="w-4 h-4 mr-1" /> Suspend
                          </Button>
                        )}

                        <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{filteredUsers.length}</span> users
            </span>
          </div>
        </div>

      </div>
    </RoleGuard>
  );
}
