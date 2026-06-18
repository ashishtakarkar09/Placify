import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Target, Calculator, Info, Sparkles, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CGPAPredictorProps {
  user: UserProfile;
}

export default function CGPAPredictor({ user }: CGPAPredictorProps) {
  const [currentCGPA, setCurrentCGPA] = useState(user.currentCGPA);
  const [currentSemester, setCurrentSemester] = useState(user.semester);
  const [targetCGPA, setTargetCGPA] = useState(8.5);

  // Sync state if profile changes
  useEffect(() => {
    setCurrentCGPA(user.currentCGPA);
    setCurrentSemester(user.semester);
  }, [user]);

  // Main custom predictor calculation
  const calculateRequiredSGPA = (currC: number, currS: number, target: number) => {
    const totalSemesters = 8;
    const remainingSemesters = totalSemesters - currS;

    if (remainingSemesters <= 0) {
      return { requiredSub: 0, status: 'Graduated', text: 'You have completed all 8 semesters.' };
    }

    const currentPointsSum = currC * currS;
    const requiredPointsSum = target * totalSemesters;
    const neededPoints = requiredPointsSum - currentPointsSum;
    const requiredSGPA = neededPoints / remainingSemesters;

    let probability = 'High';
    let probColor = 'text-emerald-600 bg-emerald-50 border-emerald-100';
    let desc = 'This target is very achievable with your current academic standing!';

    if (requiredSGPA > 10.0) {
      probability = 'Impossible';
      probColor = 'text-rose-600 bg-rose-50 border-rose-100 animate-pulse';
      desc = 'Requires an SGPA greater than 10.0, which is mathematically impossible.';
    } else if (requiredSGPA > 9.2) {
      probability = 'Low / Intense Effort';
      probColor = 'text-amber-600 bg-amber-50 border-amber-100';
      desc = 'Extremely narrow margin of error. You will need straight 9.5+ SGPA grades.';
    } else if (requiredSGPA > 8.0) {
      probability = 'Moderate';
      probColor = 'text-blue-600 bg-blue-50 border-blue-100';
      desc = 'Requires highly consistent preparation and disciplined semester study.';
    }

    return {
      requiredSGPA: Math.max(0, Number(requiredSGPA.toFixed(2))),
      probability,
      probColor,
      desc,
      remainingSemesters
    };
  };

  const mainStats = calculateRequiredSGPA(currentCGPA, currentSemester, targetCGPA);

  // Built-in fixed standards to show target cards (7.5, 8.0, 8.5, 9.0)
  const targetsList = [7.5, 8.0, 8.5, 9.0];

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-100 text-blue-600 rounded-2xl">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 leading-tight">CGPA / SGPA Predictor Engine</h2>
            <p className="text-xs text-slate-400">Project required SGPA scores for your target corporate tiers</p>
          </div>
        </div>

        {/* Predictor Interactive Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Slider 1: Current CGPA */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-500 font-mono font-bold">
              <span>CURRENT CGPA</span>
              <span className="text-sm font-extrabold text-blue-600">{currentCGPA.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.05"
              value={currentCGPA}
              onChange={(e) => setCurrentCGPA(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
            />
            <span className="text-[10px] text-slate-400 block">Edit current academic score</span>
          </div>

          {/* Slider 2: Semester Completed */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-500 font-mono font-bold">
              <span>CURRENT SEMESTER</span>
              <span className="text-sm font-extrabold text-indigo-600">{currentSemester} / 8</span>
            </div>
            <input
              type="range"
              min="1"
              max="7"
              step="1"
              value={currentSemester}
              onChange={(e) => setCurrentSemester(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
            />
            <span className="text-[10px] text-slate-400 block">Number of semesters evaluated</span>
          </div>

          {/* Slider 3: Target CGPA */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-500 font-mono font-bold">
              <span>TARGET CGPA GOAL</span>
              <span className="text-sm font-extrabold text-violet-600">{targetCGPA.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="4"
              max="10"
              step="0.05"
              value={targetCGPA}
              onChange={(e) => setTargetCGPA(Number(e.target.value))}
              className="w-full accent-violet-600 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
            />
            <span className="text-[10px] text-slate-400 block">Your dream graduation score</span>
          </div>
        </div>
      </div>

      {/* Main Single Projection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
          
          <div className="space-y-4">
            <h3 className="text-xs tracking-wider font-semibold font-mono text-slate-400 select-none uppercase">
              REMAINING GOAL OUTLOOK (Target: {targetCGPA})
            </h3>
            
            {mainStats.requiredSGPA > 10.0 ? (
              <div className="flex items-center gap-3 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span className="text-xs font-semibold leading-tight">Exceeds raw CGPA boundaries. Adjust goals!</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-2xl">
                <TrendingUp className="w-5 h-5 shrink-0 animate-pulse" />
                <span className="text-xs font-semibold leading-tight">Requires average of {mainStats.requiredSGPA} SGPA for next {mainStats.remainingSemesters} semesters.</span>
              </div>
            )}

            <div className="pt-2">
              <span className="text-xs text-slate-400 block font-mono">REQUIRED AV. SGPA</span>
              <h4 className="text-5xl font-extrabold text-white tracking-tighter mt-1">
                {mainStats.requiredSGPA > 10.0 ? 'N/A' : mainStats.requiredSGPA}
              </h4>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-700/50 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Success Probability:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${mainStats.probColor}`}>
                {mainStats.probability}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed pt-1">
              {mainStats.desc}
            </p>
          </div>
        </div>

        {/* Multiple Targets Comparison Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm uppercase font-mono tracking-wider text-gray-500 font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-violet-500" /> Comparison Against Placement Benchmark Tiers
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {targetsList.map((targetVal) => {
              const res = calculateRequiredSGPA(currentCGPA, currentSemester, targetVal);
              const isImpossible = res.requiredSGPA > 10.0;
              const isAchieved = currentCGPA >= targetVal;

              return (
                <div key={targetVal} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-xs space-y-3 relative group overflow-hidden">
                  {isAchieved && (
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-bold border border-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ACHIEVED
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">Benchmark Tier Goal</span>
                    <h4 className="text-lg font-bold text-slate-800">{targetVal.toFixed(1)} CGPA</h4>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Required SGPA:</span>
                      <span className={`font-mono font-black ${isImpossible ? 'text-rose-600' : isAchieved ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {isAchieved ? 'Already Passed!' : isImpossible ? 'Impossible' : res.requiredSGPA}
                      </span>
                    </div>

                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: isAchieved
                            ? '100%'
                            : isImpossible
                            ? '0%'
                            : `${Math.max(10, Math.min(100, (res.requiredSGPA / 10) * 100))}%`,
                          backgroundColor: isAchieved
                            ? '#10b981'
                            : isImpossible
                            ? '#ef4444'
                            : res.requiredSGPA > 8.8
                            ? '#f59e0b'
                            : '#3b82f6'
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-50 text-slate-500">
                    <span>Probability:</span>
                    <span className={`font-semibold ${isAchieved ? 'text-emerald-600' : isImpossible ? 'text-rose-500 font-bold' : 'text-slate-700'}`}>
                      {isAchieved ? '100%' : res.probability}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Projection Explanation */}
      <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800 leading-relaxed space-y-1">
          <p className="font-bold">About College Benchmarks & Tiers:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li><strong>7.5 CGPA</strong> is the baseline eligibility criteria for most Service-Based Companies (e.g. TCS, Wipro, Cognizant).</li>
            <li><strong>8.0 CGPA</strong> opens up eligibility for many high-paying Product-Based Companies and Startups.</li>
            <li><strong>8.5+ CGPA</strong> qualifies you for premium, top-tier corporations (e.g. Google, Microsoft, Adobe) and waives most cgpa screening rounds.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
