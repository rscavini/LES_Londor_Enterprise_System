import { Timestamp } from "firebase/firestore";

export interface CajaDiaria {
    id: string;
    storeId: string;
    userId: string;
    date: Timestamp;
    startTime: Timestamp;
    endTime: Timestamp | null;
    initialBalance: number;
    theoreticalBalance: number;
    realBalance: number | null;
    difference: number | null;
    status: "OPEN" | "CLOSED" | "DISCREPANCY";
    observations: string;
}

export type MovementType =
    | "VENTA"
    | "COMPRA"
    | "DEVOLUCION"
    | "EMPEÑO"
    | "INTERESES_EMPEÑO"
    | "AJUSTE"
    | "ENTRADA_MANUAL"
    | "SALIDA_MANUAL";

export type PaymentMethod =
    | "EFECTIVO"
    | "TARJETA"
    | "TRANSFERENCIA"
    | "BIZUM"
    | "VALE"
    | "MIXTO";

export interface MovimientoCaja {
    id: string;
    cajaId: string;
    type: MovementType;
    amount: number;
    direction: "IN" | "OUT";
    paymentMethod: PaymentMethod;
    userId: string;
    storeId: string;
    timestamp: Timestamp;
    originId: string; // VentaId, CompraId, etc.
    facturaId?: string;
}

export interface FichaLegalCompra {
    id: string;
    movementId: string;
    clientId: string;
    itemIds: string[];
    dniPhotoUrl: string;
    itemPhotosUrls: string[];
    status: "CUSTODIA" | "LIBERADA" | "INCIDENCIA";
    custodyEndDate: Timestamp;
    observations: string;
    sentToAuthorityDate: Timestamp | null;
}
