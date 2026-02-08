import { db } from '@/firebase';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { InventoryItem } from '../models/schema';

const COLLECTION_NAME = 'inventory';

export const InventoryService = {
    getAll: async (): Promise<InventoryItem[]> => {
        const q = query(collection(db, COLLECTION_NAME), where('isActive', '==', true));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate()
        })) as InventoryItem[];
    },

    getById: async (id: string): Promise<InventoryItem | undefined> => {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().isActive) {
            return {
                ...docSnap.data(),
                id: docSnap.id,
                createdAt: docSnap.data().createdAt?.toDate(),
                updatedAt: docSnap.data().updatedAt?.toDate()
            } as InventoryItem;
        }
        return undefined;
    },

    getByCode: async (code: string): Promise<InventoryItem | undefined> => {
        const q = query(collection(db, COLLECTION_NAME), where('itemCode', '==', code), where('isActive', '==', true));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return {
                ...doc.data(),
                id: doc.id,
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate()
            } as InventoryItem;
        }
        return undefined;
    },

    generateItemCode: async (): Promise<string> => {
        const year = new Date().getFullYear();
        const prefix = `LD-${year}-`;

        // Obtener todas las piezas que empiecen con el prefijo del año actual
        const q = query(
            collection(db, COLLECTION_NAME),
            where('itemCode', '>=', prefix),
            where('itemCode', '<=', prefix + '\uf8ff')
        );

        const querySnapshot = await getDocs(q);

        let maxSeq = 0;
        querySnapshot.forEach(doc => {
            const code = doc.data().itemCode;
            if (code && code.startsWith(prefix)) {
                const seqStr = code.substring(prefix.length);
                const seq = parseInt(seqStr, 10);
                if (!isNaN(seq) && seq > maxSeq) {
                    maxSeq = seq;
                }
            }
        });

        const nextSeq = maxSeq + 1;
        return `${prefix}${nextSeq.toString().padStart(4, '0')}`;
    },

    create: async (data: Omit<InventoryItem, 'id' | 'qrCode' | 'isActive' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> => {
        let itemCode = data.itemCode;
        if (!itemCode) {
            itemCode = await InventoryService.generateItemCode();
        }

        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...data,
            itemCode,
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        const id = docRef.id;
        // Update with qrCode using the real ID
        const qrCode = `https://les.londor.com/i/${id}`;
        await updateDoc(docRef, { qrCode });

        const finalizedDoc = await getDoc(docRef);
        return {
            ...finalizedDoc.data(),
            id,
            qrCode,
            createdAt: new Date(), // Using approximate since serverTimestamp is async
            updatedAt: new Date()
        } as InventoryItem;
    },

    update: async (id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | undefined> => {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });

        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return {
                ...docSnap.data(),
                id: docSnap.id,
                createdAt: docSnap.data().createdAt?.toDate(),
                updatedAt: docSnap.data().updatedAt?.toDate()
            } as InventoryItem;
        }
        return undefined;
    },

    deleteLogic: async (id: string): Promise<boolean> => {
        const docRef = doc(db, COLLECTION_NAME, id);
        try {
            await updateDoc(docRef, {
                isActive: false,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (e) {
            return false;
        }
    },

    getByLocation: async (locationId: string): Promise<InventoryItem[]> => {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('locationId', '==', locationId),
            where('isActive', '==', true)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate()
        })) as InventoryItem[];
    },

    getBySupplier: async (supplierId: string): Promise<InventoryItem[]> => {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('supplierId', '==', supplierId),
            where('isActive', '==', true)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate()
        })) as InventoryItem[];
    }
};
