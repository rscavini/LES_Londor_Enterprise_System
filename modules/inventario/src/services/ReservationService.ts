import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDocs,
    query,
    where,
    getDoc,
    serverTimestamp,
    Timestamp,
    writeBatch
} from 'firebase/firestore';
import { db } from '@/firebase';
import { Reservation, ReservationStatus, InventoryItem } from '../models/schema';

const COLLECTION_NAME = 'reservations';
const ITEMS_COLLECTION = 'inventory';

export const ReservationService = {
    async getAll(): Promise<Reservation[]> {
        const q = query(collection(db, COLLECTION_NAME));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            startDate: (doc.data().startDate as Timestamp)?.toDate(),
            expiryDate: (doc.data().expiryDate as Timestamp)?.toDate(),
            createdAt: (doc.data().createdAt as Timestamp)?.toDate(),
            resolvedAt: (doc.data().resolvedAt as Timestamp)?.toDate(),
        } as Reservation));
    },

    async getActiveReservations(): Promise<Reservation[]> {
        const q = query(collection(db, COLLECTION_NAME), where('status', '==', 'ACTIVE'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            startDate: (doc.data().startDate as Timestamp)?.toDate(),
            expiryDate: (doc.data().expiryDate as Timestamp)?.toDate(),
            createdAt: (doc.data().createdAt as Timestamp)?.toDate(),
        } as Reservation));
    },

    async createReservation(reservationData: Omit<Reservation, 'id' | 'status' | 'createdAt' | 'startDate'>): Promise<string> {
        const batch = writeBatch(db);

        // 1. Crear documento de reserva
        const reservationRef = doc(collection(db, COLLECTION_NAME));
        batch.set(reservationRef, {
            ...reservationData,
            status: 'ACTIVE',
            startDate: serverTimestamp(),
            createdAt: serverTimestamp()
        });

        // 2. Actualizar estado de la pieza
        const itemRef = doc(db, ITEMS_COLLECTION, reservationData.itemId);
        batch.update(itemRef, {
            statusId: 'stat_reserved', // ID estándar para Reservada
            updatedAt: serverTimestamp()
        });

        await batch.commit();
        return reservationRef.id;
    },

    async resolveReservation(id: string, resolution: { status: ReservationStatus, note: string, user: string }): Promise<void> {
        const batch = writeBatch(db);
        const reservationRef = doc(db, COLLECTION_NAME, id);
        const reservationSnap = await getDoc(reservationRef);

        if (!reservationSnap.exists()) throw new Error("Reserva no encontrada");
        const reservation = reservationSnap.data() as Reservation;

        // 1. Actualizar reserva
        batch.update(reservationRef, {
            status: resolution.status,
            resolutionNote: resolution.note,
            resolvedAt: serverTimestamp(),
            resolvedBy: resolution.user
        });

        // 2. Actualizar pieza si se libera
        if (resolution.status === 'CANCELLED' || resolution.status === 'EXPIRED') {
            const itemRef = doc(db, ITEMS_COLLECTION, reservation.itemId);
            batch.update(itemRef, {
                statusId: 'stat_available', // Volver a disponible
                updatedAt: serverTimestamp()
            });
        }
        // Si es RESOLVED (Venta), se asume que la venta gestionará el estado 'VENDIDA'

        await batch.commit();
    },

    async checkExpirations(): Promise<number> {
        const active = await this.getActiveReservations();
        const now = new Date();
        let count = 0;

        for (const res of active) {
            if (res.expiryDate < now) {
                await updateDoc(doc(db, COLLECTION_NAME, res.id), {
                    status: 'EXPIRED',
                    updatedAt: serverTimestamp()
                });
                count++;
            }
        }
        return count;
    }
};
