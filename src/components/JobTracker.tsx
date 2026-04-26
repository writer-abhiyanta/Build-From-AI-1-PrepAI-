import { useState, useEffect } from 'react';
import { Plus, MoreVertical, Calendar, Building2, MapPin, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';

interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  status: 'applied' | 'interviewing' | 'offered' | 'rejected';
  date: string;
  userId: string;
}

export function JobTracker() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newApp, setNewApp] = useState({ company: '', role: '', location: '', status: 'applied' as const });

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(collection(db, 'applications'), where('userId', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobApplication));
      setApplications(apps);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'applications');
    });

    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      await addDoc(collection(db, 'applications'), {
        ...newApp,
        userId: auth.currentUser.uid,
        date: new Date().toISOString().split('T')[0]
      });
      setIsAdding(false);
      setNewApp({ company: '', role: '', location: '', status: 'applied' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'applications');
    }
  };

  const updateStatus = async (id: string, status: JobApplication['status']) => {
    try {
      await updateDoc(doc(db, 'applications', id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `applications/${id}`);
    }
  };

  const deleteApp = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'applications', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `applications/${id}`);
    }
  };

  const columns: { id: JobApplication['status']; label: string; icon: any; color: string }[] = [
    { id: 'applied', label: 'Applied', icon: Clock, color: 'text-blue-600 bg-blue-50' },
    { id: 'interviewing', label: 'Interviewing', icon: AlertCircle, color: 'text-amber-600 bg-amber-50' },
    { id: 'offered', label: 'Offered', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'rejected', label: 'Rejected', icon: Trash2, color: 'text-red-600 bg-red-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Placement Tracker</h2>
          <p className="text-gray-500">Manage and track your job applications in real-time.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-5 h-5" /> Add Application
        </button>
      </header>

      {isAdding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold mb-6">New Application</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Company Name</label>
                <input 
                  required
                  value={newApp.company}
                  onChange={e => setNewApp({...newApp, company: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Google"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Job Role</label>
                <input 
                  required
                  value={newApp.role}
                  onChange={e => setNewApp({...newApp, role: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Software Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                <input 
                  required
                  value={newApp.location}
                  onChange={e => setNewApp({...newApp, location: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Remote / New York"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map(col => (
          <div key={col.id} className="space-y-4">
            <div className={`flex items-center justify-between p-4 rounded-2xl ${col.color} border border-current/10`}>
              <div className="flex items-center gap-2">
                <col.icon className="w-5 h-5" />
                <span className="font-bold uppercase tracking-wider text-xs">{col.label}</span>
              </div>
              <span className="bg-white/50 px-2 py-0.5 rounded-lg text-xs font-black">
                {applications.filter(a => a.status === col.id).length}
              </span>
            </div>

            <div className="space-y-4">
              {applications.filter(a => a.status === col.id).map(app => (
                <div key={app.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{app.role}</h4>
                      <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                        <Building2 className="w-3 h-3" /> {app.company}
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteApp(app.id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <MapPin className="w-3 h-3" /> {app.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" /> {app.date}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-50">
                    {columns.filter(c => c.id !== app.status).map(c => (
                      <button
                        key={c.id}
                        onClick={() => updateStatus(app.id, c.id)}
                        className="flex-1 py-1.5 rounded-lg text-[10px] font-bold border border-gray-100 hover:bg-gray-50 transition-all text-gray-400 hover:text-emerald-600"
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
