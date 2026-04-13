"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession, logout, User } from "@/lib/auth";

interface Revision {
  id: string;
  date: string;
  adviser: string;
  note: string;
}

export default function MOAPage() {
  const router = useRouter();
  const [session, setSession] = useState<User | null>(null);
  const [activeNav, setActiveNav] = useState("moa");
  const [isUrgent, setIsUrgent] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  const sampleRevisions: Revision[] = [
    { id: "1", date: "2026-04-10", adviser: "Ms. Rodriguez", note: "Please include company letterhead and signature on page 2." },
    { id: "2", date: "2026-04-08", adviser: "Ms. Rodriguez", note: "Add duration of practicum (500 hours) in section 3." },
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
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleFileUpload = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf,.doc,.docx,.jpg,.png";
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = () => {
          setUploadedFile(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
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
            <li><button onClick={() => { setActiveNav("dashboard"); router.push("/dashboard"); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: activeNav === "dashboard" ? "#00529B" : "transparent", color: activeNav === "dashboard" ? "#FFFFFF" : "#64748B" }}>Dashboard</button></li>
            <li><button onClick={() => { setActiveNav("requirements"); router.push("/documents"); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: activeNav === "requirements" ? "#00529B" : "transparent", color: activeNav === "requirements" ? "#FFFFFF" : "#64748B" }}>Requirements</button></li>
            <li><button onClick={() => router.push("/journal")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: activeNav === "journal" ? "#00529B" : "transparent", color: activeNav === "journal" ? "#FFFFFF" : "#64748B" }}>Journal</button></li>
            <li><button onClick={() => router.push("/dtr")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "#64748B" }}>DTR</button></li>
            <li><button onClick={() => router.push("/moa")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "#FFFFFF" }}>MOA</button></li>
            <li><button onClick={() => router.push("/profile")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "#64748B" }}>Profile</button></li>
            <li><button onClick={() => router.push("/letters")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "#64748B" }}>Letters</button></li>
          </ul>
        </nav>
        <div className="p-4 border-t" style={{ borderColor: "#E2E8F0" }}>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "#DC2626" }}>Logout</button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="px-8 py-4 flex items-center justify-between" style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E2E8F0" }}>
          <h2 className="text-lg font-bold" style={{ color: "#1E293B" }}>Memorandum of Agreement (MOA)</h2>
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
          <div className="space-y-6">
            <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold" style={{ color: "#1E293B" }}>MOA Overview</h3>
                <button onClick={handleFileUpload} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload MOA
                </button>
              </div>

              {uploadedFile ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl" style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6" style={{ color: "#00529B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium" style={{ color: "#1E293B" }}>{fileName}</span>
                      </div>
                      <button onClick={() => { setUploadedFile(null); setFileName(""); }} style={{ color: "#64748B", background: "none", border: "none", cursor: "pointer" }}>✕</button>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border" style={{ borderColor: "#E2E8F0", minHeight: "400px" }}>
                    <div className="flex items-center justify-center h-full" style={{ minHeight: "350px", color: "#64748B" }}>
                      <div className="text-center">
                        <svg className="w-12 h-12 mx-auto mb-3" style={{ color: "#94A3B8" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm">File preview</p>
                        <p className="text-xs" style={{ color: "#94A3B8" }}>PDF/DOCX viewer would render here</p>
                      </div>
                    </div>
                  </div>
                    <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium" style={{ color: "#1E293B" }}>Mark as Urgent</span>
                      <button onClick={() => setIsUrgent(!isUrgent)} className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors" style={{ backgroundColor: isUrgent ? "#DC2626" : "#E2E8F0" }}>
                        <span className="inline-block h-6 w-6 rounded-full bg-white shadow-lg transform transition-transform duration-200" style={{ transform: isUrgent ? "translateX(28px)" : "translateX(4px)" }} />
                      </button>
                      {isUrgent && <span className="text-xs font-medium" style={{ color: "#DC2626" }}>Urgent - Adviser will be notified</span>}
                    </div>
                    <button onClick={() => {
                      const submission = {
                        id: Date.now().toString(),
                        type: "moa",
                        studentName: session?.name || "Student",
                        studentId: session?.studentId || "",
                        title: `MOA - ${fileName}`,
                        status: "pending",
                        submittedAt: new Date().toISOString(),
                        isUrgent,
                        fileName,
                      };
                      const existingSubs = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
                      localStorage.setItem("practicum_submissions", JSON.stringify([...existingSubs, submission]));
                      alert("MOA submitted for review!");
                      setUploadedFile(null);
                      setFileName("");
                      setIsUrgent(false);
                    }} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#16A34A", color: "white" }}>Submit MOA</button>
                  </div>
                </div>
              ) : (
                <div className="p-12 rounded-xl border-dashed border-2 flex flex-col items-center justify-center" style={{ borderColor: "#E2E8F0" }}>
                  <svg className="w-12 h-12 mb-4" style={{ color: "#94A3B8" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <p className="text-sm font-medium mb-2" style={{ color: "#1E293B" }}>Upload your Memorandum of Agreement</p>
                  <p className="text-xs mb-4" style={{ color: "#64748B" }}>Supported formats: PDF, DOCX, JPG, PNG</p>
                  <button onClick={handleFileUpload} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>Choose File</button>
                </div>
              )}
            </div>

            <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: "#1E293B" }}>Adviser Revisions</h3>
              {sampleRevisions.length > 0 ? (
                <div className="space-y-3">
                  {sampleRevisions.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-xl" style={{ backgroundColor: "#FEF3C7", border: "1px solid #F59E0B" }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: "#92400E" }}>{rev.adviser}</span>
                        <span className="text-xs" style={{ color: "#B45309" }}>{rev.date}</span>
                      </div>
                      <p className="text-sm" style={{ color: "#92400E" }}>{rev.note}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm" style={{ color: "#64748B" }}>No revisions yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}