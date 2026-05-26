/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Cpu, RotateCw, AlertTriangle, Lightbulb, Flame, Award, CheckCircle } from 'lucide-react';

interface AIInsight {
  studentId: string;
  studentName: string;
  overallPercentage: number;
  riskLevel: 'critical' | 'warning' | 'low';
  detectedPattern: string;
  suggestions: string[];
}

export default function AIInsightsPanel() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [source, setSource] = useState<'gemini' | 'local-engine' | null>(null);
  const [error, setError] = useState('');

  const fetchAIAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await fetch('/api/ai/predict');
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'AI analysis failed');
      }
      setInsights(data.data || []);
      setSource(data.src || 'local-engine');
    } catch (err: any) {
      console.error(err);
      setError('An error occurred during AI optimization assessment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIAnalysis();
  }, []);

  return (
    <div id="ai-insights-panel" className="glass-panel rounded-xl shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400 animate-pulse" />
            <span>AI Predictive Attendance Counselling</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Intelligent pattern mining of attendance logs, identifying students at risk of low attendance.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {source && (
            <span className={`px-2.5 py-1 text-[11px] font-mono rounded tracking-wider ${
              source === 'gemini' ? 'bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/30' : 'bg-white/5 border border-white/10 text-slate-300'
            }`}>
              Engine: {source === 'gemini' ? 'Gemini 3.5' : 'Heuristic Rules Grid'}
            </span>
          )}

          <button
            onClick={fetchAIAnalysis}
            disabled={loading}
            className="p-1 px-3 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-white rounded text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <RotateCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Run Predictor</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-t-indigo-400 border-white/10 rounded-full animate-spin" />
          <p className="text-xs text-slate-300 font-mono animate-pulse">
            Sifting historical attendance records, running neural weights...
          </p>
        </div>
      ) : error ? (
        <div className="p-4 bg-amber-500/10 rounded text-xs text-amber-300 border border-amber-500/20">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20 flex items-center gap-4">
              <div className="p-2.5 bg-red-500/20 text-red-300 rounded-lg">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-red-400">
                  {insights.filter(i => i.riskLevel === 'critical').length}
                </div>
                <div className="text-[10px] text-red-300 font-semibold uppercase tracking-wider">Critical Risk Students</div>
              </div>
            </div>

            <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 flex items-center gap-4">
              <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-amber-400">
                  {insights.filter(i => i.riskLevel === 'warning').length}
                </div>
                <div className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider">Warnings Pending</div>
              </div>
            </div>

            <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20 flex items-center gap-4">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-lg">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {insights.filter(i => i.riskLevel === 'low').length}
                </div>
                <div className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">Safe / Ideal Records</div>
              </div>
            </div>
          </div>

          {/* Dynamic Students Logs */}
          <div className="space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.studentId}
                className={`p-5 rounded-lg border border-white/10 transition-all bg-white/5 ${
                  insight.riskLevel === 'critical' ? 'border-l-4 border-l-red-500 shadow-xs' :
                  insight.riskLevel === 'warning' ? 'border-l-4 border-l-amber-500' :
                  'border-l-4 border-l-emerald-500'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-white">{insight.studentName}</span>
                    <span className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded font-medium ${
                      insight.riskLevel === 'critical' ? 'bg-red-500/25 text-red-300' :
                      insight.riskLevel === 'warning' ? 'bg-amber-500/25 text-amber-300' : 'bg-emerald-500/25 text-emerald-300'
                    }`}>
                      {insight.riskLevel === 'critical' ? 'Critical (Under 75%)' :
                       insight.riskLevel === 'warning' ? 'Warning (<85%)' : 'Good Profile'}
                    </span>
                  </div>
                  <span className="text-xs font-semibold font-mono text-slate-300">
                    Calculated Term Presence: <span className={insight.overallPercentage < 75 ? 'text-red-400 font-bold' : 'text-slate-100'}>{insight.overallPercentage}%</span>
                  </span>
                </div>

                {/* Pattern detected description */}
                <div className="mb-4 text-xs text-slate-350 bg-white/5 p-3 rounded-md border border-white/5">
                  <span className="font-semibold text-slate-300">Detected Attendance Cycle Pattern: </span>
                  <span className="italic">"{insight.detectedPattern}"</span>
                </div>

                {/* Counselling suggestions */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase text-slate-300 tracking-wider flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-indigo-400 animate-bounce" />
                    <span>Academic Guidance & Suggestions:</span>
                  </div>
                  <ul className="pl-4 space-y-1">
                    {insight.suggestions.map((suggestion, sIdx) => (
                      <li key={sIdx} className="text-xs text-slate-300 list-disc leading-relaxed">
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
