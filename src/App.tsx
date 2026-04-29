import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Home } from './components/Home';
import { InterviewPractice } from './components/InterviewPractice';
import { ResumeAnalyzer } from './components/ResumeAnalyzer';
import { ResumeBuilder } from './components/ResumeBuilder';
import { ProjectBuilder } from './components/ProjectBuilder';
import { Report } from './components/Report';
import { GeminiChat } from './components/GeminiChat';
import { StoryVault } from './components/StoryVault';
import { SkillGapAnalyzer } from './components/SkillGapAnalyzer';
import { CareerTools } from './components/CareerTools';
import { JobTracker } from './components/JobTracker';
import { ErrorBoundary } from './components/ErrorBoundary';
import { auth, db, signInWithGoogle, logout } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { LogIn, Loader2, Briefcase, Sparkles, ShieldCheck, Zap, Globe } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let unsubDoc: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      
      // Clean up previous snapshot listener if it exists
      if (unsubDoc) {
        unsubDoc();
        unsubDoc = undefined;
      }

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        unsubDoc = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setRole(doc.data().role);
            setSubscriptionStatus(doc.data().subscriptionStatus || 'inactive');
          } else {
            setRole('student');
            setSubscriptionStatus('inactive');
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user role:", error);
          setRole('student'); // Fallback on error
          setSubscriptionStatus('inactive');
          setLoading(false);
        });
      } else {
        setRole(null);
        setSubscriptionStatus(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubDoc) unsubDoc();
    };
  }, []);

  const handleSignIn = async (preferredRole: 'student' | 'employee' | 'mentor' | 'admin' = 'student') => {
    if (isSigningIn) return;
    
    setIsSigningIn(true);
    setAuthError(null);
    
    try {
      await signInWithGoogle(preferredRole);
    } catch (error: any) {
      console.error("Sign in error:", error);
      setAuthError(error.message || "An unexpected error occurred during sign in.");
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-emerald-50">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mb-4" />
        <p className="text-emerald-800 font-medium animate-pulse">Initializing PrepAI...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-emerald-50 flex flex-col md:flex-row">
        {/* Left Side - Branding & Info */}
        <div className="flex-1 bg-emerald-900 p-12 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-emerald-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-400/20">
                <Briefcase className="w-7 h-7 text-emerald-950" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter">PrepAI</h1>
            </div>
            
            <div className="max-w-lg">
              <h2 className="text-5xl font-extrabold mb-8 leading-tight">
                The future of <span className="text-emerald-400 underline decoration-emerald-400/30 underline-offset-8">career prep</span> is here.
              </h2>
              <p className="text-emerald-100/80 text-xl leading-relaxed mb-12">
                Join thousands of students using AI to master interviews, build perfect resumes, and launch successful engineering careers.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-800/50 flex items-center justify-center shrink-0 border border-emerald-700/50">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">AI Interview Coach</h4>
                    <p className="text-emerald-200/60">Real-time feedback on your speaking and content.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-800/50 flex items-center justify-center shrink-0 border border-emerald-700/50">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">ATS-Optimized Resumes</h4>
                    <p className="text-emerald-200/60">Pass the filters with AI-crafted professional documents.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 pt-12 border-t border-emerald-800/50 flex items-center gap-8 text-emerald-400/60 text-sm font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2"><Globe className="w-4 h-4" /> Global Access</div>
            <div className="flex items-center gap-2"><Zap className="w-4 h-4" /> Instant Feedback</div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-[450px] bg-white p-12 flex flex-col justify-center items-center">
          <div className="w-full max-w-sm text-center">
            <h3 className="text-3xl font-black text-gray-900 mb-2">Welcome Back</h3>
            <p className="text-gray-500 mb-10">Sign in to continue your journey</p>
            
            <div className="space-y-4">
              <button 
                onClick={() => handleSignIn('student')}
                disabled={isSigningIn}
                className="w-full flex items-center justify-center gap-4 bg-white border-2 border-emerald-100 py-4 rounded-2xl font-bold text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigningIn ? (
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                ) : (
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                )}
                {isSigningIn ? 'Signing in...' : 'Login as Student'}
              </button>

              <button 
                onClick={() => handleSignIn('employee')}
                disabled={isSigningIn}
                className="w-full flex items-center justify-center gap-4 bg-white border-2 border-teal-100 py-4 rounded-2xl font-bold text-gray-700 hover:bg-teal-50 hover:border-teal-300 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigningIn ? (
                  <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                ) : (
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                )}
                {isSigningIn ? 'Signing in...' : 'Login as Employee'}
              </button>

              <button 
                onClick={() => handleSignIn('mentor')}
                disabled={isSigningIn}
                className="w-full relative overflow-hidden flex items-center justify-center gap-4 bg-gradient-to-r from-emerald-600 to-teal-600 border-2 border-transparent py-4 rounded-2xl font-bold text-white hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                <style>{`
                  @keyframes shimmer {
                    100% { transform: translateX(100%); }
                  }
                `}</style>
                {isSigningIn ? (
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                ) : (
                  <div className="bg-white p-1 rounded-full bg-opacity-90">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 block" />
                  </div>
                )}
                <span className="relative z-10">{isSigningIn ? 'Signing in...' : 'Login as Mentor'}</span>
              </button>

              <button 
                onClick={() => handleSignIn('admin')}
                disabled={isSigningIn}
                className="w-full flex items-center justify-center gap-4 bg-white border-2 border-slate-200 py-4 rounded-2xl font-bold text-gray-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigningIn ? (
                  <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
                ) : (
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                )}
                {isSigningIn ? 'Signing in...' : 'Login as Admin'}
              </button>
            </div>

            {authError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex flex-col gap-2">
                <p>{authError}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="text-xs underline hover:text-red-800 transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            )}
            
            <p className="text-xs text-gray-400 px-8">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user?.email === 'engineeringstudies5@gmail.com';

  const navItemRoles: Record<string, string[]> = {
    home: ['student', 'mentor', 'admin', 'employee'],
    chat: ['student', 'mentor', 'admin'],
    skillgap: ['student', 'mentor', 'admin', 'employee'],
    stories: ['student', 'mentor', 'admin', 'employee'],
    interview: ['student', 'employee', 'admin'],
    tracker: ['student', 'admin', 'employee'],
    analyzer: ['student', 'mentor', 'admin', 'employee'],
    builder: ['student', 'employee', 'admin'],
    project: ['student', 'employee', 'admin'],
    tools: ['student', 'employee', 'admin'],
    report: ['admin', 'mentor']
  };

  const roleValue = role || 'student';
  const currentTabAllowed = navItemRoles[activeTab]?.includes(roleValue);

  if (!currentTabAllowed) {
    return (
      <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} role={role} />
        <main className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center">
          <div className="text-center p-12 bg-white rounded-3xl border border-red-100 shadow-sm max-w-lg">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-500 mb-8">You don't have permission to view this section with your current role ({roleValue}).</p>
            <button 
              onClick={() => setActiveTab('home')}
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition"
            >
              Return Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} role={role} />
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'home' && <Home setActiveTab={setActiveTab} role={role} />}
          {activeTab === 'chat' && <GeminiChat />}
          {activeTab === 'skillgap' && <SkillGapAnalyzer />}
          {activeTab === 'stories' && <StoryVault />}
          {activeTab === 'interview' && <InterviewPractice />}
          {activeTab === 'tracker' && <JobTracker />}
          {activeTab === 'analyzer' && <ResumeAnalyzer />}
          {activeTab === 'builder' && <ResumeBuilder />}
          {activeTab === 'project' && <ProjectBuilder />}
          {activeTab === 'tools' && <CareerTools />}
          {activeTab === 'report' && <Report />}
        </main>
      </div>
    </ErrorBoundary>
  );
}
