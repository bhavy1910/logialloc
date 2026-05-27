
export enum UserRole {
  SITE_MANAGER = 'Site Manager',
  TRANSPORT_PROVIDER = 'Transport Provider',
  MANUFACTURER = 'Manufacturer',
  SC_ANALYST = 'Supply Chain Analyst'
}

export enum ShipmentStatus {
  PENDING = 'Pending Approval',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  ACTIVE = 'Active',
  COMPLETED = 'Completed'
}

export enum TransportMode {
  TRUCK = 'Truck',
  RAIL = 'Rail',
  SHIP = 'Ship',
  TEMPO = 'Tempo'
}

// Added missing enum WagonType
export enum WagonType {
  BOXNHL = 'BOXNHL',
  BCN = 'BCN',
  BRN = 'BRN'
}

// Added missing enum RoadVehicleType
export enum RoadVehicleType {
  V12_WHEELER = '12 Wheeler',
  V10_WHEELER = '10 Wheeler',
  V6_WHEELER = '6 Wheeler'
}

export enum NodeType {
  IU = 'Production Unit (IU)',
  GU = 'Grinding Unit (GU)',
  HUB = 'Inventory Hub'
}

export interface Node {
  id: string;
  name: string;
  type: NodeType;
  location: { lat: number; lng: number };
  capacity: number; // MT per Period
  openingStock: number;
}

export interface Route {
  fromId: string;
  toId: string;
  mode: TransportMode;
  costPerUnit: number;
  leadTimeDays: number;
  batchSize: number;
}

export interface Demand {
  nodeId: string;
  period: number;
  quantity: number;
}

export interface OptimizationResult {
  totalCost: number;
  productionPlan: { nodeId: string; period: number; quantity: number }[];
  transportPlan: { fromId: string; toId: string; mode: TransportMode; period: number; quantity: number; trips: number }[];
  inventoryPlan: { nodeId: string; period: number; level: number }[];
  metrics: {
    fulfillmentRate: number;
    capacityUtilization: number;
    costPerUnit: number;
  };
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  companyName: string;
  role: UserRole;
  contactNumber: string;
  siteLocation: string;
  gender: string;
  language: string;
  // Added properties used in profile and initialization
  dailyCapacity?: string;
  manufacturingLocation?: string;
  licenseType?: string;
  licenseExpiryDate?: string;
  licenseId?: string;
}

export interface Requirement {
  id: string;
  managerId: string;
  managerName: string;
  siteLocation: string;
  destination: string;
  materialAmount: string;
  materialType: string;
  selectedMode: TransportMode;
  createdAt: string;
  // Added properties used in creation and allocation
  distanceKm?: number;
  isBatched?: boolean;
  batchCount?: number;
  wagonType?: WagonType;
  wagonCount?: number;
  roadVehicleType?: RoadVehicleType;
  isAiOptimized?: boolean;
  aiOptimizedCost?: number;
  aiOptimizedSplit?: string;
}

// Added missing interface Driver
export interface Driver {
  id: string;
  name: string;
  vehicleNo: string;
  phone: string;
  vehicleType: TransportMode;
  capacity: string;
  status: 'Active' | 'Inactive';
}

// Added missing interface Allocation
export interface Allocation {
  mode: TransportMode;
  quantity: string;
  numVehicles: number;
  assignedDrivers: string[];
  loadingCharges: number;
  unloadingCharges: number;
  totalCost: number;
  duration: string;
  manufacturerContact: string;
  transportContact: string;
}

export interface Shipment {
  id: string;
  shipmentNumber: string;
  mode: TransportMode;
  quantity: string;
  status: ShipmentStatus;
  progress: number;
  driverName: string;
  driverId: string;
  materialType: string;
  totalCost: number;
  assignedDrivers: string[];
  // Added missing properties used in orders and tracking
  requirementId: string;
  loadingCharges?: number;
  unloadingCharges?: number;
  duration?: string;
  manufacturerContact?: string;
  transportContact?: string;
  numVehicles?: number;
  route?: { lat: number; lng: number }[];
}
