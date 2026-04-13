"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession, logout, User, getUsers } from "@/lib/auth";

interface Submission {
  id: string;
  type: "journal" | "document" | "dtr" | "moa";
  studentName: string;
  studentId: string;
  title: string;
  status: "pending" | "approved" | "rejected" | "revision";
  submittedAt: string;
  isUrgent: boolean;
  content?: string;
  feedback?: string;
}

export default function AdvisorPage() {
  const router = useRouter();
  const [session, setSession] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [feedback, setFeedback] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession || currentSession.role !== "advisor") {
      router.push("/login");
      return;
    }
    setSession(currentSession);
    
    const storedSubmissions = localStorage.getItem("practicum_submissions");
    const allUsers = getUsers();
    const assignments = JSON.parse(localStorage.getItem("practicum_adviser_assignments") || "[]");
    
    let subs: Submission[] = storedSubmissions ? JSON.parse(storedSubmissions) : [];
    
    if (subs.length === 0) {
      subs = [
        { id: "1", type: "journal", studentName: "John Dwayne B. Guaniso", studentId: "student1", title: "Week 1 Journal Entry", status: "pending", submittedAt: "2026-04-13T10:30:00Z", isUrgent: true, content: "Today I learned about the company workflow..." },
        { id: "2", type: "document", studentName: "Maria Santos", studentId: "student2", title: "Endorsement Letter", status: "pending", submittedAt: "2026-04-12T14:00:00Z", isUrgent: false },
        { id: "3", type: "dtr", studentName: "John Dwayne B. Guaniso", studentId: "student1", title: "DTR Week 2", status: "approved", submittedAt: "2026-04-10T09:00:00Z", isUrgent: false },
        { id: "4", type: "journal", studentName: "Pedro Reyes", studentId: "student3", title: "Week 2 Journal", status: "revision", submittedAt: "2026-04-11T16:00:00Z", isUrgent: false, content: "I was assigned to the QA team...", feedback: "Please add more details about your tasks" },
      ];
    }
    
    const myAssignedStudents = assignments
      .filter((a: any) => a.adviserId === currentSession.id)
      .map((a: any) => a.studentId);
    
    if (myAssignedStudents.length > 0) {
      subs = subs.filter(s => myAssignedStudents.includes(s.studentId));
    }
    
    setSubmissions(subs);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleAction = (submissionId: string, action: "approved" | "rejected" | "revision") => {
    const updated = submissions.map(s => 
      s.id === submissionId ? { ...s, status: action, feedback: action === "revision" ? feedback : s.feedback } : s
    );
    setSubmissions(updated);
    localStorage.setItem("practicum_submissions", JSON.stringify(updated));
    setSelectedSubmission(null);
    setFeedback("");
  };

  const filteredSubmissions = submissions.filter(s => {
    if (filter === "all") return true;
    return s.status === filter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "journal": return "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z";
      case "document": return "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z";
      case "dtr": return "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z";
      case "moa": return "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z";
      default: return "";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return { bg: "#DCFCE7", text: "#16A34A" };
      case "rejected": return { bg: "#FEE2E2", text: "#DC2626" };
      case "revision": return { bg: "#FEF3C7", text: "#D97706" };
      default: return { bg: "#F1F5F9", text: "#64748B" };
    }
  };

  const pendingCount = submissions.filter(s => s.status === "pending").length;
  const approvedCount = submissions.filter(s => s.status === "approved").length;
  const revisionCount = submissions.filter(s => s.status === "revision").length;

  if (!session) return null;

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
            <li><span className="block px-4 py-3 text-sm font-medium rounded-xl" style={{ backgroundColor: "#00529B", color: "#FFFFFF" }}>Submissions</span></li>
          </ul>
        </nav>
        <div className="p-4 border-t" style={{ borderColor: "#E2E8F0" }}>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "#DC2626" }}>Logout</button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="px-8 py-4 flex items-center justify-between" style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E2E8F0" }}>
          <h2 className="text-lg font-bold" style={{ color: "#1E293B" }}>Student Submissions</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F0F7FF" }}>
              <span className="font-medium text-sm" style={{ color: "#00529B" }}>{session.name.charAt(0)}</span>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "#1E293B" }}>{session.name}</p>
              <p className="text-xs" style={{ color: "#64748B" }}>Advisor</p>
            </div>
          </div>
        </header>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
              <p className="text-sm" style={{ color: "#64748B" }}>Pending</p>
              <p className="text-2xl font-bold" style={{ color: "#D97706" }}>{pendingCount}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
              <p className="text-sm" style={{ color: "#64748B" }}>Approved</p>
              <p className="text-2xl font-bold" style={{ color: "#16A34A" }}>{approvedCount}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
              <p className="text-sm" style={{ color: "#64748B" }}>Revision</p>
              <p className="text-2xl font-bold" style={{ color: "#DC2626" }}>{revisionCount}</p>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            {(["all", "pending", "approved", "rejected"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: filter === f ? "#00529B" : "#FFFFFF", color: filter === f ? "#FFFFFF" : "#64748B", border: "1px solid #E2E8F0" }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredSubmissions.length === 0 ? (
              <div className="p-8 text-center" style={{ backgroundColor: "#FFFFFF", borderRadius: "16px" }}>
                <p className="text-sm" style={{ color: "#64748B" }}>No submissions found.</p>
              </div>
            ) : (
              filteredSubmissions.map((submission) => {
                const colors = getStatusColor(submission.status);
                return (
                  <div key={submission.id} className="p-4 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#F0F7FF" }}>
                          <svg className="w-5 h-5" style={{ color: "#00529B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getTypeIcon(submission.type)} />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium" style={{ color: "#1E293B" }}>{submission.title}</p>
                            {submission.isUrgent && <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: "#FEE2E2", color: "#DC2626" }}>Urgent</span>}
                          </div>
                          <p className="text-xs" style={{ color: "#64748B" }}>{submission.studentName} • {new Date(submission.submittedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: colors.bg, color: colors.text }}>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </span>
                        <button onClick={() => setSelectedSubmission(submission)} className="px-3 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>Review</button>
                      </div>
                    </div>
                    {submission.feedback && (
                      <div className="mt-3 p-3 rounded-xl" style={{ backgroundColor: "#FEF3C7" }}>
                        <p className="text-xs font-medium" style={{ color: "#92400E" }}>Feedback:</p>
                        <p className="text-sm" style={{ color: "#92400E" }}>{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {selectedSubmission && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="p-6 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-auto" style={{ backgroundColor: "#FFFFFF" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: "#1E293B" }}>{selectedSubmission.title}</h3>
              <button onClick={() => setSelectedSubmission(null)} style={{ color: "#64748B", background: "none", border: "none", cursor: "pointer", fontSize: "20px" }}>✕</button>
            </div>
            <div className="mb-4 p-4 rounded-xl" style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <p className="text-sm" style={{ color: "#64748B" }}><strong>Student:</strong> {selectedSubmission.studentName}</p>
              <p className="text-sm" style={{ color: "#64748B" }}><strong>Type:</strong> {selectedSubmission.type.toUpperCase()}</p>
              <p className="text-sm" style={{ color: "#64748B" }}><strong>Submitted:</strong> {new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
              {selectedSubmission.isUrgent && <p className="text-sm" style={{ color: "#DC2626" }}><strong>⚠️ Urgent</strong></p>}
            </div>
            {selectedSubmission.content && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2" style={{ color: "#1E293B" }}>Content:</p>
                <div className="p-4 rounded-xl" style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", whiteSpace: "pre-wrap" }}>
                  {selectedSubmission.content}
                </div>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: "#1E293B" }}>Feedback / Notes</label>
              <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full px-4 py-3 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }} rows={3} placeholder="Add feedback for the student..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleAction(selectedSubmission.id, "approved")} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#16A34A", color: "white" }}>Approve</button>
              <button onClick={() => handleAction(selectedSubmission.id, "revision")} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F59E0B", color: "white" }}>Request Revision</button>
              <button onClick={() => handleAction(selectedSubmission.id, "rejected")} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#DC2626", color: "white" }}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}