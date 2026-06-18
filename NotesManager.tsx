import React, { useState, useEffect } from 'react';
import { UserProfile, ResumeData } from '../types';
import { DbService } from '../services/db';
import { FileText, Eye, Edit3, Settings, Plus, Trash2, Printer, CheckCircle, Sparkles } from 'lucide-react';

interface ResumeBuilderProps {
  user: UserProfile;
  onChange: () => void;
}

export default function ResumeBuilder({ user, onChange }: ResumeBuilderProps) {
  const [resume, setResume] = useState<ResumeData>(() => DbService.getResumeData(user.uid));
  const [activeSection, setActiveSection] = useState<'personal' | 'education' | 'skills' | 'projects' | 'additional'>('personal');
  const [selectedTemplate, setSelectedTemplate] = useState<'professional' | 'fresher' | 'ats'>('professional');
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Buffer fields for list entries
  const [newSchool, setNewSchool] = useState({ institution: '', degree: '', year: '', cgpaOrPercentage: '' });
  const [newProject, setNewProject] = useState({ title: '', techStack: '', description: '' });
  const [newCert, setNewCert] = useState({ name: '', issuer: '', year: '' });
  const [skillInput, setSkillInput] = useState('');
  const [achievementInput, setAchievementInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');

  // Save changes to db
  const triggerSave = (updated: ResumeData) => {
    DbService.saveResumeData(user.uid, updated);
    setResume(updated);
    onChange(); // trigger parent statistics update
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  // Sync state if skills list is loaded
  useEffect(() => {
    if (resume.skills && resume.skills.length > 0) {
      setSkillInput(resume.skills.join(', '));
    }
    if (resume.achievements && resume.achievements.length > 0) {
      setAchievementInput(resume.achievements.join(', '));
    }
    if (resume.languages && resume.languages.length > 0) {
      setLanguageInput(resume.languages.join(', '));
    }
    if (resume.interests && resume.interests.length > 0) {
      setInterestInput(resume.interests.join(', '));
    }
  }, []);

  const handlePersonalChange = (field: string, value: string) => {
    const updated = {
      ...resume,
      personalInfo: {
        ...resume.personalInfo,
        [field]: value
      }
    };
    triggerSave(updated);
  };

  const handleAddField = (section: 'education' | 'projects' | 'certifications') => {
    const updated = { ...resume };
    const id = 'id_' + Math.random().toString(36).substr(2, 9);
    
    if (section === 'education') {
      if (!newSchool.institution) return;
      updated.education.push({ ...newSchool, id });
      setNewSchool({ institution: '', degree: '', year: '', cgpaOrPercentage: '' });
    } else if (section === 'projects') {
      if (!newProject.title) return;
      updated.projects.push({ ...newProject, id });
      setNewProject({ title: '', techStack: '', description: '' });
    } else if (section === 'certifications') {
      if (!newCert.name) return;
      updated.certifications.push({ ...newCert, id });
      setNewCert({ name: '', issuer: '', year: '' });
    }

    triggerSave(updated);
  };

  const handleRemoveField = (section: 'education' | 'projects' | 'certifications', id: string) => {
    const updated = { ...resume };
    if (section === 'education') {
      updated.education = updated.education.filter((e) => e.id !== id);
    } else if (section === 'projects') {
      updated.projects = updated.projects.filter((p) => p.id !== id);
    } else if (section === 'certifications') {
      updated.certifications = updated.certifications.filter((c) => c.id !== id);
    }
    triggerSave(updated);
  };

  const handleSaveTextLists = (field: 'skills' | 'achievements' | 'languages' | 'interests', inputString: string) => {
    const list = inputString
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
    const updated = {
      ...resume,
      [field]: list
    };
    triggerSave(updated);
  };

  const handlePrint = () => {
    window.print();
  };

  // Score calculation
  const completeness = DbService.calculateResumeCompleteness(resume);

  return (
    <div className="space-y-6">
      {/* Resume Builder Stats Header */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-2xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Placement Smart Resume Builder</h2>
              <p className="text-xs text-slate-400">Generate professional resumes with instant PDF capabilities</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 min-w-[200px]">
              <div className="flex justify-between items-center text-xs text-slate-400 font-mono mb-1">
                <span>COMPLETENESS:</span>
                <span className="font-bold text-blue-600">{completeness}%</span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${completeness}%` }} />
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-2xl text-xs hover:bg-blue-700 transition cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4" /> Export/Print Resume
            </button>
          </div>
        </div>
      </div>

      {/* Main layout split into: Editors on the left, Live Preview on the right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Form Inputs Component */}
        <div className="xl:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex border-b border-light-gray select-none overflow-x-auto pb-1 gap-1">
            {[
              { id: 'personal', name: 'Personal' },
              { id: 'education', name: 'Education' },
              { id: 'skills', name: 'Skills' },
              { id: 'projects', name: 'Projects' },
              { id: 'additional', name: 'More' }
            ].map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id as any)}
                className={`px-3 py-2 text-xs font-bold rounded-xl cursor-pointer transition whitespace-nowrap ${
                  activeSection === sec.id
                    ? 'bg-blue-50 text-blue-800'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {sec.name}
              </button>
            ))}
          </div>

          {/* Toast checkmark feedback on auto save */}
          {showSavedToast && (
            <div className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100/60 w-fit">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Saved successfully
            </div>
          )}

          {/* Tab 1: Personal info fields */}
          {activeSection === 'personal' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Your Complete Name</label>
                <input
                  type="text"
                  value={resume.personalInfo.fullName || user.fullName}
                  onChange={(e) => handlePersonalChange('fullName', e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Corporate Email</label>
                <input
                  type="email"
                  value={resume.personalInfo.email || user.email}
                  onChange={(e) => handlePersonalChange('email', e.target.value)}
                  placeholder="rahul@domain.com"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Phone Number</label>
                  <input
                    type="tel"
                    value={resume.personalInfo.phone}
                    onChange={(e) => handlePersonalChange('phone', e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Location State/City</label>
                  <input
                    type="text"
                    value={resume.personalInfo.location}
                    onChange={(e) => handlePersonalChange('location', e.target.value)}
                    placeholder="New Delhi, India"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">GitHub Profile URL</label>
                  <input
                    type="url"
                    value={resume.personalInfo.github}
                    onChange={(e) => handlePersonalChange('github', e.target.value)}
                    placeholder="github.com/username"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={resume.personalInfo.linkedin}
                    onChange={(e) => handlePersonalChange('linkedin', e.target.value)}
                    placeholder="linkedin.com/in/username"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Professional Summary</label>
                <textarea
                  rows={4}
                  value={resume.personalInfo.summary}
                  onChange={(e) => handlePersonalChange('summary', e.target.value)}
                  placeholder="Write a tiny 2-sentence summary outlining your core tech focus and placements target..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:border-blue-500 transition resize-none"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Education entries */}
          {activeSection === 'education' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-2xl text-xs text-blue-800">
                Add school details such as high school, intermediate, or college degree stats.
              </div>

              {resume.education.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold font-mono text-slate-400 uppercase">Current Entries:</span>
                  {resume.education.map((edu) => (
                    <div key={edu.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <strong className="block text-slate-800">{edu.institution}</strong>
                        <span className="text-slate-500 text-[11px]">{edu.degree} ({edu.year}) • {edu.cgpaOrPercentage}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveField('education', edu.id)}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                <span className="text-[10px] font-bold font-mono text-slate-500 uppercase block">Add School Entry</span>
                <input
                  type="text"
                  placeholder="Institution (e.g. NIT Trichy)"
                  value={newSchool.institution}
                  onChange={(e) => setNewSchool({ ...newSchool, institution: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                />
                <input
                  type="text"
                  placeholder="Degree (e.g. B.Tech Computer Science)"
                  value={newSchool.degree}
                  onChange={(e) => setNewSchool({ ...newSchool, degree: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Graduation Year (e.g. 2027)"
                    value={newSchool.year}
                    onChange={(e) => setNewSchool({ ...newSchool, year: e.target.value })}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                  />
                  <input
                    type="text"
                    placeholder="CGPA / % (e.g. 8.42)"
                    value={newSchool.cgpaOrPercentage}
                    onChange={(e) => setNewSchool({ ...newSchool, cgpaOrPercentage: e.target.value })}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleAddField('education')}
                  className="w-full py-2 bg-blue-50 border border-blue-200 text-blue-700 font-bold hover:bg-blue-100 transition rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Save Education Record
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Skills inputs */}
          {activeSection === 'skills' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Core Skills (separated by commas)</label>
                <textarea
                  rows={4}
                  value={skillInput}
                  onChange={(e) => {
                    setSkillInput(e.target.value);
                    handleSaveTextLists('skills', e.target.value);
                  }}
                  placeholder="e.g. Java, OOPs, React, Python, Data Structures, SQL, Git"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:border-blue-500 transition resize-none font-mono"
                />
              </div>

              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-[11px] text-blue-800 leading-relaxed">
                <strong>💡 Tip:</strong> Ensure you include language competencies (like Java, C++) alongside core engineering topics (Data Structures, DBMS, Operating Systems) to pass standard resume screening passes.
              </div>
            </div>
          )}

          {/* Tab 4: Projects checklist */}
          {activeSection === 'projects' && (
            <div className="space-y-4">
              {resume.projects.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold font-mono text-slate-400 uppercase">Current Projects:</span>
                  {resume.projects.map((proj) => (
                    <div key={proj.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <strong className="block text-slate-800">{proj.title}</strong>
                        <span className="text-slate-500 text-[11px]">{proj.techStack}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveField('projects', proj.id)}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                <span className="text-[10px] font-bold font-mono text-slate-500 uppercase block">Add Engineering Project</span>
                <input
                  type="text"
                  placeholder="Project Title (e.g. Hotel Management Web Portal)"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                />
                <input
                  type="text"
                  placeholder="Tech Stack Used (e.g. React, Spring Boot, MySQL)"
                  value={newProject.techStack}
                  onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                />
                <textarea
                  rows={2}
                  placeholder="Short Description of key achievements/outcomes"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none resize-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddField('projects')}
                  className="w-full py-2 bg-blue-50 border border-blue-200 text-blue-700 font-bold hover:bg-blue-100 transition rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Save Project Info
                </button>
              </div>
            </div>
          )}

          {/* Tab 5: Additional fields */}
          {activeSection === 'additional' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Achievements (separated by commas)</label>
                <input
                  type="text"
                  value={achievementInput}
                  onChange={(e) => {
                    setAchievementInput(e.target.value);
                    handleSaveTextLists('achievements', e.target.value);
                  }}
                  placeholder="e.g. Secured Rank 112 in Hackathon, Solved 500+ LeetCode problems"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Certifications (separated by commas or list)</label>
                {resume.certifications.length > 0 && (
                  <div className="space-y-1.5 mb-2">
                    {resume.certifications.map((c) => (
                      <div key={c.id} className="p-2 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-[11px]">
                        <span>{c.name} ({c.issuer})</span>
                        <button
                          onClick={() => handleRemoveField('certifications', c.id)}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Java Gold certified (GitHub)"
                    value={newCert.name}
                    onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Oracle"
                    value={newCert.issuer}
                    onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                    className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddField('certifications')}
                    className="px-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Languages</label>
                  <input
                    type="text"
                    value={languageInput}
                    onChange={(e) => {
                      setLanguageInput(e.target.value);
                      handleSaveTextLists('languages', e.target.value);
                    }}
                    placeholder="English, Hindi"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Interests</label>
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(e) => {
                      setInterestInput(e.target.value);
                      handleSaveTextLists('interests', e.target.value);
                    }}
                    placeholder="Coding contest, chess"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Resume Preview Component */}
        <div className="xl:col-span-7 space-y-4">
          <div className="flex justify-between items-center select-none bg-slate-900 text-white rounded-2xl px-4 py-2.5">
            <span className="text-xs font-bold font-mono tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-blue-400" /> Live Resume Template Preview
            </span>
            
            <div className="flex gap-1.5">
              {[
                { id: 'professional', name: 'Professional' },
                { id: 'fresher', name: 'Fresher' },
                { id: 'ats', name: 'ATS Friendly' }
              ].map((temp) => (
                <button
                  key={temp.id}
                  onClick={() => setSelectedTemplate(temp.id as any)}
                  className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-extrabold rounded-lg cursor-pointer transition ${
                    selectedTemplate === temp.id ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {temp.name}
                </button>
              ))}
            </div>
          </div>

          {/* Render styled resume paper sheet based on selected Template style */}
          <div id="printable-resume-sheet" className="bg-white border border-slate-200 p-8 shadow-sm rounded-3xl min-h-[750px] font-sans text-slate-800 space-y-6">
            
            {/* Header section based on chosen template layout */}
            {selectedTemplate === 'professional' && (
              <div className="border-b-2 border-slate-800 pb-4 text-left">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                  {resume.personalInfo.fullName || user.fullName}
                </h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[11px] text-slate-500 font-mono">
                  <span>{resume.personalInfo.email || user.email}</span>
                  {resume.personalInfo.phone && <span>• {resume.personalInfo.phone}</span>}
                  {resume.personalInfo.location && <span>• {resume.personalInfo.location}</span>}
                  {resume.personalInfo.github && <span className="underline">{resume.personalInfo.github}</span>}
                  {resume.personalInfo.linkedin && <span className="underline">{resume.personalInfo.linkedin}</span>}
                </div>
              </div>
            )}

            {selectedTemplate === 'fresher' && (
              <div className="text-center pb-4 border-b border-dashed border-slate-300">
                <h1 className="text-3xl font-extrabold text-indigo-900 uppercase">
                  {resume.personalInfo.fullName || user.fullName}
                </h1>
                <div className="flex justify-center flex-wrap gap-x-5 gap-y-1 mt-2 text-[11px] text-slate-600 font-mono">
                  <span>Email: {resume.personalInfo.email || user.email}</span>
                  {resume.personalInfo.phone && <span>| Mob: {resume.personalInfo.phone}</span>}
                  {resume.personalInfo.location && <span>| {resume.personalInfo.location}</span>}
                </div>
                <div className="flex justify-center gap-4 mt-1 text-[11px] text-indigo-600 underline font-mono">
                  {resume.personalInfo.github && <span>{resume.personalInfo.github}</span>}
                  {resume.personalInfo.linkedin && <span>{resume.personalInfo.linkedin}</span>}
                </div>
              </div>
            )}

            {selectedTemplate === 'ats' && (
              <div className="pb-3 border-b-4 border-black text-left">
                <h1 className="text-2xl font-bold tracking-normal text-black font-serif uppercase">
                  {resume.personalInfo.fullName || user.fullName}
                </h1>
                <p className="text-[11px] font-mono text-black mt-1 leading-normal">
                  {resume.personalInfo.email || user.email} | {resume.personalInfo.phone || '+91-XXXXXXXXXX'} | {resume.personalInfo.location || 'India'}
                </p>
                <p className="text-[10px] font-mono text-slate-700 mt-0.5">
                  GitHub: {resume.personalInfo.github || 'N/A'} | LinkedIn: {resume.personalInfo.linkedin || 'N/A'}
                </p>
              </div>
            )}

            {/* Summary */}
            {resume.personalInfo.summary && (
              <div className="space-y-1.5">
                <h3 className="text-xs uppercase font-black font-sans tracking-widest text-slate-900">
                  Professional Objective / Summary
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  {resume.personalInfo.summary}
                </p>
              </div>
            )}

            {/* Education rendering */}
            <div className="space-y-2">
              <h3 className="text-xs uppercase font-black font-sans tracking-widest text-slate-900 border-b border-light-gray pb-1">
                Educational Background
              </h3>
              
              {resume.education.length === 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-800">
                    <span>Engineering College / University</span>
                    <span>2023 - 2027</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>{user.branch} • Semester {user.semester}</span>
                    <span>CGPA: {user.currentCGPA.toFixed(2)} / 10.0</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {resume.education.map((edu) => (
                    <div key={edu.id} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-800">
                        <span>{edu.institution}</span>
                        <span className="font-mono">{edu.year}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>{edu.degree}</span>
                        <span className="font-mono font-bold">Score: {edu.cgpaOrPercentage}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Core skills */}
            <div className="space-y-2">
              <h3 className="text-xs uppercase font-black font-sans tracking-widest text-slate-900 border-b border-light-gray pb-1">
                Skills & Technical Competencies
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-mono">
                {resume.skills && resume.skills.length > 0 ? resume.skills.join(', ') : 'Java, C++, Data structures, OOP, DBMS, Operating Systems'}
              </p>
            </div>

            {/* Engineering Projects */}
            <div className="space-y-2">
              <h3 className="text-xs uppercase font-black font-sans tracking-widest text-slate-900 border-b border-light-gray pb-1">
                Academic & Personal Projects
              </h3>

              {resume.projects.length === 0 ? (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>Placify Tool (This App)</span>
                    <span className="font-mono">Kotlin / Android SDK</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    A fully fledged student placement utility tracking CGPA predictions, eligibility metrics, dynamic countdowns, and automated resume styling modules.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {resume.projects.map((proj) => (
                    <div key={proj.id} className="space-y-1 select-text">
                      <div className="flex justify-between text-xs font-bold text-slate-800">
                        <span>{proj.title}</span>
                        <span className="font-mono bg-slate-50 px-2 py-0.5 rounded text-[10px] border border-slate-100">{proj.techStack}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {proj.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Achievements, languages, interests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Left Column: Achievements & certifications */}
              <div className="space-y-2">
                <h3 className="text-xs uppercase font-black font-sans tracking-widest text-slate-900 border-b border-slate-100 pb-1">
                  Key Achievements
                </h3>
                <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-1 pl-1">
                  {resume.achievements && resume.achievements.length > 0 ? (
                    resume.achievements.map((item, idx) => <li key={idx}>{item}</li>)
                  ) : (
                    <>
                      <li>Solved 350+ algorithms across CodeChef and LeetCode</li>
                      <li>Secured top 2% rank in collegiate coding Olympiads</li>
                    </>
                  )}
                </ul>

                {resume.certifications && resume.certifications.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <h4 className="text-[10px] uppercase font-bold text-slate-800">Certificates:</h4>
                    <ul className="list-disc list-inside text-[10px] text-slate-500 space-y-1 pl-1">
                      {resume.certifications.map((c) => <li key={c.id}>{c.name} - Issued by {c.issuer}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Column: languages & interests */}
              <div className="space-y-2">
                <h3 className="text-xs uppercase font-black font-sans tracking-widest text-slate-900 border-b border-slate-100 pb-1">
                  Personal Details
                </h3>
                <div className="text-[11px] text-slate-600 space-y-1 pl-1">
                  <p><strong>Languages:</strong> {resume.languages && resume.languages.length > 0 ? resume.languages.join(', ') : 'English, Hindi'}</p>
                  <p><strong>Interests:</strong> {resume.interests && resume.interests.length > 0 ? resume.interests.join(', ') : 'Competitive coding, Chess, Robotics'}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
