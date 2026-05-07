import React, { useState } from 'react';
import { X, Stars, Target, Brain, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import planService from '../../services/planService';
import taskService from '../../services/taskService';

const PlanGenerator = ({ schedule, onClose, onPlanGenerated }) => {
  const [goals, setGoals] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);
  const [dataId, setDataId] = useState(null);

  const extractJsonFromString = (str) => {
    // Try parsing directly first
    try { return JSON.parse(str); } catch {}
    
    // Try extracting JSON between first { and last }
    const start = str.indexOf('{');
    const end = str.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try { return JSON.parse(str.substring(start, end + 1)); } catch {}
    }
    
    return null;
  };

  const handleActivate = async () => {
    if (!dataId) return;
    setActivating(true);
    try {
      await taskService.activatePlan(dataId);
      setActivated(true);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      console.error('Activation failed', err);
      setError('Could not activate plan. Please try again.');
    } finally {
      setActivating(false);
    }
  };

  const handleGenerate = async () => {
    if (!goals.trim()) {
      setError('Please tell the AI what you want to achieve.');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const data = await planService.generate(schedule.id, goals);
      setDataId(data.id);
      console.log('AI Raw Response:', data.content);
      
      const content = extractJsonFromString(data.content);
      
      if (content && content.weeklyPlan) {
        setResult(content);
      } else if (content) {
        // JSON parsed but missing expected fields — show what we got
        setResult({
          title: content.title || 'Your Study Plan',
          overview: content.overview || content.summary || 'AI-generated plan',
          weeklyPlan: content.weeklyPlan || content.weekly_plan || [],
          tips: content.tips || content.recommendations || []
        });
      } else {
        // Couldn't parse JSON at all — show raw text
        setResult({
          title: 'Your Study Plan',
          overview: data.content,
          weeklyPlan: [],
          tips: []
        });
      }
      
      if (onPlanGenerated) onPlanGenerated(data);
    } catch (err) {
      console.error('Generation failed', err);
      setError('AI generation failed. Please check your connection and API key.');
    } finally {
      setGenerating(false);
    }
  };

  if (result) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-white border border-slate-200/60 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2rem] flex flex-col shadow-2xl shadow-slate-300/50">
          <div className="p-8 border-b border-slate-200/60 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-300">
                <CheckCircle2 className="w-6 h-6 text-slate-100" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">{result.title}</h3>
                <p className="text-slate-500 text-sm font-medium">{result.overview}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-6 h-6 text-slate-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {result.weeklyPlan && result.weeklyPlan.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {result.weeklyPlan.map((day, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 hover:bg-slate-100 transition-all">
                    <h4 className="text-slate-700 font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
                      <Calendar className="w-4 h-4" />
                      {day.day}
                    </h4>
                    <div className="space-y-4">
                      {(day.sessions || []).map((session, j) => (
                        <div key={j} className="border-l-2 border-slate-300 pl-4 py-1">
                          <p className="text-xs text-slate-500 font-medium">{session.time}</p>
                          <p className="text-sm font-bold text-slate-900">{session.subject}</p>
                          <p className="text-xs text-slate-500">{session.topic}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-8">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">{result.overview}</p>
              </div>
            )}

            {result.tips && result.tips.length > 0 && (
              <div className="bg-slate-100 border border-slate-200/60 rounded-3xl p-8">
                <h4 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-slate-700" />
                  AI Smart Tips
                </h4>
                <ul className="space-y-3">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="text-slate-700 text-sm flex items-start gap-3 font-medium">
                      <div className="w-1.5 h-1.5 bg-slate-900 rounded-full mt-1.5 flex-shrink-0"></div>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="p-8 border-t border-slate-200/60 bg-slate-50 flex justify-between items-center">
            <p className="text-slate-500 text-sm font-medium">You can find these in your task list later.</p>
            <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all"
              >
                Close
              </button>
              <button 
                onClick={handleActivate}
                disabled={activating || activated}
                className={`px-8 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg
                  ${activated 
                    ? 'bg-emerald-600 text-white shadow-emerald-300/50' 
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-300'}
                  ${activating ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {activating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Activating...
                  </>
                ) : activated ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Plan Activated!
                  </>
                ) : (
                  <>
                    <Stars className="w-5 h-5" />
                    Activate This Plan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200/60 w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-300/50">
        <div className="p-8 border-b border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-slate-700" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Generate Study Plan</h3>
              <p className="text-slate-500 text-sm font-medium">Powered by NVIDIA Llama 3.1</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div className="p-8">
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/60 mb-8">
            <div className="flex items-center gap-3 mb-4 text-slate-500 text-sm font-medium">
              <Calendar className="w-4 h-4" />
              Selected Schedule: <span className="text-slate-900 font-bold">{schedule.fileName}</span>
            </div>
            
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-slate-700" />
              What are your goals?
            </label>
            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="E.g., I want to focus on Math and Physics, reduce my stress, and have free time after 8 PM."
              className="w-full h-32 bg-white border border-slate-200/60 rounded-2xl p-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 transition-all resize-none shadow-sm"
            />
            
            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-black mb-3">Quick Templates</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Focus on Mobile Dev, Gym daily at 9 PM, and 8 hours of sleep.",
                  "Prioritize Data Science, 30min morning walk, no study after 7 PM.",
                  "Intensive Java exam prep, study mostly on weekends, include breaks."
                ].map((text, i) => (
                  <button
                    key={i}
                    onClick={() => setGoals(text)}
                    className="text-[11px] font-bold px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-full hover:border-slate-900 hover:text-slate-900 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    {text.length > 40 ? text.substring(0, 40) + "..." : text}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200/60 rounded-2xl text-red-600 text-sm flex items-center gap-2 animate-in shake-1 font-medium">
              <X className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className={`w-full py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-xl
              ${generating 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-300 hover:scale-[1.02] active:scale-95'}
            `}
          >
            {generating ? (
              <>
                <div className="w-6 h-6 border-3 border-slate-700 border-t-transparent rounded-full animate-spin"></div>
                Llama is thinking...
              </>
            ) : (
              <>
                <Stars className="w-6 h-6" />
                Generate Intelligent Plan
                <ArrowRight className="w-5 h-5 ml-2 opacity-50" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanGenerator;
