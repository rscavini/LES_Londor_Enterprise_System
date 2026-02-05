import { db } from '../firebase';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, query, where, serverTimestamp, setDoc, orderBy } from 'firebase/firestore';
import { Domain, DomainValue } from '../models/schema';

const DOMAIN_COLL = 'domains';
const VALUE_COLL = 'domain_values';

const initialDomains: Domain[] = [
    { id: 'dom_origen', code: 'ORIGEN', name: 'Origen de la Pieza', type: 'CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_legal', code: 'ESTADO_LEGAL', name: 'Estado Legal', type: 'CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_material', code: 'MATERIAL', name: 'Material Principal', type: 'SEMI_CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_ley', code: 'LEY_QUILATAJE', name: 'Ley / Quilataje', type: 'CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_color_metal', code: 'COLOR_METAL', name: 'Color del Metal', type: 'CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_tipo_piedra', code: 'TIPO_PIEDRA', name: 'Tipo de Piedra', type: 'SEMI_CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_color_piedra', code: 'COLOR_PIEDRA', name: 'Color de la Piedra', type: 'CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_pureza', code: 'PUREZA', name: 'Pureza', type: 'CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_forma_piedra', code: 'FORMA_PIEDRA', name: 'Forma de la Piedra', type: 'CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_acabado', code: 'ACABADO', name: 'Acabado', type: 'CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_engaste', code: 'TIPO_ENGASTE', name: 'Tipo de Engaste', type: 'CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_tecnica', code: 'TECNICA_ESPECIAL', name: 'Técnica Especial', type: 'CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_personalizacion', code: 'TIPO_PERSONALIZACION', name: 'Tipo de Personalización', type: 'CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_publico', code: 'PUBLICO_OBJETIVO', name: 'Público Objetivo', type: 'CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_uso', code: 'USO', name: 'Uso', type: 'CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_estado_ope', code: 'ESTADO_OPERATIVO', name: 'Estado Operativo', type: 'CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_ubicacion', code: 'UBICACION', name: 'Ubicación Actual', type: 'SEMI_CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_iva', code: 'IVA', name: 'IVA Aplicable', type: 'CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_tipo_conjunto', code: 'TIPO_CONJUNTO', name: 'Tipo de Conjunto', type: 'CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_motivo', code: 'MOTIVO_ESPECIAL', name: 'Motivo Especial', type: 'SEMI_CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_linea', code: 'COMMERCIAL_LINE', name: 'Línea Comercial', type: 'CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_coleccion', code: 'COLLECTION', name: 'Colección', type: 'SEMI_CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_perfil_cli', code: 'CUSTOMER_PROFILE', name: 'Perfil de Cliente', type: 'SEMI_CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_simbol', code: 'SYMBOLOGY', name: 'Simbología', type: 'SEMI_CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_ocasion', code: 'OCCASION', name: 'Ocasión / Motivo', type: 'SEMI_CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' }
];

const initialValues: DomainValue[] = [
    { id: 'dv_og_new', domainId: 'dom_origen', value: 'Nueva', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_og_re', domainId: 'dom_origen', value: 'Recompra', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_mat_oro', domainId: 'dom_material', value: 'Oro', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_mat_plata', domainId: 'dom_material', value: 'Plata', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_ley_18k', domainId: 'dom_ley', value: '18k', sortOrder: 3, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_col_ama', domainId: 'dom_color_metal', value: 'Amarillo', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_col_bla', domainId: 'dom_color_metal', value: 'Blanco', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    // Valores Comerciales
    { id: 'dv_line_nup', domainId: 'dom_linea', value: 'Nupcial', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_line_juv', domainId: 'dom_linea', value: 'Juvenil', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_line_alt', domainId: 'dom_linea', value: 'Alta Joyería', sortOrder: 3, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_line_dai', domainId: 'dom_linea', value: 'Daily Wear', sortOrder: 4, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },

    { id: 'dv_sim_amo', domainId: 'dom_simbol', value: 'Amor', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_sim_inf', domainId: 'dom_simbol', value: 'Infinito', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_sim_pro', domainId: 'dom_simbol', value: 'Protección', sortOrder: 3, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },

    { id: 'dv_occ_com', domainId: 'dom_ocasion', value: 'Compromiso', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_occ_ani', domainId: 'dom_ocasion', value: 'Aniversario', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_occ_gra', domainId: 'dom_ocasion', value: 'Graduación', sortOrder: 3, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_occ_qui', domainId: 'dom_ocasion', value: '15 Años', sortOrder: 4, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },

    { id: 'dv_pro_rom', domainId: 'dom_perfil_cli', value: 'Romántico', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_pro_min', domainId: 'dom_perfil_cli', value: 'Minimalista', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_pro_cla', domainId: 'dom_perfil_cli', value: 'Clásico', sortOrder: 3, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_pro_tre', domainId: 'dom_perfil_cli', value: 'Trendsetter', sortOrder: 4, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' }
];

export const DomainService = {
    getDomains: async (): Promise<Domain[]> => {
        const q = query(collection(db, DOMAIN_COLL), where('isActive', '==', true));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            for (const dom of initialDomains) {
                await setDoc(doc(db, DOMAIN_COLL, dom.id), { ...dom, createdAt: serverTimestamp() });
            }
            return initialDomains;
        }

        return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Domain[];
    },

    getValuesByDomain: async (domainId: string): Promise<DomainValue[]> => {
        const q = query(collection(db, VALUE_COLL),
            where('domainId', '==', domainId),
            where('isActive', '==', true));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            const defaults = initialValues.filter(v => v.domainId === domainId);
            for (const v of defaults) {
                await setDoc(doc(db, VALUE_COLL, v.id), { ...v, createdAt: serverTimestamp() });
            }
            return defaults;
        }

        const values = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as DomainValue[];
        // Ordenar en memoria para evitar requerir índices compuestos de Firestore
        return values.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    },

    createDomain: async (data: Omit<Domain, 'id' | 'createdAt' | 'isActive'>): Promise<Domain> => {
        const id = `dom_${Date.now()}`;
        const newDomain = { ...data, isActive: true, createdAt: serverTimestamp() };
        await setDoc(doc(db, DOMAIN_COLL, id), newDomain);
        return { ...newDomain, id, createdAt: new Date() } as Domain;
    },

    addValue: async (data: Omit<DomainValue, 'id' | 'createdAt' | 'isActive'>): Promise<DomainValue> => {
        const id = `val_${Date.now()}`;
        const newValue = { ...data, isActive: true, createdAt: serverTimestamp() };
        await setDoc(doc(db, VALUE_COLL, id), newValue);
        return { ...newValue, id, createdAt: new Date() } as DomainValue;
    },

    updateDomain: async (id: string, updates: Partial<Domain>): Promise<Domain | undefined> => {
        const docRef = doc(db, DOMAIN_COLL, id);
        await updateDoc(docRef, updates);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { ...docSnap.data(), id: docSnap.id } as Domain;
        }
        return undefined;
    },

    updateValue: async (id: string, updates: Partial<DomainValue>): Promise<DomainValue | undefined> => {
        const docRef = doc(db, VALUE_COLL, id);
        await updateDoc(docRef, updates);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { ...docSnap.data(), id: docSnap.id } as DomainValue;
        }
        return undefined;
    },

    deleteValueLogic: async (id: string): Promise<boolean> => {
        const docRef = doc(db, VALUE_COLL, id);
        try {
            await updateDoc(docRef, { isActive: false });
            return true;
        } catch (e) {
            return false;
        }
    }
};
