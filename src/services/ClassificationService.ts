import { db } from '../firebase';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, query, where, serverTimestamp, setDoc, writeBatch, deleteDoc } from 'firebase/firestore';
import { ClassificationMapping } from '../models/schema';

const COLLECTION_NAME = 'classification_mappings';
const AUDIT_COLL = 'audit_logs';

export interface AuditLog {
    id: string;
    timestamp: Date;
    user: string;
    action: 'CREATE' | 'DELETE' | 'REORDER' | 'UPDATE';
    targetType: 'category' | 'subcategory';
    targetId: string;
    details: string;
}

const initialMappings: ClassificationMapping[] = [
    { categoryId: 'cat_anillos', subcategoryId: '', attributeId: 'attr_mat_pri', isMandatory: true, sortOrder: 0 },
    { categoryId: 'cat_anillos', subcategoryId: '', attributeId: 'attr_ley', isMandatory: true, sortOrder: 1 },
    { categoryId: 'cat_anillos', subcategoryId: '', attributeId: 'attr_col_met', isMandatory: false, sortOrder: 2 },
    { categoryId: '', subcategoryId: 'sub_an_solitario', attributeId: 'attr_tip_pie', isMandatory: true, sortOrder: 3 },
    { categoryId: '', subcategoryId: 'sub_an_solitario', attributeId: 'attr_for_pie', isMandatory: false, sortOrder: 4 },
    { categoryId: 'cat_relojes', subcategoryId: '', attributeId: 'attr_mat_pri', isMandatory: true, sortOrder: 0 },
    { categoryId: 'cat_relojes', subcategoryId: '', attributeId: 'attr_acabado', isMandatory: false, sortOrder: 1 }
];

export const ClassificationService = {
    getAttributesByCategory: async (categoryId: string): Promise<ClassificationMapping[]> => {
        const q = query(collection(db, COLLECTION_NAME),
            where('categoryId', '==', categoryId),
            where('subcategoryId', '==', ''));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty && categoryId === 'cat_anillos') {
            // Seeding logic for dev/demo if empty
            for (const m of initialMappings.filter(im => im.categoryId === categoryId)) {
                await setDoc(doc(db, COLLECTION_NAME, `${m.categoryId}_${m.subcategoryId}_${m.attributeId}`), m);
            }
            return initialMappings.filter(im => im.categoryId === categoryId && !im.subcategoryId);
        }

        return querySnapshot.docs.map(doc => doc.data() as ClassificationMapping).sort((a, b) => a.sortOrder - b.sortOrder);
    },

    getAttributesBySubcategory: async (subcategoryId: string, categoryId?: string): Promise<ClassificationMapping[]> => {
        const qSub = query(collection(db, COLLECTION_NAME), where('subcategoryId', '==', subcategoryId));
        const subSnapshot = await getDocs(qSub);
        const direct = subSnapshot.docs.map(doc => doc.data() as ClassificationMapping);

        let inherited: ClassificationMapping[] = [];
        if (categoryId) {
            const qCat = query(collection(db, COLLECTION_NAME),
                where('categoryId', '==', categoryId),
                where('subcategoryId', '==', ''));
            const catSnapshot = await getDocs(qCat);
            inherited = catSnapshot.docs.map(doc => doc.data() as ClassificationMapping);
        }

        const combined = [...direct];
        inherited.forEach(inh => {
            if (!combined.some(d => d.attributeId === inh.attributeId)) {
                combined.push(inh);
            }
        });

        return combined.sort((a, b) => a.sortOrder - b.sortOrder);
    },

    addMapping: async (targetId: string, attributeId: string, type: 'category' | 'subcategory'): Promise<void> => {
        const isCat = type === 'category';
        const docId = isCat ? `${targetId}__${attributeId}` : `__${targetId}_${attributeId}`;

        await setDoc(doc(db, COLLECTION_NAME, docId), {
            categoryId: isCat ? targetId : '',
            subcategoryId: !isCat ? targetId : '',
            attributeId,
            isMandatory: false,
            sortOrder: 0 // Simplificado para refactor
        });

        await addDoc(collection(db, AUDIT_COLL), {
            timestamp: serverTimestamp(),
            user: 'admin',
            action: 'CREATE',
            targetType: type,
            targetId,
            details: `Vinculado atributo ${attributeId}.`
        });
    },

    removeMapping: async (targetId: string, attributeId: string, type: 'category' | 'subcategory'): Promise<void> => {
        const isCat = type === 'category';
        const docId = isCat ? `${targetId}__${attributeId}` : `__${targetId}_${attributeId}`;
        await deleteDoc(doc(db, COLLECTION_NAME, docId));

        await addDoc(collection(db, AUDIT_COLL), {
            timestamp: serverTimestamp(),
            user: 'admin',
            action: 'DELETE',
            targetType: type,
            targetId,
            details: `Desvinculado atributo ${attributeId}.`
        });
    },

    getLogs: async (targetId: string): Promise<AuditLog[]> => {
        const q = query(collection(db, AUDIT_COLL), where('targetId', '==', targetId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            timestamp: doc.data().timestamp?.toDate()
        })) as AuditLog[];
    }
};
