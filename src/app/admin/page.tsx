"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUsers, createUser, deleteUser, getSession, logout, User, UserRole } from "@/lib/auth";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  createdAt: string;
}

interface StudentAdviser {
  studentId: string;
  adviserId: string;
}

interface Batch {
  id: string;
  name: string;
  academicYear: string;
  term: string;
  program: string;
  createdAt: string;
}

const defaultTemplates: Template[] = [
  { id: "1", name: "Endorsement Letter", description: "School endorsement for practicum", category: "Letter", createdAt: "2026-01-01" },
  { id: "2", name: "Request Letter", description: "Request for company acceptance", category: "Letter", createdAt: "2026-01-01" },
  { id: "3", name: "Waiver Form", description: "Company liability waiver", category: "Form", createdAt: "2026-01-01" },
  { id: "4", name: "Certificate Request", description: "Request for completion certificate", category: "Letter", createdAt: "2026-01-01" },
  { id: "5", name: "Excuse Letter", description: "Absence or late excuse letter", category: "Letter", createdAt: "2026-01-01" },
  { id: "6", name: "Evaluation Form", description: "Performance evaluation form", category: "Form", createdAt: "2026-01-01" },
];

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "batches" | "templates" | "monitoring">("users");
  const [showModal, setShowModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const [studentAdvisers, setStudentAdvisers] = useState<StudentAdviser[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    email: "",
    password: "",
    role: "student" as UserRole,
    adviserId: "",
  });
  const [batchForm, setBatchForm] = useState({
    name: "",
    academicYear: "2025-2026",
    term: "1st Semester",
    program: "BSIT",
  });
  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    category: "Letter",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
    const currentSession = getSession();
    if (!currentSession || currentSession.role !== "admin") {
      router.push("/login");
      return;
    }
    setSession(currentSession);
    setUsers(getUsers());
    
    if (typeof window !== "undefined") {
      const savedAssignments = localStorage.getItem("practicum_adviser_assignments");
      if (savedAssignments) {
        setStudentAdvisers(JSON.parse(savedAssignments));
      }
    }
  }, []);

  const saveAdviserAssignments = (data: StudentAdviser[]) => {
    setStudentAdvisers(data);
    if (typeof window !== "undefined") {
      localStorage.setItem("practicum_adviser_assignments", JSON.stringify(data));
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.studentId || !formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    const newUser = createUser({
      studentId: formData.studentId,
      password: formData.password,
      name: formData.name,
      email: formData.email,
      role: formData.role,
    });

    if (!newUser) {
      setError("Student ID already exists");
      return;
    }

    if (formData.role === "student" && formData.adviserId) {
      const newAssignment: StudentAdviser = {
        studentId: formData.studentId,
        adviserId: formData.adviserId,
      };
      saveAdviserAssignments([...studentAdvisers, newAssignment]);
    }

    setUsers(getUsers());
    setShowModal(false);
    setFormData({ studentId: "", name: "", email: "", password: "", role: "student", adviserId: "" });
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUser(id);
      setUsers(getUsers());
    }
  };

  const handleAssignAdviser = (studentId: string, adviserId: string) => {
    const existing = studentAdvisers.find(s => s.studentId === studentId);
    if (existing) {
      const updated = studentAdvisers.map(s => s.studentId === studentId ? { ...s, adviserId } : s);
      saveAdviserAssignments(updated);
    } else {
      saveAdviserAssignments([...studentAdvisers, { studentId, adviserId }]);
    }
  };

  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateForm.name || !templateForm.description) return;
    
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: templateForm.name,
      description: templateForm.description,
      category: templateForm.category,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setTemplates([...templates, newTemplate]);
    setShowTemplateModal(false);
    setTemplateForm({ name: "", description: "", category: "Letter" });
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm("Delete this template?")) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchForm.name) return;
    
    const newBatch: Batch = {
      id: Date.now().toString(),
      name: batchForm.name,
      academicYear: batchForm.academicYear,
      term: batchForm.term,
      program: batchForm.program,
      createdAt: new Date().toISOString(),
    };
    setBatches([...batches, newBatch]);
    setShowBatchModal(false);
    setBatchForm({ name: "", academicYear: "2025-2026", term: "1st Semester", program: "BSIT" });
  };

  const handleDeleteBatch = (id: string) => {
    if (confirm("Delete this batch?")) {
      setBatches(batches.filter(b => b.id !== id));
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const colors: Record<UserRole, { bg: string; text: string }> = {
      admin: { bg: "#FEE2E2", text: "#991B1B" },
      advisor: { bg: "#FEF3C7", text: "#92400E" },
      student: { bg: "#DCFCE7", text: "#166534" },
    };
    return colors[role];
  };

  const students = users.filter(u => u.role === "student");
  const advisors = users.filter(u => u.role === "advisor");
  const [submissions, setSubmissions] = useState<unknown[]>([]);

  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      const saved = localStorage.getItem("practicum_submissions");
      if (saved) {
        setSubmissions(JSON.parse(saved));
      }
    }
  }, [mounted]);

  if (!mounted) return null;

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
            <li><button onClick={() => setActiveTab("users")} className="w-full text-left px-4 py-3 text-sm font-medium rounded-xl" style={{ backgroundColor: activeTab === "users" ? "#00529B" : "transparent", color: activeTab === "users" ? "#FFFFFF" : "#64748B" }}>User Management</button></li>
            <li><button onClick={() => setActiveTab("batches")} className="w-full text-left px-4 py-3 text-sm font-medium rounded-xl" style={{ backgroundColor: activeTab === "batches" ? "#00529B" : "transparent", color: activeTab === "batches" ? "#FFFFFF" : "#64748B" }}>Batch & Terms</button></li>
            <li><button onClick={() => setActiveTab("templates")} className="w-full text-left px-4 py-3 text-sm font-medium rounded-xl" style={{ backgroundColor: activeTab === "templates" ? "#00529B" : "transparent", color: activeTab === "templates" ? "#FFFFFF" : "#64748B" }}>Templates</button></li>
            <li><button onClick={() => setActiveTab("monitoring")} className="w-full text-left px-4 py-3 text-sm font-medium rounded-xl" style={{ backgroundColor: activeTab === "monitoring" ? "#00529B" : "transparent", color: activeTab === "monitoring" ? "#FFFFFF" : "#64748B" }}>Monitoring</button></li>
          </ul>
        </nav>
        <div className="p-4 border-t" style={{ borderColor: "#E2E8F0" }}>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "#DC2626" }}>Logout</button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="px-8 py-4 flex items-center justify-between" style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E2E8F0" }}>
          <h2 className="text-lg font-bold" style={{ color: "#1E293B" }}>
            {activeTab === "users" && "User Management & Adviser Assignment"}
            {activeTab === "batches" && "Batch & Academic Term Management"}
            {activeTab === "templates" && "Template Management"}
            {activeTab === "monitoring" && "System Monitoring"}
          </h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F0F7FF" }}>
              <span className="font-medium text-sm" style={{ color: "#00529B" }}>{session.name.charAt(0)}</span>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "#1E293B" }}>{session.name}</p>
              <p className="text-xs" style={{ color: "#64748B" }}>Admin</p>
            </div>
          </div>
        </header>

        <div className="p-8">
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold" style={{ color: "#1E293B" }}>All Users</h3>
                  <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add User
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#64748B" }}>Student ID</th>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#64748B" }}>Name</th>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#64748B" }}>Email</th>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#64748B" }}>Role</th>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#64748B" }}>Assigned Adviser</th>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#64748B" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => {
                        const badge = getRoleBadge(user.role);
                        const assignment = studentAdvisers.find(s => s.studentId === user.studentId);
                        const assignedAdviser = assignment ? advisors.find(a => a.id === assignment.adviserId) : null;
                        
                        return (
                          <tr key={user.id} style={{ borderBottom: "1px solid #E2E8F0" }}>
                            <td className="py-3 px-4 text-sm" style={{ color: "#1E293B" }}>{user.studentId}</td>
                            <td className="py-3 px-4 text-sm" style={{ color: "#1E293B" }}>{user.name}</td>
                            <td className="py-3 px-4 text-sm" style={{ color: "#64748B" }}>{user.email}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: badge.bg, color: badge.text }}>
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {user.role === "student" ? (
                                <select 
                                  value={assignment?.adviserId || ""}
                                  onChange={(e) => handleAssignAdviser(user.studentId, e.target.value)}
                                  className="text-sm px-2 py-1 rounded border"
                                  style={{ borderColor: "#E2E8F0" }}
                                >
                                  <option value="">Select Adviser</option>
                                  {advisors.map(a => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-sm" style={{ color: "#64748B" }}>-</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <button onClick={() => handleDeleteUser(user.id)} className="text-sm font-medium" style={{ color: "#DC2626" }}>Delete</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "batches" && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold" style={{ color: "#1E293B" }}>Batches & Academic Terms</h3>
                  <button onClick={() => setShowBatchModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Batch
                  </button>
                </div>

                {batches.length === 0 ? (
                  <p className="text-sm" style={{ color: "#64748B" }}>No batches created yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                          <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#64748B" }}>Batch Name</th>
                          <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#64748B" }}>Academic Year</th>
                          <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#64748B" }}>Term</th>
                          <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#64748B" }}>Program</th>
                          <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#64748B" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {batches.map((batch) => (
                          <tr key={batch.id} style={{ borderBottom: "1px solid #E2E8F0" }}>
                            <td className="py-3 px-4 text-sm" style={{ color: "#1E293B" }}>{batch.name}</td>
                            <td className="py-3 px-4 text-sm" style={{ color: "#64748B" }}>{batch.academicYear}</td>
                            <td className="py-3 px-4 text-sm" style={{ color: "#64748B" }}>{batch.term}</td>
                            <td className="py-3 px-4 text-sm" style={{ color: "#64748B" }}>{batch.program}</td>
                            <td className="py-3 px-4">
                              <button onClick={() => handleDeleteBatch(batch.id)} className="text-sm font-medium" style={{ color: "#DC2626" }}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "templates" && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold" style={{ color: "#1E293B" }}>Document Templates</h3>
                  <button onClick={() => setShowTemplateModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Template
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div key={template.id} className="p-4 rounded-xl border" style={{ borderColor: "#E2E8F0" }}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "#1E293B" }}>{template.name}</p>
                          <p className="text-xs mt-1" style={{ color: "#64748B" }}>{template.description}</p>
                          <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs" style={{ backgroundColor: "#F0F7FF", color: "#00529B" }}>{template.category}</span>
                        </div>
                        <button onClick={() => handleDeleteTemplate(template.id)} className="text-sm" style={{ color: "#DC2626" }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "monitoring" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                  <p className="text-sm" style={{ color: "#64748B" }}>Total Students</p>
                  <p className="text-2xl font-bold" style={{ color: "#1E293B" }}>{students.length}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                  <p className="text-sm" style={{ color: "#64748B" }}>Total Advisors</p>
                  <p className="text-2xl font-bold" style={{ color: "#1E293B" }}>{advisors.length}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                  <p className="text-sm" style={{ color: "#64748B" }}>Pending Submissions</p>
                  <p className="text-2xl font-bold" style={{ color: "#D97706" }}>{submissions.filter((s: any) => s.status === "pending").length}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                  <p className="text-sm" style={{ color: "#64748B" }}>Total Submissions</p>
                  <p className="text-2xl font-bold" style={{ color: "#1E293B" }}>{submissions.length}</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "#1E293B" }}>All Submissions</h3>
                {submissions.length === 0 ? (
                  <p className="text-sm" style={{ color: "#64748B" }}>No submissions yet.</p>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((sub: any) => (
                      <div key={sub.id} className="p-3 rounded-xl flex items-center justify-between" style={{ backgroundColor: "#F8FAFC" }}>
                        <div>
                          <p className="text-sm font-medium" style={{ color: "#1E293B" }}>{sub.title}</p>
                          <p className="text-xs" style={{ color: "#64748B" }}>{sub.studentName} • {sub.type}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          sub.status === "approved" ? "bg-green-100 text-green-700" :
                          sub.status === "rejected" ? "bg-red-100 text-red-700" :
                          sub.status === "revision" ? "bg-yellow-100 text-yellow-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="p-6 rounded-2xl w-full max-w-md" style={{ backgroundColor: "#FFFFFF" }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "#1E293B" }}>Create New User</h3>
            
            {error && (
              <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: "#FEF2F2", color: "#991B1B" }}>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Student ID</label>
                <input type="text" value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }} placeholder="e.g., student001" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }} placeholder="Full Name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }} placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Password</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }} placeholder="Password" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Role</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }}>
                  <option value="student">Student</option>
                  <option value="advisor">Advisor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {formData.role === "student" && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Assign Adviser</label>
                  <select value={formData.adviserId} onChange={(e) => setFormData({ ...formData, adviserId: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }}>
                    <option value="">Select Adviser (Optional)</option>
                    {advisors.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setError(""); }} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}>Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBatchModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="p-6 rounded-2xl w-full max-w-md" style={{ backgroundColor: "#FFFFFF" }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "#1E293B" }}>Create New Batch</h3>
            
            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Batch Name</label>
                <input type="text" value={batchForm.name} onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }} placeholder="e.g., Batch 2026-1" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Academic Year</label>
                <select value={batchForm.academicYear} onChange={(e) => setBatchForm({ ...batchForm, academicYear: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }}>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2026-2027">2026-2027</option>
                  <option value="2027-2028">2027-2028</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Term</label>
                <select value={batchForm.term} onChange={(e) => setBatchForm({ ...batchForm, term: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }}>
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Program</label>
                <select value={batchForm.program} onChange={(e) => setBatchForm({ ...batchForm, program: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }}>
                  <option value="BSIT">BSIT - Information Technology</option>
                  <option value="BSBA">BSBA - Business Administration</option>
                  <option value="BSCRIM">BSCRIM - Criminology</option>
                  <option value="BSHM">BSHM - Hospitality Management</option>
                  <option value="BSENT">BSENT - Entrepreneurship</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowBatchModal(false)} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}>Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>Create Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTemplateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="p-6 rounded-2xl w-full max-w-md" style={{ backgroundColor: "#FFFFFF" }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "#1E293B" }}>Add New Template</h3>
            
            <form onSubmit={handleAddTemplate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Template Name</label>
                <input type="text" value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }} placeholder="e.g., Offer Letter" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Description</label>
                <input type="text" value={templateForm.description} onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }} placeholder="Brief description" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Category</label>
                <select value={templateForm.category} onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }}>
                  <option value="Letter">Letter</option>
                  <option value="Form">Form</option>
                  <option value="Report">Report</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowTemplateModal(false)} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}>Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>Add Template</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}