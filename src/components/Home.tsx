import { ArrowRight, MessageSquare, FileText, Briefcase, Code, Sparkles, Kanban, MessageCircle, Star, Compass } from 'lucide-react';

interface HomeProps {
  setActiveTab: (tab: string) => void;
  role: string | null;
}

export function Home({ setActiveTab, role }: HomeProps) {
  const allFeatures = [
    {
      id: 'chat',
      title: 'AI Mentor',
      description: 'Get high-level career strategy and leadership development from your AI mentor.',
      icon: MessageCircle,
      color: 'bg-purple-500',
      shadow: 'shadow-purple-500/30',
      roles: ['student', 'mentor', 'admin']
    },
    {
      id: 'interview',
      title: 'Interview Practice',
      description: 'Practice your interview skills with our AI interviewer. Get real-time feedback and tips.',
      icon: MessageSquare,
      color: 'bg-pink-500',
      shadow: 'shadow-pink-500/30',
      roles: ['student', 'employee', 'admin']
    },
    {
      id: 'tracker',
      title: 'Placement Tracker',
      description: 'Manage and track your job applications, interviews, and offers in one place.',
      icon: Kanban,
      color: 'bg-green-500',
      shadow: 'shadow-green-500/30',
      roles: ['student', 'admin', 'employee']
    },
    {
      id: 'analyzer',
      title: 'Resume Analyzer',
      description: 'Upload your resume and get AI-suggested job roles tailored to your experience.',
      icon: FileText,
      color: 'bg-emerald-500',
      shadow: 'shadow-emerald-500/30',
      roles: ['student', 'mentor', 'admin', 'employee']
    },
    {
      id: 'builder',
      title: 'Resume Builder',
      description: 'Create an ATS-friendly resume from scratch with AI assistance.',
      icon: Briefcase,
      color: 'bg-green-500',
      shadow: 'shadow-green-500/30',
      roles: ['student', 'employee', 'admin']
    },
    {
      id: 'project',
      title: 'Project Builder',
      description: 'Get tech stack recommendations and learning paths for your project ideas.',
      icon: Code,
      color: 'bg-lime-500',
      shadow: 'shadow-lime-500/30',
      roles: ['student', 'employee', 'admin']
    },
    {
      id: 'skillgap',
      title: 'Skill Gap Analyzer',
      description: 'Find missing skills for your dream role and get a custom learning roadmap.',
      icon: Compass,
      color: 'bg-rose-500',
      shadow: 'shadow-rose-500/30',
      roles: ['student', 'mentor', 'admin', 'employee']
    },
    {
      id: 'stories',
      title: 'STAR Story Vault',
      description: 'Craft and analyze your behavioral interview stories using the STAR method.',
      icon: Star,
      color: 'bg-amber-500',
      shadow: 'shadow-amber-500/30',
      roles: ['student', 'mentor', 'admin', 'employee']
    },
    {
      id: 'tools',
      title: 'Career Suite',
      description: 'Master networking with AI outreach and practice salary negotiations.',
      icon: Sparkles,
      color: 'bg-emerald-600',
      shadow: 'shadow-emerald-600/30',
      roles: ['student', 'employee', 'admin']
    },
    {
      id: 'report',
      title: 'Software Workflow',
      description: 'View platform usage and user reports.',
      icon: FileText,
      color: 'bg-green-500',
      shadow: 'shadow-green-500/30',
      roles: ['admin', 'mentor']
    },
  ];

  const features = allFeatures.filter(f => !role || f.roles.includes(role));

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12">
      {/* Hero Section */}
      <div className="bg-emerald-900 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row items-center shadow-2xl relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        
        <div className="p-10 md:p-16 flex-1 text-white relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-800/50 text-emerald-200 text-sm font-bold mb-8 border border-emerald-700/50 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Career Growth</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-[1.1] tracking-tight">
            Land your dream job with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">PrepAI</span>
          </h1>
          <p className="text-emerald-100/90 text-lg md:text-xl mb-10 max-w-lg leading-relaxed font-medium">
            Master interviews, optimize your resume, and build the right projects with your personal AI career coach.
          </p>
          {(!role || ['student', 'employee', 'admin'].includes(role)) && (
            <button 
              onClick={() => setActiveTab('interview')}
              className="bg-emerald-400 text-emerald-950 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-emerald-300 hover:scale-105 transition-all flex items-center gap-3 shadow-lg shadow-emerald-400/20"
            >
              Start Practicing <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="w-full md:w-2/5 h-72 md:h-auto relative min-h-[450px] hidden md:block">
          <img 
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Students collaborating" 
            className="absolute inset-0 w-full h-full object-cover rounded-l-[4rem]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 via-emerald-900/40 to-transparent rounded-l-[4rem]"></div>
        </div>
      </div>

      {/* Features Grid */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Explore Features</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.id}
                onClick={() => setActiveTab(feature.id)}
                className="group text-left bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                <div className={`w-16 h-16 rounded-2xl ${feature.color} text-white flex items-center justify-center mb-8 shadow-lg ${feature.shadow} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 mb-8 flex-1 leading-relaxed text-lg">{feature.description}</p>
                <div className="flex items-center text-emerald-600 font-bold group-hover:gap-3 transition-all text-lg">
                  Try it now <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
