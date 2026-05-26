/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  rollNo?: string;        // For students
  department?: string;    // For students & teachers
  semester?: string;      // For students (e.g., "8th Semester")
  faceRegistered: boolean;
  avatarUrl?: string;
  isActive: boolean;
  phone?: string;         // Support teacher/student contact info
  password?: string;      // Support credentials
  section?: string;       // Support students section
  subject?: string;       // Support teachers assigned subject
  classAssigned?: string; // Support assigned class details
}

export interface College {
  id: string;
  name: string;
  academicYear: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Semester {
  id: string;
  name: string;
}

export interface Section {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  departmentName: string;
}

export interface Class {
  id: string;
  code: string;           // e.g., "CS-801"
  name: string;           // e.g., "Data Science & AI"
  teacherId: string;
  teacherName: string;
  department: string;
  semester: string;       // e.g., "8th Semester"
  scheduleTime: string;   // e.g., "Mon, Wed 10:00 AM"
  room: string;           // e.g., "Lab-3"
}

export interface Enrollment {
  classId: string;
  studentId: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface AttendanceRecord {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  studentRollNo: string;
  date: string;           // YYYY-MM-DD
  status: AttendanceStatus;
  markedMethod: 'manual' | 'qr' | 'face';
  timestamp: string;      // Full ISO or time string
}

export interface AttendanceAlert {
  id: string;
  studentId: string;
  classId: string;
  className: string;
  message: string;
  type: 'danger' | 'warning' | 'info';
  date: string;
  isRead: boolean;
}

export interface StudentStats {
  classId: string;
  className: string;
  classCode: string;
  totalClasses: number;
  classesPresent: number;
  classesLate: number;
  percentage: number;
  riskStatus: 'critical' | 'warning' | 'good';
}

export interface AIStudentInsight {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  percentage: number;
  patternDetected: string;
  riskScore: number; // 0 to 100
  riskLevel: 'critical' | 'warning' | 'low';
  suggestions: string[];
}

export interface DBState {
  users: User[];
  classes: Class[];
  enrollments: Enrollment[];
  records: AttendanceRecord[];
  alerts: AttendanceAlert[];
  college: College;
  departments: Department[];
  semesters: Semester[];
  sections: Section[];
  subjects: Subject[];
}
