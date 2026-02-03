import { db } from '../firebase';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, query, where, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import { Subcategory } from '../models/schema';

const COLLECTION_NAME = 'subcategories';

const initialSubcategories: Subcategory[] = [
    // ANILLOS
    { id: 'sub_an_solitario', categoryId: 'cat_anillos', name: 'Anillos Solitarios', description: 'Anillo con una sola piedra central.', isActive: true, createdAt: new Date() },
    { id: 'sub_an_alianza', categoryId: 'cat_anillos', name: 'Alianzas', description: 'Alianzas de boda o compromiso.', isActive: true, createdAt: new Date() },
    { id: 'sub_an_sello', categoryId: 'cat_anillos', name: 'Sellos', description: 'Anillos tipo sello.', isActive: true, createdAt: new Date() },
    // RELOJES
    { id: 'sub_re_deportivo', categoryId: 'cat_relojes', name: 'Relojes Deportivos', description: 'Relojes con enfoque deportivo.', isActive: true, createdAt: new Date() },
    { id: 'sub_re_vestir', categoryId: 'cat_relojes', name: 'Relojes de Vestir', description: 'Relojes elegantes/clásicos.', isActive: true, createdAt: new Date() },
    // PULSERAS
    { id: 'sub_pu_rigida', categoryId: 'cat_pulseras', name: 'Pulseras Rígidas', description: 'Brazaletes y pulseras rígidas.', isActive: true, createdAt: new Date() },
    { id: 'sub_pu_cadena', categoryId: 'cat_pulseras', name: 'Pulseras de Cadena', description: 'Pulseras eslabonadas.', isActive: true, createdAt: new Date() },
    // PENDIENTES
    { id: 'sub_pe_boton', categoryId: 'cat_pendientes', name: 'Pendientes de Botón', description: 'Pegados al lóbulo.', isActive: true, createdAt: new Date() },
    { id: 'sub_pe_aro', categoryId: 'cat_pendientes', name: 'Aros / Criollas', description: 'Pendientes circulares.', isActive: true, createdAt: new Date() },
    { id: 'sub_pe_largo', categoryId: 'cat_pendientes', name: 'Pendientes Largos', description: 'Cuelgan del lóbulo.', isActive: true, createdAt: new Date() },
    // COLLARES
    { id: 'sub_co_gargantilla', categoryId: 'cat_collares', name: 'Gargantillas', description: 'Collares cortos ajustados.', isActive: true, createdAt: new Date() },
    { id: 'sub_co_perlas', categoryId: 'cat_collares', name: 'Collares de Perlas', description: 'Hilos de perlas.', isActive: true, createdAt: new Date() },
    // COLGANTES
    { id: 'sub_cg_solitario', categoryId: 'cat_colgantes', name: 'Colgantes Solitarios', description: 'Una sola piedra o motivo.', isActive: true, createdAt: new Date() },
    { id: 'sub_cg_medalla', categoryId: 'cat_colgantes', name: 'Medallas / Cruces', description: 'Elementos religiosos o planos.', isActive: true, createdAt: new Date() },
    // CADENAS
    { id: 'sub_ca_fina', categoryId: 'cat_cadenas', name: 'Cadenas Finas', description: 'Cadenas de poco grosor.', isActive: true, createdAt: new Date() },
    { id: 'sub_ca_cordon', categoryId: 'cat_cadenas', name: 'Cordones / Bismark', description: 'Cadenas más gruesas o trenzadas.', isActive: true, createdAt: new Date() }
];

export const SubcategoryService = {
    getAll: async (): Promise<Subcategory[]> => {
        const q = query(collection(db, COLLECTION_NAME), where('isActive', '==', true));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log('Sembrando subcategorías iniciales en Firestore...');
            for (const sub of initialSubcategories) {
                await setDoc(doc(db, COLLECTION_NAME, sub.id), {
                    ...sub,
                    createdAt: serverTimestamp()
                });
            }
            return initialSubcategories;
        }

        return querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            createdAt: doc.data().createdAt?.toDate()
        })) as Subcategory[];
    },

    getByCategory: async (categoryId: string): Promise<Subcategory[]> => {
        const q = query(collection(db, COLLECTION_NAME),
            where('categoryId', '==', categoryId),
            where('isActive', '==', true));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            createdAt: doc.data().createdAt?.toDate()
        })) as Subcategory[];
    },

    create: async (sub: Omit<Subcategory, 'id' | 'createdAt' | 'isActive'>): Promise<Subcategory> => {
        const id = `sub_${Date.now()}`;
        const newSub = {
            ...sub,
            isActive: true,
            createdAt: serverTimestamp()
        };
        await setDoc(doc(db, COLLECTION_NAME, id), newSub);
        return { ...newSub, id, createdAt: new Date() } as Subcategory;
    },

    update: async (id: string, updates: Partial<Subcategory>): Promise<Subcategory | undefined> => {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, updates);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return {
                ...docSnap.data(),
                id: docSnap.id,
                createdAt: docSnap.data().createdAt?.toDate()
            } as Subcategory;
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
    },

    deactivateByCategory: async (categoryId: string): Promise<void> => {
        const q = query(collection(db, COLLECTION_NAME), where('categoryId', '==', categoryId));
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);
        querySnapshot.docs.forEach(d => {
            batch.update(d.ref, { isActive: false });
        });
        await batch.commit();
    }
};
