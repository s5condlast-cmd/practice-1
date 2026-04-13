"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession, logout, User } from "@/lib/auth";

interface Requirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

interface SubmittedDocument {
  id: string;
  requirementId: string;
  name: string;
  fileName: string;
  status: "pending" | "approved" | "rejected" | "revision";
  submittedAt: string;
  isUrgent: boolean;
}

const defaultRequirements: Requirement[] = [
  { id: "1", name: "Endorsement Letter", description: "Letter from school endorsing the student for practicum", required: true },
  { id: "2", name: "Resume", description: "Updated resume/CV", required: true },
  { id: "3", name: "Waiver Form", description: "Signed waiver for company liability", required: true },
  { id: "4", name: "Medical Certificate", description: "Recent medical clearance", required: true },
  { id: "5", name: "NDA Agreement", description: "Non-disclosure agreement if required by company", required: false },
];

export default function DocumentsPage() {
  const router = useRouter();
  const [session, setSession] = useState<User | null>(null);
  const [activeNav, setActiveNav] = useState("documents");
  const [requirements] = useState<Requirement[]>(defaultRequirements);
  const [documents, setDocuments] = useState<SubmittedDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Requirement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

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

    const saved = localStorage.getItem("practicum_documents");
    if (saved) {
      setDocuments(JSON.parse(saved));
    }
  }, []);

  const saveDocuments = (docs: SubmittedDocument[]) => {
    setDocuments(docs);
    localStorage.setItem("practicum_documents", JSON.stringify(docs));
  };

  const handleFileUpload = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf,.doc,.docx,.jpg,.png";
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !selectedDoc) return;
      
      setIsUploading(true);
      const newDoc: SubmittedDocument = {
        id: Date.now().toString(),
        requirementId: selectedDoc.id,
        name: selectedDoc.name,
        fileName: file.name,
        status: "pending",
        submittedAt: new Date().toISOString(),
        isUrgent,
      };
      saveDocuments([...documents, newDoc]);
      
      const submission = {
        id: newDoc.id,
        type: "document",
        studentName: session?.name || "Student",
        studentId: session?.studentId || "",
        title: selectedDoc.name,
        status: "pending",
        submittedAt: newDoc.submittedAt,
        isUrgent,
        fileName: file.name,
      };
      const existingSubs = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
      localStorage.setItem("practicum_submissions", JSON.stringify([...existingSubs, submission]));
      
      setSelectedDoc(null);
      setIsUrgent(false);
      setIsUploading(false);
    };
    fileInput.click();
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "#16A34A";
      case "rejected": return "#DC2626";
      case "revision": return "#F59E0B";
      default: return "#64748B";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "approved": return "#DCFCE7";
      case "rejected": return "#FEE2E2";
      case "revision": return "#FEF3C7";
      default: return "#F1F5F9";
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
            <li><button onClick={() => { setActiveNav("dashboard"); router.push("/dashboard"); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all" style={{ backgroundColor: activeNav === "dashboard" ? "#00529B" : "transparent", color: activeNav === "dashboard" ? "#FFFFFF" : "#64748B" }}>Dashboard</button></li>
            <li><span className="block px-4 py-3 text-sm font-medium" style={{ color: "#64748B" }}>Requirements</span></li>
            <li><button onClick={() => router.push("/journal")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all" style={{ color: "#64748B" }}>Journal</button></li>
            <li><button onClick={() => router.push("/dtr")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all" style={{ color: "#64748B" }}>DTR</button></li>
            <li><button onClick={() => router.push("/moa")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all" style={{ color: "#64748B" }}>MOA</button></li>
            <li><button onClick={() => router.push("/profile")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all" style={{ color: "#64748B" }}>Profile</button></li>
            <li><button onClick={() => router.push("/letters")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all" style={{ color: "#64748B" }}>Letters</button></li>
          </ul>
        </nav>
        <div className="p-4 border-t" style={{ borderColor: "#E2E8F0" }}>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all" style={{ color: "#DC2626" }}>Logout</button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="px-8 py-4 flex items-center justify-between" style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E2E8F0" }}>
          <h2 className="text-lg font-bold" style={{ color: "#1E293B" }}>Requirements</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F0F7FF" }}>
              <span className="font-medium text-sm" style={{ color: "#00529B" }}>{session?.name?.charAt(0) || "?"}</span>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "#1E293B" }}>{session?.name || "Student"}</p>
              <p className="text-xs" style={{ color: "#64748B" }}>{session?.studentId || "Student"}</p>
            </div>
          </div>
        </header>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: "#1E293B" }}>Required Documents</h3>
              <div className="space-y-3">
                {requirements.map((req) => {
                  const submitted = documents.find(d => d.requirementId === req.id);
                  return (
                    <div key={req.id} className="p-4 rounded-xl border" style={{ borderColor: submitted ? "#16A34A" : "#E2E8F0", backgroundColor: submitted ? "#F0FDF4" : "#FFFFFF" }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {submitted ? (
                            <svg className="w-5 h-5" style={{ color: "#16A34A" }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2" style={{ borderColor: req.required ? "#DC2626" : "#64748B" }} />
                          )}
                          <div>
                            <p className="text-sm font-medium" style={{ color: "#1E293B" }}>{req.name}</p>
                            <p className="text-xs" style={{ color: "#64748B" }}>{req.description}</p>
                          </div>
                        </div>
                        {!submitted && (
                          <button onClick={() => setSelectedDoc(req)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>Upload</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: "#1E293B" }}>Submitted Documents</h3>
              {documents.length === 0 ? (
                <p className="text-sm" style={{ color: "#64748B" }}>No documents submitted yet.</p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-4 rounded-xl border" style={{ borderColor: "#E2E8F0" }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium" style={{ color: "#1E293B" }}>{doc.name}</p>
                          <p className="text-xs" style={{ color: "#64748B" }}>{doc.fileName}</p>
                          <p className="text-xs" style={{ color: "#64748B" }}>{new Date(doc.submittedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: getStatusBg(doc.status), color: getStatusColor(doc.status) }}>{doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}</span>
                          {doc.isUrgent && <span className="block mt-1 text-xs font-medium" style={{ color: "#DC2626" }}>Urgent</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {selectedDoc && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="p-6 rounded-2xl w-full max-w-md" style={{ backgroundColor: "#FFFFFF" }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "#1E293B" }}>Upload {selectedDoc.name}</h3>
            <div className="mb-4">
              <label className="flex items-center gap-3">
                <button onClick={() => setIsUrgent(!isUrgent)} className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors" style={{ backgroundColor: isUrgent ? "#DC2626" : "#E2E8F0" }}>
                  <span className="inline-block h-6 w-6 rounded-full bg-white shadow-lg transform transition-transform duration-200" style={{ transform: isUrgent ? "translateX(28px)" : "translateX(4px)" }} />
                </button>
                <span className="text-sm font-medium" style={{ color: "#1E293B" }}>Mark as Urgent</span>
              </label>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setSelectedDoc(null); setIsUrgent(false); }} className="flex-1 px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}>Cancel</button>
              <button onClick={handleFileUpload} disabled={isUploading} className="flex-1 px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>{isUploading ? "Uploading..." : "Choose File"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}