import {
    doc,
    runTransaction,
    collection,
    getDocs,
    setDoc,
    Timestamp,
    serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";

export interface Sequence {
    id: string;
    name: string;
    prefix: string;
    currentValue: number;
    padding: number;
    lastUpdated: Timestamp;
}

const SEQUENCES_COLLECTION = "sequences";

export const SequenceService = {
    /**
     * Obtains the next number in a sequence atomically using a transaction.
     * Ensures no gaps and no duplicates even in high concurrency.
     */
    async getNextNumber(sequenceId: string): Promise<string> {
        const sequenceRef = doc(db, SEQUENCES_COLLECTION, sequenceId);

        return await runTransaction(db, async (transaction) => {
            const sequenceSnap = await transaction.get(sequenceRef);

            if (!sequenceSnap.exists()) {
                throw new Error(`La secuencia "${sequenceId}" no existe. Debe ser inicializada.`);
            }

            const data = sequenceSnap.data() as Sequence;
            const nextValue = data.currentValue + 1;

            // Update the sequence with the new value
            transaction.update(sequenceRef, {
                currentValue: nextValue,
                lastUpdated: serverTimestamp()
            });

            // Format the string (e.g., F-2026-000001)
            const formattedNumber = nextValue.toString().padStart(data.padding, '0');
            return `${data.prefix}${formattedNumber}`;
        });
    },

    /**
     * Initializes or updates a sequence configuration.
     */
    async setSequence(id: string, data: Partial<Sequence>) {
        const sequenceRef = doc(db, SEQUENCES_COLLECTION, id);
        return await setDoc(sequenceRef, {
            ...data,
            id,
            lastUpdated: serverTimestamp()
        }, { merge: true });
    },

    /**
     * Retrieves all sequences for management.
     */
    async getAllSequences(): Promise<Sequence[]> {
        const querySnapshot = await getDocs(collection(db, SEQUENCES_COLLECTION));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Sequence));
    }
};
