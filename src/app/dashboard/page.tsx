"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession, logout, User } from "@/lib/auth";

interface DailyEntry {
  id: string;
  date: string;
  totalHours: string;
  activities: string;
  createdAt: string;
}

interface Notification {
  id: string;
  type: "success" | "info" | "warning";
  message: string;
  time: string;
  read: boolean;
}

interface Stats {
  totalEntries: number;
  totalHours: number;
  pendingSubmissions: number;
  approved: number;
  rejected: number;
  pending: number;
}

const sampleNotifications: Notification[] = [
  { id: "1", type: "success", message: "Journal entry approved", time: "2h ago", read: false },
  { id: "2", type: "info", message: "New template available", time: "5h ago", read: false },
  { id: "3", type: "warning", message: "Submit weekly report", time: "1d ago", read: true },
  { id: "4", type: "info", message: "AI report ready for review", time: "2d ago", read: true },
];

export default function Dashboard() {
  const router = useRouter();
  const [session, setSession] = useState<User | null>(null);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalEntries: 0,
    totalHours: 0,
    pendingSubmissions: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
  });
  const [activeNav, setActiveNav] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);

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

    const storedEntries = localStorage.getItem("practicum-daily-journal");
    const storedDocs = localStorage.getItem("practicum_documents");
    const storedJournals = localStorage.getItem("practicum_journals");
    
    let parsedEntries: DailyEntry[] = [];
    let parsedDocs: any[] = [];
    let parsedJournals: any[] = [];
    
    if (storedEntries) {
      parsedEntries = JSON.parse(storedEntries);
      setEntries(parsedEntries);
    }
    
    if (storedDocs) {
      parsedDocs = JSON.parse(storedDocs);
    }
    
    if (storedJournals) {
      parsedJournals = JSON.parse(storedJournals);
    }
    
    const totalHours = parsedEntries.reduce((acc: number, entry: DailyEntry) => {
      return acc + (parseFloat(entry.totalHours) || 0);
    }, 0);

    const allSubmissions = [...parsedDocs, ...parsedJournals];
    const approved = allSubmissions.filter((d: any) => d.status === "approved").length;
    const rejected = allSubmissions.filter((d: any) => d.status === "rejected").length;
    const pending = allSubmissions.filter((d: any) => d.status === "pending" || d.status === "draft").length;

    setStats({
      totalEntries: parsedEntries.length,
      totalHours,
      pendingSubmissions: pending,
      approved,
      rejected,
      pending,
    });

    const submissions = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
    const mySubs = submissions.filter((s: any) => s.studentId === currentSession?.studentId);
    
    const newNotifications: Notification[] = [];
    mySubs.forEach((sub: any) => {
      if (sub.status === "approved") {
        newNotifications.push({ id: `${sub.id}-approved`, type: "success", message: `${sub.title} approved`, time: "Just now", read: false });
      } else if (sub.status === "rejected") {
        newNotifications.push({ id: `${sub.id}-rejected`, type: "warning", message: `${sub.title} rejected`, time: "Just now", read: false });
      } else if (sub.status === "revision") {
        newNotifications.push({ id: `${sub.id}-revision`, type: "info", message: `Revision requested for ${sub.title}`, time: "Just now", read: false });
      }
    });
    
    if (newNotifications.length > 0) {
      setNotifications([...newNotifications, ...sampleNotifications.slice(0, 2)]);
    }
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

const unreadCount = notifications.filter(n => !n.read).length;

  const recentEntries = entries.slice(0, 5);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F8FAFC" }}>
      {/* Sidebar */}
      <aside 
        className="w-60 flex-shrink-0 flex flex-col"
        style={{ 
          backgroundColor: "#FFFFFF", 
          borderRight: "1px solid #E2E8F0" 
        }}
      >
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: "#E2E8F0" }}>
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #00529B 0%, #0073C7 100%)' 
              }}
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-sm" style={{ color: "#1E293B" }}>
                Practicum
              </h1>
              <p className="text-xs" style={{ color: "#64748B" }}>System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => {
                  setActiveNav("dashboard");
                  router.push("/dashboard");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeNav === "dashboard" ? "#00529B" : "transparent",
                  color: activeNav === "dashboard" ? "#FFFFFF" : "#64748B",
                }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </button>
            </li>
            <li>
              <span className="block px-4 py-3 text-sm font-medium" style={{ color: "#64748B" }}>
                Requirements
              </span>
            </li>
            <li>
              <button
                onClick={() => router.push("/journal")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{ color: "#64748B" }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Journal
              </button>
            </li>
            <li>
              <button
                onClick={() => router.push("/dtr")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{ color: "#64748B" }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                DTR
              </button>
            </li>
            
            <li>
              <button
                onClick={() => router.push("/moa")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{ color: "#64748B" }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                MOA
              </button>
            </li>
            
            <li>
              <button
                onClick={() => router.push("/profile")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{ color: "#64748B" }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </button>
            </li>
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t" style={{ borderColor: "#E2E8F0" }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
            style={{ color: "#DC2626" }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header 
          className="px-8 py-4 flex items-center justify-between relative"
          style={{ 
            backgroundColor: "#FFFFFF", 
            borderBottom: "1px solid #E2E8F0" 
          }}
        >
          <h2 className="text-lg font-bold" style={{ color: "#1E293B" }}>Dashboard</h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl transition-colors"
              style={{ backgroundColor: "#F8FAFC", color: "#64748B" }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#F0F7FF" }}
              >
                <span className="font-medium text-sm" style={{ color: "#00529B" }}>{session?.name?.charAt(0) || "?"}</span>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "#1E293B" }}>{session?.name || "Student"}</p>
                <p className="text-xs" style={{ color: "#64748B" }}>{session?.studentId || "Student"}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Notification Popup */}
        {showNotifications && (
          <div 
            className="absolute right-8 top-20 w-80 rounded-2xl overflow-hidden z-50"
            style={{ 
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)'
            }}
          >
            {/* Header */}
            <div 
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: "1px solid #E2E8F0" }}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" style={{ color: "#00529B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="font-semibold text-sm" style={{ color: "#1E293B" }}>Notifications</span>
              </div>
              <button 
                onClick={() => setShowNotifications(false)}
                className="p-1 rounded-lg hover:bg-slate-100"
              >
                <svg className="w-4 h-4" style={{ color: "#64748B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Notification List */}
            <div className="max-h-64 overflow-y-auto">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className="px-4 py-3 flex items-start gap-3 border-b"
                  style={{ borderBottom: "1px solid #F1F5F9" }}
                >
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notification.type === "success" ? "bg-green-100" :
                      notification.type === "warning" ? "bg-yellow-100" : "bg-blue-100"
                    }`}
                  >
                    {notification.type === "success" && (
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {notification.type === "warning" && (
                      <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                    {notification.type === "info" && (
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: "#1E293B" }}>{notification.message}</p>
                    <p className="text-xs" style={{ color: "#94A3B8" }}>{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3" style={{ backgroundColor: "#F8FAFC" }}>
              <button 
                onClick={markAllAsRead}
                className="w-full py-2 text-sm font-medium rounded-lg"
                style={{ color: "#00529B" }}
              >
                Mark all as read
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div 
              className="p-6 rounded-2xl"
              style={{ 
                backgroundColor: "#FFFFFF",
                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
              }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#DCFCE7" }}
                >
                  <svg className="w-6 h-6" style={{ color: "#16A34A" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#64748B" }}>Approved</p>
                  <p className="text-2xl font-bold" style={{ color: "#1E293B" }}>{stats.approved}</p>
                </div>
              </div>
            </div>

            <div 
              className="p-6 rounded-2xl"
              style={{ 
                backgroundColor: "#FFFFFF",
                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
              }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#FEE2E2" }}
                >
                  <svg className="w-6 h-6" style={{ color: "#DC2626" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#64748B" }}>Rejected</p>
                  <p className="text-2xl font-bold" style={{ color: "#1E293B" }}>{stats.rejected}</p>
                </div>
              </div>
            </div>

            <div 
              className="p-6 rounded-2xl"
              style={{ 
                backgroundColor: "#FFFFFF",
                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
              }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#FFFBEB" }}
                >
                  <svg className="w-6 h-6" style={{ color: "#D97706" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#64748B" }}>Pending</p>
                  <p className="text-2xl font-bold" style={{ color: "#1E293B" }}>{stats.pendingSubmissions}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4" style={{ color: "#1E293B" }}>Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push("/journal")}
                className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ 
                  background: 'linear-gradient(135deg, #00529B 0%, #0073C7 100%)',
                  boxShadow: '0 4px 12px rgba(0, 82, 155, 0.2)'
                }}
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-white font-medium">New Journal Entry</span>
              </button>

              <button
                onClick={() => router.push("/documents")}
                className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ 
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                }}
              >
                <svg className="w-6 h-6" style={{ color: "#00529B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="font-medium" style={{ color: "#1E293B" }}>Upload Document</span>
              </button>

              <button
                onClick={() => alert("Templates coming soon!")}
                className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ 
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                }}
              >
                <svg className="w-6 h-6" style={{ color: "#00529B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
                </svg>
                <span className="font-medium" style={{ color: "#1E293B" }}>View Templates</span>
              </button>
            </div>
          </div>

          {/* Recent Entries & Announcements & Deadlines */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Entries */}
            <div 
              className="p-6 rounded-2xl lg:col-span-2"
              style={{ 
                backgroundColor: "#FFFFFF",
                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold" style={{ color: "#1E293B" }}>Recent Entries</h3>
                <button 
                  onClick={() => router.push("/journal")}
                  className="text-sm font-medium"
                  style={{ color: "#00529B" }}
                >
                  View All
                </button>
              </div>
              {recentEntries.length === 0 ? (
                <p className="text-sm" style={{ color: "#64748B" }}>No entries yet. Start by creating a new journal entry!</p>
              ) : (
                <div className="space-y-3">
                  {recentEntries.map((entry) => (
                    <div 
                      key={entry.id}
                      className="flex items-center justify-between p-3 rounded-xl"
                      style={{ backgroundColor: "#F8FAFC" }}
                    >
                      <div>
                        <p className="font-medium text-sm" style={{ color: "#1E293B" }}>{entry.date}</p>
                        <p className="text-xs" style={{ color: "#64748B" }}>
                          {entry.activities?.substring(0, 50) || "No content"}...
                        </p>
                      </div>
                      <span className="text-sm font-medium" style={{ color: "#00529B" }}>
                        {entry.totalHours || 0}h
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Announcements & Deadlines */}
            <div className="space-y-3">
              {/* Announcements */}
              <div 
                className="p-3 rounded-xl"
                style={{ 
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4" style={{ color: "#00529B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.843A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.664-.821z" />
                  </svg>
                  <h3 className="text-base font-bold" style={{ color: "#1E293B" }}>Announcements</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm" style={{ color: "#64748B" }}>No announcements from advisors yet.</p>
                </div>
              </div>

              {/* Deadlines */}
              <div 
                className="p-3 rounded-xl"
                style={{ 
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4" style={{ color: "#D97706" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-base font-bold" style={{ color: "#1E293B" }}>Deadlines</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm" style={{ color: "#64748B" }}>No upcoming deadlines.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 text-center">
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              Practicum System &copy; {new Date().getFullYear()} | STI Marikina
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
