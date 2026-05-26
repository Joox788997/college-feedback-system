/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import AIInsightsPanel from './components/AIInsightsPanel';
import { User } from './types';
import { School, Cpu, Info, Shield, HelpCircle, GraduationCap } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Keep login session in client state
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div id="project-workspace" className="min-h-screen flex flex-col bg-transparent font-sans text-slate-100">
      
      {/* Dynamic Header for Logged-In Portals */}
      {currentUser && (
        <header id="main-header" className="glass-panel border-x-0 border-t-0 rounded-none bg-slate-900/40 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                <School className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <span className="font-bold text-slate-100 tracking-tight block text-sm sm:text-base">
                  CAMPUS SECURE
                </span>
                <span className="text-[10px] text-slate-300 font-mono block">
                  Smart Attendance & AI Analytics Suite
                </span>
              </div>
            </div>

            {/* Role Tracker Badge */}
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-mono tracking-wider font-semibold ${
                currentUser.role === 'admin' ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20' :
                currentUser.role === 'teacher' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' :
                'bg-amber-500/15 text-amber-300 border border-amber-500/20'
              }`}>
                ROLE: {currentUser.role}
              </span>
            </div>
          </div>
        </header>
      )}

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {!currentUser ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          <div className="space-y-8">
            
            {/* 1. Dynamic Dashboard Mounted per Role */}
            {currentUser.role === 'admin' && (
              <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />
            )}
            
            {currentUser.role === 'teacher' && (
              <TeacherDashboard currentUser={currentUser} onLogout={handleLogout} />
            )}

            {currentUser.role === 'student' && (
              <StudentDashboard currentUser={currentUser} onLogout={handleLogout} />
            )}

            {/* 2. Embedded Smart AI Counselling Row for Admins and Instructors */}
            {(currentUser.role === 'admin' || currentUser.role === 'teacher') && (
              <div id="ai-insights-block" className="animate-fade-in duration-500">
                <AIInsightsPanel />
              </div>
            )}

            {/* Quick Viva-Voce Prep Card explaining the project architecture */}
            <div id="viva-brief-panel" className="p-5 glass-card rounded-xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>VIva-Voce Presentation Quick Notes & Project Architecture</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                This project implements a simulated Relational Database schema in server memory with full RESTful API routes. It integrates <strong>Vite + React 19</strong>, <strong>Tailwind UI Architecture</strong>, <strong>Express Backend endpoints</strong>, and standard <strong>@google/genai</strong> SDK queries with robust predictive AI fallback logic. Tell your examiner: 
                <em> "Under the hood, our custom Express server monitors class attendance percentages. When a student's threshold dips below 75%, a localized risk trigger registers a safety hazard notification, and a prompt analyzes their timeline to construct direct improvement advice."</em>
              </p>
            </div>

          </div>
        )}
      </main>

      {/* Static Human-Centered Footer */}
      <footer className="py-6 border-t border-white/10 bg-slate-950/40 backdrop-blur-md text-center mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-slate-400 text-xs font-mono">
          BCA Final Year Capstone Project © 2026 • Security, Presence Tracking & Smart Analytics Suite
        </div>
      </footer>

    </div>
  );
}
