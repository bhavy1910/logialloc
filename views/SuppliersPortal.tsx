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
  ChevronRight, 
  CheckCircle2, 
  TrendingUp,
  XCircle,
  Building2,
  Cpu,
  Package,
  IndianRupee,
  Briefcase,
  AlertTriangle,
  Factory,
  Activity
} from 'lucide-react';
import { DB } from '../store';
import { User, UserRole, Requirement, Shipment, ShipmentStatus, TransportMode } from '../types';

interface Props {
  user: User;
  onOrderAccepted?: () => void;
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

const SuppliersPortal: React.FC<Props> = ({ user, onOrderAccepted }) => {
  // Common states
  const [activeRequirements, setActiveRequirements] = useState<Requirement[]>([]);
  const [activeShipments, setActiveShipments] = useState<Shipment[]>([]);
  
  // Site Manager states
  const [rfqForm, setRfqForm] = useState({
    material: 'Clinker Grade A',
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
    materialFocus: 'Clinker Grade A',
    locationAddress: user.siteLocation || 'Nagpur High Corridor',
    verifiedHubLicense: 'MH-MFT-2026-991'
  });
  const [customBidPrices, setCustomBidPrices] = useState<Record<string, string>>({});
  const [submittedBidsStatus, setSubmittedBidsStatus] = useState<Record<string, boolean>>({});
  const [mftrNotice, setMftrNotice] = useState<string>('');

  useEffect(() => {
    setActiveRequirements(DB.getRequirements());
    setActiveShipments(DB.getShipments());
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
    setMftrNotice('Company credentials verified. Cryptographic GBDT ranking nodes have been initialized for your bids.');
    setTimeout(() => setMftrNotice(''), 4000);
  };

  const submitManufacturerBid = (reqId: string) => {
    const priceValue = customBidPrices[reqId];
    if (!priceValue || isNaN(parseFloat(priceValue))) return;
    
    setSubmittedBidsStatus(prev => ({ ...prev, [reqId]: true }));
    setMftrNotice(`Negotiated bid of ₹${parseFloat(priceValue).toLocaleString()}/T has been broadcasted to site managers.`);
    setTimeout(() => setMftrNotice(''), 4500);
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
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-150 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 animate-pulse">
            <Award size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Sourcing Portal & RFQ Hub</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
              {user.role === UserRole.MANUFACTURER ? 'Manufacturer bidding & compliance cockpit' : 'Pillars 1, 5, 6 Sourcing Optimizer'}
            </p>
          </div>
        </div>
        <div className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest self-start font-mono">
          GBDT Collaborative Sourcing Nodes
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
                      <option value="Clinker Grade A">Clinker Grade A</option>
                      <option value="Limestone Fine Powder">Limestone Fine Powder</option>
                      <option value="Precast Steel Pipes">Steel Pipes</option>
                      <option value="Solar Modules">Solar Modules</option>
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
                  Node securely synchronized on GBDT network under License ID. To update locations, please submit paperwork to Regional Sourcing Supervisor.
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

                        <div className="flex items-center space-x-3 pt-3 border-t border-slate-100 dark:border-slate-850">
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
                        </div>
                        
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
                <Plus size={16} className="mr-2 text-emerald-600" /> FR-1.1 Issue Structured RFQ
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Material Specification</label>
                  <select
                    value={rfqForm.material}
                    onChange={(e) => setRfqForm({ ...rfqForm, material: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-4 font-bold text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  >
                    <option value="Clinker Grade A">Clinker Grade A (Bulk)</option>
                    <option value="Limestone Fine Powder">Limestone Fine Powder</option>
                    <option value="Precast Steel Pipes">Precast Eng. Steel Pipes</option>
                    <option value="Solar Modules">Photovoltaic Solar Modules</option>
                    <option value="Ground Slag">Ground Granulated Blast Slag</option>
                    <option value="Wheat Silo Cargo">Agriculture Wheat Silo Cargo</option>
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
                  <h3 className="text-sm font-black dark:text-white uppercase">ML-Matched Optimal Sourcing Grid</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{"Ranked by Collaborative Filtering & k-NN Constraints (S_available ≥ D_demand)"}</p>
                </div>
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 text-[10px] font-black rounded-lg">GBDT SCORE</span>
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
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">GBDT Rating</span>
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
                    Fill out and broadcast your structured RFQ on the left to initialize the k-NN proximities and compliance ranking models.
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
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">FR-1.3 Dynamic Bidding portal</span>
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
