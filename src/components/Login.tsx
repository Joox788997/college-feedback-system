/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LogIn, Key, School, GraduationCap, ShieldAlert } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Ready-to-go accounts list for frictionless viva showcase!
  const demoAccounts = [
    { name: 'Dr. Ramesh Nair', role: 'admin', email: 'admin@college.edu', desc: 'HOD - Full Institution Access' },
    { name: 'Prof. Amit Verma', role: 'teacher', email: 'teacher@college.edu', desc: 'Web & Cloud Lecture Master' },
    { name: 'Dr. Shalini Sen', role: 'teacher', email: 'teacher2@college.edu', desc: 'Core AI / Neural Networks Prof' },
    { name: 'Ishaan Varma', role: 'student', email: 'ishaan@college.edu', desc: 'Critical Risk Student (<55% Attendance)' },
    { name: 'Aarav Sharma', role: 'student', email: 'aarav@college.edu', desc: 'High Attendance Scholar (93%)' },
  ];

  const handleLogin = async (inputEmail: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inputEmail.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide a valid email address');
      return;
    }
    handleLogin(email);
  };

  return (
    <div id="login-container" className="min-h-screen flex items-center justify-center p-4 bg-transparent">
      
      {/* Centered Dual-Winged Frosted Glass Portal Card */}
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 glass-panel rounded-2xl overflow-hidden shadow-2xl border border-white/15">
        
        {/* Decorative Branding Left Section */}
        <div className="hidden lg:flex lg:col-span-5 bg-slate-950/40 flex-col justify-between p-10 text-white relative border-r border-white/10">
          <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none opacity-40" />
          
          <div className="z-10 flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/25 rounded-lg">
              <School className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="font-sans font-bold text-base tracking-wider text-indigo-100">CAMPUS SECURE</span>
          </div>

          <div className="z-10 my-auto space-y-4 pr-2">
            <h1 className="font-sans font-bold text-2xl tracking-tight leading-tight text-white">
              Smart Attendance & AI Analytics Suite
            </h1>
            <p className="text-slate-300 text-xs leading-relaxed font-light">
              An advanced college capstone project featuring contactless biometric checkpoints, real-time presence logs, and automated student risk triggers powered by Gemini AI.
            </p>
            <div className="pt-4 border-t border-white/10">
              <div className="text-[10px] text-indigo-400 font-mono uppercase tracking-widest font-semibold font-bold">BCA Final-Year Capstone</div>
              <div className="text-[10px] text-slate-400 font-sans mt-0.5 font-light">Supervised Viva Presentation Edition</div>
            </div>
          </div>

          <div className="z-10 text-[10px] text-slate-550 font-mono">
            © 2026 College Computer Applications Dept.
          </div>
        </div>

        {/* Login Action Interface Section */}
        <div className="lg:col-span-7 flex flex-col justify-center p-6 sm:p-10 bg-slate-900/30">
          <div className="max-w-xl mx-auto w-full space-y-6">
            
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 font-bold">Gateway</div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                Department Portal Access
              </h2>
              <p className="text-slate-300 text-xs font-light">
                Authenticate into your secure terminal to compile schedules, log presence indexes, or review risk matrices.
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-lg flex gap-2.5 items-center">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email-input" className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest font-mono">
                  Authorized Domain Email Address
                </label>
                <div className="relative">
                  <input
                    id="email-input"
                    type="email"
                    placeholder="e.g. teacher@college.edu or ishaan@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 glass-input rounded-lg text-xs transition-all font-sans"
                  />
                  <LogIn className="absolute left-3.5 top-3 w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              <button
                id="submit-login-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all shadow-md hover:shadow-indigo-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Verifying Coordinates...' : 'Sign In To secure Portal'}
              </button>
            </form>

            {/* Frictionless Viva Single-Click Accounts */}
            <div className="pt-5 border-t border-white/10">
              <div className="flex items-center gap-2 mb-2 text-[10px] font-semibold text-slate-300 uppercase tracking-widest font-mono">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>VIVA EXAMINER QUICK-LOGIN CARDS</span>
              </div>
              
              <p className="text-[10px] text-slate-400 mb-3 font-light leading-relaxed">
                Click any credential thumbnail below to immediately pass coordinates on-viva and examine the dashboard view for that role:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {demoAccounts.map((acc) => (
                  <div
                    key={acc.email}
                    id={`demo-card-${acc.email}`}
                    onClick={() => {
                      setEmail(acc.email);
                      handleLogin(acc.email);
                    }}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/8 rounded-lg text-left cursor-pointer transition-all flex flex-col justify-between space-y-1 group hover:border-indigo-500/35"
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-semibold text-xs text-white group-hover:text-indigo-300 transition-colors truncate">
                        {acc.name}
                      </span>
                      <span className={`px-1.5 py-0.5 text-[8px] uppercase font-mono tracking-wider rounded font-bold shrink-0 ${
                        acc.role === 'admin' ? 'bg-indigo-500/15 text-indigo-300' :
                        acc.role === 'teacher' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'
                      }`}>
                        {acc.role}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-light truncate">
                      {acc.desc}
                    </p>
                    <span className="text-[9px] text-indigo-300 font-mono inline-flex items-center gap-1">
                      <Key className="w-2.5 h-2.5 text-indigo-400" />
                      {acc.email}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
