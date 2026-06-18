import React, { useState } from 'react';
import { UserProfile, NoteItem } from '../types';
import { DbService } from '../services/db';
import { StickyNote, Search, Trash2, Edit3, PlusCircle, Check, X, Tag } from 'lucide-react';

interface NotesManagerProps {
  user: UserProfile;
}

export default function NotesManager({ user }: NotesManagerProps) {
  const [notes, setNotes] = useState<NoteItem[]>(() => DbService.getNotes(user.uid));
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create / Edit Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    category: 'DSA Notes' as NoteItem['category']
  });

  const categories: Array<NoteItem['category']> = [
    'DSA Notes',
    'Aptitude Notes',
    'Interview Notes',
    'Resume Notes'
  ];

  // Search and filter notes
  const filteredNotes = notes.filter((n) => {
    const matchesCategory = selectedCategory === 'All' || n.category === selectedCategory;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // CRUD Operations
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.title.trim() || !noteForm.content.trim()) return;

    const targetId = editingId || 'note_' + Math.random().toString(36).substr(2, 9);
    
    const updated = DbService.addOrUpdateNote(user.uid, {
      id: targetId,
      title: noteForm.title.trim(),
      content: noteForm.content.trim(),
      category: noteForm.category
    });

    setNotes(updated);
    resetForm();
  };

  const handleEditInit = (note: NoteItem) => {
    setIsEditing(true);
    setEditingId(note.id);
    setNoteForm({
      title: note.title,
      content: note.content,
      category: note.category
    });
  };

  const handleDeleteNote = (id: string) => {
    if (confirm('Are you sure you want to delete this placement note?')) {
      const updated = DbService.deleteNote(user.uid, id);
      setNotes(updated);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setNoteForm({ title: '', content: '', category: 'DSA Notes' });
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 text-blue-600 rounded-2xl">
            <StickyNote className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Placement Study Scratchpad</h2>
            <p className="text-xs text-slate-400">Jot down critical interview triggers, formulas, coding templates, and recruiter questions</p>
          </div>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-2xl text-xs hover:bg-blue-700 transition cursor-pointer shadow-md select-none"
          >
            <PlusCircle className="w-4 h-4" /> Create Placement Note
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Note Form panel */}
        {isEditing && (
          <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm h-fit">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-light-gray">
              <h3 className="text-xs uppercase font-bold font-mono tracking-wider text-slate-500">
                {editingId ? 'Edit Study Note' : 'New Study Note'}
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Note Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Quick-Sort Complexity Pivot"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Specific category</label>
                <select
                  value={noteForm.category}
                  onChange={(e) => setNoteForm({ ...noteForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Note details / Code blocks</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Paste details, equations, or C++/Java templates..."
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 font-sans resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2 select-none">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 transition rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1"
                >
                  <Check className="w-4 h-4" /> Save Note
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notes listings */}
        <div className={`${isEditing ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-4`}>
          {/* Categorized and text query search controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 select-none">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search study scratchpad..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 shadow-xs"
              />
            </div>

            {/* Filter chips */}
            <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0">
              {['All', ...categories].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'All' ? 'All Notes' : cat.replace(' Notes', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Notes display grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.length === 0 ? (
              <div className="col-span-full p-12 border border-dashed border-slate-200 bg-white rounded-3xl text-center text-slate-400 text-xs">
                Your study scratchpad is empty. Create your first preparation notes!
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-200 transition"
                >
                  <div className="space-y-2 select-text">
                    <div className="flex justify-between items-start gap-2">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-mono font-black uppercase rounded border border-blue-100 flex items-center gap-1 shrink-0 select-none">
                        <Tag className="w-2.5 h-2.5" /> {note.category.replace(' Notes', '')}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono font-bold select-none">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-850 leading-tight">
                      {note.title}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line truncate max-h-[120px]">
                      {note.content}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end gap-1.5 select-none shrink-0">
                    <button
                      onClick={() => handleEditInit(note)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition flex items-center gap-1.5 text-[10px] font-bold"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1.5 text-slate-450 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition flex items-center gap-1.5 text-[10px] font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
