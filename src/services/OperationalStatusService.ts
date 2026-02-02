import { OperationalStatus } from '../models/schema';

let statuses: OperationalStatus[] = [
    { id: 'os_controlada', name: 'Controlada', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'os_disponible', name: 'Disponible', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'os_reservada', name: 'Reservada / Apartada', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'os_reparacion', name: 'En reparación / personalización', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'os_transito', name: 'En tránsito', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'os_bloqueada', name: 'Bloqueada', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'os_lista', name: 'Lista para entrega', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'os_vendida', name: 'Vendida (cerrada)', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'os_ajuste', name: 'Ajuste / regularización', isActive: true, createdAt: new Date(), createdBy: 'system' }
];

export const OperationalStatusService = {
    getAll: (): OperationalStatus[] => statuses.filter(s => s.isActive),

    create: (name: string): OperationalStatus => {
        const newStatus: OperationalStatus = {
            id: `os_${Date.now()}`,
            name,
            isActive: true,
            createdAt: new Date(),
            createdBy: 'user'
        };
        statuses.push(newStatus);
        return newStatus;
    },

    update: (id: string, name: string): OperationalStatus | undefined => {
        const status = statuses.find(s => s.id === id);
        if (status) {
            status.name = name;
            return status;
        }
        return undefined;
    },

    deleteLogic: (id: string): boolean => {
        const index = statuses.findIndex(s => s.id === id);
        if (index !== -1) {
            statuses[index].isActive = false;
            return true;
        }
        return false;
    }
};
