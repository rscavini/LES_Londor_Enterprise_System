import { db } from '../firebase';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, query, where, serverTimestamp, setDoc } from 'firebase/firestore';
import { OperationalStatus } from '../models/schema';

const COLLECTION_NAME = 'operational_statuses';

const initialStatuses: OperationalStatus[] = [
    { id: 'stat_available', name: 'Disponible', color: '#10b981', isActive: true, createdAt: new Date() },
    { id: 'stat_sold', name: 'Vendido', color: '#ef4444', isActive: true, createdAt: new Date() },
    { id: 'stat_reserved', name: 'Reservado', color: '#f59e0b', isActive: true, createdAt: new Date() }
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
    }
};
