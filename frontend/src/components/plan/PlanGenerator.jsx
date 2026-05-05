import React, { useState } from 'react';
import { X, Sparkles, Target, Brain, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a0c]/90 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-[#0f0f12] border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[40px] flex flex-col shadow-2xl shadow-indigo-500/10">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{result.title}</h3>
                <p className="text-gray-400 text-sm">{result.overview}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {result.weeklyPlan && result.weeklyPlan.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {result.weeklyPlan.map((day, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all">
                    <h4 className="text-indigo-400 font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
                      <Calendar className="w-4 h-4" />
                      {day.day}
                    </h4>
                    <div className="space-y-4">
                      {(day.sessions || []).map((session, j) => (
                        <div key={j} className="border-l-2 border-indigo-500/30 pl-4 py-1">
                          <p className="text-xs text-gray-500 font-medium">{session.time}</p>
                          <p className="text-sm font-bold text-gray-200">{session.subject}</p>
                          <p className="text-xs text-gray-400">{session.topic}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{result.overview}</p>
              </div>
            )}

            {result.tips && result.tips.length > 0 && (
              <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-8">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-400" />
                  AI Smart Tips
                </h4>
                <ul className="space-y-3">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="text-gray-300 text-sm flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="p-8 border-t border-white/5 bg-white/5 flex justify-between items-center">
            <p className="text-gray-500 text-sm">You can find these in your task list later.</p>
            <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="px-8 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-2xl transition-all"
              >
                Close
              </button>
              <button 
                onClick={handleActivate}
                disabled={activating || activated}
                className={`px-8 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg
                  ${activated 
                    ? 'bg-green-600 text-white shadow-green-500/20' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'}
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
                    <Sparkles className="w-5 h-5" />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a0c]/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#0f0f12] border border-white/10 w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl shadow-indigo-500/10">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Generate Study Plan</h3>
              <p className="text-gray-500 text-sm">Powered by NVIDIA Llama 3.1</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-8">
          <div className="bg-white/5 rounded-3xl p-6 border border-white/10 mb-8">
            <div className="flex items-center gap-3 mb-4 text-gray-400 text-sm">
              <Calendar className="w-4 h-4" />
              Selected Schedule: <span className="text-white font-medium">{schedule.fileName}</span>
            </div>
            
            <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" />
              What are your goals?
            </label>
            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="E.g., I want to focus on Math and Physics, reduce my stress, and have free time after 8 PM."
              className="w-full h-32 bg-[#0a0a0c] border border-white/10 rounded-2xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-all resize-none shadow-inner"
            />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-2 animate-in shake-1">
              <X className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className={`w-full py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-xl
              ${generating 
                ? 'bg-white/5 text-gray-500 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 hover:scale-[1.02] active:scale-95'}
            `}
          >
            {generating ? (
              <>
                <div className="w-6 h-6 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                Llama is thinking...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
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
