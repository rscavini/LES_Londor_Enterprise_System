/**
 * Definición del esquema de datos para el Módulo de Inventario LES.
 * Basado en las fases de consultoría A0-A8.
 */

// Categorías (Anexo A)
export interface Category {
    id: string;          // UUID
    name: string;        // Nombre único (Anillos, Pendientes, etc.)
    description?: string;
    isActive: boolean;
    createdAt: Date;
    createdBy: string;
}

// Subcategorías (Anexo A)
export interface Subcategory {
    id: string;
    categoryId: string;  // FK a Category
    name: string;        // Unique dentro de la categoría
    description?: string;
    isActive: boolean;
    createdAt: Date;
    createdBy: string;
}

// Atributos (Anexo B)
export type DataType = 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'LIST' | 'RANGE' | 'DATE';

export interface Attribute {
    id: string;
    name: string;        // Nombre funcional único (Material principal, Color metal)
    description?: string;
    dataType: DataType;
    domainId?: string;   // FK a Domain si dataType es 'LIST'
    isActive: boolean;
    createdAt: Date;
    createdBy: string;
}

// Dominios (Anexo D)
export type DomainType = 'CLOSED' | 'SEMI_CLOSED';

export interface Domain {
    id: string;
    code: string;        // ID estable (MATERIAL, COLOR_METAL)
    name: string;
    description?: string;
    type: DomainType;
    isActive: boolean;
    createdAt: Date;
    createdBy: string;
}

// Valores de Dominio (Anexo D)
export interface DomainValue {
    id: string;
    domainId: string;    // FK a Domain
    value: string;
    sortOrder: number;
    source: 'NORMATIVE' | 'USER_ADDED';
    justification?: string; // Obligatorio si source es 'USER_ADDED'
    isActive: boolean;
    createdAt: Date;
    createdBy: string;
}

// Estados Operativos (Anexo D)
export interface OperationalStatus {
    id: string;
    name: string;
    color?: string;
    isActive: boolean;
    createdAt: Date;
    createdBy: string;
}

// Especialidades de Taller
export type WorkshopSpecialty = 'Pulido' | 'Engaste' | 'Grabado' | 'Ajuste de Talla' | 'Reparación General' | 'Limpieza';

// Horarios comerciales
export interface TimeRange {
    open: string;
    close: string;
    isClosed?: boolean;
}

export interface DaySchedule {
    morning?: TimeRange;
    afternoon?: TimeRange;
    isClosed?: boolean;
}

export interface BusinessHours {
    monday?: DaySchedule;
    tuesday?: DaySchedule;
    wednesday?: DaySchedule;
    thursday?: DaySchedule;
    friday?: DaySchedule;
    saturday?: DaySchedule;
    sunday?: DaySchedule;
}

// Fechas especiales (Festivos, Cierres, etc.)
export interface SpecialDate {
    id: string;
    date: string; // ISO string YYYY-MM-DD
    label: string;
    isClosed: boolean;
}

// Vitrinas/Secciones de Tienda
export interface Showcase {
    id: string;
    name: string;
    details: string[];
}

// Metadatos específicos
export interface LocationMetadata {
    contactPerson?: string;
    phone?: string;         // Legacy / General
    phoneFixed?: string;    // Teléfono fijo
    phoneMobile?: string;   // Teléfono móvil
    email?: string;
    address?: string;
    // Campos Workshop
    specialties?: WorkshopSpecialty[];
    rating?: number;
    slaDays?: number;
    contractUrl?: string;
    // Campos Store
    managerName?: string;
    openingHours?: string; // Legacy / Fallback
    businessHours?: BusinessHours; // Nuevo formato por días
    specialDates?: SpecialDate[];  // Festivos y cierres
    managerNotes?: string;        // Notas internas del gerente
    showcasesCount?: number;
    securityLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'ELITE';
    showcases?: Showcase[];
    // Campos Other
    notes?: string;
}

// Mapeo Atributo - Clasificación (Fase 2 - Configuración Dinámica)
export interface ClassificationMapping {
    categoryId?: string;    // Opcional: Si se aplica a nivel de categoría
    subcategoryId?: string; // Opcional: Si se aplica a nivel de subcategoría
    attributeId: string;    // FK a Attribute
    isMandatory: boolean;   // Si el campo es obligatorio
    sortOrder: number;      // Orden de aparición
}

// Entidad Principal: Inventario (Fase 1)
export interface InventoryItem {
    id: string;               // UUID interno
    itemCode: string;         // Código de pieza LONDOR (ej. LD-2024-001)
    qrCode: string;           // Valor para el QR (vínculo permanente)

    // Clasificación
    categoryId: string;
    subcategoryId: string;

    // Identificación
    name: string;             // Nombre corto
    description: string;      // Descripción técnica completa

    // Estado y Ubicación
    statusId: string;         // FK a OperationalStatus
    locationId: string;       // FK a Location
    showcaseId?: string;      // Opcional: ID de la vitrina donde se encuentra
    isApproved: boolean;      // Si la pieza ha sido aprobada para venta/exhibición

    // Valores Económicos (Básicos Fase 1)
    purchasePrice?: number;   // Coste
    salePrice?: number;       // Precio PVP base

    // Datos Físicos
    mainWeight?: number;      // Peso total en gramos

    // Datos Dinámicos (Fase 2)
    attributes: Record<string, any>; // ID_ATRIBUTO: VALOR

    // Multimedia
    images: string[];

    // Notas Adicionales
    comments?: string;

    // Auditoría
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
}

// Ubicaciones (Anexo D - Especializado Fase 0+)
export type LocationType = 'WORKSHOP' | 'STORE' | 'OTHER';

export interface Location {
    id: string;
    name: string;
    address?: string;
    type: LocationType;
    metadata?: LocationMetadata;
    isActive: boolean;
    createdAt: Date;
    createdBy: string;
}

// Clientes (Fase 1 - Operaciones)
export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    dni?: string;        // Identificación oficial
    phone: string;
    email?: string;
    address?: string;
    tags?: string[];     // VIP, Recurrente, etc.
    isActive: boolean;
    createdAt: Date;
    createdBy: string;
}

// Apartados / Reservas (Anexo P9)
export type ReservationStatus = 'ACTIVE' | 'EXPIRED' | 'RESOLVED' | 'CANCELLED';

export interface Reservation {
    id: string;
    itemId: string;      // FK a InventoryItem
    customerId: string;  // FK a Customer
    locationId: string;  // Tienda donde se hace el apartado
    startDate: Date;
    expiryDate: Date;
    status: ReservationStatus;
    depositAmount?: number; // Importe dejado a cuenta
    notes?: string;
    resolutionNote?: string; // Motivo de liberación/venta/cancelación
    resolvedAt?: Date;
    resolvedBy?: string;
    createdAt: Date;
    createdBy: string;
}

// Órdenes de Taller (Anexo P10)
export type WorkshopOrderStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface WorkshopOrder {
    id: string;
    itemId: string;      // FK a InventoryItem
    workshopId: string;  // FK a Location (tipo WORKSHOP)
    orderNumber: string; // Código legible
    description: string; // Qué se le hace a la pieza
    status: WorkshopOrderStatus;
    estimatedDeliveryDate?: Date;
    actualDeliveryDate?: Date;
    cost?: number;
    createdAt: Date;
    createdBy: string;
}
