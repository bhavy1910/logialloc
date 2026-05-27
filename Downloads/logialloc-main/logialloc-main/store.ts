
import { User, Driver, Requirement, Allocation, Shipment, UserRole, TransportMode, ShipmentStatus } from './types';

// Initial Mock Data to ensure a rich experience on first load
const MOCK_USERS: User[] = [
  {
    id: 'U1',
    email: 'manager@site.com',
    fullName: 'Alex Rivera',
    companyName: 'BuildCore Infrastructure',
    role: UserRole.SITE_MANAGER,
    contactNumber: '+1 555-0199',
    siteLocation: 'Site A - North Industrial Park',
    gender: 'Male',
    language: 'English'
  },
  {
    id: 'U2',
    email: 'transport@logistics.com',
    fullName: 'Sarah Chen',
    companyName: 'SwiftFlow Logistics',
    role: UserRole.TRANSPORT_PROVIDER,
    contactNumber: '+1 555-0288',
    siteLocation: 'Main Depot - East Port',
    gender: 'Female',
    language: 'English'
  },
  {
    id: 'U3',
    email: 'mfg@industry.com',
    fullName: 'David Miller',
    companyName: 'SteelWorks Manufacturing',
    role: UserRole.MANUFACTURER,
    contactNumber: '+91 9988007766',
    siteLocation: 'Pune Industrial Belt',
    gender: 'Male',
    language: 'English',
    dailyCapacity: '5000 Tonnes',
    manufacturingLocation: 'MIDC Chakan, Block G'
  }
];

const MOCK_DRIVERS: Driver[] = [
  { id: 'D1', name: 'Jane Cooper', vehicleNo: 'GJ 123456', phone: '(225) 555-0118', vehicleType: TransportMode.TEMPO, capacity: '50 kg', status: 'Active' },
  { id: 'D2', name: 'Floyd Miles', vehicleNo: 'GJ 654321', phone: '(205) 555-0100', vehicleType: TransportMode.TRUCK, capacity: '100 kg', status: 'Inactive' },
  { id: 'D3', name: 'Ronald Richards', vehicleNo: 'GJ 987654', phone: '(302) 555-0107', vehicleType: TransportMode.TRUCK, capacity: '100 kg', status: 'Inactive' },
];

const MOCK_REQUIREMENTS: Requirement[] = [
  {
    id: 'R1',
    managerId: 'U1',
    managerName: 'Alex Rivera',
    siteLocation: 'Mumbai Terminal, MH',
    destination: 'Nagpur Logistics Hub',
    materialAmount: '500',
    materialType: 'Clinker Grade A',
    distanceKm: 800,
    createdAt: '2026-05-18T10:00:00Z',
    selectedMode: TransportMode.TRUCK
  },
  {
    id: 'R2',
    managerId: 'U1',
    managerName: 'Alex Rivera',
    siteLocation: 'Pune Industrial Belt',
    destination: 'Surat Industrial Sector B',
    materialAmount: '1200',
    materialType: 'Precast Steel Pipes',
    distanceKm: 340,
    createdAt: '2026-05-19T08:30:00Z',
    selectedMode: TransportMode.RAIL
  },
  {
    id: 'R3',
    managerId: 'U1',
    managerName: 'Alex Rivera',
    siteLocation: 'Ahmedabad Depot',
    destination: 'Mumbai Port Yard',
    materialAmount: '80',
    materialType: 'Optical Telemetry Sensors',
    distanceKm: 512,
    createdAt: '2026-05-20T02:15:00Z',
    selectedMode: TransportMode.TRUCK
  }
];

const MOCK_SHIPMENTS: Shipment[] = [
  {
    id: 'S1',
    shipmentNumber: 'EV-2026-001',
    requirementId: 'R1',
    mode: TransportMode.TRUCK,
    quantity: '500 Tonnes',
    loadingCharges: 12000,
    unloadingCharges: 12000,
    totalCost: 145000,
    duration: '2 Days',
    status: ShipmentStatus.ACTIVE,
    manufacturerContact: '+91 9988007766',
    transportContact: '+91 8888888888',
    numVehicles: 15,
    assignedDrivers: ['Jane Cooper', 'Floyd Miles'],
    driverId: 'D1',
    driverName: 'Jane Cooper',
    materialType: 'Clinker Grade A',
    progress: 45,
    route: [{ lat: 19.0760, lng: 72.8777 }, { lat: 21.1458, lng: 79.0882 }]
  },
  {
    id: 'S2',
    shipmentNumber: 'EV-2026-002',
    requirementId: 'R2',
    mode: TransportMode.RAIL,
    quantity: '1200 Tonnes',
    loadingCharges: 45000,
    unloadingCharges: 45000,
    totalCost: 320000,
    duration: '1 Day',
    status: ShipmentStatus.APPROVED,
    manufacturerContact: '+91 9988007766',
    transportContact: '+91 8888888888',
    numVehicles: 1, // 1 rake
    assignedDrivers: ['Ronald Richards'],
    driverId: 'D3',
    driverName: 'Ronald Richards',
    materialType: 'Precast Steel Pipes',
    progress: 0,
    route: [{ lat: 18.5204, lng: 73.8567 }, { lat: 21.1702, lng: 72.8311 }]
  },
  {
    id: 'S3',
    shipmentNumber: 'EV-2026-003',
    requirementId: 'R3',
    mode: TransportMode.TRUCK,
    quantity: '80 Tonnes',
    loadingCharges: 5000,
    unloadingCharges: 5000,
    totalCost: 65000,
    duration: '1 Day',
    status: ShipmentStatus.ACTIVE,
    manufacturerContact: '+91 9988007766',
    transportContact: '+91 8888888888',
    numVehicles: 3,
    assignedDrivers: ['Floyd Miles'],
    driverId: 'D2',
    driverName: 'Floyd Miles',
    materialType: 'Optical Telemetry Sensors',
    progress: 80,
    route: [{ lat: 23.0225, lng: 72.5714 }, { lat: 19.0760, lng: 72.8777 }]
  }
];

export class DB {
  private static getStore<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private static setStore<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  static initialize() {
    if (!localStorage.getItem('users')) this.setStore('users', MOCK_USERS);
    if (!localStorage.getItem('drivers')) this.setStore('drivers', MOCK_DRIVERS);
    if (!localStorage.getItem('shipments')) this.setStore('shipments', MOCK_SHIPMENTS);
    if (!localStorage.getItem('requirements')) this.setStore('requirements', MOCK_REQUIREMENTS);
  }

  static getUsers(): User[] {
    return this.getStore<User>('users');
  }

  static addUser(user: User) {
    const users = this.getUsers();
    if (!users.find(u => u.email === user.email)) {
      users.push(user);
      this.setStore('users', users);
    }
  }

  static updateUser(updatedUser: User) {
    const users = this.getUsers().map(u => u.id === updatedUser.id ? updatedUser : u);
    this.setStore('users', users);
  }

  static getDrivers(): Driver[] {
    return this.getStore<Driver>('drivers');
  }

  static addDriver(driver: Driver) {
    const drivers = this.getDrivers();
    drivers.unshift(driver);
    this.setStore('drivers', drivers);
  }

  static updateDriverStatus(id: string, status: 'Active' | 'Inactive') {
    const drivers = this.getDrivers().map(d => d.id === id ? { ...d, status } : d);
    this.setStore('drivers', drivers);
  }

  static getRequirements(): Requirement[] {
    return this.getStore<Requirement>('requirements');
  }

  static getRequirementById(id: string): Requirement | undefined {
    return this.getRequirements().find(r => r.id === id);
  }

  static createRequirement(req: Requirement) {
    const reqs = this.getRequirements();
    reqs.push(req);
    this.setStore('requirements', reqs);
    return req;
  }

  static getShipments(): Shipment[] {
    return this.getStore<Shipment>('shipments');
  }

  static createShipment(shipment: Shipment) {
    const shipments = this.getShipments();
    shipments.unshift(shipment);
    this.setStore('shipments', shipments);
  }

  static updateRequirement(updatedReq: Requirement) {
    const reqs = this.getRequirements().map(r => r.id === updatedReq.id ? updatedReq : r);
    this.setStore('requirements', reqs);
    return updatedReq;
  }

  static updateShipmentStatus(id: string, status: ShipmentStatus) {
    const shipments = this.getShipments().map(s => s.id === id ? { ...s, status } : s);
    this.setStore('shipments', shipments);
  }
}
