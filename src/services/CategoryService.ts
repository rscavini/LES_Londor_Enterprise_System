import { Category } from '../models/schema';
import { SubcategoryService } from './SubcategoryService';

// Mock de base de datos para la Fase 0 (se sustituirá por Firestore/SQL en la Fase 1)
let categories: Category[] = [
    { id: 'cat_anillos', name: 'Anillos', description: 'Piezas destinadas a ser llevadas en el dedo.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'cat_pendientes', name: 'Pendientes', description: 'Piezas destinadas a la oreja.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'cat_collares', name: 'Collares', description: 'Piezas completas destinadas al cuello.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'cat_colgantes', name: 'Colgantes', description: 'Piezas colgables independientes.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'cat_cadenas', name: 'Cadenas', description: 'Elementos lineales de cuello.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'cat_pulseras', name: 'Pulseras', description: 'Piezas destinadas a la muñeca (flexibles).', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'cat_brazaletes', name: 'Brazaletes', description: 'Piezas rígidas o semi-rígidas de muñeca.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'cat_tobilleras', name: 'Tobilleras', description: 'Piezas destinadas al tobillo.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'cat_gemelos', name: 'Gemelos', description: 'Piezas destinadas a camisas.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'cat_broches', name: 'Broches', description: 'Piezas decorativas o funcionales para prendas.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'cat_relojes', name: 'Relojes', description: 'Instrumentos de medida del tiempo.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'cat_conjuntos', name: 'Conjuntos / Sets', description: 'Entidad lógica de agrupación de piezas.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'cat_otros', name: 'Otros / Especiales', description: 'Uso controlado y excepcional.', isActive: true, createdAt: new Date(), createdBy: 'system' }
];

export const CategoryService = {
    getAll: (): Category[] => {
        return categories.filter(c => c.isActive);
    },

    getById: (id: string): Category | undefined => {
        return categories.find(c => c.id === id);
    },

    create: (category: Omit<Category, 'id' | 'createdAt' | 'isActive'>): Category => {
        const newCategory: Category = {
            ...category,
            id: `cat_${Date.now()}`,
            isActive: true,
            createdAt: new Date()
        };
        categories.push(newCategory);
        return newCategory;
    },

    update: (id: string, updates: Partial<Category>): Category | undefined => {
        const index = categories.findIndex(c => c.id === id);
        if (index === -1) return undefined;

        categories[index] = { ...categories[index], ...updates };
        return categories[index];
    },

    deleteLogic: (id: string): boolean => {
        const index = categories.findIndex(c => c.id === id);
        if (index === -1) return false;

        // Propagar borrado a subcategorías
        SubcategoryService.deactivateByCategory(id);

        categories[index].isActive = false;
        return true;
    }
};
