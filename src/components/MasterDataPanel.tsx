/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Users, 
  BookOpen, 
  UploadCloud, 
  AlertCircle, 
  Trash2, 
  Edit, 
  Search, 
  CheckCircle2, 
  Plus, 
  Calendar, 
  FileText, 
  ArrowRight,
  Shield,
  Layers,
  Phone,
  Mail,
  Lock,
  Download,
  Terminal
} from 'lucide-react';

interface MasterDataPanelProps {
  onRefreshTelemetry: () => void;
}

export default function MasterDataPanel({ onRefreshTelemetry }: MasterDataPanelProps) {
  // Navigation
  const [activeSubTab, setActiveSubTab] = useState<'college' | 'structures' | 'teachers' | 'students' | 'bulk'>('college');

  // Master States
  const [college, setCollege] = useState({ id: '', name: '', academicYear: '' });
  const [departments, setDepartments] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  // Telemetry loading states
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Search/Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [semFilter, setSemFilter] = useState('');

  // Forms States

  // 1. College Form
  const [editCollegeName, setEditCollegeName] = useState('');
  const [editCollegeYear, setEditCollegeYear] = useState('');

  // 2. Struct Forms
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newSemName, setNewSemName] = useState('');
  const [newSecName, setNewSecName] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubDept, setNewSubDept] = useState('');

  // 3. Teacher Form
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [teacherDept, setTeacherDept] = useState('');
  const [teacherSubject, setTeacherSubject] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');

  // 4. Student Form
  const [studentName, setStudentName] = useState('');
  const [studentRoll, setStudentRoll] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentDept, setStudentDept] = useState('');
  const [studentSem, setStudentSem] = useState('');
  const [studentSec, setStudentSec] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  // Editing States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editType, setEditType] = useState<'department' | 'semester' | 'section' | 'subject' | 'teacher' | 'student' | null>(null);
  const [editPayload, setEditPayload] = useState<any>({});

  // Bulk Upload States
  const [bulkType, setBulkType] = useState<'student' | 'teacher'>('student');
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkImportResult, setBulkImportResult] = useState<any>(null);

  // Fetch all databases
  const fetchAllData = async () => {
    setLoading(true);
    setActionError('');
    try {
      // Fetch College details
      const colResp = await fetch('/api/college');
      const colData = await colResp.json();
      if (colData.college) {
        setCollege(colData.college);
        setEditCollegeName(colData.college.name);
        setEditCollegeYear(colData.college.academicYear);
      }

      // Fetch Departments
      const depResp = await fetch('/api/departments');
      const depData = await depResp.json();
      setDepartments(depData.departments || []);

      // Fetch Semesters
      const semResp = await fetch('/api/semesters');
      const semData = await semResp.json();
      setSemesters(semData.semesters || []);

      // Fetch Sections
      const secResp = await fetch('/api/sections');
      const secData = await secResp.json();
      setSections(secData.sections || []);

      // Fetch Subjects
      const subResp = await fetch('/api/subjects');
      const subData = await subResp.json();
      setSubjects(subData.subjects || []);

      // Fetch Users
      const usersResp = await fetch('/api/users');
      const usersData = await usersResp.json();
      const allUsers = usersData.users || [];
      setTeachers(allUsers.filter((u: any) => u.role === 'teacher'));
      setStudents(allUsers.filter((u: any) => u.role === 'student'));

      // Populate default selections if empty
      if (depData.departments?.length > 0) {
        setNewSubDept(depData.departments[0].name);
        setTeacherDept(depData.departments[0].name);
        setStudentDept(depData.departments[0].name);
      }
      if (semData.semesters?.length > 0) {
        setStudentSem(semData.semesters[0].name);
      }
      if (secData.sections?.length > 0) {
        setStudentSec(secData.sections[0].name);
      }

    } catch (err) {
      console.error(err);
      setActionError('Telemetry error: Unable to index college local structures.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const flashSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 5000);
  };

  const flashError = (msg: string) => {
    setActionError(msg);
    setTimeout(() => setActionError(''), 7000);
  };

  // 1. College Details Updator
  const handleUpdateCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCollegeName || !editCollegeYear) {
      flashError('College name and current academic session are required.');
      return;
    }
    try {
      const resp = await fetch('/api/college', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editCollegeName, academicYear: editCollegeYear })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Aborted details patch.');
      setCollege(data.college);
      flashSuccess('College Master metadata updated successfully!');
      onRefreshTelemetry();
    } catch (err: any) {
      flashError(err.message);
    }
  };

  // 2. Add Department
  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName || !newDeptCode) {
      flashError('Department details are required.');
      return;
    }
    try {
      const resp = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDeptName, code: newDeptCode.toUpperCase() })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);
      setDepartments([...departments, data.department]);
      setNewDeptName('');
      setNewDeptCode('');
      flashSuccess('Department registered successfully.');
    } catch (err: any) {
      flashError(err.message);
    }
  };

  // Add Semester
  const handleAddSem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSemName) {
      flashError('Semester name is required.');
      return;
    }
    try {
      const resp = await fetch('/api/semesters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSemName })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);
      setSemesters([...semesters, data.semester]);
      setNewSemName('');
      flashSuccess('Semester slot registered.');
    } catch (err: any) {
      flashError(err.message);
    }
  };

  // Add Section
  const handleAddSec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecName) {
      flashError('Section name is required.');
      return;
    }
    try {
      const resp = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSecName })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);
      setSections([...sections, data.section]);
      setNewSecName('');
      flashSuccess('Section parameter registered.');
    } catch (err: any) {
      flashError(err.message);
    }
  };

  // Add Subject
  const handleAddSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName || !newSubCode || !newSubDept) {
      flashError('Subject code, name, and branch alignment are required.');
      return;
    }
    try {
      const resp = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSubName, code: newSubCode.toUpperCase(), departmentName: newSubDept })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);
      setSubjects([...subjects, data.subject]);
      setNewSubName('');
      setNewSubCode('');
      flashSuccess(`Subject "${newSubCode}" registered under ${newSubDept}.`);
    } catch (err: any) {
      flashError(err.message);
    }
  };

  // 3. Add Teacher Data Manual Entry with Validations
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName || !teacherEmail || !teacherDept || !teacherSubject) {
      flashError('Teacher name, email, department, and specialized subject are required.');
      return;
    }
    try {
      const resp = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'teacher',
          name: teacherName,
          email: teacherEmail,
          phone: teacherPhone,
          department: teacherDept,
          subject: teacherSubject,
          password: teacherPassword || undefined
        })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);

      setTeachers([...teachers, data.user]);
      setTeacherName('');
      setTeacherEmail('');
      setTeacherPhone('');
      setTeacherSubject('');
      setTeacherPassword('');
      flashSuccess(`Professor "${data.user.name}" enrolled into Master Registry.`);
      onRefreshTelemetry();
    } catch (err: any) {
      flashError(err.message);
    }
  };

  // 4. Add Student Data Manual Entry with Validations
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentRoll || !studentEmail || !studentDept || !studentSem || !studentSec) {
      flashError('Student name, unique roll, email, branch, sem, and section allocation are mandatory.');
      return;
    }
    try {
      const resp = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'student',
          name: studentName,
          rollNo: studentRoll,
          email: studentEmail,
          phone: studentPhone,
          department: studentDept,
          semester: studentSem,
          section: studentSec,
          password: studentPassword || undefined
        })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);

      setStudents([...students, data.user]);
      setStudentName('');
      setStudentRoll('');
      setStudentEmail('');
      setStudentPhone('');
      setStudentPassword('');
      flashSuccess(`Scholar "${data.user.name}" registered in Roll Registry.`);
      onRefreshTelemetry();
    } catch (err: any) {
      flashError(err.message);
    }
  };

  // Generic Deleter
  const handleDeleteMasterRow = async (id: string, type: 'department' | 'semester' | 'section' | 'subject' | 'teacher' | 'student') => {
    let msg = 'Are you sure you want to delete this record?';
    if (type === 'teacher' || type === 'student') {
      msg = `CRITICAL: Deleting this user will remove all credentials and attendance associations. Proceed?`;
    }
    if (!window.confirm(msg)) return;

    try {
      let url = '';
      if (type === 'department') url = `/api/departments/${id}`;
      else if (type === 'semester') url = `/api/semesters/${id}`;
      else if (type === 'section') url = `/api/sections/${id}`;
      else if (type === 'subject') url = `/api/subjects/${id}`;
      else if (type === 'teacher' || type === 'student') url = `/api/users/${id}`;

      const resp = await fetch(url, { method: 'DELETE' });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Delete operation aborted.');

      // Update states locally
      if (type === 'department') setDepartments(departments.filter(d => d.id !== id));
      else if (type === 'semester') setSemesters(semesters.filter(s => s.id !== id));
      else if (type === 'section') setSections(sections.filter(s => s.id !== id));
      else if (type === 'subject') setSubjects(subjects.filter(s => s.id !== id));
      else if (type === 'teacher') setTeachers(teachers.filter(t => t.id !== id));
      else if (type === 'student') setStudents(students.filter(s => s.id !== id));

      flashSuccess('Record permanently deleted.');
      onRefreshTelemetry();
    } catch (err: any) {
      flashError(err.message);
    }
  };

  // Generic Editor Start Helper
  const startEditing = (record: any, type: typeof editType) => {
    setEditingId(record.id);
    setEditType(type);
    setEditPayload({ ...record });
  };

  // Generic Save Edits Helper
  const handleSaveEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editType) return;

    try {
      let url = '';
      if (editType === 'department') url = `/api/departments/${editingId}`;
      else if (editType === 'semester') url = `/api/semesters/${editingId}`;
      else if (editType === 'section') url = `/api/sections/${editingId}`;
      else if (editType === 'subject') url = `/api/subjects/${editingId}`;
      else if (editType === 'teacher' || editType === 'student') url = `/api/users/${editingId}`;

      const resp = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editPayload)
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Failed to save changes.');

      // Reload appropriate state
      if (editType === 'department') {
        setDepartments(departments.map(d => d.id === editingId ? data.department : d));
      } else if (editType === 'semester') {
        setSemesters(semesters.map(s => s.id === editingId ? data.semester : s));
      } else if (editType === 'section') {
        setSections(sections.map(s => s.id === editingId ? data.section : s));
      } else if (editType === 'subject') {
        setSubjects(subjects.map(s => s.id === editingId ? data.subject : s));
      } else if (editType === 'teacher') {
        setTeachers(teachers.map(t => t.id === editingId ? data.user : t));
      } else if (editType === 'student') {
        setStudents(students.map(s => s.id === editingId ? data.user : s));
      }

      setEditingId(null);
      setEditType(null);
      flashSuccess('Changes recorded successfully.');
      onRefreshTelemetry();
    } catch (err: any) {
      flashError(err.message);
    }
  };

  // 5. CSV Parsing Logic for Bulk Upload
  const handleLoadCsvTemplate = () => {
    if (bulkType === 'student') {
      setBulkCsvText(
        `name,email,rollNo,phone,department,semester,section,password\n` +
        `Vijay Roy,vijay@college.edu,BCA-2023-45,9876543210,Computer Applications,6th Semester,Section A,vijay123\n` +
        `Nisha Sen,nisha@college.edu,BCA-2023-46,9876543211,Computer Applications,6th Semester,Section B,nisha123\n` +
        `Karan Gupta,karan@college.edu,BCA-2023-47,9876543212,Information Technology,4th Semester,Section A,karan123`
      );
    } else {
      setBulkCsvText(
        `name,email,phone,department,subject,password\n` +
        `Prof. Rajesh Khanna,khanna@college.edu,9888877777,Computer Applications,Mobile App Development,khanna99\n` +
        `Dr. Priyam Sinha,priyam@college.edu,9888877778,Information Technology,Embedded Coding,priyam99`
      );
    }
  };

  const handleProcessBulkCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkImportResult(null);
    if (!bulkCsvText.trim()) {
      flashError('CSV stream container is empty! Please write or paste standard rows.');
      return;
    }

    try {
      // Manual CSV to JSON parsing helper (suitable for MCA-viva explaining!)
      const lines = bulkCsvText.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV must contain a header line and at least one schema row.');
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const rows: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const columns = lines[i].split(',').map(c => c.trim());
        const rowObj: any = {};
        headers.forEach((header, idx) => {
          rowObj[header] = columns[idx] || '';
        });
        rows.push(rowObj);
      }

      const resp = await fetch('/api/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: bulkType, rows })
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Server rejected uploaded package.');

      setBulkImportResult(data);
      setBulkCsvText('');
      flashSuccess(`Batch processed: Imported ${data.importedCount} accounts, Warned/Skipped: ${data.skippedCount}`);
      fetchAllData();
      onRefreshTelemetry();
    } catch (err: any) {
      flashError(err.message);
    }
  };

  // Searching filter computation list
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (s.rollNo && s.rollNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter ? s.department === deptFilter : true;
    const matchesSem = semFilter ? s.semester === semFilter : true;
    return matchesSearch && matchesDept && matchesSem;
  });

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.subject && t.subject.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = deptFilter ? t.department === deptFilter : true;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      
      {/* Alert Messaging System */}
      {actionSuccess && (
        <div className="p-4 rounded-xl leading-relaxed bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 flex items-center gap-2 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl leading-relaxed bg-red-400/15 text-red-300 border border-red-500/25 flex items-center gap-2 animate-fade-in shadow-lg">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-xs font-semibold">{actionError}</span>
        </div>
      )}

      {/* Sub tabs Row */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-950/40 border border-white/5 rounded-xl w-fit">
        <button
          onClick={() => { setActiveSubTab('college'); setSearchTerm(''); }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
            activeSubTab === 'college' ? 'bg-indigo-650 text-white font-bold shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>College Configuration</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('structures'); setSearchTerm(''); }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
            activeSubTab === 'structures' ? 'bg-indigo-650 text-white font-bold shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Master Structures (BCA Master-Tables)</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('teachers'); setSearchTerm(''); }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
            activeSubTab === 'teachers' ? 'bg-indigo-650 text-white font-bold shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Instructors Register</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('students'); setSearchTerm(''); }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
            activeSubTab === 'students' ? 'bg-indigo-650 text-white font-bold shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Scholars Registry</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('bulk'); setSearchTerm(''); }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
            activeSubTab === 'bulk' ? 'bg-indigo-650 text-white font-bold shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Bulk CSV Upload</span>
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 p-4 text-xs font-mono text-indigo-400 bg-white/5 border border-white/5 rounded-xl">
          <Terminal className="w-4 h-4 animate-pulse" />
          <span>Connecting to College Master Database Memory State...</span>
        </div>
      )}

      {/* RENDER MASTER PANELS */}

      {/* 1. COLLEGE CONFIGURATION */}
      {activeSubTab === 'college' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <Building className="w-4 h-4 text-indigo-400" />
                <span>College Organization Record</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Edit the primary identifier information of your institution that manifests on academic attendance sheets.
              </p>
            </div>

            <form onSubmit={handleUpdateCollege} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-455 font-bold">College / Institution Name</label>
                <input
                  type="text"
                  value={editCollegeName}
                  onChange={(e) => setEditCollegeName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs p-2.5 rounded-lg focus:outline-indigo-400"
                  placeholder="e.g. Vidyasagar College"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-455 font-bold">Academic Year / Session Slot</label>
                <input
                  type="text"
                  value={editCollegeYear}
                  onChange={(e) => setEditCollegeYear(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs p-2.5 rounded-lg focus:outline-indigo-400"
                  placeholder="e.g. 2026-25"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-sans font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Record Institution Metadata
              </button>
            </form>
          </div>

          <div className="glass-panel p-6 rounded-xl flex flex-col justify-between border-indigo-500/10">
            <div className="space-y-4">
              <div className="text-[10px] uppercase tracking-widest text-indigo-404 font-mono font-bold">ACTIVE ORGANIZATION CONTEXT</div>
              <h1 className="text-2xl font-bold text-white leading-normal font-sans">
                {college.name || 'Vidyasagar College of IT & Management (VCIM)'}
              </h1>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/10">
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-400">Database ID</div>
                  <div className="text-sm font-bold font-mono text-indigo-300 mt-0.5">{college.id || 'college-1'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-400">Current Session</div>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">{college.academicYear || '2026-25'}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-indigo-505/5 border border-indigo-400/20 text-xs text-indigo-300 flex items-start gap-2.5 leading-relaxed">
              <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>BCA Project Note:</strong> This card reflects real-time global environment metadata configuration mapping directly to student session logs.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. MASTER STRUCTURES (DEPARTMENTS, SEMESTERS, SECTIONS & SUBJECTS) */}
      {activeSubTab === 'structures' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Creation Forms Block */}
          <div className="lg:col-span-1 space-y-6">

            {/* Department block */}
            <div className="glass-panel p-5 rounded-xl space-y-3.5">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-white/10 pb-2">
                <Building className="w-3.5 h-3.5 text-indigo-300" />
                <span>Add Department Division</span>
              </h3>
              <form onSubmit={handleAddDept} className="space-y-3">
                <input
                  type="text"
                  placeholder="Department Name (e.g., Science)"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-550 text-xs p-2 rounded focus:outline-indigo-400"
                />
                <input
                  type="text"
                  placeholder="Reference Code (e.g. BSC)"
                  value={newDeptCode}
                  onChange={(e) => setNewDeptCode(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-550 text-xs p-2 rounded focus:outline-indigo-400 font-mono"
                />
                <button type="submit" className="w-full bg-indigo-650 hover:bg-indigo-600 text-white font-sans text-xs py-2 rounded shrink-0 cursor-pointer">
                  Add Department
                </button>
              </form>
            </div>

            {/* Semester slot block */}
            <div className="glass-panel p-5 rounded-xl space-y-3.5">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-white/10 pb-2">
                <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                <span>Add Semester Slot</span>
              </h3>
              <form onSubmit={handleAddSem} className="space-y-3">
                <input
                  type="text"
                  placeholder="e.g. 5th Semester"
                  value={newSemName}
                  onChange={(e) => setNewSemName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-550 text-xs p-2 rounded focus:outline-indigo-400"
                />
                <button type="submit" className="w-full bg-indigo-650 hover:bg-indigo-600 text-white font-sans text-xs py-2 rounded shrink-0 cursor-pointer">
                  Add Semester Slot
                </button>
              </form>
            </div>

            {/* Section slot block */}
            <div className="glass-panel p-5 rounded-xl space-y-3.5">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-white/10 pb-2">
                <Layers className="w-3.5 h-3.5 text-indigo-300" />
                <span>Add Section Class</span>
              </h3>
              <form onSubmit={handleAddSec} className="space-y-3">
                <input
                  type="text"
                  placeholder="e.g. Section C"
                  value={newSecName}
                  onChange={(e) => setNewSecName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-550 text-xs p-2 rounded focus:outline-indigo-400"
                />
                <button type="submit" className="w-full bg-indigo-650 hover:bg-indigo-600 text-white font-sans text-xs py-2 rounded shrink-0 cursor-pointer">
                  Add Section Class
                </button>
              </form>
            </div>

            {/* Subject allocation block */}
            <div className="glass-panel p-5 rounded-xl space-y-3.5">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-white/10 pb-2">
                <BookOpen className="w-3.5 h-3.5 text-indigo-300" />
                <span>Add Curriculum Subject</span>
              </h3>
              <form onSubmit={handleAddSub} className="space-y-3">
                <input
                  type="text"
                  placeholder="Subject Name (e.g., Computer Graphics)"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-550 text-xs p-2 rounded focus:outline-indigo-400"
                />
                <input
                  type="text"
                  placeholder="Subject Code (e.g. BCA-604)"
                  value={newSubCode}
                  onChange={(e) => setNewSubCode(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-550 text-xs p-2 rounded focus:outline-indigo-400 font-mono"
                />
                <select
                  value={newSubDept}
                  onChange={(e) => setNewSubDept(e.target.value)}
                  className="w-full bg-[#111625] border border-white/10 text-slate-200 text-xs p-2 rounded focus:outline-indigo-400"
                >
                  <option value="" className="text-slate-400">--- Select Department ---</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
                <button type="submit" className="w-full bg-indigo-650 hover:bg-indigo-600 text-white font-sans text-xs py-2 rounded shrink-0 cursor-pointer">
                  Add New Subject
                </button>
              </form>
            </div>

          </div>

          {/* Table Listings (The relational tables) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Departments Listing Table */}
            <div className="glass-panel p-5 rounded-xl space-y-4">
              <div>
                <h3 className="text-xs font-bold text-white">Relational Table: Departments</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Primary academic divisions loaded currently.</p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-white/15">
                <table className="w-full text-left border-collapse text-xs glass-table">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-slate-300">
                      <th className="p-3">ID</th>
                      <th className="p-3">Department Name</th>
                      <th className="p-3">Branch Code</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-slate-300">
                    {departments.map((dep, d_id) => (
                      <tr key={dep.id || d_id} className="hover:bg-white/5">
                        <td className="p-3 text-slate-550 text-[10px]">{dep.id}</td>
                        <td className="p-3">
                          {editingId === dep.id && editType === 'department' ? (
                            <input
                              type="text"
                              value={editPayload.name}
                              onChange={(e) => setEditPayload({ ...editPayload, name: e.target.value })}
                              className="bg-[#1e2538] border border-white/10 text-white text-xs p-1 rounded font-sans"
                            />
                          ) : (
                            <span className="font-sans font-semibold text-white">{dep.name}</span>
                          )}
                        </td>
                        <td className="p-3">
                          {editingId === dep.id && editType === 'department' ? (
                            <input
                              type="text"
                              value={editPayload.code}
                              onChange={(e) => setEditPayload({ ...editPayload, code: e.target.value })}
                              className="bg-[#1e2538] border border-white/10 text-white text-xs p-1 rounded"
                            />
                          ) : (
                            <span className="bg-indigo-500/10 text-indigo-305 text-[10px] px-2 py-0.5 rounded border border-indigo-500/15 font-bold uppercase">{dep.code}</span>
                          )}
                        </td>
                        <td className="p-3 text-right flex justify-end gap-1.5 font-sans">
                          {editingId === dep.id && editType === 'department' ? (
                            <>
                              <button onClick={handleSaveEdits} className="text-emerald-450 hover:underline text-[10px] cursor-pointer">Save</button>
                              <button onClick={() => { setEditingId(null); setEditType(null); }} className="text-slate-400 hover:underline text-[10px] cursor-pointer">Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEditing(dep, 'department')} className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer" title="Edit row">
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDeleteMasterRow(dep.id, 'department')} className="p-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer" title="Delete row">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Semesters & Sections Double list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Semesters Table */}
              <div className="glass-panel p-5 rounded-xl space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-white">Table: Semesters</h3>
                </div>
                <div className="overflow-x-auto rounded-lg border border-white/10">
                  <table className="w-full text-left border-collapse text-xs glass-table">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-slate-350">
                        <th className="p-2">Name</th>
                        <th className="p-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-sans text-slate-350">
                      {semesters.map((sem) => (
                        <tr key={sem.id} className="hover:bg-white/5">
                          <td className="p-2">
                            {editingId === sem.id && editType === 'semester' ? (
                              <input
                                type="text"
                                value={editPayload.name}
                                onChange={(e) => setEditPayload({ ...editPayload, name: e.target.value })}
                                className="bg-[#1e2538] border border-white/10 text-white text-xs p-1 rounded w-full"
                              />
                            ) : (
                              <span className="font-semibold text-white">{sem.name}</span>
                            )}
                          </td>
                          <td className="p-2 text-right flex justify-end gap-2 text-[10px]">
                            {editingId === sem.id && editType === 'semester' ? (
                              <>
                                <button onClick={handleSaveEdits} className="text-emerald-400 cursor-pointer font-bold">Save</button>
                                <button onClick={() => { setEditingId(null); setEditType(null); }} className="text-slate-400 cursor-pointer">Cancel</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEditing(sem, 'semester')} className="text-slate-400 hover:text-white cursor-pointer"><Edit className="w-3 h-3" /></button>
                                <button onClick={() => handleDeleteMasterRow(sem.id, 'semester')} className="text-slate-400 hover:text-red-400 cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sections Table */}
              <div className="glass-panel p-5 rounded-xl space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-white">Table: Sections</h3>
                </div>
                <div className="overflow-x-auto rounded-lg border border-white/10">
                  <table className="w-full text-left border-collapse text-xs glass-table">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-slate-350">
                        <th className="p-2">Name</th>
                        <th className="p-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-sans text-slate-350">
                      {sections.map((sec) => (
                        <tr key={sec.id} className="hover:bg-white/5">
                          <td className="p-2">
                            {editingId === sec.id && editType === 'section' ? (
                              <input
                                type="text"
                                value={editPayload.name}
                                onChange={(e) => setEditPayload({ ...editPayload, name: e.target.value })}
                                className="bg-[#1e2538] border border-white/10 text-white text-xs p-1 rounded w-full"
                              />
                            ) : (
                              <span className="font-semibold text-white">{sec.name}</span>
                            )}
                          </td>
                          <td className="p-2 text-right flex justify-end gap-2 text-[10px]">
                            {editingId === sec.id && editType === 'section' ? (
                              <>
                                <button onClick={handleSaveEdits} className="text-emerald-400 cursor-pointer font-bold">Save</button>
                                <button onClick={() => { setEditingId(null); setEditType(null); }} className="text-slate-400 cursor-pointer">Cancel</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEditing(sec, 'section')} className="text-slate-400 hover:text-white cursor-pointer"><Edit className="w-3 h-3" /></button>
                                <button onClick={() => handleDeleteMasterRow(sec.id, 'section')} className="text-slate-400 hover:text-red-400 cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Subjects Table Listings */}
            <div className="glass-panel p-5 rounded-xl space-y-4">
              <div>
                <h3 className="text-xs font-bold text-white">Relational Table: Subjects</h3>
                <p className="text-[11px] text-slate-405 mt-0.5">Primary course papers assigned to branch curricula.</p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-white/10">
                <table className="w-full text-left border-collapse text-xs glass-table">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-slate-350">
                      <th className="p-3">Code</th>
                      <th className="p-3">Subject Title</th>
                      <th className="p-3">Branch Department</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans text-slate-350">
                    {subjects.map((sub) => (
                      <tr key={sub.id} className="hover:bg-white/5">
                        <td className="p-3 font-mono text-indigo-305 font-bold">{sub.code}</td>
                        <td className="p-3">
                          {editingId === sub.id && editType === 'subject' ? (
                            <input
                              type="text"
                              value={editPayload.name}
                              onChange={(e) => setEditPayload({ ...editPayload, name: e.target.value })}
                              className="bg-[#1e2538] border border-white/10 text-white text-xs p-1 rounded font-sans"
                            />
                          ) : (
                            <span className="font-semibold text-white">{sub.name}</span>
                          )}
                        </td>
                        <td className="p-3">
                          {editingId === sub.id && editType === 'subject' ? (
                            <select
                              value={editPayload.departmentName}
                              onChange={(e) => setEditPayload({ ...editPayload, departmentName: e.target.value })}
                              className="bg-[#1e2538] border border-white/10 text-slate-200 text-xs p-1 rounded"
                            >
                              {departments.map(d => (
                                <option key={d.id} value={d.name}>{d.name}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-slate-400">{sub.departmentName}</span>
                          )}
                        </td>
                        <td className="p-3 text-right flex justify-end gap-1.5 font-sans">
                          {editingId === sub.id && editType === 'subject' ? (
                            <>
                              <button onClick={handleSaveEdits} className="text-emerald-400 hover:underline text-[10px] cursor-pointer">Save</button>
                              <button onClick={() => { setEditingId(null); setEditType(null); }} className="text-slate-400 hover:underline text-[10px] cursor-pointer">Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEditing(sub, 'subject')} className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer" title="Edit row">
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDeleteMasterRow(sub.id, 'subject')} className="p-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer" title="Delete row">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 3. INSTRUCTORS REGISTER (TEACHERS RECORD PORTAL) */}
      {activeSubTab === 'teachers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Add Teacher Manual Form Block */}
          <div className="lg:col-span-1 glass-panel p-5 rounded-xl space-y-4 h-fit">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-white/10 pb-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>Enroll Teacher Profile</span>
            </h3>

            <form onSubmit={handleAddTeacher} className="space-y-3 font-sans">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-semibold">Legal Name</label>
                <input
                  type="text"
                  placeholder="e.g. Prof. Dinesh Sen"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs p-2 rounded focus:outline-indigo-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-semibold">Email Coordinates</label>
                <input
                  type="email"
                  placeholder="e.g. dinesh@college.edu"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs p-2 rounded focus:outline-indigo-400 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-semibold">Phone Contact</label>
                <input
                  type="text"
                  placeholder="e.g. +91 99999 88888"
                  value={teacherPhone}
                  onChange={(e) => setTeacherPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs p-2 rounded focus:outline-indigo-400 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-semibold">Department Division</label>
                <select
                  value={teacherDept}
                  onChange={(e) => setTeacherDept(e.target.value)}
                  className="w-full bg-[#111625] border border-white/10 text-slate-250 text-xs p-2 rounded"
                >
                  <option value="">-- Choose Division --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-semibold">Specialized Subject Paper</label>
                <input
                  type="text"
                  placeholder="e.g. Embedded Devices"
                  value={teacherSubject}
                  onChange={(e) => setTeacherSubject(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs p-2 rounded focus:outline-indigo-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-semibold">Secure Login Password</label>
                <input
                  type="password"
                  placeholder="Leave empty for fallback: VCIM@2026"
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs p-2 rounded focus:outline-indigo-400"
                />
              </div>

              <button type="submit" className="w-full mt-2 bg-indigo-650 hover:bg-indigo-600 text-white font-sans text-xs py-2 rounded font-bold uppercase shrink-0 cursor-pointer">
                Enroll Instructor Row
              </button>
            </form>
          </div>

          {/* Directory Panel & Filtering */}
          <div className="lg:col-span-2 glass-panel p-5 rounded-xl space-y-4">
            
            {/* Search Filter Head */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <h3 className="text-sm font-bold text-white">Instructors Registry Table</h3>
                <p className="text-xs text-slate-400">Total: {filteredTeachers.length} profiles</p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative shrink w-full sm:w-48">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search query..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-550 text-xs pl-8 pr-2.5 py-2 rounded focus:outline-indigo-400 font-medium"
                  />
                </div>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="bg-slate-950/40 border border-white/10 text-slate-300 text-xs px-2 rounded focus:outline-indigo-400"
                >
                  <option value="" className="bg-slate-900 text-slate-400">All Depts</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.name} className="bg-slate-900 text-white">{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* List Table */}
            <div className="overflow-x-auto rounded-lg border border-white/10 max-h-[480px]">
              <table className="w-full text-left border-collapse text-xs glass-table">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-slate-300">
                    <th className="p-3">Name & Contacts</th>
                    <th className="p-3">Department Division</th>
                    <th className="p-3">Assigned Subject Paper</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {filteredTeachers.map(t => (
                    <tr key={t.id} className="hover:bg-white/5">
                      <td className="p-3">
                        {editingId === t.id && editType === 'teacher' ? (
                          <input
                            type="text"
                            value={editPayload.name}
                            onChange={(e) => setEditPayload({ ...editPayload, name: e.target.value })}
                            className="bg-[#1e2538] border border-white/10 text-white text-xs p-1.5 rounded w-full mb-1 font-sans"
                          />
                        ) : (
                          <div className="font-semibold text-white">{t.name}</div>
                        )}
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 font-mono">
                          <Mail className="w-3 h-3 text-slate-500" />
                          {editingId === t.id && editType === 'teacher' ? (
                            <input
                              type="text"
                              value={editPayload.email}
                              onChange={(e) => setEditPayload({ ...editPayload, email: e.target.value })}
                              className="bg-[#1e2538] border border-white/10 text-white text-xs p-1 rounded font-mono"
                            />
                          ) : (
                            <span>{t.email}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 font-mono">
                          <Phone className="w-3 h-3 text-slate-500" />
                          {editingId === t.id && editType === 'teacher' ? (
                            <input
                              type="text"
                              value={editPayload.phone || ''}
                              onChange={(e) => setEditPayload({ ...editPayload, phone: e.target.value })}
                              className="bg-[#1e2538] border border-white/10 text-white text-xs p-1 rounded font-mono"
                            />
                          ) : (
                            <span>{t.phone || 'N/A'}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-xs">
                        {editingId === t.id && editType === 'teacher' ? (
                          <select
                            value={editPayload.department}
                            onChange={(e) => setEditPayload({ ...editPayload, department: e.target.value })}
                            className="bg-[#1e2538] border border-white/10 text-slate-250 text-xs p-1 rounded"
                          >
                            {departments.map(d => (
                              <option key={d.id} value={d.name}>{d.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-slate-200">{t.department}</span>
                        )}
                      </td>
                      <td className="p-3 text-xs font-semibold text-indigo-305">
                        {editingId === t.id && editType === 'teacher' ? (
                          <input
                            type="text"
                            value={editPayload.subject || ''}
                            onChange={(e) => setEditPayload({ ...editPayload, subject: e.target.value })}
                            className="bg-[#1e2538] border border-white/10 text-white text-xs p-1 rounded"
                          />
                        ) : (
                          <span>{t.subject || 'N/A'}</span>
                        )}
                      </td>
                      <td className="p-3 text-right flex justify-end gap-1.5 font-sans pt-6">
                        {editingId === t.id && editType === 'teacher' ? (
                          <div className="flex flex-col gap-1 items-end">
                            <button onClick={handleSaveEdits} className="text-emerald-400 hover:underline text-[10px] cursor-pointer">Save</button>
                            <button onClick={() => { setEditingId(null); setEditType(null); }} className="text-slate-400 hover:underline text-[10px] cursor-pointer">Cancel</button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => startEditing(t, 'teacher')} className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer" title="Edit Profile">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteMasterRow(t.id, 'teacher')} className="p-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer" title="Delete Profile">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 4. SCHOLARS REGISTRY (STUDENTS RECORD PORTAL) */}
      {activeSubTab === 'students' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Scholars Add Form */}
          <div className="lg:col-span-1 glass-panel p-5 rounded-xl space-y-4 h-fit">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-white/10 pb-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>Enroll Student row</span>
            </h3>

            <form onSubmit={handleAddStudent} className="space-y-3 font-sans">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-semibold">Scholars Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Saxena"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs p-2 rounded focus:outline-indigo-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-semibold">Unique Roll Number</label>
                <input
                  type="text"
                  placeholder="e.g. BCA-2023-38"
                  value={studentRoll}
                  onChange={(e) => setStudentRoll(e.target.value.toUpperCase())}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs p-2 rounded focus:outline-indigo-400 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-semibold">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. ramesh@college.edu"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs p-2 rounded focus:outline-indigo-400 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-semibold">Contact Phone</label>
                <input
                  type="text"
                  placeholder="e.g. +91 99999 77777"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs p-2 rounded focus:outline-indigo-400 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-semibold">Department Branch</label>
                <select
                  value={studentDept}
                  onChange={(e) => setStudentDept(e.target.value)}
                  className="w-full bg-[#111625] border border-white/10 text-slate-250 text-xs p-2 rounded"
                >
                  <option value="">-- Choose Branch --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-semibold">Semester</label>
                  <select
                    value={studentSem}
                    onChange={(e) => setStudentSem(e.target.value)}
                    className="w-full bg-[#111625] border border-white/10 text-slate-250 text-xs p-2 rounded"
                  >
                    <option value="">-- Sem --</option>
                    {semesters.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-semibold">Section</label>
                  <select
                    value={studentSec}
                    onChange={(e) => setStudentSec(e.target.value)}
                    className="w-full bg-[#111625] border border-white/10 text-slate-250 text-xs p-2 rounded"
                  >
                    <option value="">-- Sec --</option>
                    {sections.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-semibold">Credentials Password</label>
                <input
                  type="password"
                  placeholder="Fallback: VCIM@2026"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs p-2 rounded focus:outline-indigo-400"
                />
              </div>

              <button type="submit" className="w-full mt-2 bg-indigo-650 hover:bg-indigo-600 text-white font-sans text-xs py-2 rounded font-bold uppercase shrink-0 cursor-pointer">
                Enroll Student Scholar
              </button>
            </form>
          </div>

          {/* Directory Listings with filter & search */}
          <div className="lg:col-span-3 glass-panel p-5 rounded-xl space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div>
                <h3 className="text-sm font-bold text-white">Scholars Master Record Registry</h3>
                <p className="text-xs text-slate-400">Total: {filteredStudents.length} active scholars</p>
              </div>

              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <div className="relative shrink w-full md:w-44">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search query..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-550 text-xs pl-8 pr-2 py-2 rounded focus:outline-indigo-400 font-medium"
                  />
                </div>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="bg-slate-950/40 border border-white/10 text-slate-300 text-xs px-2 rounded focus:outline-indigo-400"
                >
                  <option value="" className="bg-slate-900 text-slate-405">All Depts</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.name} className="bg-slate-900 text-white">{d.name}</option>
                  ))}
                </select>

                <select
                  value={semFilter}
                  onChange={(e) => setSemFilter(e.target.value)}
                  className="bg-slate-950/40 border border-white/10 text-slate-300 text-xs px-2 rounded focus:outline-indigo-400"
                >
                  <option value="" className="bg-slate-900 text-slate-405">All Sems</option>
                  {semesters.map(s => (
                    <option key={s.id} value={s.name} className="bg-slate-900 text-white">{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* List block */}
            <div className="overflow-x-auto rounded-lg border border-white/10 max-h-[500px]">
              <table className="w-full text-left border-collapse text-xs glass-table">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-slate-300">
                    <th className="p-3">Roll No & Name</th>
                    <th className="p-3">Email & Phone</th>
                    <th className="p-3">Department Branch</th>
                    <th className="p-3">Level Semester</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {filteredStudents.map(s => (
                    <tr key={s.id} className="hover:bg-white/5">
                      <td className="p-3">
                        {editingId === s.id && editType === 'student' ? (
                          <>
                            <input
                              type="text"
                              value={editPayload.rollNo}
                              onChange={(e) => setEditPayload({ ...editPayload, rollNo: e.target.value })}
                              className="bg-[#1e2538] border border-[#d2dffc]/15 text-indigo-300 font-mono font-bold text-xs p-1 rounded mb-1"
                            />
                            <input
                              type="text"
                              value={editPayload.name}
                              onChange={(e) => setEditPayload({ ...editPayload, name: e.target.value })}
                              className="bg-[#1e2538] border border-white/10 text-white text-xs p-1.5 rounded w-full font-sans"
                            />
                          </>
                        ) : (
                          <>
                            <span className="font-mono font-bold text-indigo-305 text-[10px] bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/15 mb-1.5 inline-block">
                              {s.rollNo || 'UNASSIGNED'}
                            </span>
                            <div className="font-bold text-white text-xs">{s.name}</div>
                          </>
                        )}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-300 space-y-1">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          {editingId === s.id && editType === 'student' ? (
                            <input
                              type="text"
                              value={editPayload.email}
                              onChange={(e) => setEditPayload({ ...editPayload, email: e.target.value })}
                              className="bg-[#1e2538] border border-white/10 text-white text-xs p-1 rounded text-[11px]"
                            />
                          ) : (
                            <span>{s.email}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          {editingId === s.id && editType === 'student' ? (
                            <input
                              type="text"
                              value={editPayload.phone || ''}
                              onChange={(e) => setEditPayload({ ...editPayload, phone: e.target.value })}
                              className="bg-[#1e2538] border border-white/10 text-white text-xs p-1 rounded text-[11px]"
                            />
                          ) : (
                            <span>{s.phone || 'N/A'}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-xs">
                        {editingId === s.id && editType === 'student' ? (
                          <select
                            value={editPayload.department}
                            onChange={(e) => setEditPayload({ ...editPayload, department: e.target.value })}
                            className="bg-[#1e2538] border border-white/10 text-slate-200 text-xs p-1 rounded"
                          >
                            {departments.map(d => (
                              <option key={d.id} value={d.name}>{d.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-slate-205">{s.department || 'N/A'}</span>
                        )}
                      </td>
                      <td className="p-3 text-xs">
                        {editingId === s.id && editType === 'student' ? (
                          <div className="space-y-1">
                            <select
                              value={editPayload.semester}
                              onChange={(e) => setEditPayload({ ...editPayload, semester: e.target.value })}
                              className="bg-[#1e2538] border border-white/10 text-slate-200 text-xs p-1 rounded"
                            >
                              {semesters.map(se => (
                                <option key={se.id} value={se.name}>{se.name}</option>
                              ))}
                            </select>
                            <select
                              value={editPayload.section || ''}
                              onChange={(e) => setEditPayload({ ...editPayload, section: e.target.value })}
                              className="bg-[#1e2538] border border-white/10 text-slate-200 text-xs p-1 rounded block"
                            >
                              <option value="">Section</option>
                              {sections.map(sec => (
                                <option key={sec.id} value={sec.name}>{sec.name}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="text-white text-xs leading-normal">
                            <div>{s.semester || 'N/A'}</div>
                            {s.section && <div className="text-[10px] text-slate-400 font-mono mt-0.5">{s.section}</div>}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-right flex justify-end gap-1.5 font-sans pt-6">
                        {editingId === s.id && editType === 'student' ? (
                          <div className="flex flex-col gap-1 items-end">
                            <button onClick={handleSaveEdits} className="text-emerald-450 hover:underline text-[10px] cursor-pointer">Save</button>
                            <button onClick={() => { setEditingId(null); setEditType(null); }} className="text-slate-400 hover:underline text-[10px] cursor-pointer" >Cancel</button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => startEditing(s, 'student')} className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer" title="Edit Student">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteMasterRow(s.id, 'student')} className="p-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer" title="Delete Student">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 5. BULK CSV UPLOAD PANEL */}
      {activeSubTab === 'bulk' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-indigo-400" />
                <span>Upload CSV Bulk Entry Sheet</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Paste standardized raw comma-delimited Excel/CSV listings of scholars or professors. Automatic field validation runs during parsing.
              </p>
            </div>

            <form onSubmit={handleProcessBulkCsv} className="space-y-4">
              <div className="flex items-center gap-6 p-4 rounded-lg bg-white/5 border border-white/5 w-fit">
                <div className="text-xs font-semibold text-slate-350 shrink-0">Import Row Target:</div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs text-white cursor-pointer font-medium">
                    <input
                      type="radio"
                      checked={bulkType === 'student'}
                      onChange={() => { setBulkType('student'); setBulkImportResult(null); }}
                      className="accent-indigo-400"
                    />
                    <span>Scholars (Students)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-white cursor-pointer font-medium">
                    <input
                      type="radio"
                      checked={bulkType === 'teacher'}
                      onChange={() => { setBulkType('teacher'); setBulkImportResult(null); }}
                      className="accent-indigo-400"
                    />
                    <span>Instructors (Teachers)</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Comma Delimited Raw Content</label>
                  <button
                    type="button"
                    onClick={handleLoadCsvTemplate}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Load Viva Sample CSV Template</span>
                  </button>
                </div>
                
                <textarea
                  value={bulkCsvText}
                  onChange={(e) => setBulkCsvText(e.target.value)}
                  placeholder={`name,email,...\npaste your CSV file here...`}
                  rows={8}
                  className="w-full bg-slate-950/60 border border-white/10 text-slate-200 placeholder-slate-600 font-mono text-xs p-3.5 rounded-lg focus:outline-indigo-400 focus:border-indigo-400"
                />
              </div>

              <button
                type="submit"
                className="px-4.5 py-2 bg-indigo-650 hover:bg-indigo-600 border border-indigo-505/20 text-white font-sans font-semibold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 transition-all text-center"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Compile & Bulk Import</span>
              </button>
            </form>
          </div>

          {/* Import Result Block */}
          {bulkImportResult && (
            <div className="glass-panel p-6 rounded-xl space-y-4 animate-fade-in border-indigo-500/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Import Execution Output Report</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/15">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Successfully Imported</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">{bulkImportResult.importedCount} rows</div>
                </div>

                <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/15">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Skipped / Blocked Entries</div>
                  <div className="text-2xl font-bold font-mono text-orange-400 mt-0.5">{bulkImportResult.skippedCount} rows</div>
                </div>

                <div className="p-4 rounded-lg bg-slate-900/40 border border-white/10">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Import Category</div>
                  <div className="text-base font-bold font-sans text-indigo-300 mt-1.5 capitalize">{bulkType} Account Block</div>
                </div>
              </div>

              {bulkImportResult.skippedDetails?.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-orange-300">Detailed Skipped/Error Log:</div>
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-white/10 p-3 bg-slate-950/25 space-y-1.5">
                    {bulkImportResult.skippedDetails.map((det: any, i: number) => (
                      <div key={i} className="text-[11px] font-mono leading-normal text-slate-350 flex items-start gap-1.5">
                        <span className="text-red-400 shrink-0 select-none">●</span>
                        <span>[Row #{det.rowIdx}] Skipped: <strong className="text-orange-300">{det.reason}</strong></span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
