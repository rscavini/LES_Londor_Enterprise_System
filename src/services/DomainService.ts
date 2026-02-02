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
    { id: 'dom_motivo', code: 'MOTIVO_ESPECIAL', name: 'Motivo Especial', type: 'SEMI_CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' }
];

const initialValues: DomainValue[] = [
    { id: 'dv_og_new', domainId: 'dom_origen', value: 'Nueva', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_og_re', domainId: 'dom_origen', value: 'Recompra', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_mat_oro', domainId: 'dom_material', value: 'Oro', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_mat_plata', domainId: 'dom_material', value: 'Plata', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_ley_18k', domainId: 'dom_ley', value: '18k', sortOrder: 3, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_col_ama', domainId: 'dom_color_metal', value: 'Amarillo', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_col_bla', domainId: 'dom_color_metal', value: 'Blanco', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' }
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
            where('isActive', '==', true),
            orderBy('sortOrder', 'asc'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            const defaults = initialValues.filter(v => v.domainId === domainId);
            for (const v of defaults) {
                await setDoc(doc(db, VALUE_COLL, v.id), { ...v, createdAt: serverTimestamp() });
            }
            return defaults;
        }

        return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as DomainValue[];
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
    }
};
