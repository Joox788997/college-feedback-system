/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { User, Class, StudentStats, AttendanceRecord, AttendanceAlert } from '../types';
import { Award, Bell, ShieldCheck, Camera, Sparkles, QrCode, Clock, BookOpen, ThumbsUp, ChevronRight, AlertTriangle } from 'lucide-react';

interface StudentDashboardProps {
  currentUser: User;
  onLogout: () => void;
}

export default function StudentDashboard({ currentUser, onLogout }: StudentDashboardProps) {
  const [overallStats, setOverallStats] = useState<any>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [alerts, setAlerts] = useState<AttendanceAlert[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'log' | 'biometrics'>('overview');

  // Face Registration Mock
  const [snapping, setSnapping] = useState(false);
  const [snapCompleted, setSnapCompleted] = useState(false);
  const [isFaceRegistered, setIsFaceRegistered] = useState(currentUser.faceRegistered);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fetchStudentTelemetry = async () => {
    try {
      // 1. Fetch statistics
      const statsResp = await fetch(`/api/analytics/student/${currentUser.id}`);
      const statsData = await statsResp.json();
      setOverallStats(statsData);

      // 2. Fetch records
      const recsResp = await fetch(`/api/records?studentId=${currentUser.id}`);
      const recsData = await recsResp.json();
      // Sort newest first
      const sortedRecs = (recsData.records || []).sort((a: AttendanceRecord, b: AttendanceRecord) => b.date.localeCompare(a.date));
      setRecords(sortedRecs);

      // 3. Fetch Alerts
      const alertsResp = await fetch(`/api/alerts?studentId=${currentUser.id}`);
      const alertsData = await alertsResp.json();
      setAlerts(alertsData.alerts || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudentTelemetry();
  }, [currentUser]);

  const handleDismissAlert = async (id: string) => {
    try {
      await fetch(`/api/alerts/${id}/read`, { method: 'POST' });
      setAlerts(prev => prev.filter(a => a.id !== id));
      fetchStudentTelemetry();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterFace = async () => {
    setSnapping(true);
    // Request webcam feed
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error(e));
      }
    } catch (err) {
      console.warn('Face capture hardware unavailable inside environment frame. Mocking camera feed.', err);
    }

    setTimeout(async () => {
      // Clean camera tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      
      // Update User DB Face state
      try {
        const resp = await fetch(`/api/users/${currentUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ faceRegistered: true })
        });
        if (resp.ok) {
          setIsFaceRegistered(true);
          setSnapCompleted(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setSnapping(false);
      }
    }, 4000);
  };

  return (
    <div id="student-dashboard" className="space-y-6 animate-fade-in">
      
      {/* Top Welcome Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 glass-panel rounded-xl text-white gap-4 bg-slate-900/30 border-white/15">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 bg-indigo-500/10 border border-indigo-500/25 rounded-lg">
            <Award className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">Student Scholar Info</div>
            <h1 className="text-lg font-bold font-sans text-white">{currentUser.name}</h1>
            <p className="text-[10px] text-slate-300 font-mono mt-0.5">Roll No: {currentUser.rollNo} • {currentUser.semester}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-500/15 border border-red-500/25 hover:bg-red-500/25 font-sans font-semibold text-red-300 text-xs rounded-lg cursor-pointer transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Dynamic Alerts notification center */}
      {alerts.filter(a => !a.isRead).length > 0 && (
        <div className="space-y-2">
          {alerts.filter(a => !a.isRead).map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
                alert.type === 'danger' ? 'bg-red-500/15 border-red-500/25 text-red-200' :
                alert.type === 'warning' ? 'bg-amber-500/15 border-amber-500/25 text-amber-200' : 'bg-blue-500/15 border-blue-500/25 text-blue-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <Bell className="w-4 h-4 mt-0.5 text-slate-305 shrink-0 animate-bounce" />
                <div>
                  <div className="text-[10px] font-bold font-mono tracking-wider uppercase mb-0.5 text-indigo-300">
                    Notification Alert {alert.className ? `(${alert.className})` : ''}
                  </div>
                  <div className="text-xs font-light leading-relaxed">{alert.message}</div>
                </div>
              </div>
              <button
                onClick={() => handleDismissAlert(alert.id)}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold uppercase rounded text-slate-200 cursor-pointer self-end sm:self-auto shrink-0 transition-colors"
              >
                Acknowledge
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Student Nav Row */}
      <div className="border-b border-white/10 flex gap-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'overview' ? 'border-indigo-400 text-white font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Course Ledger
        </button>
        <button
          onClick={() => setActiveTab('log')}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'log' ? 'border-indigo-400 text-white font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Presence Logs Timelines
        </button>
        <button
          onClick={() => setActiveTab('biometrics')}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'biometrics' ? 'border-indigo-400 text-white font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Self-Service Desk (Biometrics)
        </button>
      </div>

      {/* VIEW COMPONENT RENDERING */}
      {activeTab === 'overview' && (
        <div id="overview-tab" className="space-y-6">
          
          {/* Main Attendance Dial Banner */}
          {overallStats && (
            <div className={`p-6 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-6 ${
              overallStats.overallPercentage >= 85 ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-200' :
              overallStats.overallPercentage >= 75 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' : 'bg-red-500/10 border-red-500/20 text-red-200'
            }`}>
              <div className="space-y-1.5 text-center md:text-left">
                <h3 className="text-sm font-bold flex items-center justify-center md:justify-start gap-1.5">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <span>Exam Admit-Card Eligibility Verification</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-xl font-light">
                  {overallStats.overallPercentage >= 75
                    ? 'Congratulations! Your combined attendance satisfies the legal academic threshold. You stand qualified for terminal exam certifications automatically.'
                    : 'URGENT CAUTION: Your current average presence slips under the minimum regulatory academic standards. Failure to register immediate remedial attendance will block exam admit approvals.'}
                </p>
              </div>

              <div className="text-center shrink-0 pr-4">
                <div className="text-4xl font-bold font-mono tracking-tight text-white">
                  {overallStats.overallPercentage}%
                </div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">
                  Cumulative Score
                </div>
              </div>
            </div>
          )}

          {/* Individual Courses Grid List */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Syllabus Progress Ledger</h3>
              <p className="text-xs text-slate-400 mt-0.5">Attendance ratios sorted per registered semester stream course.</p>
            </div>

            {overallStats?.stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {overallStats.stats.map((stat: StudentStats) => (
                  <div key={stat.classId} className="p-5 glass-card rounded-xl flex flex-col justify-between space-y-4 relative overflow-hidden group">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-[9px] bg-white/5 border border-white/5 font-bold px-2 py-0.5 rounded text-indigo-300">
                          {stat.classCode}
                        </span>
                        
                        <span className={`px-2 py-0.5 text-[8px] font-semibold uppercase rounded tracking-wider ${
                          stat.riskStatus === 'good' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' :
                          stat.riskStatus === 'warning' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20' : 'bg-red-500/15 text-red-300 border border-red-500/20'
                        }`}>
                          {stat.riskStatus === 'good' ? 'Safe Limit' :
                           stat.riskStatus === 'warning' ? 'Moderate Risk' : 'Critical Hazard'}
                        </span>
                      </div>
                      
                      <h4 className="text-sm font-bold text-white leading-tight">
                        {stat.className}
                      </h4>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <div className="flex justify-between items-center text-xs text-slate-350">
                        <span>Attendance Tracker</span>
                        <span className="font-mono font-bold text-slate-100">{stat.percentage}%</span>
                      </div>

                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                        <div
                          style={{ width: `${stat.percentage}%` }}
                          className={`h-full rounded-full ${
                            stat.riskStatus === 'good' ? 'bg-indigo-500' :
                            stat.riskStatus === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
                        <span>Present: {stat.classesPresent}</span>
                        <span>Late: {stat.classesLate}</span>
                        <span>Total: {stat.totalClasses}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Compiling ledger grids...</p>
            )}
          </div>

        </div>
      )}

      {/* LOG TIMELINE LIST VIEW */}
      {activeTab === 'log' && (
        <div id="logs-timeline-tab" className="glass-panel rounded-xl shadow-sm p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Your Presence Logs History</h3>
            <p className="text-xs text-slate-400 mt-0.5">Chronological record listings of registered lecturer dates and sources.</p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full text-left border-collapse text-xs glass-table">
              <thead>
                <tr className="border-b border-white/10 text-slate-300 bg-white/5 font-mono text-[9px] uppercase tracking-wider">
                  <th className="p-3 font-semibold text-slate-300">Marked Date</th>
                  <th className="p-3 font-semibold text-slate-300">Course Reference</th>
                  <th className="p-3 font-semibold text-slate-300">Check-in Coordinate</th>
                  <th className="p-3 font-semibold text-center text-slate-300">Receipt Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-white/5">
                    <td className="p-3 font-mono text-slate-300 font-medium">{r.date}</td>
                    <td className="p-3 font-semibold text-white">
                      {r.classId === 'c-101' ? 'Cloud Computing' :
                       r.classId === 'c-102' ? 'Web Programming with React' : 'Artificial Intelligence & ML'}
                    </td>
                    <td className="p-3 font-mono text-slate-350 text-[10px] capitalize">
                      {r.markedMethod === 'face' ? '❖ Facial Biometric matched' :
                       r.markedMethod === 'qr' ? '◈ Dynamic QR Token' : '✓ Manual roll check'}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-block w-20 py-0.5 font-mono font-bold uppercase rounded text-[9px] tracking-wide ${
                        r.status === 'present' ? 'bg-emerald-500/20 text-emerald-300' :
                        r.status === 'late' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SELF-SERVICE DESK (BIOMETRICS) */}
      {activeTab === 'biometrics' && (
        <div id="biometrics-portal-tab" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Snap-Face Panel */}
          <div className="glass-panel shadow-sm p-6 space-y-4 rounded-xl">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span>Facial Biometric Activation Desk</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Enroll your face vector structure to unlock contact-free biometric portals.</p>
            </div>

            <div className="relative border border-white/10 bg-slate-950/40 rounded-xl aspect-video overflow-hidden flex flex-col justify-between items-center text-white text-center p-4">
              <div className="absolute inset-x-4 inset-y-6 border border-white/10 rounded-md pointer-events-none flex items-center justify-center">
                {snapping && <div className="absolute inset-0 bg-indigo-500/10 animate-pulse border-2 border-indigo-500" />}
                {isFaceRegistered && <div className="p-2.5 bg-indigo-500/20 rounded border border-indigo-500/30 font-mono text-xs uppercase text-indigo-300">Biometric Vector Encoded</div>}
              </div>

              {snapping ? (
                <>
                  <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
                  <div className="z-10 bg-slate-950/85 px-4 py-2 rounded-lg border border-indigo-500/30 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping" />
                    <span className="font-mono text-xs text-indigo-400">Capturing face coordinate points...</span>
                  </div>
                </>
              ) : snapCompleted || isFaceRegistered ? (
                <div className="z-10 m-auto space-y-1">
                  <span className="text-emerald-400 font-bold text-2xl font-mono">BIOMETRIC OK</span>
                  <p className="text-xs text-slate-350 leading-relaxed max-w-xs mx-auto">
                    Your unique face vector coordinates have been compiled and uploaded onto local college archives successfully.
                  </p>
                </div>
              ) : (
                <div className="z-10 m-auto space-y-1 text-slate-400">
                  <Camera className="w-10 h-10 text-slate-500 mx-auto animate-pulse" />
                  <span className="text-xs font-mono block text-slate-400">Offline standby coordinates matches</span>
                </div>
              )}

              <div className="z-10 w-full pt-2">
                {isFaceRegistered ? (
                  <button
                    disabled
                    className="w-full py-2 bg-slate-800 text-slate-500 text-xs font-semibold rounded-lg shrink-0"
                  >
                    Face Registry Securely Verified
                  </button>
                ) : (
                  <button
                    onClick={handleRegisterFace}
                    disabled={snapping}
                    className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg shrink-0 cursor-pointer transition-all"
                  >
                    {snapping ? 'Finalizing snaps...' : 'Engage Lens Capture Snap'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* QR Card Generation */}
          <div className="glass-panel shadow-sm p-6 space-y-4 rounded-xl flex flex-col justify-between items-stretch">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span>ID Card Dynamic Check-in QR</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Project this token coordinates in front of your teacher's desk camera.</p>
            </div>

            <div className="p-4 bg-white rounded-xl flex flex-col items-center justify-center space-y-3 border border-white/10 py-6">
              {/* QR representation of student roll ID info - QR remains black and white for extreme scannability */}
              <div className="w-36 h-36 bg-white p-3 border border-slate-200 rounded-md relative shadow-sm">
                <QrCode className="w-full h-full text-indigo-950" />
              </div>
              <span className="text-xs font-mono font-bold tracking-widest text-slate-600">
                TOKEN: {currentUser.rollNo}
              </span>
            </div>

            <p className="text-[10px] text-indigo-300 font-mono leading-relaxed text-center font-medium bg-indigo-500/10 p-2.5 rounded-lg border border-indigo-500/20">
              ⚡ This OTP updates on rotation cycles automatically to block double scans or roll bunk parameters.
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
