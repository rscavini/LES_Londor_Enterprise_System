import { Domain, DomainValue } from '../models/schema';

// Mock de base de datos para Dominios
let domains: Domain[] = [
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

let domainValues: DomainValue[] = [
    // Origen
    { id: 'dv_og_new', domainId: 'dom_origen', value: 'Nueva', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_og_re', domainId: 'dom_origen', value: 'Recompra', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_og_sh', domainId: 'dom_origen', value: 'Segunda mano', sortOrder: 3, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    // Materiales
    { id: 'dv_mat_oro', domainId: 'dom_material', value: 'Oro', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_mat_plata', domainId: 'dom_material', value: 'Plata', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_mat_platino', domainId: 'dom_material', value: 'Platino', sortOrder: 3, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    // Leyes
    { id: 'dv_ley_18k', domainId: 'dom_ley', value: '18k', sortOrder: 3, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_ley_925', domainId: 'dom_ley', value: '925', sortOrder: 6, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    // Colores Metal
    { id: 'dv_col_ama', domainId: 'dom_color_metal', value: 'Amarillo', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_col_bla', domainId: 'dom_color_metal', value: 'Blanco', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_col_ros', domainId: 'dom_color_metal', value: 'Rosa', sortOrder: 3, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    // Estados Operativos
    { id: 'dv_ope_dis', domainId: 'dom_estado_ope', value: 'Disponible', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_ope_res', domainId: 'dom_estado_ope', value: 'Reservada / Apartada', sortOrder: 3, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_ope_rep', domainId: 'dom_estado_ope', value: 'En reparación / personalización', sortOrder: 4, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' }
];

export const DomainService = {
    getDomains: (): Domain[] => domains.filter(d => d.isActive),

    getValuesByDomain: (domainId: string): DomainValue[] => {
        return domainValues.filter(v => v.domainId === domainId && v.isActive)
            .sort((a, b) => a.sortOrder - b.sortOrder);
    },

    addValue: (data: Omit<DomainValue, 'id' | 'createdAt' | 'isActive'>): DomainValue => {
        const domain = domains.find(d => d.id === data.domainId);

        // R11/R12: Gestión de nuevos valores
        if (domain?.type === 'CLOSED' && data.source === 'USER_ADDED') {
            console.log(`Aviso: Añadiendo valor a un dominio CERRADO: ${domain.name}`);
        }

        if (data.source === 'USER_ADDED' && !data.justification) {
            throw new Error('La justificación es obligatoria para nuevos valores en dominios semi-cerrados.');
        }

        const newValue: DomainValue = {
            ...data,
            id: `val_${Date.now()}`,
            isActive: true,
            createdAt: new Date()
        };

        domainValues.push(newValue);
        return newValue;
    },

    updateValue: (id: string, updates: Partial<DomainValue>): DomainValue | undefined => {
        const index = domainValues.findIndex(v => v.id === id);
        if (index === -1) return undefined;

        domainValues[index] = { ...domainValues[index], ...updates };
        return domainValues[index];
    },

    deleteValue: (id: string): boolean => {
        const index = domainValues.findIndex(v => v.id === id);
        if (index === -1) return false;

        domainValues[index].isActive = false;
        return true;
    }
};
