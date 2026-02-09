import { db } from '@/firebase';
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    doc,
    runTransaction,
    serverTimestamp,
    setDoc
} from 'firebase/firestore';
import { InventoryMovement, MovementType, InventoryItem } from '../models/schema';

const MOVEMENTS_COLL = 'inventory_movements';
const MOVEMENT_TYPES_COLL = 'movement_types';
const INVENTORY_COLL = 'inventory';

const initialMovementTypes: MovementType[] = [
    { id: 'mt_create', code: 'CREATE', name: 'Alta de Pieza', isActive: true },
    { id: 'mt_transfer', code: 'TRANSFER', name: 'Traslado entre Ubicaciones', isActive: true },
    { id: 'mt_status_change', code: 'STATUS_CHANGE', name: 'Cambio de Estado Operativo', isActive: true },
    { id: 'mt_sale', code: 'SALE', name: 'Venta', isActive: true },
    { id: 'mt_reserve', code: 'RESERVE', name: 'Reserva / Apartado', isActive: true },
    { id: 'mt_adaptation', code: 'ADAPTATION', name: 'Adaptación / Taller', isActive: true },
    { id: 'mt_adjustment', code: 'ADJUSTMENT', name: 'Ajuste de Inventario', isActive: true }
];

export const MovementService = {
    getMovementTypes: async (): Promise<MovementType[]> => {
        const q = query(collection(db, MOVEMENT_TYPES_COLL), where('isActive', '==', true));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            for (const mt of initialMovementTypes) {
                await setDoc(doc(db, MOVEMENT_TYPES_COLL, mt.id), { ...mt, createdAt: serverTimestamp() });
            }
            return initialMovementTypes;
        }

        return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as MovementType[];
    },

    getHistory: async (itemId: string): Promise<InventoryMovement[]> => {
        const q = query(
            collection(db, MOVEMENTS_COLL),
            where('itemId', '==', itemId)
        );
        const querySnapshot = await getDocs(q);
        const movements = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            createdAt: doc.data().createdAt?.toDate()
        })) as InventoryMovement[];

        // Sort in memory to avoid needing a composite index for (itemId, createdAt)
        return movements.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },

    /**
     * Registra un movimiento y actualiza la pieza de forma atómica.
     */
    recordMovement: async (params: {
        itemId: string;
        movementTypeCode: string;
        toLocationId?: string;
        toStatusId?: string;
        documentType?: string;
        documentId?: string;
        reason?: string;
        notes?: string;
        performedBy: string;
    }): Promise<string> => {
        return await runTransaction(db, async (transaction) => {
            const itemRef = doc(db, INVENTORY_COLL, params.itemId);
            const itemDoc = await transaction.get(itemRef);

            if (!itemDoc.exists()) {
                throw new Error("La pieza no existe");
            }

            const itemData = itemDoc.data() as InventoryItem;

            // Buscar el ID del tipo de movimiento por código
            const mtQuery = query(collection(db, MOVEMENT_TYPES_COLL), where('code', '==', params.movementTypeCode));
            const mtSnapshot = await getDocs(mtQuery);
            if (mtSnapshot.empty) {
                throw new Error(`Tipo de movimiento no encontrado: ${params.movementTypeCode}`);
            }
            const movementType = mtSnapshot.docs[0];

            // Preparar el documento de movimiento
            const movementData: any = {
                itemId: params.itemId,
                movementTypeId: movementType.id,
                fromLocationId: itemData.locationId || null,
                toLocationId: params.toLocationId || itemData.locationId || null,
                fromStatusId: itemData.statusId || null,
                toStatusId: params.toStatusId || itemData.statusId || null,
                documentType: params.documentType || null,
                documentId: params.documentId || null,
                reason: params.reason || null,
                notes: params.notes || null,
                performedBy: params.performedBy
            };

            // Limpieza final de campos undefined para Firestore
            Object.keys(movementData).forEach(key => {
                if (movementData[key] === undefined) {
                    delete movementData[key];
                }
            });

            const movementsRef = collection(db, MOVEMENTS_COLL);
            const newMovementRef = doc(movementsRef);

            transaction.set(newMovementRef, {
                ...movementData,
                createdAt: serverTimestamp()
            });

            // Actualizar la pieza
            transaction.update(itemRef, {
                locationId: params.toLocationId || itemData.locationId,
                statusId: params.toStatusId || itemData.statusId,
                lastMovementId: newMovementRef.id,
                lastMovementAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            return newMovementRef.id;
        });
    }
};
