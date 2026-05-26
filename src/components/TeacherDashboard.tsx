/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, UserCheck, QrCode, Camera, FileSpreadsheet, FileText, Check, AlertCircle, Save, Calendar, Sparkles, CheckSquare, Clock } from 'lucide-react';
import { User, Class, AttendanceRecord, AttendanceStatus } from '../types';

interface TeacherDashboardProps {
  currentUser: User;
  onLogout: () => void;
}

export default function TeacherDashboard({ currentUser, onLogout }: TeacherDashboardProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<User[]>([]);
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'manual' | 'qr' | 'face' | 'reports'>('manual');
  const [saveMsg, setSaveMsg] = useState('');

  // QR Session Variables
  const [qrRunning, setQrRunning] = useState(false);
  const [qrTimer, setQrTimer] = useState(60);
  const [qrNotifications, setQrNotifications] = useState<string[]>([]);
  const qrIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Face Recognition Variables
  const [faceRunning, setFaceRunning] = useState(false);
  const [faceLog, setFaceLog] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reports
  const [reportDateList, setReportDateList] = useState<string[]>([]);
  const [reportRecords, setReportRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const resp = await fetch(`/api/classes?teacherId=${currentUser.id}`);
        const data = await resp.json();
        setClasses(data.classes || []);
        if (data.classes && data.classes.length > 0) {
          setSelectedClassId(data.classes[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchClasses();
  }, [currentUser]);

  // Load students when selectedClassId shifts
  useEffect(() => {
    if (!selectedClassId) return;

    const fetchStudentsAndRecords = async () => {
      try {
        // Find enrolled kids
        const kidsResp = await fetch(`/api/classes/${selectedClassId}/students`);
        const kidsData = await kidsResp.json();
        setStudents(kidsData.students || []);

        // Find existing attendance records for this class & date
        const recResp = await fetch(`/api/records?classId=${selectedClassId}&date=${selectedDate}`);
        const recData = await recResp.json();
        
        // Map student records to temporary editable states
        const initialStates: Record<string, AttendanceStatus> = {};
        
        // Match existing or default to present
        kidsData.students.forEach((s: User) => {
          const matched = (recData.records || []).find((r: AttendanceRecord) => r.studentId === s.id);
          initialStates[s.id] = matched ? matched.status : 'present';
        });

        setRecords(initialStates);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStudentsAndRecords();
  }, [selectedClassId, selectedDate]);

  // Handle manual attendance submission
  const handleSaveAttendance = async () => {
    setSaveMsg('');
    try {
      const promises = Object.entries(records).map(([sId, status]) => {
        return fetch('/api/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classId: selectedClassId,
            studentId: sId,
            date: selectedDate,
            status,
            markedMethod: 'manual'
          })
        });
      });

      await Promise.all(promises);
      setSaveMsg('Attendance register successfully compiled and saved to local state.');
      setTimeout(() => setSaveMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setSaveMsg('Failed to broadcast record logs.');
    }
  };

  const handleToggleAll = (status: AttendanceStatus) => {
    const updated = { ...records };
    students.forEach(s => {
      updated[s.id] = status;
    });
    setRecords(updated);
  };

  // QR CODE ATTENDANCE LOG SIMULATION
  const startQrSession = () => {
    setQrRunning(true);
    setQrTimer(45);
    setQrNotifications(['Dynamic classroom QR token generated. Awaiting student check-ins.']);
    
    // Auto scanning simulator
    let scanCount = 0;
    qrIntervalRef.current = setInterval(() => {
      setQrTimer(prev => {
        if (prev <= 1) {
          stopQrSession();
          return 0;
        }
        return prev - 1;
      });

      // Simulate structured scans by students on random intervals
      scanCount++;
      if (scanCount % 4 === 1 && students.length > 0) {
        const randId = Math.floor(Math.random() * students.length);
        const kid = students[randId];
        
        // Set state to present
        setRecords(prev => ({ ...prev, [kid.id]: 'present' }));
        
        // Log notification log
        setQrNotifications(prev => [
          `[${new Date().toLocaleTimeString()}] ${kid.name} (${kid.rollNo}) scanned. Matched OTP. Marked PRESENT`,
          ...prev
        ]);

        // Post record log to server
        fetch('/api/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classId: selectedClassId,
            studentId: kid.id,
            date: selectedDate,
            status: 'present',
            markedMethod: 'qr'
          })
        });
      }
    }, 1000);
  };

  const stopQrSession = () => {
    if (qrIntervalRef.current) {
      clearInterval(qrIntervalRef.current);
    }
    setQrRunning(false);
  };

  // CAMERA FACE RECOGNITION SIMULATION
  const startFaceSession = async () => {
    setFaceRunning(true);
    setFaceLog(['Camera interface initialized. Deploying facial tracking matrix...']);
    
    // Request webcam feed from iframe context
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error(e));
      }
    } catch (err) {
      console.warn('Webcam hardware block or not available inside iframe. Displaying video scanner placeholder.', err);
    }

    // Facial recognition ticks simulator (Matches registered students every 3 seconds)
    let count = 0;
    faceIntervalRef.current = setInterval(() => {
      count++;
      if (count <= students.length) {
        const kid = students[count - 1];
        const accuracy = (95 + Math.random() * 4.9).toFixed(2);
        
        // If face is registered, mark PRESENT. If not registered, skip!
        if (kid.faceRegistered) {
          setRecords(prev => ({ ...prev, [kid.id]: 'present' }));
          setFaceLog(prev => [
            `[MATCHED] ${kid.name} matched biometric code (${accuracy}% match). Registered as PRESENT`,
            ...prev
          ]);

          fetch('/api/records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              classId: selectedClassId,
              studentId: kid.id,
              date: selectedDate,
              status: 'present',
              markedMethod: 'face'
            })
          });
        } else {
          setFaceLog(prev => [
            `[MISSING BIOMETRICS] ${kid.name} detected but face registry was never finalized. Skipping...`,
            ...prev
          ]);
        }
      } else {
        setFaceLog(prev => ['Face scan cycle finalized. Overall roster verified.', ...prev]);
        stopFaceSession();
      }
    }, 3000);
  };

  const stopFaceSession = () => {
    if (faceIntervalRef.current) {
      clearInterval(faceIntervalRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setFaceRunning(false);
  };

  // Compile monthly Reports
  const fetchMonthlyReport = async () => {
    try {
      const resp = await fetch(`/api/records?classId=${selectedClassId}`);
      const data = await resp.json();
      setReportRecords(data.records || []);
      
      // Pull list of sorted dates
      const dates = Array.from(new Set((data.records || []).map((r: AttendanceRecord) => r.date))) as string[];
      dates.sort();
      setReportDateList(dates);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports' && selectedClassId) {
      fetchMonthlyReport();
    }
  }, [activeTab, selectedClassId]);

  // Clean cleanup on shift
  useEffect(() => {
    return () => {
      stopQrSession();
      stopFaceSession();
    };
  }, []);

  // Standard printing PDF template trigger
  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (reportDateList.length === 0) return;
    
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Student Name,Roll No,' + reportDateList.join(',') + '\n';
    
    students.forEach(s => {
      let row = `${s.name},${s.rollNo || ''}`;
      reportDateList.forEach(date => {
        const rec = reportRecords.find(r => r.studentId === s.id && r.date === date);
        row += `,${rec ? rec.status.toUpperCase() : 'N/A'}`;
      });
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Report_${selectedClassId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="teacher-dashboard-container" className="space-y-6">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 glass-panel rounded-xl text-white gap-4 bg-slate-900/30 border-white/15">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded-lg">
            <BookOpen className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">Class Instructor Portal</div>
            <h1 className="text-lg font-bold font-sans text-white">{currentUser.name}</h1>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-500/15 border border-red-500/25 hover:bg-red-500/25 font-sans font-semibold text-red-350 text-xs rounded-lg cursor-pointer transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Select Course Program and Date selection */}
      <div className="p-4 glass-panel rounded-xl shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Active Class Lectures</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-xs py-2 px-3 rounded-lg focus:outline-indigo-400 font-medium text-slate-200"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">{c.code}: {c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Lecture Date Slot</span>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-xs py-2 pl-8 pr-3 rounded-lg focus:outline-indigo-400 font-mono text-slate-200"
              />
              <Calendar className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Action Toggle navigation menu inside Teacher portal */}
        <div className="flex bg-white/5 border border-white/5 p-1 rounded-lg self-start sm:self-auto gap-1">
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-3 py-1.5 text-xs font-semibold rounded cursor-pointer transition-all ${
              activeTab === 'manual' ? 'bg-white/10 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Manual Register
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-3 py-1.5 text-xs font-semibold rounded cursor-pointer transition-all ${
              activeTab === 'qr' ? 'bg-white/10 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            QR Code
          </button>
          <button
            onClick={() => setActiveTab('face')}
            className={`px-3 py-1.5 text-xs font-semibold rounded cursor-pointer transition-all ${
              activeTab === 'face' ? 'bg-white/10 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Face Recognition
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 text-xs font-semibold rounded cursor-pointer transition-all ${
              activeTab === 'reports' ? 'bg-white/10 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Matric Reports
          </button>
        </div>
      </div>

      {/* MANUAL REGISTER VIEW */}
      {activeTab === 'manual' && (
        <div id="manual-att-tab" className="glass-panel rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/10 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>Manual Attendance Sheet</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Toggle student badges for present, late, or absent marks manually.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">Set All:</span>
              <button
                onClick={() => handleToggleAll('present')}
                className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-sans font-semibold text-[11px] rounded transition-colors cursor-pointer"
              >
                Present
              </button>
              <button
                onClick={() => handleToggleAll('absent')}
                className="px-2.5 py-1 bg-red-500/15 hover:bg-red-500/25 text-red-300 font-sans font-semibold text-[11px] rounded transition-colors cursor-pointer"
              >
                Absent
              </button>
            </div>
          </div>

          {saveMsg && (
            <div className="p-3 bg-emerald-500/10 text-emerald-200 border-l-4 border-emerald-500 border-white/5 text-xs rounded flex gap-2 items-center">
              <Check className="w-4 h-4" />
              <span>{saveMsg}</span>
            </div>
          )}

          {/* Student manual listing column */}
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full text-left border-collapse text-xs glass-table">
              <thead>
                <tr className="border-b border-white/10 text-slate-300 bg-white/5">
                  <th className="p-3 font-semibold uppercase tracking-wider text-slate-300">Roll No</th>
                  <th className="p-3 font-semibold uppercase tracking-wider text-slate-300">Student Scholar Name</th>
                  <th className="p-3 font-semibold uppercase tracking-wider text-slate-300">Biometric Status</th>
                  <th className="p-3 font-semibold uppercase tracking-wider text-center text-slate-300">Status Toggle Badges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-white/5">
                    <td className="p-3 font-mono text-indigo-300 font-bold">{s.rollNo}</td>
                    <td className="p-3 font-medium text-white">{s.name}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[9px] font-mono tracking-wider font-semibold uppercase rounded ${
                        s.faceRegistered ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' : 'bg-white/5 text-slate-400'
                      }`}>
                        {s.faceRegistered ? '✓ Face Registered' : 'Not setup'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center items-center gap-1.5">
                        <button
                          onClick={() => setRecords(prev => ({ ...prev, [s.id]: 'present' }))}
                          className={`w-16 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                            records[s.id] === 'present'
                              ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs'
                              : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => setRecords(prev => ({ ...prev, [s.id]: 'late' }))}
                          className={`w-16 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                            records[s.id] === 'late'
                              ? 'bg-amber-550 border-amber-550 text-white shadow-xs'
                              : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          onClick={() => setRecords(prev => ({ ...prev, [s.id]: 'absent' }))}
                          className={`w-16 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                            records[s.id] === 'absent'
                              ? 'bg-red-650 border-red-650 text-white shadow-xs'
                              : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-end">
            <button
              id="save-manual-att-btn"
              onClick={handleSaveAttendance}
              className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 font-sans font-semibold text-white text-xs rounded-lg flex items-center gap-2 cursor-pointer transition-shadow shadow-xs hover:shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Submit Attendance Sheet</span>
            </button>
          </div>
        </div>
      )}

      {/* QR ATTENDANCE LOG SIMULATOR */}
      {activeTab === 'qr' && (
        <div id="qr-att-tab" className="grid grid-cols-1 lg:grid-cols-12 gap-6 glass-panel rounded-xl shadow-sm p-6">
          
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 border border-white/5 rounded-xl space-y-4 bg-white/5">
            <div className="text-center">
              <h3 className="text-sm font-bold text-white">Automatic QR Desk</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Launches high-frequency rotational student QR scanning.</p>
            </div>

            {/* QR Code Container Mock */}
            <div className="bg-white p-4 rounded-xl border border-slate-250 shadow-sm relative overflow-hidden group">
              <div className={`absolute inset-0 bg-indigo-50/80 flex flex-col items-center justify-center transition-opacity duration-300 ${qrRunning ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <QrCode className="w-12 h-12 text-slate-400 stroke-[1.5]" />
                <span className="text-[10px] text-slate-500 mt-2 font-mono">Session Closed</span>
              </div>

              {/* Real SVG or detailed Box QR Simulator with scanning neon bar */}
              <div className="w-44 h-44 relative flex items-center justify-center bg-slate-50 rounded border border-slate-150">
                <div className="absolute top-0 w-full h-0.5 bg-indigo-600 animate-[bounce_2s_infinite] opacity-80" />
                <QrCode className="w-36 h-36 text-indigo-950" />
              </div>
            </div>

            {qrRunning ? (
              <div className="w-full space-y-2 text-center">
                <div className="flex justify-center items-center gap-1.5 text-xs text-indigo-300 font-semibold font-mono">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Cycle Timer: {qrTimer}s</span>
                </div>
                <button
                  onClick={stopQrSession}
                  className="w-full py-2 bg-red-650 hover:bg-red-600 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Terminate QR Session
                </button>
              </div>
            ) : (
              <button
                onClick={startQrSession}
                className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Inaugurate QR Session
              </button>
            )}
          </div>

          <div className="lg:col-span-8 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Check-in Scan Streams</h3>
              <p className="text-xs text-slate-400 mt-0.5">Live reporting line of OTP matching and roll entries.</p>
            </div>

            <div className="h-64 bg-slate-950/75 border border-white/5 rounded-lg p-4 font-mono text-[11px] text-indigo-350 overflow-y-auto space-y-1">
              {qrNotifications.length === 0 ? (
                <div className="text-slate-500 text-center py-16">
                  &lt; System passive. Open session to process check-ins &gt;
                </div>
              ) : (
                qrNotifications.map((n, idx) => (
                  <div key={idx} className="leading-relaxed border-b border-white/5 pb-1 font-light">
                    {n}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* FACE RECOGNITION ATTENDANCE SIMULATOR */}
      {activeTab === 'face' && (
        <div id="face-att-tab" className="grid grid-cols-1 lg:grid-cols-12 gap-6 glass-panel rounded-xl shadow-sm p-6">
          
          <div className="lg:col-span-6 flex flex-col justify-between border border-white/10 rounded-xl bg-slate-950/40 text-white relative h-[320px] overflow-hidden">
            
            {/* Live Camera Feed canvas or simulation container */}
            <div className="absolute inset-0 z-0 flex items-center justify-center">
              {faceRunning ? (
                <>
                  <video ref={videoRef} className="w-full h-full object-cover opacity-60" playsInline muted />
                  {/* Neon animated scanners overlaying webcam */}
                  <div className="absolute inset-x-6 inset-y-12 border-2 border-indigo-400/50 rounded-lg animate-pulse flex items-center justify-center">
                    <div className="w-full h-0.5 bg-emerald-500/80 absolute top-1/2 left-0 animate-[bounce_3s_infinite]" />
                    <div className="text-[10px] font-mono tracking-widest uppercase bg-indigo-900/80 px-2 py-1 rounded text-indigo-300">
                      Facial Landmarks Active
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-slate-500 text-center space-y-2 p-6 animate-pulse">
                  <Camera className="w-12 h-12 mx-auto stroke-[1.5]" />
                  <p className="text-xs font-mono">Camera Blocked or Standby Mode</p>
                </div>
              )}
            </div>

            <div className="z-10 p-3 bg-slate-950/80 border-b border-white/5 flex justify-between items-center">
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1.5 font-bold">
                <span className={`w-2 h-2 rounded-full ${faceRunning ? 'bg-red-500 animate-ping' : 'bg-slate-500'}`} />
                {faceRunning ? 'Feed: LIVE SCANNER' : 'Cam Coordinate: Standby'}
              </span>
            </div>

            <div className="z-10 p-4 bg-slate-950/80 border-t border-white/5">
              {faceRunning ? (
                <button
                  onClick={stopFaceSession}
                  className="w-full py-2 bg-red-650 hover:bg-red-600 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Disconnect Lens Feed
                </button>
              ) : (
                <button
                  onClick={startFaceSession}
                  className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Activate Biometric Scan Cycle
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Feature-match Biometric Roll</h3>
              <p className="text-xs text-slate-400 mt-0.5">Neural comparison matching landmarks on frame logs.</p>
            </div>

            <div className="h-64 bg-slate-950/75 border border-white/5 rounded-lg p-4 font-mono text-[11px] text-emerald-400 overflow-y-auto space-y-1.5 max-h-[250px]">
              {faceLog.length === 0 ? (
                <div className="text-slate-505 text-center py-16">
                  &lt; Biometric lens inactive. Initiate scan sequence to trigger registry matches &gt;
                </div>
              ) : (
                faceLog.map((n, idx) => (
                  <div key={idx} className="leading-relaxed border-b border-white/5 pb-1 font-light flex items-start gap-1">
                    <span className="text-emerald-500 shrink-0">❖</span>
                    <span>{n}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* MATRIX REPORTS VIEW */}
      {activeTab === 'reports' && (
        <div id="reports-matrix-tab" className="glass-panel rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-sm font-bold text-white">Term-End Attendance Grid</h2>
              <p className="text-xs text-slate-400 mt-0.5">Structured matrices showing scholar roll coordinates over active dates.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="p-1.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs font-semibold text-slate-200 cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Print PDF Roll</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="p-1.5 px-3 bg-emerald-650 hover:bg-emerald-600 rounded text-xs font-semibold text-white cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export CSV Sheet</span>
              </button>
            </div>
          </div>

          {reportDateList.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 italic">
              No previous logs saved for this specific class program yet. Register presence to load matrix columns.
            </div>
          ) : (
            <div className="overflow-x-auto max-w-full rounded-lg border border-white/10">
              <table className="w-full text-center border-collapse text-[11px] glass-table">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-slate-350 font-mono">
                    <th className="p-2.5 text-left font-sans font-semibold text-slate-300">Scholar Name</th>
                    <th className="p-2.5 font-sans font-semibold text-slate-300">Roll Code</th>
                    {reportDateList.map(d => (
                      <th key={d} className="p-2.5 rotate-[-30deg] py-5 font-medium whitespace-nowrap min-w-[50px] text-slate-300">
                        {d.substr(5)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {students.map(s => {
                    return (
                      <tr key={s.id} className="hover:bg-white/5">
                        <td className="p-2.5 font-semibold text-white text-left">{s.name}</td>
                        <td className="p-2.5 font-mono text-slate-350 text-left">{s.rollNo}</td>
                        {reportDateList.map(date => {
                          const record = reportRecords.find(r => r.studentId === s.id && r.date === date);
                          return (
                            <td key={date} className="p-2.5">
                              {record ? (
                                <span className={`inline-block w-6 py-0.5 uppercase text-[9px] font-mono font-bold rounded ${
                                  record.status === 'present' ? 'bg-emerald-500/20 text-emerald-300' :
                                  record.status === 'late' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'
                                }`}>
                                  {record.status.substr(0,1).toUpperCase()}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-mono">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
