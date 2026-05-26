/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {DBState, User, Class, Enrollment, AttendanceRecord, AttendanceAlert, StudentStats, College, Department, Semester, Section, Subject} from './types';

const INITIAL_COLLEGE: College = {
  id: 'college-1',
  name: 'Vidyasagar College of IT & Management (VCIM)',
  academicYear: '2026-25'
};

const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dep-1', name: 'Computer Applications', code: 'BCA' },
  { id: 'dep-2', name: 'Information Technology', code: 'BSC-IT' },
  { id: 'dep-3', name: 'Science', code: 'BSC' }
];

const INITIAL_SEMESTERS: Semester[] = [
  { id: 'sem-1', name: '4th Semester' },
  { id: 'sem-2', name: '6th Semester' },
  { id: 'sem-3', name: '8th Semester' }
];

const INITIAL_SECTIONS: Section[] = [
  { id: 'sec-1', name: 'Section A' },
  { id: 'sec-2', name: 'Section B' }
];

const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sub-1', name: 'Cloud Computing', code: 'BCA-601', departmentName: 'Computer Applications' },
  { id: 'sub-2', name: 'Web Programming with React', code: 'BCA-602', departmentName: 'Computer Applications' },
  { id: 'sub-3', name: 'Artificial Intelligence & ML', code: 'BCA-603', departmentName: 'Computer Applications' },
  { id: 'sub-4', name: 'Database Management Systems', code: 'BCA-401', departmentName: 'Computer Applications' }
];

// Let's create helper to generate past dates
const getPastDateString = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const INITIAL_USERS: User[] = [
  { id: 'u-admin', email: 'admin@college.edu', name: 'Dr. Ramesh Nair (HOD)', role: 'admin', faceRegistered: true, isActive: true },
  { id: 'u-teacher1', email: 'teacher@college.edu', name: 'Prof. Amit Verma', role: 'teacher', department: 'Computer Applications', faceRegistered: true, isActive: true },
  { id: 'u-teacher2', email: 'teacher2@college.edu', name: 'Dr. Shalini Sen', role: 'teacher', department: 'Computer Applications', faceRegistered: true, isActive: true },
  { id: 'u-student1', email: 'aarav@college.edu', name: 'Aarav Sharma', role: 'student', rollNo: 'BCA-2023-01', department: 'Computer Applications', semester: '6th Semester', faceRegistered: true, isActive: true },
  { id: 'u-student2', email: 'ishaan@college.edu', name: 'Ishaan Varma', role: 'student', rollNo: 'BCA-2023-02', department: 'Computer Applications', semester: '6th Semester', faceRegistered: false, isActive: true },
  { id: 'u-student3', email: 'meera@college.edu', name: 'Meera Jayaraman', role: 'student', rollNo: 'BCA-2023-03', department: 'Computer Applications', semester: '6th Semester', faceRegistered: true, isActive: true },
  { id: 'u-student4', email: 'rohan@college.edu', name: 'Rohan Das', role: 'student', rollNo: 'BCA-2023-04', department: 'Computer Applications', semester: '6th Semester', faceRegistered: true, isActive: true },
  { id: 'u-student5', email: 'divya@college.edu', name: 'Divya Iyer', role: 'student', rollNo: 'BCA-2023-05', department: 'Computer Applications', semester: '6th Semester', faceRegistered: true, isActive: true },
  { id: 'u-student6', email: 'kabir@college.edu', name: 'Kabir Mehta', role: 'student', rollNo: 'BCA-2023-06', department: 'Computer Applications', semester: '6th Semester', faceRegistered: false, isActive: true },
];

const INITIAL_CLASSES: Class[] = [
  { id: 'c-101', code: 'BCA-601', name: 'Cloud Computing', teacherId: 'u-teacher1', teacherName: 'Prof. Amit Verma', department: 'Computer Applications', semester: '6th Semester', scheduleTime: 'Mon, Wed 10:00 AM', room: 'LT-1' },
  { id: 'c-102', code: 'BCA-602', name: 'Web Programming with React', teacherId: 'u-teacher1', teacherName: 'Prof. Amit Verma', department: 'Computer Applications', semester: '6th Semester', scheduleTime: 'Tue, Thu 11:30 AM', room: 'Lab-2' },
  { id: 'c-103', code: 'BCA-603', name: 'Artificial Intelligence & ML', teacherId: 'u-teacher2', teacherName: 'Dr. Shalini Sen', department: 'Computer Applications', semester: '6th Semester', scheduleTime: 'Wed, Fri 02:00 PM', room: 'Lab-4' },
];

const INITIAL_ENROLLMENTS: Enrollment[] = [
  { classId: 'c-101', studentId: 'u-student1' },
  { classId: 'c-101', studentId: 'u-student2' },
  { classId: 'c-101', studentId: 'u-student3' },
  { classId: 'c-101', studentId: 'u-student4' },
  { classId: 'c-101', studentId: 'u-student5' },
  { classId: 'c-101', studentId: 'u-student6' },

  { classId: 'c-102', studentId: 'u-student1' },
  { classId: 'c-102', studentId: 'u-student2' },
  { classId: 'c-102', studentId: 'u-student3' },
  { classId: 'c-102', studentId: 'u-student4' },
  { classId: 'c-102', studentId: 'u-student5' },

  { classId: 'c-103', studentId: 'u-student1' },
  { classId: 'c-103', studentId: 'u-student2' },
  { classId: 'c-103', studentId: 'u-student3' },
  { classId: 'c-103', studentId: 'u-student4' },
  { classId: 'c-103', studentId: 'u-student5' },
  { classId: 'c-103', studentId: 'u-student6' },
];

// Let's seed rich attendance history over 15 lecture dates in the last 30 days
// We will distribute attendance:
// - Aarav (u-student1): present almost always (~93%)
// - Ishaan (u-student2): absent in many (~53%) -> Critical alert trigger target!
// - Meera (u-student3): late sometimes, moderate (~80%) -> Warning status
// - Rohan (u-student4): 100% present (100%) -> Stellar
// - Divya (u-student5): normal high (~86%)
// - Kabir (u-student6): u-student6 is enrolled only in Cloud & AI, absent frequently (~60%)
const generateSeededRecords = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const activeLecturesCount = 12; // 12 past dates where attendance was taken
  
  // Make a list of 12 lecture dates
  const lectureDates: string[] = [];
  for (let i = 1; i <= 24; i++) {
    // Exclude weekends
    const d = new Date();
    d.setDate(d.getDate() - i);
    const day = d.getDay();
    if (day !== 0 && day !== 6 && lectureDates.length < activeLecturesCount) {
      lectureDates.push(d.toISOString().split('T')[0]);
    }
  }
  lectureDates.sort(); // Oldest to newest

  const students = INITIAL_USERS.filter(u => u.role === 'student');

  INITIAL_CLASSES.forEach(cls => {
    // Get enrolled students
    const enrolledIds = INITIAL_ENROLLMENTS
      .filter(e => e.classId === cls.id)
      .map(e => e.studentId);

    lectureDates.forEach((date, index) => {
      // Simulate that attendance was marked for this date
      enrolledIds.forEach(sId => {
        const student = students.find(s => s.id === sId);
        if (!student) return;

        let status: 'present' | 'absent' | 'late' = 'present';
        
        // Custom deterministic probabilities per student to show outstanding Viva metrics!
        if (sId === 'u-student1') {
          // Aarav Sharma: present mostly, absent once, late once
          if (index === 2) status = 'absent';
          else if (index === 5) status = 'late';
        } else if (sId === 'u-student2') {
          // Ishaan Varma: absent frequently (~50% absent)
          if (index % 2 === 0) status = 'absent';
          else if (index === 5) status = 'late';
        } else if (sId === 'u-student3') {
          // Meera: moderate, late often
          if (index === 3 || index === 9) status = 'absent';
          else if (index % 4 === 1) status = 'late';
        } else if (sId === 'u-student4') {
          // Rohan: 100%
          status = 'present';
        } else if (sId === 'u-student5') {
          // Divya: solid academic
          if (index === 1) status = 'absent';
          else if (index === 7) status = 'late';
        } else if (sId === 'u-student6') {
          // Kabir Mehta: low attendance
          if (index === 1 || index === 2 || index === 6 || index === 8 || index === 11) status = 'absent';
          else if (index === 4) status = 'late';
        }

        records.push({
          id: `rec-${cls.id}-${sId}-${index}`,
          classId: cls.id,
          studentId: sId,
          studentName: student.name,
          studentRollNo: student.rollNo || '',
          date,
          status,
          markedMethod: index % 3 === 0 ? 'qr' : (index % 3 === 1 ? 'face' : 'manual'),
          timestamp: `${date}T10:0${index % 10}:12Z`
        });
      });
    });
  });

  return records;
};

const INITIAL_ALERTS: AttendanceAlert[] = [
  {
    id: 'alert-1',
    studentId: 'u-student2',
    classId: 'c-101',
    className: 'Cloud Computing',
    message: 'Your Cloud Computing attendance has dropped to 50% (Academic minimum: 75%). Please contact Prof. Amit Verma.',
    type: 'danger',
    date: getPastDateString(1),
    isRead: false,
  },
  {
    id: 'alert-2',
    studentId: 'u-student6',
    classId: 'c-103',
    className: 'Artificial Intelligence & ML',
    message: 'Your Artificial Intelligence attendance is currently at 58.3%. Attendance under 75% will block exam admit card generation.',
    type: 'warning',
    date: getPastDateString(2),
    isRead: false,
  },
  {
    id: 'alert-3',
    studentId: 'u-student3',
    classId: 'c-102',
    className: 'Web Programming with React',
    message: 'You were marked Late today. Cumulative late count stands at 3. Three lates equal one absent.',
    type: 'info',
    date: getPastDateString(0),
    isRead: false,
  }
];

class DatabaseManager {
  private state: DBState;

  constructor() {
    this.state = this.getInitialState();
  }

  private getInitialState(): DBState {
    return {
      users: [...INITIAL_USERS],
      classes: [...INITIAL_CLASSES],
      enrollments: [...INITIAL_ENROLLMENTS],
      records: generateSeededRecords(),
      alerts: [...INITIAL_ALERTS],
      college: { ...INITIAL_COLLEGE },
      departments: [...INITIAL_DEPARTMENTS],
      semesters: [...INITIAL_SEMESTERS],
      sections: [...INITIAL_SECTIONS],
      subjects: [...INITIAL_SUBJECTS]
    };
  }

  public reset() {
    this.state = this.getInitialState();
  }

  // Users
  public getUsers(): User[] {
    return this.state.users;
  }

  public getStudents(): User[] {
    return this.state.users.filter(u => u.role === 'student');
  }

  public getTeachers(): User[] {
    return this.state.users.filter(u => u.role === 'teacher');
  }

  public getUserById(id: string): User | undefined {
    return this.state.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: Omit<User, 'id'>): User {
    const id = `u-${Math.random().toString(36).substr(2, 9)}`;
    const newUser: User = { ...user, id };
    this.state.users.push(newUser);
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.getUserById(id);
    if (!user) return undefined;
    Object.assign(user, updates);
    return user;
  }

  // Classes
  public getClasses(): Class[] {
    return this.state.classes;
  }

  public getClassesByTeacher(teacherId: string): Class[] {
    return this.state.classes.filter(c => c.teacherId === teacherId);
  }

  public getClassById(id: string): Class | undefined {
    return this.state.classes.find(c => c.id === id);
  }

  public createClass(cls: Omit<Class, 'id'>): Class {
    const id = `c-${Math.random().toString(36).substr(2, 9)}`;
    const newClass: Class = { ...cls, id };
    this.state.classes.push(newClass);
    return newClass;
  }

  // Enrollments
  public getEnrollments(): Enrollment[] {
    return this.state.enrollments;
  }

  public enrollStudent(classId: string, studentId: string) {
    const exists = this.state.enrollments.some(e => e.classId === classId && e.studentId === studentId);
    if (!exists) {
      this.state.enrollments.push({ classId, studentId });
    }
  }

  public unenrollStudent(classId: string, studentId: string) {
    this.state.enrollments = this.state.enrollments.filter(e => !(e.classId === classId && e.studentId === studentId));
  }

  public getEnrolledStudents(classId: string): User[] {
    const studentIds = this.state.enrollments.filter(e => e.classId === classId).map(e => e.studentId);
    return this.state.users.filter(u => studentIds.includes(u.id));
  }

  public getStudentClasses(studentId: string): Class[] {
    const classIds = this.state.enrollments.filter(e => e.studentId === studentId).map(e => e.classId);
    return this.state.classes.filter(c => classIds.includes(c.id));
  }

  // Attendance Records
  public getRecords(): AttendanceRecord[] {
    return this.state.records;
  }

  public getRecordsByClass(classId: string): AttendanceRecord[] {
    return this.state.records.filter(r => r.classId === classId);
  }

  public getRecordsByStudent(studentId: string): AttendanceRecord[] {
    return this.state.records.filter(r => r.studentId === studentId);
  }

  public addAttendanceRecord(record: Omit<AttendanceRecord, 'id' | 'timestamp'>): AttendanceRecord {
    const id = `rec-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    // Check if record for same student, class, and date already exists. Overwrite if so!
    const existingIndex = this.state.records.findIndex(
      r => r.classId === record.classId && r.studentId === record.studentId && r.date === record.date
    );

    const newRecord: AttendanceRecord = { ...record, id, timestamp };

    if (existingIndex !== -1) {
      this.state.records[existingIndex] = newRecord;
    } else {
      this.state.records.push(newRecord);
    }

    // Trigger low attendance check alert
    this.checkAndGenerateAlert(record.studentId, record.classId);

    return newRecord;
  }

  // Alerts
  public getAlerts(): AttendanceAlert[] {
    return this.state.alerts;
  }

  public getAlertsByStudent(studentId: string): AttendanceAlert[] {
    return this.state.alerts.filter(a => a.studentId === studentId);
  }

  public markAlertAsRead(alertId: string) {
    const alert = this.state.alerts.find(a => a.id === alertId);
    if (alert) alert.isRead = true;
  }

  private checkAndGenerateAlert(studentId: string, classId: string) {
    const stats = this.getStudentStatsForClass(studentId, classId);
    const student = this.getUserById(studentId);
    const cls = this.getClassById(classId);

    if (stats && student && cls && stats.percentage < 75) {
      // Check if alert already exists for today to avoid flooding
      const today = new Date().toISOString().split('T')[0];
      const exists = this.state.alerts.some(
        a => a.studentId === studentId && a.classId === classId && a.date === today && a.type === 'danger'
      );

      if (!exists) {
        this.state.alerts.unshift({
          id: `alert-${Math.random().toString(36).substr(2, 9)}`,
          studentId,
          classId,
          className: cls.name,
          message: `URGENT: Your attendance in ${cls.name} has fallen to ${stats.percentage.toFixed(1)}%. Maintain minimum 75% to be eligible for end-semester exams!`,
          type: 'danger',
          date: today,
          isRead: false
        });
      }
    }
  }

  // Calculation Utilities (Viva-friendly metrics formulas!)
  public getStudentStatsForClass(studentId: string, classId: string): StudentStats | null {
    const cls = this.getClassById(classId);
    if (!cls) return null;

    const classRecords = this.getRecordsByClass(classId);
    
    // How many unique lecture dates total have been registered for this class
    const dates = Array.from(new Set(classRecords.map(r => r.date)));
    const totalClasses = dates.length;

    if (totalClasses === 0) {
      return {
        classId,
        className: cls.name,
        classCode: cls.code,
        totalClasses: 0,
        classesPresent: 0,
        classesLate: 0,
        percentage: 100, // Starts fresh and clean
        riskStatus: 'good'
      };
    }

    const studentRecords = classRecords.filter(r => r.studentId === studentId);
    const presents = studentRecords.filter(r => r.status === 'present').length;
    const lates = studentRecords.filter(r => r.status === 'late').length;

    // Standard university formula: 3 lates = 1 absent, OR late is counted as 0.75 weight or full present depending on configuration.
    // Let's count Late as present but track it. Weight = 1.0, but warns them!
    const effectivePresent = presents + lates;
    const percentage = Math.min(100, Math.round((effectivePresent / totalClasses) * 1000) / 10);

    let riskStatus: 'critical' | 'warning' | 'good' = 'good';
    if (percentage < 75) riskStatus = 'critical';
    else if (percentage < 85) riskStatus = 'warning';

    return {
      classId,
      className: cls.name,
      classCode: cls.code,
      totalClasses,
      classesPresent: presents,
      classesLate: lates,
      percentage,
      riskStatus
    };
  }

  public getOverallStudentStats(studentId: string) {
    const studentClasses = this.getStudentClasses(studentId);
    const stats: StudentStats[] = [];
    
    studentClasses.forEach(cls => {
      const clsStats = this.getStudentStatsForClass(studentId, cls.id);
      if (clsStats) stats.push(clsStats);
    });

    if (stats.length === 0) {
      return { stats, overallPercentage: 100, risk: 'good' };
    }

    const sumPercentages = stats.reduce((acc, s) => acc + s.percentage, 0);
    const overallPercentage = Math.round((sumPercentages / stats.length) * 10) / 10;
    
    let risk: 'critical' | 'warning' | 'good' = 'good';
    if (overallPercentage < 75) risk = 'critical';
    else if (overallPercentage < 85) risk = 'warning';

    return { stats, overallPercentage, risk };
  }

  // College Details
  public getCollege(): College {
    return this.state.college;
  }

  public updateCollege(updates: Partial<College>): College {
    Object.assign(this.state.college, updates);
    return this.state.college;
  }

  // Departments
  public getDepartments(): Department[] {
    return this.state.departments;
  }

  public createDepartment(dep: Omit<Department, 'id'>): Department {
    const id = `dep-${Math.random().toString(36).substr(2, 9)}`;
    const newDep = { ...dep, id };
    this.state.departments.push(newDep);
    return newDep;
  }

  public updateDepartment(id: string, updates: Partial<Department>): Department | undefined {
    const dep = this.state.departments.find(d => d.id === id);
    if (!dep) return undefined;
    Object.assign(dep, updates);
    return dep;
  }

  public deleteDepartment(id: string): boolean {
    const len = this.state.departments.length;
    this.state.departments = this.state.departments.filter(d => d.id !== id);
    return this.state.departments.length < len;
  }

  // Semesters
  public getSemesters(): Semester[] {
    return this.state.semesters;
  }

  public createSemester(sem: Omit<Semester, 'id'>): Semester {
    const id = `sem-${Math.random().toString(36).substr(2, 9)}`;
    const newSem = { ...sem, id };
    this.state.semesters.push(newSem);
    return newSem;
  }

  public updateSemester(id: string, updates: Partial<Semester>): Semester | undefined {
    const sem = this.state.semesters.find(s => s.id === id);
    if (!sem) return undefined;
    Object.assign(sem, updates);
    return sem;
  }

  public deleteSemester(id: string): boolean {
    const len = this.state.semesters.length;
    this.state.semesters = this.state.semesters.filter(s => s.id !== id);
    return this.state.semesters.length < len;
  }

  // Sections
  public getSections(): Section[] {
    return this.state.sections;
  }

  public createSection(sec: Omit<Section, 'id'>): Section {
    const id = `sec-${Math.random().toString(36).substr(2, 9)}`;
    const newSec = { ...sec, id };
    this.state.sections.push(newSec);
    return newSec;
  }

  public updateSection(id: string, updates: Partial<Section>): Section | undefined {
    const sec = this.state.sections.find(s => s.id === id);
    if (!sec) return undefined;
    Object.assign(sec, updates);
    return sec;
  }

  public deleteSection(id: string): boolean {
    const len = this.state.sections.length;
    this.state.sections = this.state.sections.filter(s => s.id !== id);
    return this.state.sections.length < len;
  }

  // Subjects
  public getSubjects(): Subject[] {
    return this.state.subjects;
  }

  public createSubject(sub: Omit<Subject, 'id'>): Subject {
    const id = `sub-${Math.random().toString(36).substr(2, 9)}`;
    const newSub = { ...sub, id };
    this.state.subjects.push(newSub);
    return newSub;
  }

  public updateSubject(id: string, updates: Partial<Subject>): Subject | undefined {
    const sub = this.state.subjects.find(s => s.id === id);
    if (!sub) return undefined;
    Object.assign(sub, updates);
    return sub;
  }

  public deleteSubject(id: string): boolean {
    const len = this.state.subjects.length;
    this.state.subjects = this.state.subjects.filter(s => s.id !== id);
    return this.state.subjects.length < len;
  }

  // User Deletion (to manage student/teacher data fully!)
  public deleteUser(id: string): boolean {
    const len = this.state.users.length;
    this.state.users = this.state.users.filter(u => u.id !== id);
    // Unenroll student if they are deleted
    this.state.enrollments = this.state.enrollments.filter(e => e.studentId !== id);
    return this.state.users.length < len;
  }
}

export const dbStore = new DatabaseManager();
