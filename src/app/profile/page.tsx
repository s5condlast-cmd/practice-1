"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession, logout, User } from "@/lib/auth";

interface PracticumProfile {
  studentId: string;
  program: string;
  yearLevel: string;
  companyName: string;
  companyAddress: string;
  companyContact: string;
  supervisorName: string;
  supervisorEmail: string;
  startDate: string;
  endDate: string;
  requiredHours: number;
  completedHours: number;
}

interface RequirementItem {
  id: string;
  name: string;
  status: "missing" | "pending" | "returned" | "completed";
}

export default function ProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<PracticumProfile>({
    studentId: "",
    program: "BSIT",
    yearLevel: "3rd Year",
    companyName: "",
    companyAddress: "",
    companyContact: "",
    supervisorName: "",
    supervisorEmail: "",
    startDate: "",
    endDate: "",
    requiredHours: 500,
    completedHours: 0,
  });

  const [requirements, setRequirements] = useState<RequirementItem[]>([
    { id: "1", name: "Endorsement Letter", status: "completed" },
    { id: "2", name: "Resume", status: "completed" },
    { id: "3", name: "Waiver Form", status: "pending" },
    { id: "4", name: "Medical Certificate", status: "missing" },
    { id: "5", name: "NDA Agreement", status: "missing" },
  ]);

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession || currentSession.role !== "student") {
      if (currentSession?.role === "admin") {
        router.push("/admin");
      } else if (currentSession?.role === "advisor") {
        router.push("/advisor");
      } else {
        router.push("/login");
      }
      return;
    }
    setSession(currentSession);
    setProfile(prev => ({ ...prev, studentId: currentSession.studentId }));

    const savedProfile = localStorage.getItem("practicum_profile_" + currentSession.studentId);
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }

    const savedReqs = localStorage.getItem("practicum_requirements_status");
    if (savedReqs) {
      setRequirements(JSON.parse(savedReqs));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("practicum_profile_" + session?.studentId, JSON.stringify(profile));
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const completedCount = requirements.filter(r => r.status === "completed").length;
  const pendingCount = requirements.filter(r => r.status === "pending" || r.status === "returned").length;
  const missingCount = requirements.filter(r => r.status === "missing").length;
  const progressPercent = Math.round((completedCount / requirements.length) * 100);
  const hoursPercent = Math.round((profile.completedHours / profile.requiredHours) * 100);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return { bg: "#DCFCE7", text: "#16A34A" };
      case "pending": return { bg: "#FEF3C7", text: "#D97706" };
      case "returned": return { bg: "#DBEAFE", text: "#2563EB" };
      case "missing": return { bg: "#FEE2E2", text: "#DC2626" };
      default: return { bg: "#F1F5F9", text: "#64748B" };
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F8FAFC" }}>
      <aside className="w-60 flex-shrink-0 flex flex-col" style={{ backgroundColor: "#FFFFFF", borderRight: "1px solid #E2E8F0" }}>
        <div className="p-6 border-b" style={{ borderColor: "#E2E8F0" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00529B 0%, #0073C7 100%)' }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-sm" style={{ color: "#1E293B" }}>Practicum</h1>
              <p className="text-xs" style={{ color: "#64748B" }}>System</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            <li><button onClick={() => router.push("/dashboard")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "#64748B" }}>Dashboard</button></li>
            <li><button onClick={() => router.push("/documents")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "#64748B" }}>Requirements</button></li>
            <li><button onClick={() => router.push("/journal")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "#64748B" }}>Journal</button></li>
            <li><button onClick={() => router.push("/dtr")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "#64748B" }}>DTR</button></li>
            <li><button onClick={() => router.push("/moa")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "#64748B" }}>MOA</button></li>
            <li><button onClick={() => router.push("/profile")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "#FFFFFF" }}>Profile</button></li>
            <li><button onClick={() => router.push("/letters")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "#64748B" }}>Letters</button></li>
          </ul>
        </nav>
        <div className="p-4 border-t" style={{ borderColor: "#E2E8F0" }}>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "#DC2626" }}>Logout</button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="px-8 py-4 flex items-center justify-between" style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E2E8F0" }}>
          <h2 className="text-lg font-bold" style={{ color: "#1E293B" }}>Practicum Profile</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F0F7FF" }}>
              <span className="font-medium text-sm" style={{ color: "#00529B" }}>{session?.name?.charAt(0) || "?"}</span>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "#1E293B" }}>{session?.name || "Student"}</p>
              <p className="text-xs" style={{ color: "#64748B" }}>{session?.studentId}</p>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: "#1E293B" }}>OJT Hours Progress</h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: "#64748B" }}>Completed</span>
                  <span style={{ color: "#1E293B" }}>{profile.completedHours} / {profile.requiredHours} hours</span>
                </div>
                <div className="w-full h-3 rounded-full" style={{ backgroundColor: "#E2E8F0" }}>
                  <div className="h-3 rounded-full transition-all" style={{ width: `${hoursPercent}%`, backgroundColor: hoursPercent >= 100 ? "#16A34A" : "#00529B" }} />
                </div>
                <p className="text-xs mt-2" style={{ color: "#64748B" }}>{hoursPercent}% complete</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: "#1E293B" }}>Requirements Compliance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#16A34A" }} />
                    <span className="text-sm" style={{ color: "#64748B" }}>Completed</span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: "#1E293B" }}>{completedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#D97706" }} />
                    <span className="text-sm" style={{ color: "#64748B" }}>Pending</span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: "#1E293B" }}>{pendingCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#DC2626" }} />
                    <span className="text-sm" style={{ color: "#64748B" }}>Missing</span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: "#1E293B" }}>{missingCount}</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full h-3 rounded-full" style={{ backgroundColor: "#E2E8F0" }}>
                  <div className="h-3 rounded-full transition-all" style={{ width: `${progressPercent}%`, backgroundColor: progressPercent >= 100 ? "#16A34A" : "#00529B" }} />
                </div>
                <p className="text-xs mt-2" style={{ color: "#64748B" }}>{progressPercent}% requirements complete</p>
              </div>
            </div>
          </div>

          {/* Program Info */}
          <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: "#1E293B" }}>Program Information</h3>
              <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>
                {isEditing ? "Save Changes" : "Edit"}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Program</label>
                {isEditing ? (
                  <select value={profile.program} onChange={(e) => setProfile({ ...profile, program: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }}>
                    <option value="BSIT">BSIT - Information Technology</option>
                    <option value="BSBA">BSBA - Business Administration</option>
                    <option value="BSCRIM">BSCRIM - Criminology</option>
                    <option value="BSHM">BSHM - Hospitality Management</option>
                    <option value="BSENT">BSENT - Entrepreneurship</option>
                  </select>
                ) : (
                  <p className="text-sm font-medium" style={{ color: "#1E293B" }}>{profile.program}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Year Level</label>
                {isEditing ? (
                  <select value={profile.yearLevel} onChange={(e) => setProfile({ ...profile, yearLevel: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }}>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="5th Year">5th Year</option>
                  </select>
                ) : (
                  <p className="text-sm font-medium" style={{ color: "#1E293B" }}>{profile.yearLevel}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Required Hours</label>
                <p className="text-sm font-medium" style={{ color: "#1E293B" }}>{profile.requiredHours} hours</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Completed Hours</label>
                {isEditing ? (
                  <input type="number" value={profile.completedHours} onChange={(e) => setProfile({ ...profile, completedHours: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }} />
                ) : (
                  <p className="text-sm font-medium" style={{ color: "#1E293B" }}>{profile.completedHours} hours</p>
                )}
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "#1E293B" }}>Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Company Name</label>
                {isEditing ? (
                  <input type="text" value={profile.companyName} onChange={(e) => setProfile({ ...profile, companyName: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }} placeholder="Enter company name" />
                ) : (
                  <p className="text-sm font-medium" style={{ color: profile.companyName ? "#1E293B" : "#94A3B8" }}>{profile.companyName || "Not set"}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Company Contact</label>
                {isEditing ? (
                  <input type="text" value={profile.companyContact} onChange={(e) => setProfile({ ...profile, companyContact: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }} placeholder="Phone/Email" />
                ) : (
                  <p className="text-sm font-medium" style={{ color: profile.companyContact ? "#1E293B" : "#94A3B8" }}>{profile.companyContact || "Not set"}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Company Address</label>
                {isEditing ? (
                  <input type="text" value={profile.companyAddress} onChange={(e) => setProfile({ ...profile, companyAddress: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }} placeholder="Full address" />
                ) : (
                  <p className="text-sm font-medium" style={{ color: profile.companyAddress ? "#1E293B" : "#94A3B8" }}>{profile.companyAddress || "Not set"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Supervisor Info */}
          <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "#1E293B" }}>Supervisor Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Supervisor Name</label>
                {isEditing ? (
                  <input type="text" value={profile.supervisorName} onChange={(e) => setProfile({ ...profile, supervisorName: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }} placeholder="Full name" />
                ) : (
                  <p className="text-sm font-medium" style={{ color: profile.supervisorName ? "#1E293B" : "#94A3B8" }}>{profile.supervisorName || "Not set"}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Supervisor Email</label>
                {isEditing ? (
                  <input type="email" value={profile.supervisorEmail} onChange={(e) => setProfile({ ...profile, supervisorEmail: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }} placeholder="email@company.com" />
                ) : (
                  <p className="text-sm font-medium" style={{ color: profile.supervisorEmail ? "#1E293B" : "#94A3B8" }}>{profile.supervisorEmail || "Not set"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Practicum Period */}
          <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "#1E293B" }}>Practicum Period</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Start Date</label>
                {isEditing ? (
                  <input type="date" value={profile.startDate} onChange={(e) => setProfile({ ...profile, startDate: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }} />
                ) : (
                  <p className="text-sm font-medium" style={{ color: profile.startDate ? "#1E293B" : "#94A3B8" }}>{profile.startDate || "Not set"}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>End Date</label>
                {isEditing ? (
                  <input type="date" value={profile.endDate} onChange={(e) => setProfile({ ...profile, endDate: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }} />
                ) : (
                  <p className="text-sm font-medium" style={{ color: profile.endDate ? "#1E293B" : "#94A3B8" }}>{profile.endDate || "Not set"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Requirements Checklist */}
          <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "#1E293B" }}>Requirements Checklist</h3>
            <div className="space-y-3">
              {requirements.map((req) => {
                const colors = getStatusColor(req.status);
                return (
                  <div key={req.id} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: "#F8FAFC" }}>
                    <span className="text-sm font-medium" style={{ color: "#1E293B" }}>{req.name}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: colors.bg, color: colors.text }}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}