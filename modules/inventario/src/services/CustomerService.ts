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
    Timestamp
} from 'firebase/firestore';
import { db } from '@/firebase';
import { Customer } from '../models/schema';

const COLLECTION_NAME = 'customers';

export const CustomerService = {
    async getAll(): Promise<Customer[]> {
        const q = query(collection(db, COLLECTION_NAME), where('isActive', '==', true));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as Timestamp)?.toDate(),
        } as Customer));
    },

    async getById(id: string): Promise<Customer | null> {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data(),
                createdAt: (docSnap.data().createdAt as Timestamp)?.toDate(),
            } as Customer;
        }
        return null;
    },

    async create(customerData: Omit<Customer, 'id' | 'createdAt' | 'isActive'>): Promise<string> {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...customerData,
            isActive: true,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    },

    async update(id: string, customerData: Partial<Customer>): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            ...customerData,
            updatedAt: serverTimestamp()
        });
    },

    async deleteLogic(id: string): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, { isActive: false });
    },

    async search(searchTerm: string): Promise<Customer[]> {
        const customers = await this.getAll();
        const term = searchTerm.toLowerCase();
        return customers.filter(c =>
            c.firstName.toLowerCase().includes(term) ||
            c.lastName.toLowerCase().includes(term) ||
            c.dni?.toLowerCase().includes(term) ||
            c.phone.includes(term)
        );
    }
};
