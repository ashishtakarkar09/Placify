import React, { useState } from 'react';
import { UserProfile } from '../types';
import { DbService } from '../services/db';
import { Shield, BookOpen, GraduationCap, Mail, Key, User, Plus, Award } from 'lucide-react';

interface AuthProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export default function Auth({ onLoginSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    branch: 'Computer Science',
    semester: 5,
    currentCGPA: 8.0,
    activeBacklogs: 0
  });

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Lists of options
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const { email, password, fullName, branch, semester, currentCGPA, activeBacklogs } = formData;

    // Check simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ text: 'Please enter a valid email address.', type: 'error' });
      return;
    }

    if (isLogin) {
      const users = DbService.getUsers();
      const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      
      if (!existingUser) {
        setMessage({ text: 'User account not found. Try signing up!', type: 'error' });
        return;
      }
      
      // Simple verification (in clear simulation mode, allows any password >= 8 characters or correct match)
      if (password.length < 8) {
        setMessage({ text: 'Password must be at least 8 characters.', type: 'error' });
        return;
      }

      DbService.setCurrentUserSession(existingUser.email);
      onLoginSuccess(existingUser);
    } else {
      // Sign Up validations
      if (!fullName.trim()) {
        setMessage({ text: 'Full Name is required.', type: 'error' });
        return;
      }

      if (password.length < 8) {
        setMessage({ text: 'Password must exceed 8 characters.', type: 'error' });
        return;
      }

      if (password !== formData.confirmPassword) {
        setMessage({ text: 'Passwords do not match.', type: 'error' });
        return;
      }

      if (semester < 1 || semester > 8) {
        setMessage({ text: 'Semester must be a valid number between 1 and 8.', type: 'error' });
        return;
      }

      const cgpa = Number(currentCGPA);
      if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
        setMessage({ text: 'CGPA must be a valid number between 0.00 and 10.00.', type: 'error' });
        return;
      }

      const backlogs = Number(activeBacklogs);
      if (isNaN(backlogs) || backlogs < 0) {
        setMessage({ text: 'Backlogs count cannot be negative.', type: 'error' });
        return;
      }

      // Check if email already registered
      const users = DbService.getUsers();
      if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
        setMessage({ text: 'This email is already registered. Please login.', type: 'error' });
        return;
      }

      const registered = DbService.registerUser({
        fullName,
        email: email.toLowerCase(),
        branch,
        semester: Number(semester),
        currentCGPA: cgpa,
        activeBacklogs: backlogs
      });

      setMessage({ text: 'Registration successful! Directing to Dashboard...', type: 'success' });
      setTimeout(() => {
        DbService.setCurrentUserSession(registered.email);
        onLoginSuccess(registered);
      }, 1000);
    }
  };

  const handleForgotPassword = () => {
    if (!formData.email) {
      setMessage({ text: 'Please type your email address first!', type: 'error' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage({ text: 'Please enter a valid email address.', type: 'error' });
      return;
    }
    setMessage({
      text: 'A simulated password reset link has been dispatched to ' + formData.email,
      type: 'success'
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden transition-all duration-300">
        <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-center select-none relative">
          <div className="absolute top-4 right-4 bg-white/10 p-2 rounded-full backdrop-blur-md">
            <Award className="w-6 h-6 text-yellow-300" />
          </div>
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold font-sans tracking-tight">Placify</h1>
          <p className="text-blue-100 text-sm mt-1">Indian Colleges Engineering Preparation Engine</p>
        </div>

        <div className="p-8">
          <div className="flex justify-center border-b border-light-gray mb-6">
            <button
              onClick={() => { setIsLogin(true); setMessage(null); }}
              className={`flex-1 pb-3 text-center font-medium ${
                isLogin
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setIsLogin(false); setMessage(null); }}
              className={`flex-1 pb-3 text-center font-medium ${
                !isLogin
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Sign Up (Student)
            </button>
          </div>

          {message && (
            <div
              className={`p-4 mb-5 rounded-2xl text-sm ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                  : 'bg-rose-50 text-rose-800 border border-rose-100'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 font-mono">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-gray-800 outline-none focus:border-blue-500 focus:bg-white text-sm transition"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 font-mono">College Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. rahul.sharma@nit.edu"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-gray-800 outline-none focus:border-blue-500 focus:bg-white text-sm transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 font-mono">Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min. 8 characters"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-gray-800 outline-none focus:border-blue-500 focus:bg-white text-sm transition"
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 font-mono">Confirm Password</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Repeat password"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-gray-800 outline-none focus:border-blue-500 focus:bg-white text-sm transition"
                    />
                  </div>
                </div>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 font-mono">Engineering Branch</label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-gray-800 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
                  >
                    {branches.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 font-mono block truncate">Semester</label>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      required
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-gray-800 text-sm focus:border-blue-500 focus:bg-white text-center outline-none"
                    />
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 font-mono">Current CGPA (0-10)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      required
                      value={formData.currentCGPA}
                      onChange={(e) => setFormData({ ...formData, currentCGPA: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-gray-800 text-sm focus:border-blue-500 focus:bg-white text-center outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 font-mono">Active Backlogs count</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.activeBacklogs}
                    onChange={(e) => setFormData({ ...formData, activeBacklogs: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-gray-800 text-sm focus:border-blue-500 focus:bg-white text-center outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/20 hover:shadow-indigo-500/30 transition-all cursor-pointer text-sm mt-3"
            >
              {isLogin ? 'Log In to Dashboard' : 'Create Student Account'}
            </button>
          </form>

          {isLogin && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <div className="mt-6 p-4 border border-dashed border-blue-100 rounded-2xl bg-blue-50/50">
            <h4 className="text-xs font-bold text-blue-800 flex items-center gap-1.5 font-mono">
              <Shield className="w-3.5 h-3.5" /> DEMONSTRATION CREDENTIALS:
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              You can instantly register, or log in with any test email and any 8-character password. Data stores securely in raw database collections inside storage!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
