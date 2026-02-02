import { Subcategory } from '../models/schema';

// Mock de base de datos para la Fase 0
let subcategories: Subcategory[] = [
    // ANILLOS
    { id: 'sub_an_solitario', categoryId: 'cat_anillos', name: 'Solitario', description: 'Anillo con una única piedra central.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_an_alianza', categoryId: 'cat_anillos', name: 'Alianza', description: 'Banda uniforme.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_an_media_alianza', categoryId: 'cat_anillos', name: 'Media alianza', description: 'Banda con piedras en la mitad superior.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_an_roseton', categoryId: 'cat_anillos', name: 'Rosetón', description: 'Piedra central rodeada de otras menores.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_an_sello', categoryId: 'cat_anillos', name: 'Sello', description: 'Anillo con parte superior plana y ancha.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_an_trilogy', categoryId: 'cat_anillos', name: 'Trilogy / Tresillo', description: 'Anillo con tres piedras.', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_an_con_piedra', categoryId: 'cat_anillos', name: 'Anillo con piedra central', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_an_sin_piedra', categoryId: 'cat_anillos', name: 'Anillo sin piedra', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_an_ajustable', categoryId: 'cat_anillos', name: 'Anillo ajustable', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_an_infantil', categoryId: 'cat_anillos', name: 'Anillo infantil', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // PENDIENTES
    { id: 'sub_pe_boton', categoryId: 'cat_pendientes', name: 'Pendientes de botón', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_pe_aro', categoryId: 'cat_pendientes', name: 'Pendientes de aro', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_pe_largos', categoryId: 'cat_pendientes', name: 'Pendientes largos', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_pe_colgantes', categoryId: 'cat_pendientes', name: 'Pendientes colgantes', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_pe_criollas', categoryId: 'cat_pendientes', name: 'Criollas', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_pe_trepadores', categoryId: 'cat_pendientes', name: 'Trepadores (ear climbers)', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_pe_con_piedra', categoryId: 'cat_pendientes', name: 'Pendientes con piedra', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_pe_sin_piedra', categoryId: 'cat_pendientes', name: 'Pendientes sin piedra', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_pe_infantil', categoryId: 'cat_pendientes', name: 'Pendientes infantil', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // COLLARES
    { id: 'sub_co_corto', categoryId: 'cat_collares', name: 'Collar corto', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_co_largo', categoryId: 'cat_collares', name: 'Collar largo', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_co_rigido', categoryId: 'cat_collares', name: 'Collar rígido', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_co_flexible', categoryId: 'cat_collares', name: 'Collar flexible', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_co_fijo', categoryId: 'cat_collares', name: 'Collar con colgante fijo', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_co_desmontable', categoryId: 'cat_collares', name: 'Collar con colgante desmontable', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // COLGANTES
    { id: 'sub_cl_clasico', categoryId: 'cat_colgantes', name: 'Colgante clásico', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_cl_con_piedra', categoryId: 'cat_colgantes', name: 'Colgante con piedra', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_cl_sin_piedra', categoryId: 'cat_colgantes', name: 'Colgante sin piedra', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_cl_medalla', categoryId: 'cat_colgantes', name: 'Medalla', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_cl_cruz', categoryId: 'cat_colgantes', name: 'Cruz', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_cl_inicial', categoryId: 'cat_colgantes', name: 'Inicial / letra', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_cl_simbolo', categoryId: 'cat_colgantes', name: 'Símbolo', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_cl_religioso', categoryId: 'cat_colgantes', name: 'Colgante religioso', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_cl_infantil', categoryId: 'cat_colgantes', name: 'Colgante infantil', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // CADENAS
    { id: 'sub_ca_fina', categoryId: 'cat_cadenas', name: 'Cadena fina', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_ca_media', categoryId: 'cat_cadenas', name: 'Cadena media', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_ca_gruesa', categoryId: 'cat_cadenas', name: 'Cadena gruesa', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_ca_rigida', categoryId: 'cat_cadenas', name: 'Cadena rígida', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_ca_flexible', categoryId: 'cat_cadenas', name: 'Cadena flexible', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_ca_cordon', categoryId: 'cat_cadenas', name: 'Cadena tipo cordón', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_ca_eslabon', categoryId: 'cat_cadenas', name: 'Cadena tipo eslabón', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_ca_infantil', categoryId: 'cat_cadenas', name: 'Cadena infantil', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // PULSERAS
    { id: 'sub_pu_cadena', categoryId: 'cat_pulseras', name: 'Pulsera cadena', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_pu_rigida', categoryId: 'cat_pulseras', name: 'Pulsera rígida', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_pu_flexible', categoryId: 'cat_pulseras', name: 'Pulsera flexible', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_pu_colgantes', categoryId: 'cat_pulseras', name: 'Pulsera con colgantes', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_pu_piedras', categoryId: 'cat_pulseras', name: 'Pulsera con piedras', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_pu_sin_piedras', categoryId: 'cat_pulseras', name: 'Pulsera sin piedras', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_pu_infantil', categoryId: 'cat_pulseras', name: 'Pulsera infantil', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // BRAZALETES
    { id: 'sub_br_rigido', categoryId: 'cat_brazaletes', name: 'Brazalete rígido', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_br_abierto', categoryId: 'cat_brazaletes', name: 'Brazalete abierto', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_br_cerrado', categoryId: 'cat_brazaletes', name: 'Brazalete cerrado', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_br_piedras', categoryId: 'cat_brazaletes', name: 'Brazalete con piedras', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_br_sin_piedras', categoryId: 'cat_brazaletes', name: 'Brazalete sin piedras', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // TOBILLERAS
    { id: 'sub_to_cadena', categoryId: 'cat_tobilleras', name: 'Tobillera cadena', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_to_colgantes', categoryId: 'cat_tobilleras', name: 'Tobillera con colgantes', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_to_piedras', categoryId: 'cat_tobilleras', name: 'Tobillera con piedras', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_to_sin_piedras', categoryId: 'cat_tobilleras', name: 'Tobillera sin piedras', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // GEMELOS
    { id: 'sub_ge_clasicos', categoryId: 'cat_gemelos', name: 'Gemelos clásicos', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_ge_piedra', categoryId: 'cat_gemelos', name: 'Gemelos con piedra', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_ge_personalizados', categoryId: 'cat_gemelos', name: 'Gemelos personalizados', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_ge_infantiles', categoryId: 'cat_gemelos', name: 'Gemelos infantiles', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // BROCHES
    { id: 'sub_bro_clasico', categoryId: 'cat_broches', name: 'Broche clásico', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_bro_piedras', categoryId: 'cat_broches', name: 'Broche con piedras', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_bro_decorativo', categoryId: 'cat_broches', name: 'Broche decorativo', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_bro_funcional', categoryId: 'cat_broches', name: 'Broche funcional', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // RELOJES
    { id: 'sub_re_pulsera', categoryId: 'cat_relojes', name: 'Reloj de pulsera', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_re_clasico', categoryId: 'cat_relojes', name: 'Reloj clásico', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_re_deportivo', categoryId: 'cat_relojes', name: 'Reloj deportivo', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_re_joya', categoryId: 'cat_relojes', name: 'Reloj joya', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // CONJUNTOS
    { id: 'sub_con_an_pe', categoryId: 'cat_conjuntos', name: 'Conjunto anillo + pendientes', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_con_co_pe', categoryId: 'cat_conjuntos', name: 'Conjunto collar + pendientes', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_con_pu_co', categoryId: 'cat_conjuntos', name: 'Conjunto pulsera + collar', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_con_completo', categoryId: 'cat_conjuntos', name: 'Conjunto completo', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // OTROS
    { id: 'sub_ot_personalizada', categoryId: 'cat_otros', name: 'Pieza personalizada', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_ot_unica', categoryId: 'cat_otros', name: 'Pieza única', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_ot_prototipo', categoryId: 'cat_otros', name: 'Prototipo / muestra', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'sub_ot_historica', categoryId: 'cat_otros', name: 'Pieza histórica / especial', isActive: true, createdAt: new Date(), createdBy: 'system' }
];

export const SubcategoryService = {
    getAll: (): Subcategory[] => {
        return subcategories.filter(s => s.isActive);
    },

    getByCategory: (categoryId: string): Subcategory[] => {
        return subcategories.filter(s => s.categoryId === categoryId && s.isActive);
    },

    create: (subcat: Omit<Subcategory, 'id' | 'createdAt' | 'isActive'>): Subcategory => {
        // R5: Consistencia Category <-> Subcategory
        const newSubcat: Subcategory = {
            ...subcat,
            id: `sub_${Date.now()}`,
            isActive: true,
            createdAt: new Date()
        };
        subcategories.push(newSubcat);
        return newSubcat;
    },

    update: (id: string, updates: Partial<Subcategory>): Subcategory | undefined => {
        const index = subcategories.findIndex(s => s.id === id);
        if (index === -1) return undefined;

        subcategories[index] = { ...subcategories[index], ...updates };
        return subcategories[index];
    },

    deleteLogic: (id: string): boolean => {
        const index = subcategories.findIndex(s => s.id === id);
        if (index === -1) return false;

        subcategories[index].isActive = false;
        return true;
    },

    deactivateByCategory: (categoryId: string): void => {
        subcategories.forEach(s => {
            if (s.categoryId === categoryId) {
                s.isActive = false;
            }
        });
    }
};
