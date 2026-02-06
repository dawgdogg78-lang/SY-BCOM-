import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Calculator, GraduationCap, ArrowRight, HelpCircle, FileText, CheckCircle, RefreshCw, ChevronDown, Award, Briefcase, TrendingUp, Settings } from 'lucide-react';

// --- Configuration & Data ---

const SUBJECTS = [
  { id: 1, title: "Fundamental of Business and Financial Analysis-III (Minor)", icon: TrendingUp, type: "Analysis", prompt: "Focus on financial ratio analysis, business environment, and analytical techniques. Include working notes for all calculations. Present analysis in tabular format where appropriate." },
  { id: 2, title: "Macro Economics Analysis of Interactions Between Goods and Money Market (Major-II)", icon: TrendingUp, type: "Economics", prompt: "Explain IS-LM model, AD-AS framework clearly. Use text-based graph descriptions. Connect theory to current Indian economic scenarios." },
  { id: 3, title: "Accountancy and Financial Management-IV (Major-I)", icon: Calculator, type: "Accounting", prompt: "Provide journal entries, ledger accounts, and financial statements in proper Markdown table format. Show all working notes clearly. Highlight applicable accounting standards." },
  { id: 4, title: "Accounting & Auditing-II / Management Accounting-II (Major-I)", icon: FileText, type: "Accounting", prompt: "For Auditing: Focus on verification techniques, vouching, internal control. For Mgmt Accounting: Budgets, standard costing, marginal costing with formulas. Use standard formats for cost sheets." },
  { id: 5, title: "Vocational Skills in Accounting-IV (SEC)", icon: Briefcase, type: "Vocational", prompt: "Focus on practical, hands-on accounting procedures, Tally/ERP concepts, GST practical applications, and E-filing steps." },
  { id: 6, title: "Commerce IV [Management Production and Finance] (Major-III)", icon: BookOpen, type: "Commerce", prompt: "Focus on Production planning, capital budgeting, working capital management. Use Case study approach. Ensure financial management numericals have proper formula application." },
  { id: 7, title: "Microbes and Environment (O.E-I)", icon: Award, type: "Science", prompt: "Explain Basic microbiology for commerce students, Environmental accounting, and sustainability concepts. Focus on the Business-environment interface." },
  { id: 8, title: "AEC-Business Communication Skill-II", icon: CheckCircle, type: "Soft Skills", prompt: "Focus on Letter formats, report writing, presentation skills, Email etiquette, and business correspondence." },
  { id: 9, title: "CU-Integrated Theatre Production", icon: GraduationCap, type: "Cultural", prompt: "Focus on Management aspects of event production, Budgeting for cultural events, team coordination, and Project management applied to theatre." }
];

// --- Helper: Simple Markdown Parser for Single File ---
// This handles basic tables, bolding, headers, and lists for the academic response.
const MarkdownRenderer = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const rendered = [];
  let inTable = false;
  let tableHeader = [];
  let tableRows = [];

  const renderTable = () => {
    if (tableHeader.length === 0) return null;
    return (
      <div key={`table-${Date.now()}-${Math.random()}`} className="my-4 overflow-x-auto border border-gray-300 rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-slate-50">
            <tr>
              {tableHeader.map((th, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r last:border-r-0 border-gray-200">
                  {th.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableRows.map((row, rI) => (
              <tr key={rI} className={rI % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                {row.map((td, cI) => (
                  <td key={cI} className="px-4 py-2 text-sm text-gray-700 whitespace-pre-wrap border-r last:border-r-0 border-gray-200 font-mono">
                    {td.trim()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  lines.forEach((line, index) => {
    // Table detection
    if (line.trim().startsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableHeader = line.split('|').filter(cell => cell.trim() !== '');
        tableRows = [];
        return;
      } else if (line.includes('---')) {
        // Separator line, ignore
        return;
      } else {
        const row = line.split('|').filter(cell => cell.trim() !== ''); // Basic split
        // Fix for when split creates empty first/last elements due to | at start/end
        if(row.length > 0) tableRows.push(row);
        return;
      }
    } else if (inTable) {
      inTable = false;
      rendered.push(renderTable());
      tableHeader = [];
      tableRows = [];
    }

    // Headers
    if (line.startsWith('### ')) {
      rendered.push(<h3 key={index} className="text-lg font-bold text-slate-800 mt-6 mb-2 border-b pb-1 border-slate-200">{line.replace('### ', '')}</h3>);
    } else if (line.startsWith('## ')) {
      rendered.push(<h2 key={index} className="text-xl font-bold text-slate-900 mt-8 mb-3">{line.replace('## ', '')}</h2>);
    } 
    // Bullet Points
    else if (line.trim().startsWith('- ')) {
       // Handle bolding within list
       const text = line.replace('- ', '');
       const parts = text.split(/(\*\*.*?\*\*)/g);
       rendered.push(
        <li key={index} className="ml-6 list-disc text-slate-700 mb-1">
          {parts.map((part, i) => 
            part.startsWith('**') ? <strong key={i} className="text-slate-900 font-semibold">{part.replace(/\*\*/g, '')}</strong> : part
          )}
        </li>
       );
    }
    // Numbered Lists
    else if (/^\d+\.\s/.test(line)) {
      rendered.push(<div key={index} className="ml-6 mb-1 text-slate-700"><span className="font-semibold mr-2">{line.split(' ')[0]}</span>{line.substring(line.indexOf(' '))}</div>);
    }
    // Standard Paragraphs with Bolding
    else if (line.trim() !== '') {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      rendered.push(
        <p key={index} className="mb-3 text-slate-700 leading-relaxed">
          {parts.map((part, i) => 
            part.startsWith('**') ? <strong key={i} className="text-slate-900 font-semibold">{part.replace(/\*\*/g, '')}</strong> : part
          )}
        </p>
      );
    }
  });

  // Flush table if end of content
  if (inTable) {
    rendered.push(renderTable());
  }

  return <div className="markdown-body">{rendered}</div>;
};

// --- Main App Component ---

export default function SYBComCommandCenter() {
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [examMode, setExamMode] = useState(false);
  const [error, setError] = useState('');
  
  const responseRef = useRef(null);

  const generateContent = async (customQuery = null) => {
    const activeQuery = customQuery || query;
    if (!activeQuery.trim()) return;

    setIsLoading(true);
    setError('');
    setResponse(null);

    const systemPrompt = `
      You are an experienced S.Y B.Com professor at Mumbai University with 15+ years teaching experience. 
      Subject: ${selectedSubject.title}
      Subject Rules: ${selectedSubject.prompt}
      
      User Question: "${activeQuery}"
      Exam Mode: ${examMode ? "ON. Strict 5-mark or 10-mark answer structure required." : "OFF. Explain clearly for understanding."}

      INSTRUCTIONS:
      1. Structure: Introduction, Body (with subheadings), Working/Calculation (if numerical), Conclusion.
      2. If numerical: Show Step-by-Step Working Notes clearly.
      3. Use MARKDOWN TABLES for all accounts, statements, and differences.
      4. Language: Academic, clear English suitable for Mumbai University exams.
      5. Include "Key Takeaway" and "Exam Tip" sections at the end.
      6. If data is missing in a numerical problem, state assumptions.
      7. Reference relevant Indian laws/standards (e.g., Companies Act 2013, AS-13) where applicable.
      
      FORMATTING:
      - Use **Bold** for key terms.
      - Use | Tables | for differences and accounts.
      - Start with a direct answer.
    `;

    try {
      // NOTE: Using the standard fetch approach for the provided environment
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error("Gemini API key not configured. Add VITE_GEMINI_API_KEY to .env file");
      }
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
          }),
        }
      );

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      setResponse(generatedText);
      
      // Auto-scroll to response
      setTimeout(() => {
        responseRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err) {
      setError("Professor is busy (Network Error). Please try again. " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubjectChange = (e) => {
    const subId = parseInt(e.target.value);
    const sub = SUBJECTS.find(s => s.id === subId);
    setSelectedSubject(sub);
    setResponse(null); // Clear previous subject response
  };

  const handleQuickAction = (action) => {
    if (!response) return;
    let newPrompt = "";
    if (action === 'simplify') newPrompt = `Simplify the previous explanation for a student who is struggling to understand. Keep it brief. Context: ${query}`;
    if (action === 'practice') newPrompt = `Generate 2 practice questions (one theory, one numerical if applicable) based on this topic: ${query}. Don't answer them, just list them.`;
    if (action === 'tip') newPrompt = `Give me a specific exam scoring tip for this specific topic: ${query} in the context of Mumbai University evaluation patterns.`;
    
    generateContent(newPrompt);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      
      {/* --- Header --- */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500 p-2 rounded-lg">
              <GraduationCap size={24} className="text-slate-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">S.Y. B.Com Command Center</h1>
              <p className="text-xs text-slate-400">Mumbai University Academic Assistant</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-sm bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>Professor AI Online</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* --- Left Panel: Controls --- */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Subject Selector */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <label className="flex items-center space-x-2 text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">
              <BookOpen size={16} />
              <span>Select Subject</span>
            </label>
            <div className="relative">
              <select 
                value={selectedSubject.id}
                onChange={handleSubjectChange}
                className="w-full appearance-none bg-slate-50 border border-slate-300 hover:border-amber-500 text-slate-900 text-sm rounded-lg p-3 pr-10 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all shadow-sm"
              >
                {SUBJECTS.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
            </div>
            
            <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
              <div className="flex items-start space-x-3">
                <selectedSubject.icon className="text-amber-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h3 className="text-sm font-bold text-amber-900">{selectedSubject.type} Focus</h3>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed opacity-90">
                    {selectedSubject.prompt.substring(0, 120)}...
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <label className="flex items-center space-x-2 text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">
              <Settings size={16} />
              <span>Exam Parameters</span>
            </label>
            
            <div 
              onClick={() => setExamMode(!examMode)}
              className={`cursor-pointer flex items-center justify-between p-3 rounded-lg border transition-all ${examMode ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-6 rounded-full flex items-center p-1 duration-300 ease-in-out ${examMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${examMode ? 'translate-x-4' : ''}`}></div>
                </div>
                <span className={`text-sm font-medium ${examMode ? 'text-indigo-900' : 'text-slate-600'}`}>Exam Mode</span>
              </div>
              {examMode && <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded font-bold">STRICT</span>}
            </div>
            <p className="text-xs text-slate-400 mt-2 px-1">
              Enables strict 5/10 mark answer structure required for Mumbai University papers.
            </p>
          </div>

          {/* Tips Section */}
          <div className="bg-slate-800 text-slate-300 rounded-xl p-5 text-sm">
            <h4 className="font-bold text-white mb-2 flex items-center"><HelpCircle size={16} className="mr-2"/> Quick Tips</h4>
            <ul className="space-y-2 list-disc pl-4 text-xs opacity-80">
              <li>Enter numericals with clear values.</li>
              <li>Ask for "Differences between X and Y" for tabular answers.</li>
              <li>Type "Journal entries for..." for accounting.</li>
            </ul>
          </div>
        </div>

        {/* --- Right Panel: Interaction --- */}
        <div className="lg:col-span-8 flex flex-col h-full space-y-6">
          
          {/* Input Area */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-1">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Ask a question about ${selectedSubject.title.split('(')[0]}...`}
              className="w-full min-h-[140px] p-4 text-slate-700 bg-transparent resize-none focus:outline-none text-base"
            />
            <div className="px-4 pb-4 flex justify-between items-center border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-400 font-medium hidden sm:block">
                Press Enter for new line. Click button to submit.
              </span>
              <button
                onClick={() => generateContent()}
                disabled={isLoading || !query.trim()}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-semibold text-white transition-all transform active:scale-95 shadow-md ${
                  isLoading || !query.trim() 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Answer</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-start space-x-3">
              <HelpCircle size={20} className="mt-0.5" />
              <div>
                <h4 className="font-bold">Error</h4>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Response Area */}
          {response && (
            <div ref={responseRef} className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden animate-fade-in-up">
              <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 flex items-center">
                  <FileText size={18} className="mr-2 text-amber-500" />
                  Professor's Solution
                </h3>
                <div className="flex space-x-2">
                  <button onClick={() => handleQuickAction('simplify')} className="text-xs bg-white border border-slate-300 px-2 py-1 rounded hover:bg-slate-50 text-slate-600">Simplify</button>
                  <button onClick={() => handleQuickAction('practice')} className="text-xs bg-white border border-slate-300 px-2 py-1 rounded hover:bg-slate-50 text-slate-600">Practice Qs</button>
                </div>
              </div>
              
              <div className="p-6 md:p-8">
                <div className="prose prose-slate max-w-none prose-headings:font-serif prose-h3:text-lg prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-slate-800">
                  <MarkdownRenderer content={response} />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="bg-indigo-50 px-6 py-4 border-t border-indigo-100 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center space-x-2 text-indigo-800 text-sm font-medium">
                  <Award size={18} />
                  <span>Exam Tip included in response</span>
                </div>
                <button 
                  className="text-xs text-indigo-600 underline hover:text-indigo-800"
                  onClick={() => handleQuickAction('tip')}
                >
                  Need more exam strategy?
                </button>
              </div>
            </div>
          )}

          {/* Empty State / Welcome */}
          {!response && !isLoading && !error && (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4 py-12 border-2 border-dashed border-slate-200 rounded-xl">
              <div className="bg-slate-100 p-4 rounded-full">
                <BookOpen size={48} className="text-slate-300" />
              </div>
              <div className="text-center max-w-sm">
                <h3 className="text-lg font-semibold text-slate-600">Ready to Study</h3>
                <p className="text-sm mt-1">Select your subject from the sidebar and type your question or problem above.</p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
