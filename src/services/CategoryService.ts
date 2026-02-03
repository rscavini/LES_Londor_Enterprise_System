import { db } from '../firebase';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, query, where, serverTimestamp, setDoc } from 'firebase/firestore';
import { Category } from '../models/schema';
import { SubcategoryService } from './SubcategoryService';

const COLLECTION_NAME = 'categories';

// Initial data for seeding
const initialCategories: Category[] = [
    { id: 'cat_anillos', name: 'Anillos', description: 'Piezas destinadas a ser llevadas en el dedo.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'cat_pendientes', name: 'Pendientes', description: 'Piezas destinadas a la oreja.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'cat_collares', name: 'Collares', description: 'Piezas completas destinadas al cuello.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'cat_colgantes', name: 'Colgantes', description: 'Piezas colgables independientes.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'cat_cadenas', name: 'Cadenas', description: 'Elementos lineales de cuello.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'cat_pulseras', name: 'Pulseras', description: 'Piezas destinadas a la muñeca (flexibles).', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'cat_brazaletes', name: 'Brazaletes', description: 'Piezas rígidas o semi-rígidas de muñeca.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'cat_tobilleras', name: 'Tobilleras', description: 'Piezas destinadas al tobillo.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'cat_gemelos', name: 'Gemelos', description: 'Piezas destinadas a camisas.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'cat_broches', name: 'Broches', description: 'Piezas decorativas o funcionales para prendas.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'cat_relojes', name: 'Relojes', description: '(Solo si se incluye en inventario troncal) Instrumentos de medida del tiempo.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'cat_conjuntos', name: 'Conjuntos / Sets', description: 'Entidad lógica de agrupación de piezas.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'cat_otros', name: 'Otros / Especiales', description: 'Uso controlado y excepcional.', isActive: true, createdAt: new Date(), createdBy: 'system' }
];

export const CategoryService = {
    getAll: async (): Promise<Category[]> => {
        const q = query(collection(db, COLLECTION_NAME), where('isActive', '==', true));
        const querySnapshot = await getDocs(q);

        // Seed if empty (for Phase 0 -> Phase 1 transition)
        if (querySnapshot.empty) {
            console.log('Sembrando categorías iniciales en Firestore...');
            for (const cat of initialCategories) {
                await setDoc(doc(db, COLLECTION_NAME, cat.id), {
                    ...cat,
                    createdAt: serverTimestamp()
                });
            }
            return initialCategories;
        }

        return querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            createdAt: doc.data().createdAt?.toDate()
        })) as Category[];
    },

    getById: async (id: string): Promise<Category | undefined> => {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().isActive) {
            return {
                ...docSnap.data(),
                id: docSnap.id,
                createdAt: docSnap.data().createdAt?.toDate()
            } as Category;
        }
        return undefined;
    },

    create: async (category: Omit<Category, 'id' | 'createdAt' | 'isActive'>): Promise<Category> => {
        const id = `cat_${Date.now()}`;
        const newCategory = {
            ...category,
            isActive: true,
            createdAt: serverTimestamp()
        };
        await setDoc(doc(db, COLLECTION_NAME, id), newCategory);
        return { ...newCategory, id, createdAt: new Date() } as Category;
    },

    update: async (id: string, updates: Partial<Category>): Promise<Category | undefined> => {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, updates);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { ...docSnap.data(), id: docSnap.id, createdAt: docSnap.data().createdAt?.toDate() } as Category;
        }
        return undefined;
    },

    deleteLogic: async (id: string): Promise<boolean> => {
        const docRef = doc(db, COLLECTION_NAME, id);
        try {
            await SubcategoryService.deactivateByCategory(id);
            await updateDoc(docRef, { isActive: false });
            return true;
        } catch (e) {
            return false;
        }
    }
};
