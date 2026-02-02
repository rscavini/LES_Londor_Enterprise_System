import { Attribute, DataType } from '../models/schema';

// Mock de base de datos para Atributos
let attributes: Attribute[] = [
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
    getAll: (): Attribute[] => attributes.filter(a => a.isActive),

    create: (attr: Omit<Attribute, 'id' | 'createdAt' | 'isActive'>): Attribute => {
        // R7: Si DataType es LIST, domainId es obligatorio
        if (attr.dataType === 'LIST' && !attr.domainId) {
            throw new Error('Un atributo de tipo LISTA debe tener un dominio asociado.');
        }

        const newAttr: Attribute = {
            ...attr,
            id: `attr_${Date.now()}`,
            isActive: true,
            createdAt: new Date()
        };

        attributes.push(newAttr);
        return newAttr;
    },

    update: (id: string, updates: Partial<Attribute>): Attribute | undefined => {
        const index = attributes.findIndex(a => a.id === id);
        if (index === -1) return undefined;

        attributes[index] = { ...attributes[index], ...updates };
        return attributes[index];
    },

    deleteLogic: (id: string): boolean => {
        const index = attributes.findIndex(a => a.id === id);
        if (index === -1) return false;

        attributes[index].isActive = false;
        return true;
    }
};
