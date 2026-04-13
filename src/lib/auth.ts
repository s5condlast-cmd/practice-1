"use client";

export interface User {
  id: string;
  studentId: string;
  name: string;
  email: string;
  role: "admin" | "advisor" | "student";
}

export type UserRole = "admin" | "advisor" | "student";

export const DEMO_USERS: Record<UserRole, User> = {
  admin: {
    id: "admin-001",
    studentId: "ADMIN001",
    name: "Admin User",
    email: "admin@practicum.edu",
    role: "admin",
  },
  advisor: {
    id: "advisor-001",
    studentId: "ADVISOR001",
    name: "Ms. Rodriguez",
    email: "rodriguez@practicum.edu",
    role: "advisor",
  },
  student: {
    id: "student-001",
    studentId: "STUDENT001",
    name: "John Dwayne B. Guaniso",
    email: "john.guaniso@student.edu",
    role: "student",
  },
};

export function getSession(): User | null {
  if (typeof window === "undefined") return null;
  const role = localStorage.getItem("demo_role") as UserRole | null;
  if (!role) return null;
  return DEMO_USERS[role] || null;
}

export function login(role: UserRole): User {
  if (typeof window !== "undefined") {
    localStorage.setItem("demo_role", role);
  }
  return DEMO_USERS[role];
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("demo_role");
  }
}

export function getUsers(): User[] {
  return Object.values(DEMO_USERS);
}

export function createUser(data: {
  studentId: string;
  password: string;
  name: string;
  email: string;
  role: UserRole;
}): User | null {
  const existing = DEMO_USERS[data.role as UserRole];
  if (existing) return null;
  return {
    id: `${data.role}-${Date.now()}`,
    studentId: data.studentId,
    name: data.name,
    email: data.email,
    role: data.role,
  };
}

export function deleteUser(id: string): void {}

export function initializeUsers(): void {}