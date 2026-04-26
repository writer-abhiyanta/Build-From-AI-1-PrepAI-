import { useEffect, useRef, useState } from 'react';
import { Shield, Zap, Cpu, Globe, CheckCircle2, Server, Database, Layout, Lock, Download, Loader2 } from 'lucide-react';
import mermaid from 'mermaid';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

mermaid.initialize({ 
  startOnLoad: false, 
  theme: 'base', 
  themeVariables: { 
    primaryColor: '#10b981', 
    primaryTextColor: '#064e3b', 
    primaryBorderColor: '#059669', 
    lineColor: '#059669', 
    secondaryColor: '#a7f3d0', 
    tertiaryColor: '#ecfdf5',
    fontFamily: 'Inter'
  } 
});

function MermaidChart({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && chart) {
      const id = `mermaid-report-${Math.random().toString(36).substring(2, 9)}`;
      mermaid.render(id, chart).then((result) => {
        if (ref.current) {
          ref.current.innerHTML = result.svg;
        }
      }).catch((e) => {
        console.error("Mermaid rendering error", e);
      });
    }
  }, [chart]);

  return <div ref={ref} className="flex justify-center my-8 overflow-x-auto bg-white p-8 rounded-[2rem] border border-emerald-100 shadow-xl shadow-emerald-500/5" />;
}

export function Report() {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Add a style block to override oklch colors with HEX for html2canvas compatibility
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .pdf-compat {
        --color-emerald-50: #ecfdf5 !important;
        --color-emerald-100: #d1fae5 !important;
        --color-emerald-200: #a7f3d0 !important;
        --color-emerald-300: #6ee7b7 !important;
        --color-emerald-400: #34d399 !important;
        --color-emerald-500: #10b981 !important;
        --color-emerald-600: #059669 !important;
        --color-emerald-700: #047857 !important;
        --color-emerald-800: #065f46 !important;
        --color-emerald-900: #064e3b !important;
        --color-gray-50: #f9fafb !important;
        --color-gray-100: #f3f4f6 !important;
        --color-gray-200: #e5e7eb !important;
        --color-gray-500: #6b7280 !important;
        --color-gray-600: #4b5563 !important;
        --color-gray-700: #374151 !important;
        --color-gray-900: #111827 !important;
        --color-teal-600: #0d9488 !important;
        --color-teal-100: #ccfbf1 !important;
        --color-green-600: #16a34a !important;
        --color-green-100: #dcfce7 !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    
    setIsGenerating(true);
    // Add compatibility class before capture
    reportRef.current.classList.add('pdf-compat');
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f9fafb',
        logging: false,
        onclone: (clonedDoc) => {
          // Ensure the cloned element also has the compatibility class
          const clonedElement = clonedDoc.querySelector('.pdf-compat') as HTMLElement;
          if (clonedElement) {
            clonedElement.style.backgroundColor = '#f9fafb';
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save('PrepAI-Architecture-Report.pdf');
    } catch (error) {
      console.error("PDF generation failed", error);
    } finally {
      // Remove compatibility class after capture
      if (reportRef.current) {
        reportRef.current.classList.remove('pdf-compat');
      }
      setIsGenerating(false);
    }
  };

  const architectureChart = `
    graph LR
      User((Student))
      subgraph "Frontend Layer"
        UI[React 19 SPA]
        Styles[Tailwind 4.0]
      end
      subgraph "Intelligence Layer"
        Gemini[Gemini 3 Flash]
      end
      subgraph "Backend Services"
        Auth[Firebase Auth]
        DB[(Firestore NoSQL)]
      end
      
      User <--> UI
      UI <--> Gemini
      UI <--> Auth
      UI <--> DB
      
      style UI fill:#ecfdf5,stroke:#10b981,stroke-width:2px
      style Gemini fill:#f0fdf4,stroke:#059669,stroke-width:2px
      style Auth fill:#f0fdf4,stroke:#059669,stroke-width:2px
      style DB fill:#f0fdf4,stroke:#059669,stroke-width:2px
  `;

  const stats = [
    { label: 'Core Features', value: '4', icon: Cpu, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Security Level', value: 'High', icon: Shield, color: 'text-teal-600', bg: 'bg-teal-100' },
    { label: 'Response Time', value: '< 2s', icon: Zap, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Deployment', value: 'Live', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="flex justify-end">
        <button
          onClick={downloadPDF}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          {isGenerating ? 'Generating PDF...' : 'Download PDF Report'}
        </button>
      </div>

      <div ref={reportRef} className="space-y-12 p-8 rounded-[3rem] bg-gray-50">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>Build Report v1.0</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">Software Architecture & Implementation</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            A detailed overview of the PrepAI technical ecosystem, security protocols, and core functionalities.
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-2xl font-black text-gray-900">{stat.value}</div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Architecture Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg text-white">
              <Server className="w-5 h-5" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">System Workflow</h2>
          </div>
          <div className="bg-emerald-900 p-1 rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="bg-white rounded-[2.4rem] p-4 md:p-10">
              <MermaidChart chart={architectureChart} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
                <div className="space-y-3">
                  <h4 className="font-bold text-emerald-700 flex items-center gap-2">
                    <Layout className="w-4 h-4" /> Presentation Layer
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    React 19 SPA with Tailwind 4.0. Optimized for high-performance rendering and mobile-first responsiveness.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-bold text-emerald-700 flex items-center gap-2">
                    <Cpu className="w-4 h-4" /> Intelligence Layer
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Gemini 3 Flash integration for real-time interview coaching, resume parsing, and technical roadmap generation.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-bold text-emerald-700 flex items-center gap-2">
                    <Database className="w-4 h-4" /> Persistence Layer
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Firebase Firestore for NoSQL data storage and Firebase Auth for secure, multi-tenant user management.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Validation */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900">Security Protocols</h3>
            <ul className="space-y-4">
              {[
                'Default Deny Firestore Security Rules',
                'OAuth 2.0 Google Authentication',
                'User-Scoped Data Isolation',
                'Encrypted API Key Management',
                'Strict Input Sanitization'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-emerald-600 p-10 rounded-[2.5rem] text-white space-y-6 shadow-xl shadow-emerald-600/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
            <div className="w-14 h-14 bg-white text-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-3xl font-bold">Validation Logic</h3>
            <p className="text-emerald-50/80 leading-relaxed">
              Our validation engine ensures data integrity across all layers. From frontend form validation to backend schema enforcement in Firestore, every byte is checked for compliance.
            </p>
            <div className="pt-4 space-y-3">
              <div className="flex justify-between text-sm font-bold uppercase tracking-widest text-emerald-200">
                <span>Schema Compliance</span>
                <span>100%</span>
              </div>
              <div className="w-full h-2 bg-emerald-800 rounded-full overflow-hidden">
                <div className="w-full h-full bg-emerald-300" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
