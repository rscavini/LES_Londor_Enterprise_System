import { db } from '@/firebase';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, query, where, serverTimestamp, setDoc } from 'firebase/firestore';
import { Attribute } from '../models/schema';

const COLLECTION_NAME = 'attributes';

const initialAttributes: Attribute[] = [
    { id: 'attr_mat_pri', name: 'Material Principal', description: 'Metal base de la pieza', dataType: 'LIST', domainId: 'dom_material', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_ley', name: 'Ley / Quilataje', description: 'Pureza del metal precioso', dataType: 'LIST', domainId: 'dom_ley', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_col_met', name: 'Color del Metal', description: 'Tonalidad del metal', dataType: 'LIST', domainId: 'dom_color_metal', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_acabado', name: 'Acabado del Metal', description: 'Tratamiento superficial del metal', dataType: 'LIST', domainId: 'dom_acabado', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_engaste', name: 'Tipo de Engaste', description: 'Método de sujeción de piedras', dataType: 'LIST', domainId: 'dom_engaste', isActive: true, createdAt: new Date(), createdBy: 'system' },

    { id: 'attr_tip_pie', name: 'Tipo de Piedra', description: 'Gema o piedra principal', dataType: 'LIST', domainId: 'dom_tipo_piedra', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_col_pie', name: 'Color de la Piedra', description: 'Tonalidad de la gema', dataType: 'LIST', domainId: 'dom_color_piedra', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_for_pie', name: 'Forma de la Piedra', description: 'Corte o talla de la gema', dataType: 'LIST', domainId: 'dom_forma_piedra', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_pureza', name: 'Pureza / Claridad', description: 'Transparencia y limpieza de la gema', dataType: 'LIST', domainId: 'dom_pureza', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_col_dia', name: 'Color de Diamante (GIA)', description: 'Ausencia de color en diamantes incoloros', dataType: 'LIST', domainId: 'dom_color_diamante', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_cort_dia', name: 'Calidad de Corte', description: 'Determinante del brillo y fuego del diamante', dataType: 'LIST', domainId: 'dom_corte_diamante', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_pes_gem', name: 'Peso de la Gema (ct)', description: 'Peso del diamante o piedra en Quilates', dataType: 'NUMBER', isActive: true, createdAt: new Date(), createdBy: 'system' },

    { id: 'attr_tal', name: 'Talla', description: 'Tamaño de la pieza', dataType: 'NUMBER', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_lon', name: 'Longitud (mm)', description: 'Largo de cadena o pulsera', dataType: 'NUMBER', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_pes_met', name: 'Peso del Metal (gr)', description: 'Peso neto del metal', dataType: 'NUMBER', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_anc_ban', name: 'Ancho de la Banda (mm)', description: 'Grosor del anillo', dataType: 'NUMBER', isActive: true, createdAt: new Date(), createdBy: 'system' },

    { id: 'attr_gra_per', name: 'Grabado Personalizado', description: 'Si la pieza permite grabado', dataType: 'BOOLEAN', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_tex_gra', name: 'Texto del Grabado', description: 'Contenido a grabar', dataType: 'TEXT', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_cer_aut', name: 'Certificado de Autenticidad', description: 'Si incluye certificado', dataType: 'BOOLEAN', isActive: true, createdAt: new Date(), createdBy: 'system' },

    { id: 'attr_iva', name: 'IVA Aplicable', description: 'Régimen fiscal', dataType: 'LIST', domainId: 'dom_iva', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // Estos campos también están en el modelo top-level, pero se mantienen aquí para clasificación dinámica
    { id: 'attr_linea', name: 'Línea Comercial', description: 'Segmento comercial', dataType: 'LIST', domainId: 'dom_linea', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_colec', name: 'Colección', description: 'Colección de diseño', dataType: 'TEXT', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_simbol', name: 'Simbología', description: 'Significado de la pieza', dataType: 'LIST', domainId: 'dom_simbol', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_ocasion', name: 'Ocasión / Motivo', description: 'Uso recomendado', dataType: 'LIST', domainId: 'dom_ocasion', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_perfil', name: 'Perfil de Cliente', description: 'Target psicográfico', dataType: 'LIST', domainId: 'dom_perfil_cli', isActive: true, createdAt: new Date(), createdBy: 'system' }
];

export const AttributeService = {
    getAll: async (): Promise<Attribute[]> => {
        const q = query(collection(db, COLLECTION_NAME), where('isActive', '==', true));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            for (const attr of initialAttributes) {
                await setDoc(doc(db, COLLECTION_NAME, attr.id), { ...attr, createdAt: serverTimestamp() });
            }
            return initialAttributes;
        }

        return querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            createdAt: doc.data().createdAt?.toDate()
        })) as Attribute[];
    },

    create: async (attr: Omit<Attribute, 'id' | 'createdAt' | 'isActive'>): Promise<Attribute> => {
        if (attr.dataType === 'LIST' && !attr.domainId) {
            throw new Error('Un atributo de tipo LISTA debe tener un dominio asociado.');
        }

        const id = `attr_${Date.now()}`;
        const newAttr: any = { ...attr, isActive: true, createdAt: serverTimestamp() };

        // Limpiar campos undefined para Firestore
        if (newAttr.domainId === undefined) {
            delete newAttr.domainId;
        }

        await setDoc(doc(db, COLLECTION_NAME, id), newAttr);
        return { ...newAttr, id, createdAt: new Date() } as Attribute;
    },

    update: async (id: string, updates: Partial<Attribute>): Promise<Attribute | undefined> => {
        const docRef = doc(db, COLLECTION_NAME, id);

        // Limpiar campos undefined
        const cleanUpdates = { ...updates } as any;
        Object.keys(cleanUpdates).forEach(key => {
            if (cleanUpdates[key] === undefined) {
                delete cleanUpdates[key];
            }
        });

        await updateDoc(docRef, cleanUpdates);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return {
                ...docSnap.data(),
                id: docSnap.id,
                createdAt: docSnap.data().createdAt?.toDate()
            } as Attribute;
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
