import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Map, 
  Award, 
  Percent, 
  DollarSign, 
  Lock, 
  Play, 
  Layers, 
  CheckSquare, 
  Plus, 
  Sparkles,
  ChevronRight, 
  CheckCircle2, 
  TrendingUp,
  TrendingDown,
  XCircle,
  Building2,
  Cpu,
  Package,
  IndianRupee,
  Briefcase,
  AlertTriangle,
  Factory,
  Activity,
  MessageSquare,
  Send,
  X,
  MessageCircle,
  Trophy
} from 'lucide-react';
import { DB } from '../store';
import { User, UserRole, Requirement, Shipment, ShipmentStatus, TransportMode } from '../types';

interface Props {
  user: User;
  onOrderAccepted?: () => void;
  onNavigateView?: (view: string) => void;
}

interface SupplierMatch {
  id: string;
  name: string;
  gbdtScore: number;
  fulfillmentRate: number;
  priceElasticity: number;
  damageClaimFreq: number;
  uberH3Address: string;
  stockAvailable: number;
  distanceKm: number;
  location: string;
  logo: string;
}

const getSupplierIcon = (logoStr: string) => {
  switch (logoStr) {
    case 'Layers':
      return Layers;
    case 'Building2':
      return Building2;
    case 'Factory':
      return Factory;
    case 'Briefcase':
      return Briefcase;
    default:
      return Building2;
  }
};

const CONSTANT_SUPPLIERS: SupplierMatch[] = [
  {
    id: 'S_A1',
    name: 'Maharashtra Cement Minerals Co.',
    gbdtScore: 97.4,
    fulfillmentRate: 98.6,
    priceElasticity: 1.12,
    damageClaimFreq: 0.01,
    uberH3Address: '872f00121ffffff (Res 7)',
    stockAvailable: 15000,
    distanceKm: 84,
    location: 'Pune Outskirts, MH',
    logo: 'Layers',
  },
  {
    id: 'S_A2',
    name: 'Vidarbha Crushed Steels & Raw',
    gbdtScore: 91.2,
    fulfillmentRate: 94.5,
    priceElasticity: 0.98,
    damageClaimFreq: 0.03,
    uberH3Address: '872f0012cffffff (Res 7)',
    stockAvailable: 22000,
    distanceKm: 140,
    location: 'Nagpur East Corridor',
    logo: 'Building2',
  },
  {
    id: 'S_A3',
    name: 'Gujarat Clinker Aggregates',
    gbdtScore: 88.5,
    fulfillmentRate: 92.1,
    priceElasticity: 1.45,
    damageClaimFreq: 0.01,
    uberH3Address: '872f00130ffffff (Res 7)',
    stockAvailable: 8000,
    distanceKm: 210,
    location: 'Surat industrial Sector B',
    logo: 'Factory',
  },
  {
    id: 'S_A4',
    name: 'Western India Mineral Corp.',
    gbdtScore: 79.8,
    fulfillmentRate: 85.0,
    priceElasticity: 1.65,
    damageClaimFreq: 0.06,
    uberH3Address: '872f0014affffff (Res 7)',
    stockAvailable: 35000,
    distanceKm: 420,
    location: 'Thane Central, MH',
    logo: 'Briefcase',
  }
];

const SuppliersPortal: React.FC<Props> = ({ user, onOrderAccepted, onNavigateView }) => {
  // Common states
  const [activeRequirements, setActiveRequirements] = useState<Requirement[]>([]);
  const [activeShipments, setActiveShipments] = useState<Shipment[]>([]);
  
  // Site Manager states
  const [rfqForm, setRfqForm] = useState({
    material: 'CLINKER GRADE A',
    amount: '12000',
    targetPrice: '2800',
    timelineDays: '15',
    certifications: {
      iso9001: true,
      ohsas18001: false,
      beeStar: true,
    }
  });
  const [broadcasted, setBroadcasted] = useState(false);
  const [biddingSupplier, setBiddingSupplier] = useState<SupplierMatch | null>(null);
  const [biddingLoopStatus, setBiddingLoopStatus] = useState<'IDLE' | 'BIDDING' | 'LOCKED'>('IDLE');
  const [currentBidPrice, setCurrentBidPrice] = useState(3100);
  const [bidsHistory, setBidsHistory] = useState<number[]>([]);

  // Manufacturer States
  const [isRegistered, setIsRegistered] = useState<boolean>(() => {
    return localStorage.getItem(`verified_mftr_${user.id}`) === 'true';
  });
  const [mftrForm, setMftrForm] = useState({
    companyName: user.companyName || 'Maharashtra Minerals Ltd.',
    plantCapacity: '50000',
    materialFocus: 'CLINKER GRADE A',
    locationAddress: user.siteLocation || 'Nagpur High Corridor',
    verifiedHubLicense: 'MH-MFT-2026-991'
  });
  const [customBidPrices, setCustomBidPrices] = useState<Record<string, string>>({});
  const [submittedBidsStatus, setSubmittedBidsStatus] = useState<Record<string, boolean>>({});
  const [mftrNotice, setMftrNotice] = useState<string>('');

  // Live Bidding entries per requirement ID
  interface LiveBidEntry {
    bidderName: string;
    amount: number;
    timestamp: string;
    isUser?: boolean;
  }
  const [liveBids, setLiveBids] = useState<Record<string, LiveBidEntry[]>>({});

  // Manufacturer Negotiation states
  const [negotiationActiveId, setNegotiationActiveId] = useState<string | null>(null);
  const [negotiationChats, setNegotiationChats] = useState<Record<string, Array<{ id: string; sender: 'manufacturer' | 'manager'; message: string; timestamp: string }>>>({});
  const [negotiationStatus, setNegotiationStatus] = useState<Record<string, { status: 'idle' | 'ongoing' | 'agreed' | 'rejected', agreedPrice?: number }>>({});
  const [typedMessage, setTypedMessage] = useState('');
  const [isTypingCounter, setIsTypingCounter] = useState<string | null>(null);

  const startNegotiationWithSiteManager = (req: Requirement) => {
    setNegotiationActiveId(req.id);
    if (!negotiationChats[req.id]) {
      const initialMsgs = [
        {
          id: 'm1',
          sender: 'manager' as const,
          message: `Hello ${user.fullName || 'Partner'}. I am ${req.managerName || 'Alex Rivera'}, the Site Manager for requirement [${req.id}]. We need to dispatch ${req.materialAmount} Tonnes of ${req.materialType} to ${req.destination}. Our standard target budget is around ₹2,900 per Tonne, but we are looking to optimize this with a competitive partner. What rate / Tonne can you provide?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setNegotiationChats(prev => ({ ...prev, [req.id]: initialMsgs }));
    }
  };

  const sendNegotiationMessage = (reqId: string, customText?: string) => {
    const textToSend = customText || typedMessage;
    if (!textToSend.trim()) return;

    const req = activeRequirements.find(r => r.id === reqId);
    if (!req) return;

    const newMsg = {
      id: `m_${Date.now()}`,
      sender: 'manufacturer' as const,
      message: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setNegotiationChats(prev => {
      const existing = prev[reqId] || [];
      return { ...prev, [reqId]: [...existing, newMsg] };
    });

    if (!customText) {
      setTypedMessage('');
    }

    setIsTypingCounter(reqId);

    let numericOffer = parseFloat(textToSend.replace(/[^0-9]/g, ''));
    if (isNaN(numericOffer) || numericOffer <= 0) {
      numericOffer = 2700;
    }

    setTimeout(() => {
      setIsTypingCounter(null);
      let responseText = '';
      let isFinal = false;
      let finalPrice = 0;

      if (numericOffer < 1200) {
        responseText = `₹${numericOffer.toLocaleString()} is below our baseline production overhead and transport fuel parameters. The absolute minimum we can approve is ₹2,200/T. Could you scale your quote closer to that?`;
      } else if (numericOffer >= 1200 && numericOffer < 2200) {
        responseText = `We appreciate your interest, but we have strict logistic tariffs. If we lock it at ₹2,350/T, we can sign the allocation immediately. What do you say?`;
      } else if (numericOffer >= 2200 && numericOffer <= 2850) {
        const agreedVal = Math.round(numericOffer);
        responseText = `That works perfectly! An offer of ₹${agreedVal.toLocaleString()}/T is competitive for our active planning cycle. Handshake established. Let's seal the contract for ${req.materialAmount} Tonnes!`;
        isFinal = true;
        finalPrice = agreedVal;
      } else {
        const agreedVal = Math.round(numericOffer * 0.95);
        responseText = `Your quote of ₹${numericOffer.toLocaleString()}/T is above our benchmark, but for premium dispatch agility we can finalize the contract at a discounted value of ₹${agreedVal.toLocaleString()}/T. Agreement confirmed!`;
        isFinal = true;
        finalPrice = agreedVal;
      }

      const replyMsg = {
        id: `reply_${Date.now()}`,
        sender: 'manager' as const,
        message: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setNegotiationChats(prev => {
        const existing = prev[reqId] || [];
        return { ...prev, [reqId]: [...existing, replyMsg] };
      });

      if (isFinal) {
        setNegotiationStatus(prev => ({
          ...prev,
          [reqId]: { status: 'agreed', agreedPrice: finalPrice }
        }));
        
        const updated = { ...req, aiOptimizedCost: finalPrice, isAiOptimized: true };
        DB.updateRequirement(updated);
        refreshRegistryData();
      }
    }, 1200);
  };

  useEffect(() => {
    const requirementsList = DB.getRequirements();
    setActiveRequirements(requirementsList);
    setActiveShipments(DB.getShipments());

    // Populate initial competitor bids for the live bidding deck
    const initialLiveBids: Record<string, LiveBidEntry[]> = {};
    requirementsList.forEach(req => {
      // Find a realistic budget range
      const baseCost = req.aiOptimizedCost || 2400 + (parseInt(req.id.replace(/[^0-9]/g, '')) || 1) * 150;
      initialLiveBids[req.id] = [
        { bidderName: 'Ultratech Cement Link', amount: Math.round(baseCost * 1.08), timestamp: '12m ago' },
        { bidderName: 'Ambuja Logistics Co.', amount: Math.round(baseCost * 1.02), timestamp: '5m ago' },
        { bidderName: 'JSW Steel Logistics', amount: Math.round(baseCost * 0.97), timestamp: '2m ago' },
      ].sort((a, b) => a.amount - b.amount);
    });
    setLiveBids(initialLiveBids);
  }, []);

  const refreshRegistryData = () => {
    setActiveRequirements(DB.getRequirements());
    setActiveShipments(DB.getShipments());
  };

  // Site Manager handlers
  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcasted(true);
    setBiddingSupplier(null);
    setBiddingLoopStatus('IDLE');
  };

  const startBiddingLoop = (supplier: SupplierMatch) => {
    setBiddingSupplier(supplier);
    setBiddingLoopStatus('BIDDING');
    const startPrice = Math.round(parseFloat(rfqForm.targetPrice) * 1.25);
    setCurrentBidPrice(startPrice);
    setBidsHistory([startPrice]);

    const rounds = [1.18, 1.12, 1.05, 0.99];
    rounds.forEach((factor, idx) => {
      setTimeout(() => {
        setBiddingLoopStatus((status) => {
          if (status !== 'BIDDING') return status;
          const nextBid = Math.round(parseFloat(rfqForm.targetPrice) * factor);
          setCurrentBidPrice(nextBid);
          setBidsHistory((prev) => [...prev, nextBid]);
          return 'BIDDING';
        });
      }, (idx + 1) * 1200);
    });
  };

  const lockTransaction = () => {
    setBiddingLoopStatus('LOCKED');
    localStorage.setItem('sourcing_order_accepted', 'true');
    if (biddingSupplier) {
      localStorage.setItem('accepted_bid_location', biddingSupplier.location);
      localStorage.setItem('accepted_bid_demand', rfqForm.amount);
      localStorage.setItem('accepted_bid_material', rfqForm.material);
    }
    window.dispatchEvent(new Event('storage'));
    if (onOrderAccepted) {
      onOrderAccepted();
    }
    // Save a mock requirement update
    const mockReqId = 'R1';
    const req = DB.getRequirementById(mockReqId);
    if (req) {
      DB.updateRequirement({ ...req, isBatched: true });
      refreshRegistryData();
    }
  };

  // Manufacturer handlers
  const handleMftrRegister = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(`verified_mftr_${user.id}`, 'true');
    setIsRegistered(true);
    setMftrNotice('Company credentials verified. Sourcing profile has been initialized for your bids.');
    setTimeout(() => setMftrNotice(''), 4000);
  };

  const submitManufacturerBid = (reqId: string, customPrice?: number) => {
    const priceValue = customPrice !== undefined ? String(customPrice) : customBidPrices[reqId];
    if (!priceValue || isNaN(parseFloat(priceValue))) return;
    
    const bidAmount = Math.round(parseFloat(priceValue));
    
    // Clear custom input if it wasn't a preset click
    if (customPrice === undefined) {
      setCustomBidPrices(prev => ({ ...prev, [reqId]: '' }));
    }

    setSubmittedBidsStatus(prev => ({ ...prev, [reqId]: true }));
    
    // Insert/update our bid in the live ledger
    setLiveBids(prev => {
      const activeList = prev[reqId] || [];
      const nonUserBids = activeList.filter(b => !b.isUser);
      const userBid = {
        bidderName: `${mftrForm.companyName || 'Our EcoUnit Node'} (You)`,
        amount: bidAmount,
        timestamp: 'Just now',
        isUser: true
      };
      return {
        ...prev,
        [reqId]: [...nonUserBids, userBid].sort((a, b) => a.amount - b.amount)
      };
    });

    setMftrNotice(`Your live bid of ₹${bidAmount.toLocaleString()}/T is active! Ledger standings updated.`);
    setTimeout(() => setMftrNotice(''), 4500);

    // Dynamic smart response simulation:
    // If you placed the leading bid, a competitor may try to outbid you in 2.5 seconds
    setTimeout(() => {
      setLiveBids(prev => {
        const currentList = prev[reqId] || [];
        const standsAsFirst = currentList[0]?.isUser;
        if (standsAsFirst && bidAmount > 1600) {
          const counterAmount = Math.round(bidAmount - 30 - Math.random() * 40);
          const challenger = {
            bidderName: Math.random() > 0.5 ? 'Adani Logistics Node' : 'Ultratech Cement Link',
            amount: counterAmount,
            timestamp: 'Just now'
          };
          setMftrNotice(`Competitor underbid you at ₹${counterAmount.toLocaleString()}/T! Submit a lower rate to reclaim lead.`);
          setTimeout(() => setMftrNotice(''), 5000);
          return {
            ...prev,
            [reqId]: [...currentList, challenger].sort((a, b) => a.amount - b.amount)
          };
        }
        return prev;
      });
    }, 2500);
  };

  const handleAcceptOrder = (shipmentId: string) => {
    DB.updateShipmentStatus(shipmentId, ShipmentStatus.APPROVED);
    refreshRegistryData();
    setMftrNotice(`Order [${shipmentId}] has been successfully Approved and locked for priority dispatch routing.`);
    setTimeout(() => setMftrNotice(''), 4500);
  };

  const handleDenyOrder = (shipmentId: string) => {
    DB.updateShipmentStatus(shipmentId, ShipmentStatus.REJECTED);
    refreshRegistryData();
    setMftrNotice(`Order [${shipmentId}] has been officially Rejected. Releasing resources back to carriers.`);
    setTimeout(() => setMftrNotice(''), 4500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500 pb-20">
      
      {/* Sourcing & Requirement Cohesive Tabs */}
      {user.role === 'SITE_MANAGER' && onNavigateView && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-3xl flex flex-wrap gap-2 shadow-sm">
          <button
            onClick={() => onNavigateView('SUPPLIERS')}
            className="flex-1 min-w-[200px] flex items-center justify-center space-x-2 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
          >
            <Award size={16} />
            <span>1. Sourcing & RFQ Market</span>
          </button>
          <button
            onClick={() => onNavigateView('CREATE_REQ')}
            className="flex-1 min-w-[200px] flex items-center justify-center space-x-2 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Plus size={16} />
            <span>2. Setup Transport Requirement</span>
          </button>
          <button
            onClick={() => onNavigateView('ALLOCATE')}
            disabled={localStorage.getItem('sourcing_order_accepted') !== 'true'}
            className={`flex-1 min-w-[200px] flex items-center justify-center space-x-2 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all ${
              localStorage.getItem('sourcing_order_accepted') !== 'true'
                ? 'opacity-40 cursor-not-allowed text-slate-300 dark:text-slate-600'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingDown size={16} />
            <span>3. Mode & Provider Allocation</span>
          </button>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-150 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 animate-pulse">
            <Award size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Sourcing Portal & RFQ Hub</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
              {user.role === UserRole.MANUFACTURER ? 'Manufacturer bidding & compliance cockpit' : 'Sourcing Portal'}
            </p>
          </div>
        </div>
        <div className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest self-start font-mono">
          Active Sourcing Network
        </div>
      </div>

      {mftrNotice && (
        <div className="p-6 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-450 border-l-8 border-emerald-600 dark:border-emerald-500 rounded-3xl text-sm font-bold flex items-center space-x-3 shadow-md animate-in slide-in-from-top-3">
          <CheckCircle2 className="text-emerald-600 flex-shrink-0 animate-bounce" />
          <span>{mftrNotice}</span>
        </div>
      )}

      {/* RENDER MANUFACTURER VIEW */}
      {user.role === UserRole.MANUFACTURER ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* MANUFACTURER COMP REGISTRATION */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-150 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <form onSubmit={handleMftrRegister} className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-4 mb-6">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center">
                  <Building2 size={16} className="mr-2 text-emerald-650" /> Company Registration
                </h3>
                <span className={`px-3.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full ${
                  isRegistered 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-500/20' 
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                }`}>
                  {isRegistered ? 'Verified Hub' : 'Pending Register'}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Corporate Entity Name</label>
                  <input
                    type="text"
                    disabled={isRegistered}
                    value={mftrForm.companyName}
                    onChange={(e) => setMftrForm({ ...mftrForm, companyName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-4 font-bold text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 disabled:opacity-65"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Dispatch Cap (MT/Mo)</label>
                    <input
                      type="number"
                      disabled={isRegistered}
                      value={mftrForm.plantCapacity}
                      onChange={(e) => setMftrForm({ ...mftrForm, plantCapacity: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-4 font-bold text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 disabled:opacity-65"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Resource Specialized</label>
                    <select
                      disabled={isRegistered}
                      value={mftrForm.materialFocus}
                      onChange={(e) => setMftrForm({ ...mftrForm, materialFocus: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-4 font-bold text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 disabled:opacity-65"
                    >
                      <option value="CLINKER GRADE A">CLINKER GRADE A (BULK)</option>
                      <option value="FLY ASH">FLY ASH</option>
                      <option value="PRECAST STEEL PIPES">PRECAST STEEL PIPES</option>
                      <option value="SOLAR PANEL ARRAYS">SOLAR PANEL ARRAYS (MODULES)</option>
                      <option value="COAL & LIGNITE">COAL & LIGNITE</option>
                      <option value="LIMESTONE FINE POWDER">LIMESTONE FINE POWDER</option>
                      <option value="AGRI-GRAINS BULK">AGRI-GRAINS BULK (SILO)</option>
                      <option value="HEAVY BOILER MOTORS">HEAVY BOILER MOTORS</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Plant Location Segment</label>
                  <input
                    type="text"
                    disabled={isRegistered}
                    value={mftrForm.locationAddress}
                    onChange={(e) => setMftrForm({ ...mftrForm, locationAddress: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-4 font-bold text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 disabled:opacity-65"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Verification License Code</label>
                  <input
                    type="text"
                    disabled={isRegistered}
                    value={mftrForm.verifiedHubLicense}
                    onChange={(e) => setMftrForm({ ...mftrForm, verifiedHubLicense: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-indigo-950/20 border border-slate-100 dark:border-slate-800 rounded-xl p-4 font-mono text-[10px] font-bold text-indigo-650 dark:text-indigo-400 outline-none disabled:opacity-85"
                  />
                </div>
              </div>

              {!isRegistered ? (
                <button
                  type="submit"
                  className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all active:scale-[0.98] shadow"
                >
                  Register Manufacturer Compliance Node
                </button>
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-[10px] font-semibold rounded-2xl leading-relaxed text-center pointer-events-none border border-slate-150 dark:border-slate-850">
                  Site securely registered under License ID. To update locations, please submit paperwork to your administrator.
                </div>
              )}
            </form>
          </div>

          {/* ACTIVE RFQS BIDDING AND ORDERS ACTION DECK */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 1. RFQ Bidding Grid */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-150 dark:border-slate-800 shadow-sm space-y-6">
              <div className="border-b border-slate-50 dark:border-slate-800 pb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Active RFQs Matrix (Enter Competitor Bids)</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Submit custom pricing quotes per tonne to secure regional demand</p>
                </div>
              </div>

              <div className="space-y-4">
                {activeRequirements.length > 0 ? (
                  activeRequirements.map((req) => {
                    const hasSubmitted = submittedBidsStatus[req.id];
                    return (
                      <div key={req.id} className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-205 dark:border-slate-850 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-650 dark:text-indigo-400 px-2.5 py-0.5 rounded-lg uppercase tracking-wider font-bold">Requirement ID: {req.id}</span>
                            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase mt-1.5">{req.materialType} • {req.materialAmount} T</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">To: {req.destination} • Distance: {req.distanceKm || 300} KM</p>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-[8px] text-slate-450 uppercase tracking-widest font-bold">Route Preference</span>
                            <p className="text-xs font-black text-slate-800 dark:text-slate-300 uppercase">{req.selectedMode}</p>
                          </div>
                        </div>

                        {/* Live Bids Board */}
                        <div className="bg-slate-100/50 dark:bg-slate-950/45 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/60 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                              Live Competitive Bids Board
                            </span>
                            <span className="text-[8px] font-mono text-indigo-500 dark:text-indigo-400 uppercase font-bold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">Reverse Auction Desk</span>
                          </div>

                          <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
                            {(!liveBids[req.id] || liveBids[req.id].length === 0) ? (
                              <div className="text-[9px] text-slate-450 italic py-2 text-center">Initialising live bidding pool...</div>
                            ) : (
                              liveBids[req.id].map((bid, idx) => {
                                const isLeading = idx === 0;
                                return (
                                  <div 
                                    key={idx} 
                                    className={`flex items-center justify-between p-2 rounded-lg text-[10px] h-9 transition-all duration-300 border ${
                                      bid.isUser 
                                        ? 'bg-indigo-500/10 border-indigo-500/30 dark:bg-indigo-500/15 text-slate-800 dark:text-white' 
                                        : isLeading
                                          ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-700 dark:text-slate-300'
                                          : 'bg-white/80 dark:bg-slate-900/60 border-slate-200/40 dark:border-slate-800/45 text-slate-600 dark:text-slate-400'
                                    }`}
                                  >
                                    <div className="flex items-center space-x-2 truncate">
                                      {isLeading ? (
                                        <Trophy size={11} className="text-amber-500 flex-shrink-0 animate-bounce" />
                                      ) : (
                                        <Award size={11} className="text-slate-400 flex-shrink-0" />
                                      )}
                                      <span className="font-extrabold truncate">
                                        {bid.bidderName}
                                      </span>
                                      {bid.isUser && (
                                        <span className="bg-indigo-600 text-white text-[7px] font-bold px-1.5 py-0.5 rounded scale-90">YOU</span>
                                      )}
                                      {isLeading && (
                                        <span className="bg-emerald-600 text-white text-[7px] font-bold px-1.5 py-0.5 rounded scale-90">LEAD</span>
                                      )}
                                    </div>

                                    <div className="flex items-center space-x-2 flex-shrink-0">
                                      <span className="text-slate-400 text-[8px] font-mono">{bid.timestamp}</span>
                                      <span className="font-black text-slate-800 dark:text-white text-xs">
                                        ₹{bid.amount.toLocaleString()}/T
                                      </span>
                                      {!bid.isUser && isRegistered && (
                                        <button
                                          type="button"
                                          disabled={hasSubmitted}
                                          onClick={() => {
                                            const targetRate = Math.round(bid.amount - 20);
                                            submitManufacturerBid(req.id, targetRate);
                                          }}
                                          className={`px-2 py-1 text-[8px] font-black uppercase rounded tracking-wider transition-all ${
                                            hasSubmitted
                                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                              : 'bg-[#0f172a] hover:bg-slate-950 dark:bg-blue-600 dark:hover:bg-blue-700 text-white hover:scale-105 active:scale-95'
                                          }`}
                                        >
                                          Bid ₹{(bid.amount - 20).toLocaleString()}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-850">
                          <div className="flex-1 flex items-center bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl px-3 py-2">
                            <IndianRupee size={12} className="text-slate-400 mr-1 flex-shrink-0" />
                            <input
                              type="number"
                              disabled={hasSubmitted || !isRegistered}
                              placeholder="Enter bid amount / T"
                              value={customBidPrices[req.id] || ''}
                              onChange={(e) => setCustomBidPrices({ ...customBidPrices, [req.id]: e.target.value })}
                              className="bg-transparent text-xs font-extrabold pb-0.5 dark:text-white outline-none w-full"
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => submitManufacturerBid(req.id)}
                              disabled={hasSubmitted || !isRegistered || !customBidPrices[req.id]}
                              className={`px-4 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${
                                hasSubmitted 
                                  ? 'bg-emerald-600 text-white font-bold' 
                                  : isRegistered 
                                    ? 'bg-[#0f172a] hover:bg-slate-950 dark:bg-blue-600 text-white hover:scale-105' 
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              {hasSubmitted ? '✓ Bidded' : 'Submit Bid'}
                            </button>

                            <button
                              type="button"
                              onClick={() => startNegotiationWithSiteManager(req)}
                              disabled={!isRegistered}
                              className={`px-4 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center space-x-1.5 ${
                                negotiationActiveId === req.id
                                  ? 'bg-indigo-600 text-white'
                                  : isRegistered
                                    ? 'bg-slate-100 hover:bg-slate-205 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              <MessageSquare size={12} />
                              <span>{negotiationActiveId === req.id ? 'Active' : 'Negotiate'}</span>
                            </button>
                          </div>
                        </div>
                        
                        {negotiationActiveId === req.id && (
                          <div className="mt-4 pt-4 border-t border-slate-150 dark:border-slate-800/80 space-y-4 animate-in slide-in-from-top-4 duration-300">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-25">
                                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
                                  <MessageCircle size={16} className="text-blue-500 animate-pulse" />
                                </div>
                                <div className="ml-1">
                                  <h5 className="text-[11px] font-black uppercase text-slate-800 dark:text-white leading-none mb-1">{req.managerName || 'Alex Rivera'}</h5>
                                  <p className="text-[8px] text-emerald-500 font-black uppercase tracking-wider flex items-center leading-none">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1 inline-block animate-pulse" />
                                    <span>Site Manager • Connected</span>
                                  </p>
                                </div>
                              </div>
                              <button 
                                onClick={() => setNegotiationActiveId(null)}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                              >
                                <X size={14} />
                              </button>
                            </div>

                            {/* Chat messages viewport */}
                            <div className="max-h-60 overflow-y-auto bg-slate-100/60 dark:bg-slate-950/60 rounded-xl p-4 space-y-3 flex flex-col border border-slate-150 dark:border-slate-850">
                              {(negotiationChats[req.id] || []).map((msg) => {
                                const isUser = msg.sender === 'manufacturer';
                                return (
                                  <div 
                                    key={msg.id} 
                                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                                      isUser 
                                        ? 'bg-[#0f172a] text-white dark:bg-blue-600 self-end rounded-tr-none' 
                                        : 'bg-white text-slate-800 dark:bg-slate-850 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800/60 self-start rounded-tl-none shadow-sm'
                                    }`}
                                  >
                                    <p className="font-semibold">{msg.message}</p>
                                    <span className="text-[8px] text-slate-400 block text-right mt-1 font-mono">{msg.timestamp}</span>
                                  </div>
                                );
                              })}
                              {isTypingCounter === req.id && (
                                <div className="bg-white text-slate-500 dark:bg-slate-850 dark:text-slate-400 border border-slate-200/65 dark:border-slate-800 self-start rounded-2xl rounded-tl-none p-3 text-xs flex items-center space-x-1.5 shadow-sm">
                                  <span className="w-1.5 h-1.5 bg-slate-450 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                  <span className="w-1.5 h-1.5 bg-slate-450 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                  <span className="w-1.5 h-1.5 bg-slate-450 rounded-full animate-bounce" />
                                </div>
                              )}
                            </div>

                            {/* Negotiation status alerts */}
                            {negotiationStatus[req.id]?.status === 'agreed' ? (
                              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-center justify-between text-emerald-800 dark:text-emerald-400">
                                <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-wider">
                                  <CheckCircle2 size={14} className="text-emerald-600 animate-bounce" />
                                  <span>Deal Agreed at ₹{negotiationStatus[req.id].agreedPrice?.toLocaleString()}/T!</span>
                                </div>
                                <span className="text-[8px] font-bold bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-1 rounded">Registry Updated</span>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {/* Preset offers pills */}
                                <div className="flex flex-wrap gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => sendNegotiationMessage(req.id, "I can offer ₹2,350 / Tonne for the whole shipment.")}
                                    className="px-2.5 py-1.5 bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-lg text-[9px] font-black uppercase text-slate-600 dark:text-slate-350 transition-all border border-slate-200/50 dark:border-slate-800/50"
                                  >
                                    Offer ₹2,350/T
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => sendNegotiationMessage(req.id, "How about ₹2,450 / Tonne with fast track delivery?")}
                                    className="px-2.5 py-1.5 bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-lg text-[9px] font-black uppercase text-slate-600 dark:text-slate-355 transition-all border border-slate-200/50 dark:border-slate-800/50"
                                  >
                                    Propose ₹2,450/T
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => sendNegotiationMessage(req.id, "We can do ₹2,600 / Tonne with priority bulk loading.")}
                                    className="px-2.5 py-1.5 bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-lg text-[9px] font-black uppercase text-slate-600 dark:text-[#cbd5e1] transition-all border border-slate-200/50 dark:border-slate-800/50"
                                  >
                                    Propose ₹2,600/T
                                  </button>
                                </div>

                                {/* Message input controller */}
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    placeholder="Type customized price proposal (e.g. ₹2450)..."
                                    value={typedMessage}
                                    onChange={(e) => setTypedMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') sendNegotiationMessage(req.id);
                                    }}
                                    className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-xs font-semibold dark:text-white outline-none focus:border-indigo-500 shadow-inner"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => sendNegotiationMessage(req.id)}
                                    className="p-2.5 bg-[#0f172a] dark:bg-blue-600 hover:scale-[1.05] text-white rounded-xl transition-all shadow"
                                  >
                                    <Send size={14} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {!isRegistered && (
                          <p className="text-[8px] text-amber-500 font-black tracking-widest uppercase flex items-center space-x-1 mt-1.5">
                            <AlertTriangle size={10} />
                            <span>Complete Registration first to place negotiation bids</span>
                          </p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-450 text-center py-6">No active Site Manager requirements on ledger.</p>
                )}
              </div>
            </div>

            {/* 2. Order Accept/Deny Deck */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-150 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Accept or Deny Raw Orders</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Approve incoming shipment logistics tickets or decline them to release carriers</p>
              </div>

              <div className="space-y-4">
                {activeShipments.map((shipment) => (
                  <div key={shipment.id} className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start space-x-3.5">
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-950/45 text-indigo-650 dark:text-indigo-400 rounded-xl mt-1">
                        <Package size={20} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-extrabold text-xs dark:text-white">{shipment.shipmentNumber}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                            shipment.status === ShipmentStatus.APPROVED 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-500/10'
                              : shipment.status === ShipmentStatus.REJECTED 
                                ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                          }`}>
                            {shipment.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Quantity: {shipment.quantity} • Material: {shipment.materialType}</p>
                        <p className="text-[8px] font-mono text-slate-450 uppercase mt-0.5">Mode Requested: {shipment.mode} • Base cost: ₹{shipment.totalCost.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2.5 w-full md:w-auto mt-2 md:mt-0 justify-end">
                      {shipment.status !== ShipmentStatus.APPROVED && shipment.status !== ShipmentStatus.REJECTED ? (
                        <>
                          <button
                            onClick={() => handleAcceptOrder(shipment.id)}
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[9px] uppercase tracking-widest rounded-xl shadow transition-all hover:scale-105"
                          >
                            Accept Order
                          </button>
                          <button
                            onClick={() => handleDenyOrder(shipment.id)}
                            className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-red-50 text-slate-600 dark:text-slate-350 hover:text-red-600 font-extrabold text-[9px] uppercase tracking-widest rounded-xl transition-all"
                          >
                            Deny
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">🔒 Closed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* RENDER SITE MANAGER PORTAL VIEW (EXISTING Structured RFQ and Matched Sourcing) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Issue Structured RFQ */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-150 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <form onSubmit={handleBroadcast} className="space-y-6">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 pb-4 mb-6 flex items-center">
                <Plus size={16} className="mr-2 text-emerald-600" /> Issue Structured RFQ
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Material Specification</label>
                  <select
                    value={rfqForm.material}
                    onChange={(e) => setRfqForm({ ...rfqForm, material: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-4 font-bold text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  >
                    <option value="CLINKER GRADE A">CLINKER GRADE A (BULK)</option>
                    <option value="FLY ASH">FLY ASH</option>
                    <option value="PRECAST STEEL PIPES">PRECAST STEEL PIPES</option>
                    <option value="SOLAR PANEL ARRAYS">SOLAR PANEL ARRAYS (MODULES)</option>
                    <option value="COAL & LIGNITE">COAL & LIGNITE</option>
                    <option value="LIMESTONE FINE POWDER">LIMESTONE FINE POWDER</option>
                    <option value="AGRI-GRAINS BULK">AGRI-GRAINS BULK (SILO)</option>
                    <option value="HEAVY BOILER MOTORS">HEAVY BOILER MOTORS</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Volume (Tonnes)</label>
                    <input
                      type="number"
                      value={rfqForm.amount}
                      onChange={(e) => setRfqForm({ ...rfqForm, amount: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-4 font-bold text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Target Price per T</label>
                    <input
                      type="number"
                      value={rfqForm.targetPrice}
                      onChange={(e) => setRfqForm({ ...rfqForm, targetPrice: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-4 font-bold text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Required Deliver Timeline</label>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-4">
                    <input
                      type="number"
                      value={rfqForm.timelineDays}
                      onChange={(e) => setRfqForm({ ...rfqForm, timelineDays: e.target.value })}
                      className="bg-transparent font-bold text-xs text-slate-900 dark:text-white outline-none flex-1"
                    />
                    <span className="text-[10px] font-black uppercase text-slate-400">Days</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Mandatory QA Certifications</label>
                  <div className="grid grid-cols-1 gap-2">
                    <label className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rfqForm.certifications.iso9001}
                        onChange={(e) => setRfqForm({ ...rfqForm, certifications: { ...rfqForm.certifications, iso9001: e.target.checked } })}
                        className="rounded border-slate-300 dark:border-slate-800 text-emerald-650 focus:ring-emerald-500 h-4 w-4"
                      />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">ISO 9001 Quality Certified</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rfqForm.certifications.ohsas18001}
                        onChange={(e) => setRfqForm({ ...rfqForm, certifications: { ...rfqForm.certifications, ohsas18001: e.target.checked } })}
                        className="rounded border-slate-300 dark:border-slate-800 text-emerald-655 focus:ring-emerald-500 h-4 w-4"
                      />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">OHSAS 18001 Safety Management</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rfqForm.certifications.beeStar}
                        onChange={(e) => setRfqForm({ ...rfqForm, certifications: { ...rfqForm.certifications, beeStar: e.target.checked } })}
                        className="rounded border-slate-300 dark:border-slate-800 text-emerald-660 focus:ring-emerald-500 h-4 w-4"
                      />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">BEE Star Energy Rating Compliance</span>
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20"
              >
                📣 Broadcast RFQ to Sourcing Grid
              </button>
            </form>
          </div>

          {/* Sourcing matched results / loop negotiation */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-150 dark:border-slate-800 p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black dark:text-white uppercase flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                    <Sparkles size={14} className="animate-pulse" /> Let our AI find the best option for you
                  </h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Matching real-time market rates with top verified supplier configurations</p>
                </div>
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 text-[10px] font-black rounded-lg">MATCH SCORE</span>
              </div>

              {broadcasted ? (
                <div className="space-y-4">
                  {CONSTANT_SUPPLIERS.map((supplier) => {
                    const meetsCapacity = supplier.stockAvailable >= parseFloat(rfqForm.amount);
                    return (
                      <div
                        key={supplier.id}
                        className="p-5 bg-slate-50 dark:bg-slate-950/60 rounded-3xl border border-slate-150 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 group hover:border-emerald-500 transition-all shadow-sm"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-white dark:bg-slate-850 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow">
                            {React.createElement(getSupplierIcon(supplier.logo), { size: 24 })}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-xs dark:text-white leading-tight">{supplier.name}</h4>
                            <div className="flex items-center space-x-3 mt-1.5 text-[9px] font-black text-slate-400 uppercase">
                              <span className="flex items-center text-emerald-600 space-x-1">
                                <TrendingUp size={11} className="mr-0.5" />
                                <span>{supplier.fulfillmentRate}% Fulfilled</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Map size={11} className="mr-0.5" />
                                <span>{supplier.distanceKm}KM</span>
                              </span>
                              <span className={`flex items-center space-x-1 ${meetsCapacity ? 'text-blue-500' : 'text-rose-500'}`}>
                                <Package size={11} className="mr-0.5" />
                                <span>Stock: {supplier.stockAvailable.toLocaleString()} T</span>
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 mt-2 font-mono text-[8px] tracking-tight text-slate-400">
                              <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">H3: {supplier.uberH3Address}</span>
                              <span>Elasticity: {supplier.priceElasticity}</span>
                              <span>Claims Rate: {supplier.damageClaimFreq}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Supplier Rating</span>
                            <span className="font-black text-lg text-emerald-600">{supplier.gbdtScore}%</span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => startBiddingLoop(supplier)}
                            className="px-5 py-3 bg-slate-900 dark:bg-emerald-600 hover:scale-[1.03] active:scale-[0.97] text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center space-x-1.5 shadow transition-all"
                          >
                            <Play size={10} />
                            <span>NEGOTIATE</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-950/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Search size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3 animate-ping" />
                  <p className="text-xs text-slate-500 font-bold max-w-sm mx-auto leading-relaxed">
                    finding the best options for you
                  </p>
                </div>
              )}
            </div>

            {/* Dynamic negotiation loop */}
            {biddingSupplier && (
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-emerald-500 p-8 shadow-2xl animate-in zoom-in-95 duration-500 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-405 shadow">
                      {React.createElement(getSupplierIcon(biddingSupplier.logo), { size: 20 })}
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">Dynamic Bidding portal</span>
                      <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase mt-0.5">{biddingSupplier.name} Negotiation</h4>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Status</p>
                    <div className={`text-xs font-black uppercase flex items-center space-x-1 justify-end ${
                      biddingLoopStatus === 'LOCKED' ? 'text-emerald-600' : 'text-amber-500 animate-pulse'
                    }`}>
                      {biddingLoopStatus === 'LOCKED' ? (
                        <>
                          <Lock size={12} />
                          <span>Locked</span>
                        </>
                      ) : (
                        <>
                          <Activity size={12} />
                          <span>Active Round</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-slate-100 dark:border-slate-850 flex flex-col justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 font-mono">Decay Bid Sequence (₹ / MT)</p>
                    <div className="h-28 flex items-end space-x-2 pb-2">
                      {bidsHistory.map((bid, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center space-y-2">
                          <span className="text-[8px] font-mono font-bold text-slate-400">₹{bid}</span>
                          <div
                            style={{ height: `${(bid / 4000) * 100}%` }}
                            className={`w-full rounded-t-lg transition-all duration-500 ${
                              i === bidsHistory.length - 1 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                          />
                          <span className="text-[8px] font-bold text-slate-450">R{i+1}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1.5">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Current Low Bid Price</p>
                      <p className="text-3xl font-black text-slate-900 dark:text-white">₹{currentBidPrice.toLocaleString()} <span className="text-xs text-slate-400">/ MT</span></p>
                      <p className="text-[10px] font-black text-emerald-500 flex items-center">
                        <TrendingUp size={12} className="mr-1" /> Save -₹{Math.max(0, 3804 - currentBidPrice)}/MT vs local average
                      </p>
                    </div>

                    {biddingLoopStatus === 'LOCKED' ? (
                      <button
                        disabled
                        className="w-full py-5 bg-emerald-600 text-white font-extrabold rounded-2xl text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 shadow-xl"
                      >
                        <CheckCircle2 size={14} />
                        <span>Cryptographic Lock Established</span>
                      </button>
                    ) : (
                      <div className="flex space-x-3.5">
                        <button
                          onClick={lockTransaction}
                          className="flex-1 py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          <CheckCircle2 size={14} />
                          <span>Accept Bid</span>
                        </button>
                        <button
                          onClick={() => {
                            setBiddingSupplier(null);
                            setBiddingLoopStatus('IDLE');
                          }}
                          className="px-5 py-5 bg-slate-200 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-700 dark:text-slate-300 font-extrabold rounded-2xl text-[10px] uppercase tracking-widest transition-all"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {biddingLoopStatus === 'LOCKED' && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-800 flex items-center space-x-3 text-emerald-800 dark:text-emerald-450 rounded-xl leading-relaxed text-xs">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    <span>Cryptographic signature locked. Procurement contract has been recorded on the secure ledger. Syncing details to optimization systems...</span>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default SuppliersPortal;
