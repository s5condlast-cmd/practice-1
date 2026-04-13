"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession, logout, User } from "@/lib/auth";

interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export default function JournalPage() {
  const router = useRouter();
  const [session, setSession] = useState<User | null>(null);
  const [activeNav, setActiveNav] = useState("journal");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activities, setActivities] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateUrgent, setTemplateUrgent] = useState(false);
  const [journals, setJournals] = useState<any[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const templates: Template[] = [
    { id: "1", name: "Endorsement Letter", description: "School endorsement for practicum", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { id: "2", name: "Request Letter", description: "Request for company acceptance", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { id: "3", name: "Waiver Form", description: "Company liability waiver", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
    { id: "4", name: "Certificate Request", description: "Request for completion certificate", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
    { id: "5", name: "Excuse Letter", description: "Absence or late excuse letter", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
    { id: "6", name: "Evaluation Form", description: "Performance evaluation form", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
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

    const saved = localStorage.getItem("practicum_journals");
    if (saved) {
      setJournals(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
  }, [showPreview, activities]);

  const handlePreview = () => {
    if (!activities.trim()) {
      alert("Please add some content first.");
      return;
    }
    setShowPreview(true);
  };

  const saveJournals = (data: any[]) => {
    setJournals(data);
    localStorage.setItem("practicum_journals", JSON.stringify(data));
  };

  const handleSaveDraft = () => {
    if (!activities.trim()) {
      alert("Please add some content first.");
      return;
    }
    const draft = {
      id: Date.now().toString(),
      content: activities,
      isUrgent,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveJournals([...journals, draft]);
    setActivities("");
    setIsUrgent(false);
    alert("Draft saved!");
  };

  const handleSubmit = () => {
    if (!activities.trim()) {
      alert("Please add some content first.");
      return;
    }
    const entry = {
      id: Date.now().toString(),
      type: "journal",
      studentName: session?.name || "Student",
      studentId: session?.studentId || "",
      title: `Journal - ${new Date().toLocaleDateString()}`,
      content: activities,
      isUrgent,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };
    
    const existingSubs = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
    localStorage.setItem("practicum_submissions", JSON.stringify([...existingSubs, entry]));
    saveJournals([...journals, { ...entry, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
    setActivities("");
    setIsUrgent(false);
    alert("Journal submitted for review!");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not access microphone. Please grant permission.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64 = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ""));

      const response = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "transcribe", audioData: base64 }),
      });

      const data = await response.json();
      if (data.error) {
        alert(data.error);
      } else {
        setAiSummary(data.summary || "");
        setShowSummary(true);
      }
    } catch (error) {
      console.error("Transcription error:", error);
      alert("Failed to transcribe audio");
    } finally {
      setIsProcessing(false);
    }
  };

  const generateFullJournal = async () => {
    if (!aiSummary.trim()) {
      alert("No summary to generate from. Please use voice input first.");
      return;
    }
    setIsGenerating(true);
    try {
      const response = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "generate", summary: aiSummary }),
      });
      const data = await response.json();
      if (data.error) {
        alert(data.error);
      } else {
        setActivities(data.journal || "");
        setShowSummary(false);
      }
    } catch (error) {
      console.error("Generation error:", error);
      alert("Failed to generate journal");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
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
            <li><button onClick={() => router.push("/journal")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "#FFFFFF" }}>Journal</button></li>
            <li><button onClick={() => router.push("/dtr")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "#64748B" }}>DTR</button></li>
            <li><button onClick={() => router.push("/moa")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "#64748B" }}>MOA</button></li>
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
          <h2 className="text-lg font-bold" style={{ color: "#1E293B" }}>Journal</h2>
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
            <div className="flex flex-wrap gap-3">
              <button onClick={isRecording ? stopRecording : startRecording} disabled={isProcessing} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium" style={{ background: isRecording ? '#DC2626' : 'linear-gradient(135deg, #00529B 0%, #0073C7 100%)', color: "white" }}>
                {isProcessing ? "Processing..." : isRecording ? "Stop Recording" : "Start Voice Input"}
              </button>
              <button onClick={() => setShowTemplates(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'linear-gradient(135deg, #00529B 0%, #0073C7 100%)', color: "white" }}>
                Browse Templates (Forms)
              </button>
            </div>

            {showSummary && (
              <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "#1E293B" }}>AI Summary</h3>
                <textarea className="w-full px-4 py-3 rounded-xl border text-sm mb-4" style={{ borderColor: "#E2E8F0" }} rows={6} value={aiSummary} onChange={(e) => setAiSummary(e.target.value)} placeholder="AI summary will appear here..." />
                <button onClick={generateFullJournal} disabled={isGenerating} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium" style={{ background: isGenerating ? '#94A3B8' : '#16A34A', color: "white" }}>
                  {isGenerating ? "Generating..." : "Generate Full Journal"}
                </button>
              </div>
            )}

            <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: "#1E293B" }}>New Journal Entry</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#1E293B" }}>Activities / What is it about?</label>
                  <textarea className="w-full px-4 py-3 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0", color: "#1E293B" }} rows={15} placeholder="Describe your activities for the day... Or use voice input" value={activities} onChange={(e) => setActivities(e.target.value)} />
                </div>
                <div className="flex flex-wrap gap-3 pt-4">
                  <button onClick={handlePreview} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F8FAFC", border: '1px solid #E2E8F0', color: "#1E293B" }}>Preview</button>
                  <button onClick={handleSaveDraft} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F8FAFC", border: '1px solid #E2E8F0', color: "#1E293B" }}>Save Draft</button>
                  <button onClick={handleSubmit} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#16A34A", color: "white" }}>Submit Document</button>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium" style={{ color: "#1E293B" }}>Urgent</span>
                    <button onClick={() => setIsUrgent(!isUrgent)} className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors" style={{ backgroundColor: isUrgent ? "#DC2626" : "#E2E8F0" }}>
                      <span className="inline-block h-6 w-6 rounded-full bg-white shadow-lg transform transition-transform duration-200" style={{ transform: isUrgent ? "translateX(28px)" : "translateX(4px)" }} />
                    </button>
                  </div>
                </div>
              </div>

              {showPreview && (
                <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold" style={{ color: "#1E293B" }}>Preview</h4>
                    <button onClick={() => setShowPreview(false)} style={{ color: "#64748B", background: "none", border: "none", cursor: "pointer" }}>✕</button>
                  </div>
                  <div style={{ minHeight: "400px", whiteSpace: "pre-wrap", padding: "20px", backgroundColor: "#FFFFFF", borderRadius: "8px", fontFamily: "inherit", fontSize: "14px", lineHeight: "1.6", color: "#1E293B" }}>
                    {activities}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showTemplates && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="p-6 rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-auto" style={{ backgroundColor: "#FFFFFF" }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold" style={{ color: "#1E293B" }}>Browse Templates</h3>
              <button onClick={() => setShowTemplates(false)} style={{ color: "#64748B", background: "none", border: "none", cursor: "pointer", fontSize: "20px" }}>✕</button>
            </div>
            <div className="mb-6 flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <span className="text-sm font-medium" style={{ color: "#1E293B" }}>Mark as Urgent</span>
              <button onClick={() => setTemplateUrgent(!templateUrgent)} className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors" style={{ backgroundColor: templateUrgent ? "#DC2626" : "#E2E8F0" }}>
                <span className="inline-block h-6 w-6 rounded-full bg-white shadow-lg transform transition-transform duration-200" style={{ transform: templateUrgent ? "translateX(28px)" : "translateX(4px)" }} />
              </button>
              {templateUrgent && <span className="text-xs font-medium" style={{ color: "#DC2626" }}>Urgent</span>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div key={template.id} className="p-4 rounded-xl border cursor-pointer hover:border-[#00529B] transition-all" style={{ borderColor: "#E2E8F0", backgroundColor: "#FFFFFF" }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#F0F7FF" }}>
                      <svg className="w-5 h-5" style={{ color: "#00529B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={template.icon} />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: "#1E293B" }}>{template.name}</p>
                      <p className="text-xs" style={{ color: "#64748B" }}>{template.description}</p>
                    </div>
                  </div>
                  <button onClick={() => { alert(`Template "${template.name}" selected. Mark as urgent: ${templateUrgent}`); setShowTemplates(false); }} className="mt-3 w-full py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>Use Template</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}