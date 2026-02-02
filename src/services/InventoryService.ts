import { InventoryItem } from '../models/schema';

// Simulación de persistencia
let items: InventoryItem[] = [];

export const InventoryService = {
    getAll: (): InventoryItem[] => items.filter(i => i.isActive),

    getById: (id: string): InventoryItem | undefined => items.find(i => i.id === id && i.isActive),

    getByCode: (code: string): InventoryItem | undefined => items.find(i => i.itemCode === code && i.isActive),

    /**
     * Genera un código único basado en el año y un secuencial.
     * En un sistema real, esto consultaría el último ID en DB.
     */
    generateItemCode: (): string => {
        const year = new Date().getFullYear();
        const count = items.length + 1;
        const sequence = count.toString().padStart(4, '0');
        return `LD-${year}-${sequence}`;
    },

    create: (data: Omit<InventoryItem, 'id' | 'itemCode' | 'qrCode' | 'isActive' | 'createdAt' | 'updatedAt'>): InventoryItem => {
        const id = crypto.randomUUID();
        const itemCode = InventoryService.generateItemCode();

        const newItem: InventoryItem = {
            ...data,
            id,
            itemCode,
            qrCode: `https://les.londor.com/i/${id}`, // URL base para QR
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        items.push(newItem);
        return newItem;
    },

    update: (id: string, updates: Partial<InventoryItem>): InventoryItem | undefined => {
        const index = items.findIndex(i => i.id === id);
        if (index !== -1) {
            items[index] = {
                ...items[index],
                ...updates,
                updatedAt: new Date()
            };
            return items[index];
        }
        return undefined;
    },

    deleteLogic: (id: string): boolean => {
        const index = items.findIndex(i => i.id === id);
        if (index !== -1) {
            items[index].isActive = false;
            items[index].updatedAt = new Date();
            return true;
        }
        return false;
    }
};
