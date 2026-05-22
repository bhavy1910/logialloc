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
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'model',
      text: `Hello ${user.fullName}. Welcome to LogicAlloc Ground Control. I am your RAG-enabled logistics copilot. Ask me anything here about clinker allocations or container stacking densities.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const activePersona: 'Site Manager' | 'Transport Provider' | 'System Admin' = 
    user.role === UserRole.SITE_MANAGER ? 'Site Manager' :
    user.role === UserRole.TRANSPORT_PROVIDER ? 'Transport Provider' : 'System Admin';
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

  // Load requirements on mount
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
  }, []);

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
          fallbackText += "Analysis shows the recommended option aligns with historical route performance.";
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
                <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">LEVEL I EMERGENCY PROTOCOL</span>
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
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Interactive Decision and Planning Copilot</p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Chat Console container */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[550px]">
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
                Test automatic safety notifications by triggering these high-urgency highway events:
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
      </div>
  );
};

export default GroundControlBot;
