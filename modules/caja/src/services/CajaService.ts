import {
    collection,
    addDoc,
    updateDoc,
    doc,
    query,
    where,
    getDocs,
    Timestamp,
    orderBy,
    limit,
    getDoc,
    serverTimestamp
} from "firebase/firestore";
import { db } from "@/firebase"; // Using centralized firebase config
import { CajaDiaria, MovimientoCaja, FichaLegalCompra } from "../models/cajaSchema";

const CAJAS_COLLECTION = "cajas_diarias";
const MOVIMIENTOS_COLLECTION = "movimientos_caja";
const FICHAS_LEGALES_COLLECTION = "fichas_legales_compra";

export const CajaService = {
    async getCurrentCaja(storeId: string): Promise<CajaDiaria | null> {
        const q = query(
            collection(db, CAJAS_COLLECTION),
            where("storeId", "==", storeId),
            where("status", "in", ["OPEN", "DISCREPANCY"]),
            limit(1)
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as CajaDiaria;
    },

    async openCaja(data: Omit<CajaDiaria, "id" | "status" | "date" | "startTime">) {
        return await addDoc(collection(db, CAJAS_COLLECTION), {
            ...data,
            date: serverTimestamp(),
            startTime: serverTimestamp(),
            status: "OPEN",
            theoreticalBalance: data.initialBalance,
            observations: ""
        });
    },

    async closeCaja(cajaId: string, data: Partial<CajaDiaria>) {
        const cajaRef = doc(db, CAJAS_COLLECTION, cajaId);
        return await updateDoc(cajaRef, {
            ...data,
            endTime: serverTimestamp(),
            status: data.difference === 0 ? "CLOSED" : "DISCREPANCY"
        });
    },

    async addMovement(movement: Omit<MovimientoCaja, "id" | "timestamp">) {
        // 1. Add movement
        const moveRef = await addDoc(collection(db, MOVIMIENTOS_COLLECTION), {
            ...movement,
            timestamp: serverTimestamp()
        });

        // 2. Update theoretical balance in daily caja
        const cajaRef = doc(db, CAJAS_COLLECTION, movement.cajaId);
        const cajaSnap = await getDoc(cajaRef);
        if (cajaSnap.exists()) {
            const currentTheoretical = cajaSnap.data().theoreticalBalance || 0;
            const newTheoretical = movement.direction === "IN"
                ? currentTheoretical + movement.amount
                : currentTheoretical - movement.amount;

            await updateDoc(cajaRef, { theoreticalBalance: newTheoretical });
        }

        return moveRef;
    },

    async getMovementsByCaja(cajaId: string): Promise<MovimientoCaja[]> {
        const q = query(
            collection(db, MOVIMIENTOS_COLLECTION),
            where("cajaId", "==", cajaId)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MovimientoCaja));
    },

    async createFichaLegal(ficha: Omit<FichaLegalCompra, "id" | "status">) {
        const custodyDays = 15;
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + custodyDays);

        return await addDoc(collection(db, FICHAS_LEGALES_COLLECTION), {
            ...ficha,
            status: "CUSTODIA",
            custodyEndDate: Timestamp.fromDate(endDate),
            sentToAuthorityDate: null
        });
    }
};
