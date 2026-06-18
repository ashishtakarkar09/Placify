import React, { useState } from 'react';
import { UserProfile, Company, INITIAL_COMPANIES } from '../types';
import { ShieldAlert, CheckCircle, XCircle, Search, Filter, HelpCircle, Briefcase, GraduationCap } from 'lucide-react';

interface CompanyCheckerProps {
  user: UserProfile;
}

export default function CompanyChecker({ user }: CompanyCheckerProps) {
  // Local overrides so the user can test their hypothetical stats side-by-side
  const [cgpaOverride, setCgpaOverride] = useState(user.currentCGPA);
  const [backlogsOverride, setBacklogsOverride] = useState(user.activeBacklogs);
  const [branchOverride, setBranchOverride] = useState(user.branch);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'All' | 'Product Based' | 'Service Based' | 'Startup'>('All');

  const branches = [
    'Computer Science',
    'Information Technology',
    'Electronics & Communication',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'All Branches'
  ];

  // Evaluate eligibility logic
  const checkEligibility = (company: Company) => {
    const reasons: string[] = [];

    // 1. CGPA check
    if (cgpaOverride < company.minCGPA) {
      reasons.push(`Requires Min. CGPA ${company.minCGPA.toFixed(1)} (You have ${cgpaOverride.toFixed(2)})`);
    }

    // 2. Backlogs check
    if (backlogsOverride > company.maxBacklogs) {
      reasons.push(`Limits Active Backlogs to ${company.maxBacklogs} (You have ${backlogsOverride})`);
    }

    // 3. Branch check
    const isAllowedBranch =
      company.allowedBranches.includes('All Branches') ||
      company.allowedBranches.includes('All') ||
      company.allowedBranches.some(
        (b) => b.toLowerCase().trim() === branchOverride.toLowerCase().trim()
      );

    if (!isAllowedBranch) {
      reasons.push(`Allowed Branches: ${company.allowedBranches.join(', ')}`);
    }

    return {
      eligible: reasons.length === 0,
      reasons
    };
  };

  // Compile results
  const evaluatedCompanies = INITIAL_COMPANIES.map((company) => {
    const evaluation = checkEligibility(company);
    return {
      ...company,
      isEligible: evaluation.eligible,
      reasons: evaluation.reasons
    };
  });

  // Filter lists
  const filteredCompanies = evaluatedCompanies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedTypeFilter === 'All' || company.type === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  const eligibleList = filteredCompanies.filter((c) => c.isEligible);
  const ineligibleList = filteredCompanies.filter((c) => !c.isEligible);

  return (
    <div className="space-y-6">
      {/* Dynamic Profile Input Overrides */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Placement Eligibility Checker</h2>
            <p className="text-xs text-slate-400">Instantly evaluate eligibility based on academic indicators</p>
          </div>
          <div className="flex gap-2 self-start md:self-auto">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-mono font-bold rounded-lg border border-blue-100">
              Active Backlogs: {user.activeBacklogs}
            </span>
          </div>
        </div>

        {/* Override controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* CGPA Slider */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold font-mono text-slate-500 uppercase flex justify-between">
              TEST CGPA: <span className="text-blue-600 font-extrabold">{cgpaOverride.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.05"
              value={cgpaOverride}
              onChange={(e) => setCgpaOverride(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-50 border border-slate-200 rounded-lg appearance-none"
            />
          </div>

          {/* Backlogs slider */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold font-mono text-slate-500 uppercase flex justify-between">
              TEST BACKLOGS: <span className="text-blue-600 font-extrabold">{backlogsOverride}</span>
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={backlogsOverride}
              onChange={(e) => setBacklogsOverride(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-50 border border-slate-200 rounded-lg appearance-none"
            />
          </div>

          {/* Branch selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">
              TEST BRANCH
            </label>
            <select
              value={branchOverride}
              onChange={(e) => setBranchOverride(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 font-mono"
            >
              {branches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Query Search / Filtering Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company requirements..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs outline-none focus:border-blue-500 shadow-xs"
          />
        </div>

        {/* Filtering */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0 select-none">
          {['All', 'Product Based', 'Service Based', 'Startup'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedTypeFilter(type as any)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap border transition ${
                selectedTypeFilter === type
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Lists of Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Eligible List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 px-4 py-2.5 rounded-2xl">
            <h3 className="text-xs font-bold font-mono text-emerald-800 uppercase flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> Eligible Companies ({eligibleList.length})
            </h3>
            <span className="text-[10px] text-emerald-700 bg-white border border-emerald-100 px-2 py-0.5 rounded-full font-bold">
              Qualified
            </span>
          </div>

          {eligibleList.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-200 bg-white rounded-3xl text-center text-slate-400 text-xs">
              No eligible companies match these test status filters.
            </div>
          ) : (
            <div className="space-y-3">
              {eligibleList.map((company) => (
                <div key={company.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-xs hover:border-emerald-500/40 transition">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono border border-blue-100">
                        {company.type}
                      </span>
                      <h4 className="text-sm font-bold text-slate-800 mt-2">{company.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Criteria: CGPA ≥ {company.minCGPA.toFixed(1)} • Max Backlogs: {company.maxBacklogs} <br />
                        Branches: <span className="font-mono text-slate-600">{company.allowedBranches.join(', ')}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-800 block font-mono">{company.expectedSalary}</span>
                      <span className="text-[9px] text-emerald-600 uppercase font-black bg-emerald-50 border border-emerald-100/60 px-2 py-0.5 rounded mt-1.5 inline-block">
                        Ready to Apply
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ineligible List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-rose-50 border border-rose-100 px-4 py-2.5 rounded-2xl">
            <h3 className="text-xs font-bold font-mono text-rose-800 uppercase flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" /> Missing Criteria ({ineligibleList.length})
            </h3>
            <span className="text-[10px] text-rose-700 bg-white border border-rose-100 px-2 py-0.5 rounded-full font-bold">
              Ineligible
            </span>
          </div>

          {ineligibleList.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-200 bg-white rounded-3xl text-center text-slate-400 text-xs">
              Excellent! No companies found under restricted criteria with current overrides.
            </div>
          ) : (
            <div className="space-y-3">
              {ineligibleList.map((company) => (
                <div key={company.id} className="p-4 bg-white/70 border border-slate-100 rounded-2xl shadow-xs opacity-90">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-mono border border-slate-200">
                        {company.type}
                      </span>
                      <h4 className="text-sm font-bold text-slate-700 mt-2">{company.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Salary: {company.expectedSalary}
                      </p>
                      
                      {/* Reason badges describing failures */}
                      <div className="mt-2.5 space-y-1">
                        {company.reasons.map((reason, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[10px] text-rose-700 bg-rose-50 border border-rose-100/60 px-2 py-1 rounded-lg font-medium">
                            <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
