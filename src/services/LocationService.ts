import { Location, LocationType, LocationMetadata } from '../models/schema';

let locations: Location[] = [
    {
        id: 'loc_taller_unificado',
        name: 'Joyeros Unificados S.A.',
        type: 'WORKSHOP',
        metadata: {
            contactPerson: 'Julián Rodríguez',
            phone: '+34 912 345 678',
            email: 'julian@unificados.com',
            address: 'Calle de la Platería, 12, Planta 2, 28014 Madrid, España',
            specialties: ['Pulido', 'Engaste', 'Ajuste de Talla'],
            rating: 4.8,
            slaDays: 4
        },
        isActive: true,
        createdAt: new Date(),
        createdBy: 'system'
    },
    {
        id: 'loc_tienda_madrid',
        name: 'Londor Madrid - Serrano',
        type: 'STORE',
        metadata: {
            contactPerson: 'Elena Gómez',
            managerName: 'Elena Gómez',
            phone: '+34 912 000 111',
            address: 'Calle de Serrano, 45, 28001 Madrid'
        },
        isActive: true,
        createdAt: new Date(),
        createdBy: 'system'
    },
    { id: 'loc_almacen_central', name: 'Almacén Central', type: 'OTHER', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'loc_transito', name: 'En tránsito', type: 'OTHER', isActive: true, createdAt: new Date(), createdBy: 'system' }
];

export const LocationService = {
    getAll: (): Location[] => locations.filter(l => l.isActive),

    getById: (id: string): Location | undefined => locations.find(l => l.id === id && l.isActive),

    create: (data: Omit<Location, 'id' | 'createdAt' | 'isActive'>): Location => {
        const newLoc: Location = {
            ...data,
            id: `loc_${Date.now()}`,
            isActive: true,
            createdAt: new Date()
        };
        locations.push(newLoc);
        return newLoc;
    },

    update: (id: string, updates: Partial<Location>): Location | undefined => {
        const index = locations.findIndex(l => l.id === id);
        if (index !== -1) {
            locations[index] = { ...locations[index], ...updates };
            return locations[index];
        }
        return undefined;
    },

    deleteLogic: (id: string): boolean => {
        const index = locations.findIndex(l => l.id === id);
        if (index !== -1) {
            locations[index].isActive = false;
            return true;
        }
        return false;
    }
};
