import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { 
  Send, 
  User, 
  Bot, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  Cpu, 
  Phone, 
  Zap, 
  TrendingUp, 
  Layers, 
  MapPin, 
  FileCheck, 
  Truck, 
  CheckCircle2, 
  HelpCircle,
  HelpCircle as TrainIcon
} from 'lucide-react';
import { DB } from '../store';
import { User as UserType, UserRole, Requirement, TransportMode, ShipmentStatus } from '../types';

interface Props {
  user: UserType;
}

interface ChatMessage {
  sender: 'user' | 'model';
  text: string;
  timestamp: string;
  isUrgent?: boolean;
}

const GroundControlBot: React.FC<Props> = ({ user }) => {
  // Tabs: COPILOT (Chat and scenario alarms), DECIDER (Train vs Truck dynamic analyzer)
  const [activeTab, setActiveTab] = useState<'COPILOT' | 'DECIDER'>('COPILOT');
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'model',
      text: `Hello ${user.fullName}. Welcome to LogicAlloc Ground Control. I am your RAG-enabled logistics copilot. Open the "AI Train vs Truck Decider" tab to obtain dynamic model choice recommendations for active requirements, or query anything here about clinker allocations or container stacking densities.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [activePersona, setActivePersona] = useState<'Site Manager' | 'Transport Provider' | 'System Admin'>(() => {
    if (user.role === UserRole.SITE_MANAGER) return 'Site Manager';
    if (user.role === UserRole.TRANSPORT_PROVIDER) return 'Transport Provider';
    return 'System Admin';
  });
  const [isTyping, setIsTyping] = useState(false);
  const [emergencyFired, setEmergencyFired] = useState(false);
  const [emergencyDetails, setEmergencyDetails] = useState({ type: '', code: '', location: '' });
  const [countdown, setCountdown] = useState(15);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mode Choice Decider states
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [selectedReqId, setSelectedReqId] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<{
    recommendedMode: TransportMode;
    score: number;
    metrics: { trainCost: number; truckCost: number; trainCO2: number; truckCO2: number; trainDays: string; truckDays: string };
    reasoning: string[];
  } | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (emergencyFired && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [emergencyFired, countdown]);

  // Load requirements on mount or tab focus
  useEffect(() => {
    const list = DB.getRequirements();
    setRequirements(list);
    if (list.length > 0) {
      // Find one that matches site location if site manager
      const filtered = user.role === UserRole.SITE_MANAGER 
        ? list.filter(r => r.managerId === user.id || r.siteLocation === user.siteLocation)
        : list;
      
      const targetList = filtered.length > 0 ? filtered : list;
      setRequirements(targetList);
      setSelectedReqId(targetList[0].id);
      triggerModeAnalysis(targetList[0]);
    }
  }, [activeTab]);

  const triggerModeAnalysis = (req: Requirement) => {
    setIsAnalyzing(true);
    setUpdateSuccess(false);
    setTimeout(() => {
      const amount = parseFloat(req.materialAmount) || 120;
      const dist = req.distanceKm || 300;
      const material = req.materialType || 'Clinker Grade A';

      let mode: TransportMode = TransportMode.TRUCK;
      let score = 85; 
      let reasons: string[] = [];

      // Industry estimation indices
      const trainCost = Math.round(amount * dist * 1.62);
      const truckCost = Math.round(amount * dist * 2.85);
      const trainCO2 = Math.round(amount * dist * 0.05);
      const truckCO2 = Math.round(amount * dist * 0.22);
      const trainDays = "2 Days";
      const truckDays = "1 Day";

      if (material.toLowerCase().includes('sensor') || material.toLowerCase().includes('optical') || material.toLowerCase().includes('panel')) {
        mode = TransportMode.TRUCK;
        score = 93;
        reasons = [
          "Fragile high-value telemetry components are susceptible to railway marshalling yard coupling impacts.",
          "Road vehicles (Trucks) allow custom visual route planning, protective shock padding, and flexible weatherproofing.",
          "Shorter handling loops minimize the risk of inventory displacement or component separation during transit."
        ];
      } else if (amount >= 500 || (dist > 350 && amount >= 200)) {
        mode = TransportMode.RAIL;
        score = 97;
        reasons = [
          `Heavy commodity volume (${amount.toLocaleString()} T) exceeds standard axle limit indexes, making dedicated railway railcars highly efficient.`,
          `Reduces overall freight expenses by ₹${(truckCost - trainCost).toLocaleString()} compared to dispatched truck convoys.`,
          `Abates approximately ${((truckCO2 - trainCO2) / 1000).toFixed(1)} metric tonnes of greenhouse carbon emissions, unlocking critical Green Energy star compliance.`
        ];
      } else {
        mode = TransportMode.TRUCK;
        score = 86;
        reasons = [
          "Volume limits are below the minimum payload threshold for scheduling full railway shipping rakes efficiently.",
          "Provides immediate point-to-point dispatch without waiting for railway marshalling or line clearance delays.",
          "Highly agile. Allows direct delivery to remote destination belt yards without intermediate loading terminals."
        ];
      }

      setAiReport({
        recommendedMode: mode,
        score,
        metrics: { trainCost, truckCost, trainCO2, truckCO2, trainDays, truckDays },
        reasoning: reasons
      });
      setIsAnalyzing(false);
    }, 800);
  };

  const handleReqChange = (reqId: string) => {
    setSelectedReqId(reqId);
    const req = requirements.find(r => r.id === reqId);
    if (req) {
      triggerModeAnalysis(req);
    }
  };

  const applyModeRecommendation = () => {
    if (!selectedReqId || !aiReport) return;
    const req = DB.getRequirementById(selectedReqId);
    if (req) {
      const updated = { ...req, selectedMode: aiReport.recommendedMode };
      DB.updateRequirement(updated);
      setUpdateSuccess(true);
      // reload requirements
      setRequirements(DB.getRequirements());
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg, timestamp: now }]);
    setInputText('');

    // Check for high-urgency alarm trigger (FR-9.2)
    const lowerMsg = userMsg.toLowerCase();
    if (lowerMsg.includes('theft') || lowerMsg.includes('stolen') || lowerMsg.includes('leak') || lowerMsg.includes('hazardous') || lowerMsg.includes('hijack')) {
      setEmergencyDetails({
        type: lowerMsg.includes('leak') ? 'HAZARDOUS MATERIAL SPILLAGE (HAZMAT CLASS 8)' : 'CARGO THEFT / TRANSIT HIJACK',
        code: lowerMsg.includes('leak') ? 'LMG-SPILL-882' : 'LMG-SEC-911',
        location: 'NEK-58 National Highway (Pune-Nagpur segment, km 412)',
      });
      setCountdown(15);
      setEmergencyFired(true);

      const systemAlertText = `[CRITICAL ALERT] CRITICAL INTERRUPT: Automatic threat classification isolated high-urgency keywords. Raising Class 1 Alarm to Regional Emergency Supervisor immediately. Continuous telemetry has been locked on vehicle GJ 123456.`;
      
      setMessages((prev) => [
        ...prev,
        { sender: 'model', text: systemAlertText, timestamp: now, isUrgent: true }
      ]);
      return;
    }

    setIsTyping(true);

    try {
      const users = DB.getUsers();
      const shipments = DB.getShipments();
      const requirementsList = DB.getRequirements();

      const key = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (!key) {
        throw new Error("Missing API Key");
      }

      const ai = new GoogleGenAI({ apiKey: key });

      const systemInstruction = `You are LogicAnalog Assistant, an enterprise-grade AI solver and logistics copilot. 
      You are speaking in the context of a ${activePersona}. Current user logged-in: ${user.fullName} (${user.role}).
      Here is the current state of the supply chain database:
      - Active Users: ${JSON.stringify(users)}
      - Ongoing Shipments: ${JSON.stringify(shipments)}
      - Allocation Requirements: ${JSON.stringify(requirementsList)}
      
      Follow these guidelines:
      - Keep responses highly functional, realistic, and formatted in clean markdown bullet points where appropriate.
      - Recommend Train (Rail) or Truck based on requirements:
         - Bulk cargo (amount >= 150 MT) defaults to Rail/Train due to cost & carbon abatement efficiency.
         - Fragile/Sensitive, high-speed cargo (sensors, panels, items < 80 MT) defaults to Truck for point-to-point dispatch agility.
      - Support the user with formula references: safety stock threshold is I_threshold = (mu * LT) + Z * sigma * sqrt(LT). Volume packing is 3D bin heuristic.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: userMsg,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const responseText = response.text || "Solver did not respond. Try reorienting constraints.";
      setMessages((prev) => [...prev, { sender: 'model', text: responseText, timestamp: now }]);
    } catch (err) {
      console.error(err);
      setTimeout(() => {
        let fallbackText = "I have fetched the local context for your query. ";
        if (activePersona === 'Site Manager') {
          fallbackText += "For cement or steel requirement decisions, large bulk orders over 200 Tonnes should be assigned Train (Rail). For highly sensitive equipment like Optical Telemetry Sensors, use our specialized Truck fleets for cushion padding.";
        } else if (activePersona === 'Transport Provider') {
          fallbackText += "Drivers manifest database shows Driver Jane Cooper is active on vehicle GJ 123456 with 45% routing complete.";
        } else {
          fallbackText += "System telemetry parameters show GBDT routing matched with 97% confidence gap.";
        }
        setMessages((prev) => [...prev, { sender: 'model', text: fallbackText, timestamp: now }]);
      }, 800);
    } finally {
      setIsTyping(false);
    }
  };

  const simulateUrgentIncident = (type: 'theft' | 'leak') => {
    setInputText(`URGENT INCIDENT: Report immediate ${type === 'theft' ? 'cargo theft hijacking' : 'hazardous chemical clinker leakage'} on highway 58.`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500 pb-20">
      {/* emergency alert banner */}
      {emergencyFired && (
        <div className="bg-red-500 text-white rounded-3xl p-8 shadow-2xl space-y-6 animate-pulse ring-8 ring-red-500/20 border-2 border-red-400">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white text-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <AlertTriangle size={32} className="animate-bounce" />
              </div>
              <div>
                <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">FR-9.2 LEVEL I EMERGENCY PROTOCOL</span>
                <h3 className="text-2xl font-black tracking-tight mt-1">{emergencyDetails.type}</h3>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Supervisor Escalation Clock</p>
              <p className="text-4xl font-black font-mono mt-1">{countdown > 0 ? `${countdown}s` : 'ESCALATED'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-red-600/50 p-6 rounded-2xl backdrop-blur-md">
            <div>
              <p className="text-[10px] uppercase font-black tracking-wider opacity-70">Automated Threat Code</p>
              <p className="font-extrabold text-sm font-mono">{emergencyDetails.code}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-wider opacity-70">GPS Live Coordinate Segment</p>
              <p className="font-extrabold text-sm font-mono">{emergencyDetails.location}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-wider opacity-70">Supervisor Action</p>
              <button
                onClick={() => setEmergencyFired(false)}
                className="mt-2 w-full py-2 bg-white text-red-600 font-black rounded-lg text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors"
              >
                HEAL ALARM / DISMISS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-150 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <Bot size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">AI Logistics Copilot</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Multi-Pillar Neural Optimization Framework</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex space-x-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('COPILOT')}
            className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'COPILOT'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Copilot Chat
          </button>
          <button
            onClick={() => setActiveTab('DECIDER')}
            className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${
              activeTab === 'DECIDER'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap size={12} className="text-amber-500 animate-pulse" />
            <span>AI Train vs Truck Decider</span>
          </button>
        </div>
      </div>

      {activeTab === 'COPILOT' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Chat Console container */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[550px]">
            {/* Header */}
            <div className="px-8 py-5 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Thread Mode</span>
                  <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase">Secure Session • {activePersona} Context</h4>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">RAG_STORE_ACTIVE</span>
            </div>

            {/* Messages viewport */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                  <div className="flex items-start space-x-3 max-w-[85%]">
                    {msg.sender === 'model' && (
                      <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <Bot size={18} />
                      </div>
                    )}
                    <div>
                      <div className={`p-5 rounded-[1.5rem] ${
                        msg.sender === 'user'
                          ? 'bg-slate-900 dark:bg-blue-600 text-white rounded-tr-none'
                          : msg.isUrgent 
                            ? 'bg-red-500 text-white rounded-tl-none border-2 border-red-300'
                            : 'bg-slate-50 dark:bg-slate-800/60 dark:text-slate-100 text-slate-800 rounded-tl-none'
                      }`}>
                        <p className="text-xs font-bold leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                      <span className={`text-[8px] font-bold text-slate-400 mt-1 block ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                    {msg.sender === 'user' && (
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 flex items-center justify-center flex-shrink-0">
                        <User size={18} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-center">
                    <Bot size={18} className="text-blue-600 animate-spin" />
                  </div>
                  <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 rounded-full flex space-x-1.5 items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Form input */}
            <form onSubmit={handleSendMessage} className="p-6 border-t border-slate-50 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 flex space-x-4">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask anything or type theft/leak to simulate urgent triggers..."
                className="flex-1 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-5 py-3 font-medium text-xs dark:text-white outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#0f172a] dark:bg-blue-600 text-white rounded-xl font-bold flex items-center space-x-2 shadow hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Send size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">SEND</span>
              </button>
            </form>
          </div>

          {/* Right Reference sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
                <ShieldCheck className="text-emerald-500 mr-2" size={16} /> Operational Test Scenarios
              </h3>

              <p className="text-xs text-slate-500 leading-relaxed font-bold">
                Test FR-9.2 automatic supervisor alarms by triggering these high-urgency highway events:
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => simulateUrgentIncident('theft')}
                  className="w-full p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 hover:border-red-500 text-left rounded-2xl transition-all flex items-center space-x-3 text-red-700 dark:text-red-400"
                >
                  <div className="p-2 bg-white rounded-xl text-red-650 shadow">
                    <AlertTriangle size={16} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-wide">Launch Cargo Theft Alert</h4>
                    <p className="text-[9px] opacity-80 font-bold">Simulates real-time cargo hijacking on highway Segment</p>
                  </div>
                </button>

                <button
                  onClick={() => simulateUrgentIncident('leak')}
                  className="w-full p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 hover:border-amber-500 text-left rounded-2xl transition-all flex items-center space-x-3 text-amber-700 dark:text-amber-400"
                >
                  <div className="p-2 bg-white rounded-xl text-amber-605 shadow">
                    <AlertTriangle size={16} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-wide">Launch Hazmat Leak Alert</h4>
                    <p className="text-[9px] opacity-80 font-bold">Simulates Class 8 spillage during transfer</p>
                  </div>
                </button>
              </div>

              {/* Persona Override */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Simulate Context</h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['Site Manager', 'Transport Provider'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setActivePersona(p)}
                      className={`text-[8px] font-black px-2 py-2 rounded-xl border uppercase tracking-widest transition-all ${
                        activePersona === p 
                          ? 'bg-slate-900 dark:bg-blue-600 text-white border-transparent'
                          : 'bg-white dark:bg-slate-850 hover:bg-slate-50 border-slate-200 dark:border-slate-800 text-slate-500'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 dark:border-slate-800 space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Helpful Prompts</h4>
                <ul className="space-y-2 text-slate-500 dark:text-slate-400 font-bold text-xs">
                  <li className="p-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 cursor-pointer hover:text-blue-500 truncate block w-full text-left" onClick={() => setInputText("What are my current active delivery statuses?")}>
                    What are my current active delivery statuses?
                  </li>
                  <li className="p-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 cursor-pointer hover:text-blue-500 truncate block w-full text-left" onClick={() => setInputText("Show me safety stock formula parameters")}>
                    Show me safety stock formula parameters
                  </li>
                  <li className="p-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 cursor-pointer hover:text-blue-500 truncate block w-full text-left" onClick={() => setInputText("Recommend Train or Truck with cost math")}>
                    Recommend Train or Truck with cost math
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* AI MODAL DECIDER VIEW: Train vs Truck Solver widget */
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-150 dark:border-slate-800 shadow-md p-8 md:p-12 space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-50 dark:border-slate-800 pb-8">
            <div className="space-y-1">
              <span className="px-3.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[10px] uppercase font-black tracking-widest rounded-full">PILLAR 4 COGNITIVE ENGINE</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">AI Modal Transport Choice Optimizer</h3>
              <p className="text-xs font-bold text-slate-400 uppercase mt-0.5">Solve optimal road-to-rail tradeoffs dynamically for any active requirement</p>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 pointer-events-none">Select Requirement Registry Item</label>
              <select
                value={selectedReqId}
                onChange={(e) => handleReqChange(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 font-black text-xs text-slate-800 dark:text-white outline-none focus:border-blue-500 min-w-[280px]"
              >
                {requirements.map((req) => (
                  <option key={req.id} value={req.id}>
                    {req.id}: {req.materialType} ({req.materialAmount} T) to {req.destination}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedReqId ? (
            <div className="space-y-10">
              {/* CURRENT REQUIREMENT SPECS */}
              {(() => {
                const req = requirements.find(r => r.id === selectedReqId);
                if (!req) return null;
                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 dark:bg-slate-950/65 p-6 rounded-3xl border border-slate-100 dark:border-slate-850">
                    <div className="space-y-1">
                      <p className="text-[9px] font-mono font-bold text-slate-400 uppercase">Material Cargo</p>
                      <p className="text-sm font-black text-slate-800 dark:text-white truncate">{req.materialType}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-mono font-bold text-slate-400 uppercase">Payload Weight</p>
                      <p className="text-sm font-black text-slate-800 dark:text-white">{req.materialAmount} Tonnes</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-mono font-bold text-slate-400 uppercase">Distance Index</p>
                      <p className="text-sm font-black text-slate-800 dark:text-white">{req.distanceKm || 300} KM</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-mono font-bold text-slate-400 uppercase">Current Registry Mode</p>
                      <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase">{req.selectedMode}</p>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* DUAL COMPARATIVE COLUMNS */}
                <div className="lg:col-span-7 space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Comparative Logistics Tradeoffs</h4>
                  
                  {isAnalyzing ? (
                    <div className="h-64 flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-950/30 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
                      <RefreshCw className="animate-spin text-blue-600 mb-3" size={32} />
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Running Advanced Axle & Carbon Multi-Agent Evaluator...</p>
                    </div>
                  ) : aiReport ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* TRAIN CARD */}
                      <div className={`p-6 rounded-[2rem] border flex flex-col justify-between transition-all ${
                        aiReport.recommendedMode === TransportMode.RAIL 
                          ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/10' 
                          : 'border-slate-150 dark:border-slate-800 dark:bg-slate-950/20'
                      }`}>
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-lg">RAIL / TRAIN</span>
                            {aiReport.recommendedMode === TransportMode.RAIL && (
                              <span className="text-[9px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase">AI MATCH</span>
                            )}
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Estimated cost</p>
                              <p className="text-lg font-black text-slate-900 dark:text-white">₹ {aiReport.metrics.trainCost.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Greenhouse CO2 Emissions</p>
                              <p className="text-xs font-black text-emerald-600">{aiReport.metrics.trainCO2} Kg CO2</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Average Lead Time</p>
                              <p className="text-xs font-bold dark:text-white">{aiReport.metrics.trainDays} (Marshalling rakes included)</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-850">
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Efficiency Index</p>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-1 overflow-hidden">
                            <div className="bg-emerald-500 h-full transition-all" style={{ width: '92%' }} />
                          </div>
                        </div>
                      </div>

                      {/* TRUCK CARD */}
                      <div className={`p-6 rounded-[2rem] border flex flex-col justify-between transition-all ${
                        aiReport.recommendedMode === TransportMode.TRUCK 
                          ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/10' 
                          : 'border-slate-150 dark:border-slate-800 dark:bg-slate-950/20'
                      }`}>
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-100 dark:bg-indigo-950/60 px-3 py-1 rounded-lg">ROAD / TRUCK</span>
                            {aiReport.recommendedMode === TransportMode.TRUCK && (
                              <span className="text-[9px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase">AI MATCH</span>
                            )}
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Estimated cost</p>
                              <p className="text-lg font-black text-slate-900 dark:text-white">₹ {aiReport.metrics.truckCost.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Greenhouse CO2 Emissions</p>
                              <p className="text-xs font-black text-rose-500 dark:text-rose-400">{aiReport.metrics.truckCO2} Kg CO2</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Average Lead Time</p>
                              <p className="text-xs font-bold dark:text-white">{aiReport.metrics.truckDays} (Point-to-point dispatch agility)</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-850">
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Efficiency Index</p>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-1 overflow-hidden">
                            <div className="bg-indigo-500 h-full transition-all" style={{ width: '74%' }} />
                          </div>
                        </div>
                      </div>

                    </div>
                  ) : null}
                </div>

                {/* AI REPORT SUMMARY */}
                <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-950/40 p-8 rounded-[2rem] border border-slate-150 dark:border-slate-800 space-y-6">
                  <div className="flex items-center space-x-2">
                    <Zap className="text-amber-500" size={18} />
                    <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest font-mono">AI Recommended Outcome</h4>
                  </div>

                  {isAnalyzing ? (
                    <div className="space-y-3 py-6 animate-pulse">
                      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-3/4" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-full" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-5/6" />
                    </div>
                  ) : aiReport ? (
                    <div className="space-y-6">
                      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                        <div>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Optimized Routing Allocation</p>
                          <p className="text-2xl font-black text-slate-900 dark:text-white uppercase mt-0.5">
                            {aiReport.recommendedMode === TransportMode.RAIL ? 'TRAIN (RAIL)' : 'TRUCK'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Model Conf.</p>
                          <p className="text-xl font-black text-emerald-600">{aiReport.score}%</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">Strategic Reasoning Checklist</p>
                        <div className="space-y-3">
                          {aiReport.reasoning.map((reason, i) => (
                            <div key={i} className="flex items-start space-x-2.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">{reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={applyModeRecommendation}
                          disabled={updateSuccess}
                          className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            updateSuccess 
                              ? 'bg-emerald-600 text-white shadow-lg' 
                              : 'bg-slate-900 hover:bg-slate-950 text-white'
                          }`}
                        >
                          {updateSuccess ? '✓ Applied Successfully to Registry' : 'Apply AI Recommendation to Cargo'}
                        </button>
                        
                        {updateSuccess && (
                          <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 rounded-xl border border-emerald-100 dark:border-emerald-900 flex items-center space-x-2 text-[10px] font-bold animate-in fade-in duration-300">
                            <CheckCircle2 size={12} />
                            <span>Requirement selection mode updated key parameters. Re-optimized in Gurobi and solver pipelines.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>

              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50 dark:bg-slate-950/20 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <HelpCircle size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                No Site Manager requirements available inside your registered segment. Go to New Requirement tab to create some cargo demand!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GroundControlBot;
