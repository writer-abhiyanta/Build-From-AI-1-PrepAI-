import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles, ChevronDown, ChevronUp, CheckCircle, AlertCircle, BarChart, Quote, Zap } from 'lucide-react';
import { createChatSession, generateText, generateStructuredFeedback } from '../lib/gemini';
import Markdown from 'react-markdown';

interface FeedbackData {
  content: {
    analysis: string;
    strengths: string[];
    improvements: string[];
  };
  tone: {
    analysis: string;
    advice: string;
  };
  clarity: {
    score: number;
    analysis: string;
  };
  actionableTip: string;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  feedback?: string | FeedbackData;
  isAnalyzing?: boolean;
  showFeedback?: boolean;
}

export function InterviewPractice() {
  const [persona, setPersona] = useState('Hiring Manager');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: "Hello! I'm your AI interviewer. I've set my persona to **Hiring Manager**. I'll be asking questions from a management perspective, focusing on your strategic thinking, leadership, and problem-solving. \n\nWhich role are we interviewing for today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const personas = {
    'Hiring Manager': 'You are a Senior Hiring Manager looking for leadership potential, strategic thinking, and emotional intelligence. Your questions are open-ended and focus on how the user handles complex situations, conflicts, and decision-making.',
    'Technical Lead': 'You are a Senior Technical Lead. You focus on technical depth, architecture, code quality, and how the user solves difficult engineering problems.',
    'Startup Founder': 'You are a founder of a rapidly growing startup. You are informal but very focused on ownership, multi-tasking, and the ability to learn quickly. You want to see passion and "hustle".',
    'Standard': 'You are an expert technical and behavioral interviewer. Keep the tone professional, encouraging, and helpful.'
  };

  // We use a ref to store the chat session so it persists across renders
  const chatSessionRef = useRef<any>(null);

  useEffect(() => {
    chatSessionRef.current = createChatSession(
      `${personas[persona as keyof typeof personas]} Ask one question at a time. Wait for the user's response. After they respond, provide constructive feedback on their answer, and then ask the next question.`
    );
  }, [persona]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      if (!chatSessionRef.current) return;
      
      const result = await chatSessionRef.current.sendMessage({ message: userMessage });
      
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: result.text 
      }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: "I'm sorry, I encountered an error. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFeedback = async (messageId: string, userText: string, index: number) => {
    // Context is the previous message (the question)
    const contextText = index > 0 ? messages[index - 1].text : "Initial introduction";
    
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isAnalyzing: true, showFeedback: true } : m));
    
    try {
      const prompt = `Context: The interviewer asked: "${contextText}"\nUser's Response: "${userText}"`;
      const feedback = await generateStructuredFeedback(prompt);
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, feedback, isAnalyzing: false } : m));
    } catch (error) {
      console.error("Error getting feedback:", error);
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isAnalyzing: false } : m));
    }
  };

  const toggleFeedback = (messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, showFeedback: !m.showFeedback } : m));
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-4rem)] flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Interview Practice</h2>
          <p className="text-gray-600 mt-1">Chat with our AI to improve your interview skills.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-black text-emerald-900 uppercase tracking-widest">Interviewer Persona:</label>
          <select 
            value={persona}
            onChange={(e) => {
              setPersona(e.target.value);
              setMessages([{
                id: Date.now().toString(),
                role: 'model',
                text: `I've switched my persona to **${e.target.value}**. Let's continue or start a new session. What role are we focusing on?`
              }]);
            }}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          >
            {Object.keys(personas).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, index) => (
          <div key={msg.id} className="space-y-2">
            <div className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-emerald-100 text-emerald-600' : 'bg-teal-100 text-teal-600'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-600/20' 
                  : 'bg-white border border-gray-100 shadow-sm text-gray-900 rounded-tl-none'
              }`}>
                {msg.role === 'user' ? (
                  <div className="space-y-2">
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <button 
                      onClick={() => msg.feedback ? toggleFeedback(msg.id) : getFeedback(msg.id, msg.text, index)}
                      className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-white/20 hover:bg-white/30 px-2 py-1 rounded-md transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                      {msg.feedback ? (msg.showFeedback ? 'Hide Feedback' : 'Show Feedback') : 'Analyze Response'}
                    </button>
                  </div>
                ) : (
                  <div className="markdown-body prose prose-sm max-w-none">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                )}
              </div>
            </div>

            {msg.role === 'user' && msg.showFeedback && (
              <div className="flex flex-row-reverse gap-4">
                <div className="w-10 shrink-0" /> {/* Spacer for avatar */}
                <div className="max-w-[85%] w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-xl space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-emerald-100 p-2 rounded-xl">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Response Analysis</span>
                    </div>
                    {msg.isAnalyzing && (
                      <div className="flex items-center gap-2 text-emerald-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-xs font-bold animate-pulse">Processing...</span>
                      </div>
                    )}
                  </div>
                  
                  {msg.isAnalyzing ? (
                    <div className="space-y-4 py-4">
                      <div className="h-4 bg-slate-200 rounded-full w-3/4 animate-pulse" />
                      <div className="h-4 bg-slate-200 rounded-full w-1/2 animate-pulse" />
                    </div>
                  ) : msg.feedback && typeof msg.feedback === 'object' ? (
                    <div className="space-y-8">
                      {/* Detailed Categories */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Content */}
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
                            <Quote className="w-4 h-4" />
                            Content
                          </div>
                          <p className="text-xs leading-relaxed text-slate-600">{(msg.feedback as FeedbackData).content.analysis}</p>
                          <div className="space-y-2">
                            {(msg.feedback as FeedbackData).content.strengths.slice(0, 2).map((s, i) => (
                              <div key={i} className="flex items-center gap-2 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md font-medium">
                                <CheckCircle className="w-3 h-3" />
                                {s}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tone */}
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                          <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-wider">
                            <Zap className="w-4 h-4" />
                            Tone
                          </div>
                          <p className="text-xs leading-relaxed text-slate-600">{(msg.feedback as FeedbackData).tone.analysis}</p>
                          <div className="p-2 bg-purple-50 rounded-lg text-[10px] text-purple-700 italic border border-purple-100">
                            {(msg.feedback as FeedbackData).tone.advice}
                          </div>
                        </div>

                        {/* Clarity */}
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
                              <BarChart className="w-4 h-4" />
                              Clarity
                            </div>
                            <span className="text-xs font-black text-amber-600">{(msg.feedback as FeedbackData).clarity.score}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-amber-500 h-full transition-all duration-1000" 
                              style={{ width: `${(msg.feedback as FeedbackData).clarity.score}%` }} 
                            />
                          </div>
                          <p className="text-xs leading-relaxed text-slate-600">{(msg.feedback as FeedbackData).clarity.analysis}</p>
                        </div>
                      </div>

                      {/* Actionable Tip */}
                      <div className="bg-emerald-600 p-4 rounded-2xl text-white shadow-lg shadow-emerald-600/20 group hover:scale-[1.02] transition-transform duration-300">
                        <div className="flex items-start gap-4">
                          <div className="bg-white/20 p-2 rounded-xl group-hover:rotate-12 transition-transform">
                            <Zap className="w-5 h-5 text-white shadow-glow" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Pro Tip for Next Time</span>
                            <p className="text-sm font-bold mt-1 text-emerald-50 leading-snug">
                              {(msg.feedback as FeedbackData).actionableTip}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : typeof msg.feedback === 'string' ? (
                    <div className="markdown-body prose prose-sm prose-emerald max-w-none">
                      <Markdown>{msg.feedback as string}</Markdown>
                    </div>
                  ) : (
                    <p className="text-sm text-red-500 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Failed to generate analysis.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
              <span className="text-gray-500 text-sm">AI is typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your response..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md shadow-emerald-600/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
