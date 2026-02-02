import { db } from '../firebase';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, query, where, serverTimestamp, setDoc } from 'firebase/firestore';
import { Location } from '../models/schema';

const COLLECTION_NAME = 'locations';

const initialLocations: Location[] = [
    { id: 'loc_1', name: 'Tienda Principal', address: 'Calle Mayor 1', type: 'STORE', isActive: true, createdAt: new Date() },
    { id: 'loc_2', name: 'Almacén Central', address: 'Polígono Ind.', type: 'WAREHOUSE', isActive: true, createdAt: new Date() }
];

export const LocationService = {
    getAll: async (): Promise<Location[]> => {
        const q = query(collection(db, COLLECTION_NAME), where('isActive', '==', true));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            for (const loc of initialLocations) {
                await setDoc(doc(db, COLLECTION_NAME, loc.id), { ...loc, createdAt: serverTimestamp() });
            }
            return initialLocations;
        }

        return querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            createdAt: doc.data().createdAt?.toDate()
        })) as Location[];
    }
};
