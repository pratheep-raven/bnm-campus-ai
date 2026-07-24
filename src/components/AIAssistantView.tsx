import React, { useState } from 'react';
import {
  User,
  AIChatMessage,
  AIProgressReport
} from '../types';
import {
  Sparkles,
  Send,
  BrainCircuit,
  GraduationCap,
  FileCheck2,
  HelpCircle,
  BarChart3,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api';

interface AIAssistantViewProps {
  currentUser: User;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ currentUser }) => {
  const [activeMode, setActiveMode] = useState<'academic_help' | 'assignment_help' | 'exam_practice' | 'progress_analysis'>('academic_help');
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      agentName: 'BNM Multi-Agent System',
      text: `Hello ${currentUser.name}! I am the BNM Campus AI Assistant powered by multi-specialist agents. How can I assist your engineering studies or teaching activities today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  const suggestedPrompts = [
    { mode: 'academic_help', text: 'Explain Pumping Lemma for Regular Languages with a 5-step proof example.' },
    { mode: 'academic_help', text: 'What is Distance Vector Routing algorithm in Computer Networks?' },
    { mode: 'assignment_help', text: 'How do I structure a B-Tree vs B+ Tree comparison for my DBMS assignment?' },
    { mode: 'exam_practice', text: 'Generate 3 high-yield 10-mark VTU internal exam questions on Automata Theory.' },
    { mode: 'progress_analysis', text: 'Analyze my current academic status and generate a grade improvement study plan.' }
  ];

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || isSending) return;

    const userMsg: AIChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputPrompt('');
    setIsSending(true);

    try {
      const res = await api.sendAIChat(textToSend, currentUser.role, activeMode, {
        userName: currentUser.name,
        department: currentUser.departmentName,
        class: currentUser.className
      });

      const aiMsg: AIChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        agentName: res.agentName,
        text: res.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'ai',
          agentName: 'BNM AI Assistant',
          text: `I encountered an issue processing your request: ${err.message}. Please try again!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center ring-2 ring-teal-500/40">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              BNM Campus Multi-Agent AI System
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Specialized AI Agents for Q&A, Assignments, Exams & Academic Analysis
            </p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Gemini 3.6 Flash Orchestrator
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => setActiveMode('academic_help')}
          className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeMode === 'academic_help'
              ? 'bg-slate-900 text-teal-400 border-slate-900 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <GraduationCap className="w-4 h-4" /> Academic Q&A
        </button>

        <button
          onClick={() => setActiveMode('assignment_help')}
          className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeMode === 'assignment_help'
              ? 'bg-slate-900 text-teal-400 border-slate-900 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileCheck2 className="w-4 h-4" /> Assignment Helper
        </button>

        <button
          onClick={() => setActiveMode('exam_practice')}
          className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeMode === 'exam_practice'
              ? 'bg-slate-900 text-teal-400 border-slate-900 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <HelpCircle className="w-4 h-4" /> Exam Questions
        </button>

        <button
          onClick={() => setActiveMode('progress_analysis')}
          className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeMode === 'progress_analysis'
              ? 'bg-slate-900 text-teal-400 border-slate-900 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Progress Analysis
        </button>
      </div>

      {/* Suggested Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold text-slate-500 shrink-0">Quick Prompts:</span>
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setActiveMode(p.mode as any);
              handleSendMessage(p.text);
            }}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-medium text-slate-700 hover:border-teal-400 hover:text-teal-800 shrink-0 transition-all shadow-xs"
          >
            💡 {p.text}
          </button>
        ))}
      </div>

      {/* Conversation Thread */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col h-[500px]">
        
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-bold text-slate-400">
                  {msg.sender === 'user' ? currentUser.name : (msg.agentName || 'BNM AI Agent')}
                </span>
                <span className="text-[9px] text-slate-400">{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none shadow-md'
                    : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/80 shadow-xs'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex items-center gap-2 text-xs text-teal-700 font-semibold animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Routing request to specialist agent...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 rounded-b-3xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={`Ask the ${activeMode.replace('_', ' ')} agent...`}
              className="flex-1 px-4 py-2.5 text-xs bg-white border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 outline-none"
            />
            <button
              type="submit"
              disabled={isSending || !inputPrompt.trim()}
              className="p-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
