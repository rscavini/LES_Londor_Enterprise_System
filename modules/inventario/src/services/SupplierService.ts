import { db } from '@/firebase';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { Supplier } from '../models/schema';

const COLLECTION_NAME = 'suppliers';

export const SupplierService = {
    getAll: async (): Promise<Supplier[]> => {
        const q = query(collection(db, COLLECTION_NAME), where('isActive', '==', true));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            createdAt: doc.data().createdAt?.toDate(),
            createdBy: doc.data().createdBy
        })) as Supplier[];
    },

    getById: async (id: string): Promise<Supplier | undefined> => {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().isActive) {
            return {
                ...docSnap.data(),
                id: docSnap.id,
                createdAt: docSnap.data().createdAt?.toDate(),
                createdBy: docSnap.data().createdBy
            } as Supplier;
        }
        return undefined;
    },

    create: async (data: Omit<Supplier, 'id' | 'isActive' | 'createdAt'>): Promise<Supplier> => {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...data,
            isActive: true,
            createdAt: serverTimestamp()
        });

        const finalizedDoc = await getDoc(docRef);
        return {
            ...finalizedDoc.data(),
            id: docRef.id,
            createdAt: new Date() // Using approximate since serverTimestamp is async
        } as Supplier;
    },

    update: async (id: string, updates: Partial<Supplier>): Promise<Supplier | undefined> => {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            ...updates
        });

        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return {
                ...docSnap.data(),
                id: docSnap.id,
                createdAt: docSnap.data().createdAt?.toDate()
            } as Supplier;
        }
        return undefined;
    },

    deleteLogic: async (id: string): Promise<boolean> => {
        const docRef = doc(db, COLLECTION_NAME, id);
        try {
            await updateDoc(docRef, {
                isActive: false
            });
            return true;
        } catch (e) {
            console.error("Error deleting supplier:", e);
            return false;
        }
    }
};
