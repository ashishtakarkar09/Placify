import React, { useState } from 'react';
import { UserProfile } from '../types';
import { DbService } from '../services/db';
import { User, Shield, GraduationCap, Lock, Mail, Save, LogOut, CheckCircle2 } from 'lucide-react';

interface ProfilePageProps {
  user: UserProfile;
  onLogout: () => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

export default function ProfilePage({ user, onLogout, onUpdateUser }: ProfilePageProps) {
  const [profileForm, setProfileForm] = useState({
    fullName: user.fullName,
    email: user.email,
    branch: user.branch,
    semester: user.semester,
    currentCGPA: user.currentCGPA,
    activeBacklogs: user.activeBacklogs || 0
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const branches = [
    'Computer Science',
    'Information Technology',
    'Electronics & Communication',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Other'
  ];

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const { fullName, semester, currentCGPA, activeBacklogs } = profileForm;

    if (!fullName.trim()) {
      setMessage({ text: 'Full Name is required.', type: 'error' });
      return;
    }

    if (semester < 1 || semester > 8) {
      setMessage({ text: 'Semester must be between 1 and 8.', type: 'error' });
      return;
    }

    const cgpaNum = Number(currentCGPA);
    if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
      setMessage({ text: 'CGPA must be a valid number between 0.00 and 10.00.', type: 'error' });
      return;
    }

    const backlogsNum = Number(activeBacklogs);
    if (isNaN(backlogsNum) || backlogsNum < 0) {
      setMessage({ text: 'Backlogs count cannot be negative.', type: 'error' });
      return;
    }

    const updatedUser: UserProfile = {
      ...user,
      ...profileForm,
      currentCGPA: cgpaNum,
      activeBacklogs: backlogsNum
    };

    DbService.saveUser(updatedUser);
    onUpdateUser(updatedUser);
    setMessage({ text: 'Your collegiate profile has been refreshed in our database.', type: 'success' });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    const { currentPassword, newPassword, confirmNewPassword } = passwordForm;

    if (!currentPassword) {
      setPasswordMessage({ text: 'Please type your current password.', type: 'error' });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({ text: 'The new password must exceed 8 characters in length.', type: 'error' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage({ text: 'Constructed new passwords do not match.', type: 'error' });
      return;
    }

    setPasswordMessage({ text: 'Password has been synchronized successfully.', type: 'success' });
    setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Visual Identity Left Card */}
      <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center justify-between">
        <div className="space-y-4 w-full">
          <div className="relative w-24 h-24 mx-auto select-none">
            <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg text-white">
              <User className="w-12 h-12" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">{user.fullName}</h3>
            <span className="text-xs text-slate-400 block font-mono">{user.email}</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-2 text-left font-mono">
            <div className="flex justify-between">
              <span>Branch:</span>
              <strong className="text-slate-800 truncate max-w-[150px]">{user.branch}</strong>
            </div>
            <div className="flex justify-between">
              <span>Semester:</span>
              <strong className="text-slate-800">Sem {user.semester}</strong>
            </div>
            <div className="flex justify-between">
              <span>Current CGPA:</span>
              <strong className="text-blue-600">{user.currentCGPA.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full mt-8 py-3 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-700 font-bold rounded-2xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          <LogOut className="w-4 h-4" /> Sign Out from Student Space
        </button>
      </div>

      {/* Main Edit Profiles */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Profile Update Panel */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5 border-b border-light-gray pb-3 select-none">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm uppercase font-bold font-mono tracking-wider text-slate-500">
              Collegiate Information
            </h3>
          </div>

          {message && (
            <div className={`p-4 mb-4 rounded-xl text-xs flex gap-1.5 font-semibold ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Your Complete Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1 col-span-1">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Engineering Branch</label>
                <select
                  value={profileForm.branch}
                  onChange={(e) => setProfileForm({ ...profileForm, branch: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 font-mono"
                >
                  {branches.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Active Semester</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  required
                  value={profileForm.semester}
                  onChange={(e) => setProfileForm({ ...profileForm, semester: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 text-center font-bold"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Current CGPA (0-10)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  required
                  value={profileForm.currentCGPA}
                  onChange={(e) => setProfileForm({ ...profileForm, currentCGPA: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 text-center font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Active backlog counts</label>
              <input
                type="number"
                min={0}
                required
                value={profileForm.activeBacklogs}
                onChange={(e) => setProfileForm({ ...profileForm, activeBacklogs: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 text-white font-bold hover:bg-blue-700 transition rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1 select-none"
            >
              <Save className="w-4 h-4" /> Save Profiles Update
            </button>
          </form>
        </div>

        {/* Change Passwords settings */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5 border-b border-light-gray pb-3 select-none">
            <Lock className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm uppercase font-bold font-mono tracking-wider text-slate-500">
              Credential Synchronization
            </h3>
          </div>

          {passwordMessage && (
            <div className={`p-4 mb-4 rounded-xl text-xs flex gap-1.5 font-semibold ${
              passwordMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{passwordMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Existing Password</label>
                <input
                  type="password"
                  required
                  placeholder="Type current key"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Proposed Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min. 8 chars"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Retype Proposed</label>
                <input
                  type="password"
                  required
                  placeholder="Repeat new key"
                  value={passwordForm.confirmNewPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1 select-none"
            >
              <Lock className="w-4 h-4" /> Sync New Password
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
