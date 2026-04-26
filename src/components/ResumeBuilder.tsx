import { useState } from 'react';
import { Loader2, Download, Copy, Check } from 'lucide-react';
import { generateText } from '../lib/gemini';
import Markdown from 'react-markdown';

export function ResumeBuilder() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    summary: '',
    experience: '',
    education: '',
    skills: '',
    projects: ''
  });
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    
    const prompt = `
      Create a professional, ATS-friendly resume using the following details. 
      Format it clearly using Markdown. Use strong action verbs and quantify achievements where possible (even if you have to suggest placeholders like [X]%).
      
      Name: ${formData.name}
      Email: ${formData.email}
      Phone: ${formData.phone}
      
      Professional Summary:
      ${formData.summary}
      
      Experience:
      ${formData.experience}
      
      Education:
      ${formData.education}
      
      Skills:
      ${formData.skills}
      
      Projects:
      ${formData.projects}
    `;

    try {
      const generatedResume = await generateText(
        prompt, 
        "You are an expert resume writer. Your goal is to take raw user input and format it into a highly professional, ATS-optimized resume in Markdown format. Ensure clear headings, bullet points, and professional language."
      );
      setResult(generatedResume);
    } catch (error) {
      console.error(error);
      alert("Failed to generate resume.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Resume Builder</h2>
        <p className="text-gray-600 mt-2">Fill in your details and let AI generate an ATS-friendly resume for you.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 h-[calc(100vh-12rem)] overflow-y-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 sticky top-0 bg-white py-2 border-b">Your Details</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-colors" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-colors" placeholder="john@example.com" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-colors" placeholder="+1 234 567 8900" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
            <textarea name="summary" value={formData.summary} onChange={handleChange} rows={3} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-colors" placeholder="Brief overview of your career and goals..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
            <textarea name="experience" value={formData.experience} onChange={handleChange} rows={4} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-colors" placeholder="Company, Role, Dates, Responsibilities..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
            <textarea name="education" value={formData.education} onChange={handleChange} rows={3} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-colors" placeholder="University, Degree, Year..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
            <textarea name="skills" value={formData.skills} onChange={handleChange} rows={2} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-colors" placeholder="React, Node.js, Python, Project Management..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Projects</label>
            <textarea name="projects" value={formData.projects} onChange={handleChange} rows={4} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-colors" placeholder="Project Name, Tech Stack, Description..." />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-6 shadow-lg shadow-emerald-600/20"
          >
            {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : 'Generate ATS Resume'}
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-[calc(100vh-12rem)] flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-2 border-b">
            <h3 className="text-xl font-semibold text-gray-900">Generated Resume</h3>
            {result && (
              <div className="flex gap-2">
                <button onClick={handleCopy} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Copy Markdown">
                  {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
                <p>Crafting your perfect resume...</p>
              </div>
            ) : result ? (
              <div className="markdown-body prose prose-sm max-w-none">
                <Markdown>{result}</Markdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <p>Fill in your details and click generate to see your resume here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
