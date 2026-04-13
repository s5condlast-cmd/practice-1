"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession, logout, User } from "@/lib/auth";

interface LetterRequest {
  id: string;
  type: string;
  status: "pending" | "approved" | "rejected" | "returned";
  requestedAt: string;
  notes?: string;
}

export default function LettersPage() {
  const router = useRouter();
  const [session, setSession] = useState<User | null>(null);
  const [activeNav, setActiveNav] = useState("letters");
  const [letterType, setLetterType] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [supervisorName, setSupervisorName] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [requests, setRequests] = useState<LetterRequest[]>([]);

  const letterTypes = [
    { id: "endorsement", name: "Endorsement Letter", description: "School endorsement for practicum" },
    { id: "request", name: "Request Letter", description: "Request for company acceptance" },
    { id: "certificate", name: "Certificate Request", description: "Request for completion certificate" },
    { id: "excuse", name: "Excuse Letter", description: "Absence or late excuse letter" },
  ];

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

    const savedRequests = localStorage.getItem("practicum_letter_requests_" + currentSession.studentId);
    if (savedRequests) {
      setRequests(JSON.parse(savedRequests));
    }
  }, []);

  const saveRequests = (data: LetterRequest[]) => {
    setRequests(data);
    localStorage.setItem("practicum_letter_requests_" + session?.studentId, JSON.stringify(data));
  };

  const handleSubmitRequest = () => {
    if (!letterType || !companyName) {
      alert("Please select a letter type and enter company name");
      return;
    }

    const newRequest: LetterRequest = {
      id: Date.now().toString(),
      type: letterType,
      status: "pending",
      requestedAt: new Date().toISOString(),
    };

    const submission = {
      id: newRequest.id,
      type: "letter",
      studentName: session?.name || "Student",
      studentId: session?.studentId || "",
      title: `${letterTypes.find(l => l.id === letterType)?.name || letterType} Request`,
      status: "pending",
      submittedAt: newRequest.requestedAt,
      isUrgent,
      companyName,
      companyAddress,
      supervisorName,
    };

    const existingSubs = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
    localStorage.setItem("practicum_submissions", JSON.stringify([...existingSubs, submission]));

    saveRequests([...requests, newRequest]);
    setShowModal(false);
    setLetterType("");
    setCompanyName("");
    setCompanyAddress("");
    setSupervisorName("");
    setIsUrgent(false);
    alert("Letter request submitted!");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return { bg: "#DCFCE7", text: "#16A34A" };
      case "rejected": return { bg: "#FEE2E2", text: "#DC2626" };
      case "returned": return { bg: "#DBEAFE", text: "#2563EB" };
      default: return { bg: "#FEF3C7", text: "#D97706" };
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
            <li><button onClick={() => router.push("/profile")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "#64748B" }}>Profile</button></li>
            <li><button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "#FFFFFF" }}>Letters</button></li>
          </ul>
        </nav>
        <div className="p-4 border-t" style={{ borderColor: "#E2E8F0" }}>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "#DC2626" }}>Logout</button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="px-8 py-4 flex items-center justify-between" style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E2E8F0" }}>
          <h2 className="text-lg font-bold" style={{ color: "#1E293B" }}>Letter Requests</h2>
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

        <div className="p-8">
          <div className="p-6 rounded-2xl mb-6" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: "#1E293B" }}>Available Letters</h3>
              <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Request Letter
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {letterTypes.map((letter) => (
                <div key={letter.id} className="p-4 rounded-xl border" style={{ borderColor: "#E2E8F0" }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#F0F7FF" }}>
                      <svg className="w-5 h-5" style={{ color: "#00529B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: "#1E293B" }}>{letter.name}</p>
                  </div>
                  <p className="text-xs" style={{ color: "#64748B" }}>{letter.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "#1E293B" }}>My Request History</h3>
            {requests.length === 0 ? (
              <p className="text-sm" style={{ color: "#64748B" }}>No letter requests yet.</p>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => {
                  const letterType = letterTypes.find(l => l.id === req.type);
                  const colors = getStatusColor(req.status);
                  return (
                    <div key={req.id} className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: "#F8FAFC" }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "#1E293B" }}>{letterType?.name || req.type}</p>
                        <p className="text-xs" style={{ color: "#64748B" }}>Requested: {new Date(req.requestedAt).toLocaleDateString()}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: colors.bg, color: colors.text }}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="p-6 rounded-2xl w-full max-w-lg" style={{ backgroundColor: "#FFFFFF" }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "#1E293B" }}>Request Letter</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Letter Type</label>
                <select value={letterType} onChange={(e) => setLetterType(e.target.value)} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }}>
                  <option value="">Select Letter</option>
                  {letterTypes.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Company Name</label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }} placeholder="Company name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Company Address</label>
                <input type="text" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }} placeholder="Full address" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Supervisor Name</label>
                <input type="text" value={supervisorName} onChange={(e) => setSupervisorName(e.target.value)} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }} placeholder="Supervisor full name" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium" style={{ color: "#1E293B" }}>Mark as Urgent</span>
                <button onClick={() => setIsUrgent(!isUrgent)} className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors" style={{ backgroundColor: isUrgent ? "#DC2626" : "#E2E8F0" }}>
                  <span className="inline-block h-6 w-6 rounded-full bg-white shadow-lg transform transition-transform duration-200" style={{ transform: isUrgent ? "translateX(28px)" : "translateX(4px)" }} />
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}>Cancel</button>
              <button onClick={handleSubmitRequest} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}