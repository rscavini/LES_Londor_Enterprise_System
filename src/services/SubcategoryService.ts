import { db } from '../firebase';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, query, where, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import { Subcategory } from '../models/schema';

const COLLECTION_NAME = 'subcategories';

const initialSubcategories: Subcategory[] = [
    // A.4.1 Categoría: Anillos
    { id: 'sub_an_solitario', categoryId: 'cat_anillos', name: 'Solitario', description: 'Anillo con una sola piedra central.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_an_alianza', categoryId: 'cat_anillos', name: 'Alianza', description: 'Alianzas de boda o compromiso.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_an_media_alianza', categoryId: 'cat_anillos', name: 'Media alianza', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_an_roseton', categoryId: 'cat_anillos', name: 'Rosetón', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_an_sello', categoryId: 'cat_anillos', name: 'Sello', description: 'Anillos tipo sello.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_an_trilogy', categoryId: 'cat_anillos', name: 'Trilogy / Tresillo', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_an_piedra_central', categoryId: 'cat_anillos', name: 'Anillo con piedra central', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_an_sin_piedra', categoryId: 'cat_anillos', name: 'Anillo sin piedra', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_an_ajustable', categoryId: 'cat_anillos', name: 'Anillo ajustable', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_an_infantil', categoryId: 'cat_anillos', name: 'Anillo infantil', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // A.4.2 Categoría: Pendientes
    { id: 'sub_pe_boton', categoryId: 'cat_pendientes', name: 'Pendientes de botón', description: 'Pegados al lóbulo.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_pe_aro', categoryId: 'cat_pendientes', name: 'Pendientes de aro', description: 'Pendientes circulares.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_pe_largo', categoryId: 'cat_pendientes', name: 'Pendientes largos', description: 'Cuelgan del lóbulo.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_pe_colgante', categoryId: 'cat_pendientes', name: 'Pendientes colgantes', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_pe_criolla', categoryId: 'cat_pendientes', name: 'Criollas', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_pe_trepador', categoryId: 'cat_pendientes', name: 'Trepadores (ear climbers)', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_pe_con_piedra', categoryId: 'cat_pendientes', name: 'Pendientes con piedra', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_pe_sin_piedra', categoryId: 'cat_pendientes', name: 'Pendientes sin piedra', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_pe_infantil', categoryId: 'cat_pendientes', name: 'Pendientes infantiles', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // A.4.3 Categoría: Collares
    { id: 'sub_co_corto', categoryId: 'cat_collares', name: 'Collar corto', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_co_largo', categoryId: 'cat_collares', name: 'Collar largo', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_co_rigido', categoryId: 'cat_collares', name: 'Collar rígido', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_co_flexible', categoryId: 'cat_collares', name: 'Collar flexible', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_co_colgante_fijo', categoryId: 'cat_collares', name: 'Collar con colgante fijo', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_co_colgante_desm', categoryId: 'cat_collares', name: 'Collar con colgante desmontable', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // A.4.4 Categoría: Colgantes
    { id: 'sub_cg_clasico', categoryId: 'cat_colgantes', name: 'Colgante clásico', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_cg_con_piedra', categoryId: 'cat_colgantes', name: 'Colgante con piedra', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_cg_sin_piedra', categoryId: 'cat_colgantes', name: 'Colgante sin piedra', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_cg_medalla', categoryId: 'cat_colgantes', name: 'Medalla', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_cg_cruz', categoryId: 'cat_colgantes', name: 'Cruz', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_cg_inicial', categoryId: 'cat_colgantes', name: 'Inicial / letra', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_cg_simbolo', categoryId: 'cat_colgantes', name: 'Símbolo', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_cg_religioso', categoryId: 'cat_colgantes', name: 'Colgante religioso', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_cg_infantil', categoryId: 'cat_colgantes', name: 'Colgante infantil', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // A.4.5 Categoría: Cadenas
    { id: 'sub_ca_fina', categoryId: 'cat_cadenas', name: 'Cadena fina', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_ca_media', categoryId: 'cat_cadenas', name: 'Cadena media', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_ca_gruesa', categoryId: 'cat_cadenas', name: 'Cadena gruesa', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_ca_rigida', categoryId: 'cat_cadenas', name: 'Cadena rígida', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_ca_flexible', categoryId: 'cat_cadenas', name: 'Cadena flexible', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_ca_cordon', categoryId: 'cat_cadenas', name: 'Cadena tipo cordón', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_ca_eslabon', categoryId: 'cat_cadenas', name: 'Cadena tipo eslabón', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_ca_infantil', categoryId: 'cat_cadenas', name: 'Cadena infantil', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // A.4.6 Categoría: Pulseras
    { id: 'sub_pu_cadena', categoryId: 'cat_pulseras', name: 'Pulsera cadena', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_pu_rigida', categoryId: 'cat_pulseras', name: 'Pulsera rígida', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_pu_flexible', categoryId: 'cat_pulseras', name: 'Pulsera flexible', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_pu_colgantes', categoryId: 'cat_pulseras', name: 'Pulsera con colgantes', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_pu_con_piedras', categoryId: 'cat_pulseras', name: 'Pulsera con piedras', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_pu_sin_piedras', categoryId: 'cat_pulseras', name: 'Pulsera sin piedras', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_pu_infantil', categoryId: 'cat_pulseras', name: 'Pulsera infantil', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // A.4.7 Categoría: Brazaletes
    { id: 'sub_br_rigido', categoryId: 'cat_brazaletes', name: 'Brazalete rígido', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_br_abierto', categoryId: 'cat_brazaletes', name: 'Brazalete abierto', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_br_cerrado', categoryId: 'cat_brazaletes', name: 'Brazalete cerrado', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_br_con_piedras', categoryId: 'cat_brazaletes', name: 'Brazalete con piedras', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_br_sin_piedras', categoryId: 'cat_brazaletes', name: 'Brazalete sin piedras', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // A.4.8 Categoría: Tobilleras
    { id: 'sub_to_cadena', categoryId: 'cat_tobilleras', name: 'Tobillera cadena', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_to_colgantes', categoryId: 'cat_tobilleras', name: 'Tobillera con colgantes', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_to_con_piedras', categoryId: 'cat_tobilleras', name: 'Tobillera con piedras', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_to_sin_piedras', categoryId: 'cat_tobilleras', name: 'Tobillera sin piedras', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // A.4.9 Categoría: Gemelos
    { id: 'sub_ge_clasicos', categoryId: 'cat_gemelos', name: 'Gemelos clásicos', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_ge_con_piedra', categoryId: 'cat_gemelos', name: 'Gemelos con piedra', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_ge_personalizado', categoryId: 'cat_gemelos', name: 'Gemelos personalizados', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_ge_infantil', categoryId: 'cat_gemelos', name: 'Gemelos infantiles', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // A.4.10 Categoría: Broches
    { id: 'sub_bc_clasico', categoryId: 'cat_broches', name: 'Broche clásico', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_bc_con_piedras', categoryId: 'cat_broches', name: 'Broche con piedras', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_bc_decorativo', categoryId: 'cat_broches', name: 'Broche decorativo', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_bc_funcional', categoryId: 'cat_broches', name: 'Broche funcional', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // A.4.11 Categoría: Relojes
    { id: 'sub_re_pulsera', categoryId: 'cat_relojes', name: 'Reloj de pulsera', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_re_clasico', categoryId: 'cat_relojes', name: 'Reloj clásico', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_re_deportivo', categoryId: 'cat_relojes', name: 'Reloj deportivo', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_re_joya', categoryId: 'cat_relojes', name: 'Reloj joya', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // A.4.12 Categoría: Conjuntos / Sets
    { id: 'sub_cj_anillo_pendientes', categoryId: 'cat_conjuntos', name: 'Conjunto anillo + pendientes', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_cj_collar_pendientes', categoryId: 'cat_conjuntos', name: 'Conjunto collar + pendientes', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_cj_pulsera_collar', categoryId: 'cat_conjuntos', name: 'Conjunto pulsera + collar', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_cj_completo', categoryId: 'cat_conjuntos', name: 'Conjunto completo', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // A.4.13 Categoría: Otros / Especiales
    { id: 'sub_ot_personalizada', categoryId: 'cat_otros', name: 'Pieza personalizada', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_ot_unica', categoryId: 'cat_otros', name: 'Pieza única', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_ot_prototipo', categoryId: 'cat_otros', name: 'Prototipo / muestra', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_ot_historica', categoryId: 'cat_otros', name: 'Pieza histórica / especial', isActive: true, createdAt: new Date(), createdBy: 'system' }
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
