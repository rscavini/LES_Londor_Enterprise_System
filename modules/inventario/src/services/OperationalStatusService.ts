import { db } from '@/firebase';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, query, where, serverTimestamp, setDoc } from 'firebase/firestore';
import { OperationalStatus } from '../models/schema';

const COLLECTION_NAME = 'operational_statuses';

const initialStatuses: OperationalStatus[] = [
    { id: 'stat_available', name: 'Disponible', color: '#10b981', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'stat_sold', name: 'Vendido', color: '#ef4444', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'stat_reserved', name: 'Reservado', color: '#f59e0b', isActive: true, createdAt: new Date(), createdBy: 'system' }
];

export const OperationalStatusService = {
    getAll: async (): Promise<OperationalStatus[]> => {
        const q = query(collection(db, COLLECTION_NAME), where('isActive', '==', true));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            for (const stat of initialStatuses) {
                await setDoc(doc(db, COLLECTION_NAME, stat.id), { ...stat, createdAt: serverTimestamp() });
            }
            return initialStatuses;
        }

        return querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            createdAt: doc.data().createdAt?.toDate()
        })) as OperationalStatus[];
    },

    create: async (name: string): Promise<OperationalStatus> => {
        const id = `stat_${Date.now()}`;
        const newStatus = {
            name,
            color: '#9b59b6', // Default color for new manual statuses
            isActive: true,
            createdAt: serverTimestamp()
        };
        await setDoc(doc(db, COLLECTION_NAME, id), newStatus);
        return { ...newStatus, id, createdAt: new Date() } as OperationalStatus;
    },

    update: async (id: string, name: string): Promise<OperationalStatus | undefined> => {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, { name });
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return {
                ...docSnap.data(),
                id: docSnap.id,
                createdAt: docSnap.data().createdAt?.toDate()
            } as OperationalStatus;
        }
        return undefined;
    },

    deleteLogic: async (id: string): Promise<boolean> => {
        const docRef = doc(db, COLLECTION_NAME, id);
        try {
            await updateDoc(docRef, { isActive: false });
            return true;
        } catch (e) {
            return false;
        }
    }
};
