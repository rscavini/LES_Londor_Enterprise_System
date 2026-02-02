import { db } from '../firebase';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, query, where, serverTimestamp, setDoc } from 'firebase/firestore';
import { Attribute } from '../models/schema';

const COLLECTION_NAME = 'attributes';

const initialAttributes: Attribute[] = [
    { id: 'attr_mat_pri', name: 'Material Principal', description: 'Metal base de la pieza', dataType: 'LIST', domainId: 'dom_material', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_ley', name: 'Ley / Quilataje', description: 'Pureza del metal precioso', dataType: 'LIST', domainId: 'dom_ley', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_col_met', name: 'Color del Metal', description: 'Tonalidad del metal', dataType: 'LIST', domainId: 'dom_color_metal', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_pes_ex', name: 'Peso Exacto', description: 'Peso real en gramos', dataType: 'NUMBER', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_tip_pie', name: 'Tipo de Piedra', description: 'Gema o piedra principal', dataType: 'LIST', domainId: 'dom_tipo_piedra', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_col_pie', name: 'Color de la Piedra', description: 'Tonalidad de la gema', dataType: 'LIST', domainId: 'dom_color_piedra', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_pureza', name: 'Pureza', description: 'Grado de pureza de la piedra', dataType: 'LIST', domainId: 'dom_pureza', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_for_pie', name: 'Forma de la Piedra', description: 'Corte o talla de la gema', dataType: 'LIST', domainId: 'dom_forma_piedra', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_acabado', name: 'Acabado', description: 'Tratamiento superficial del metal', dataType: 'LIST', domainId: 'dom_acabado', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_engaste', name: 'Tipo de Engaste', description: 'Método de sujeción de piedras', dataType: 'LIST', domainId: 'dom_engaste', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_origen', name: 'Origen de la pieza', description: 'Procedencia de entrada al stock', dataType: 'LIST', domainId: 'dom_origen', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_legal', name: 'Estado legal', description: 'Situación jurídica de la pieza', dataType: 'LIST', domainId: 'dom_legal', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_publico', name: 'Público objetivo', description: 'Segmento de cliente', dataType: 'LIST', domainId: 'dom_publico', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_uso', name: 'Uso / Ocasión', description: 'Contexto de uso recomendado', dataType: 'LIST', domainId: 'dom_uso', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_iva', name: 'IVA Aplicable', description: 'Régimen fiscal', dataType: 'LIST', domainId: 'dom_iva', isActive: true, createdAt: new Date(), createdBy: 'system' }
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
        const newAttr = { ...attr, isActive: true, createdAt: serverTimestamp() };
        await setDoc(doc(db, COLLECTION_NAME, id), newAttr);
        return { ...newAttr, id, createdAt: new Date() } as Attribute;
    }
};
