import { ClassificationMapping } from '../models/schema';

export interface AuditLog {
    id: string;
    timestamp: Date;
    user: string;
    action: 'CREATE' | 'DELETE' | 'REORDER' | 'UPDATE';
    targetType: 'category' | 'subcategory';
    targetId: string;
    details: string;
}

// Simulación de persistencia de mapeos
let mappings: ClassificationMapping[] = [];
let auditLogs: AuditLog[] = [];

export const ClassificationService = {
    /**
     * Obtiene los atributos mapeados de una categoría.
     */
    getAttributesByCategory: (categoryId: string): ClassificationMapping[] => {
        return mappings
            .filter(m => m.categoryId === categoryId && !m.subcategoryId)
            .sort((a, b) => a.sortOrder - b.sortOrder);
    },

    /**
     * Obtiene los atributos mapeados de una subcategoría (incluye heredados).
     */
    getAttributesBySubcategory: (subcategoryId: string, categoryId?: string): ClassificationMapping[] => {
        const direct = mappings.filter(m => m.subcategoryId === subcategoryId);
        let inherited: ClassificationMapping[] = [];
        if (categoryId) {
            inherited = mappings.filter(m => m.categoryId === categoryId && !m.subcategoryId);
        }

        // La subcategoría puede sobrescribir orden o mandatoriedad del heredado si existiera duplicado
        const combined = [...direct];
        inherited.forEach(inh => {
            if (!combined.some(d => d.attributeId === inh.attributeId)) {
                combined.push(inh);
            }
        });

        return combined.sort((a, b) => a.sortOrder - b.sortOrder);
    },

    /**
     * Añade un mapeo de forma inmediata.
     */
    addMapping: (targetId: string, attributeId: string, type: 'category' | 'subcategory'): void => {
        const isCat = type === 'category';
        const exists = mappings.find(m =>
            m.attributeId === attributeId &&
            (isCat ? (m.categoryId === targetId && !m.subcategoryId) : m.subcategoryId === targetId)
        );
        if (exists) return;

        const currentMappings = isCat
            ? mappings.filter(m => m.categoryId === targetId && !m.subcategoryId)
            : mappings.filter(m => m.subcategoryId === targetId);

        const newMapping: ClassificationMapping = {
            categoryId: isCat ? targetId : '',
            subcategoryId: !isCat ? targetId : '',
            attributeId,
            isMandatory: false,
            sortOrder: currentMappings.length
        };

        mappings.push(newMapping);

        auditLogs.push({
            id: `log_${Date.now()}`,
            timestamp: new Date(),
            user: 'admin',
            action: 'CREATE',
            targetType: type,
            targetId,
            details: `Vinculado atributo ${attributeId}.`
        });
    },

    /**
     * Elimina un mapeo de forma inmediata.
     */
    removeMapping: (targetId: string, attributeId: string, type: 'category' | 'subcategory'): void => {
        mappings = mappings.filter(m => {
            const isTarget = type === 'category' ? (m.categoryId === targetId && !m.subcategoryId) : m.subcategoryId === targetId;
            return !(isTarget && m.attributeId === attributeId);
        });

        auditLogs.push({
            id: `log_${Date.now()}`,
            timestamp: new Date(),
            user: 'admin',
            action: 'DELETE',
            targetType: type,
            targetId,
            details: `Desvinculado atributo ${attributeId}.`
        });
    },

    /**
     * Cambia la obligatoriedad de forma inmediata.
     */
    toggleMandatory: (targetId: string, attributeId: string, type: 'category' | 'subcategory'): void => {
        const mapping = mappings.find(m => {
            const isTarget = type === 'category' ? (m.categoryId === targetId && !m.subcategoryId) : m.subcategoryId === targetId;
            return isTarget && m.attributeId === attributeId;
        });

        if (mapping) {
            mapping.isMandatory = !mapping.isMandatory;
            auditLogs.push({
                id: `log_${Date.now()}`,
                timestamp: new Date(),
                user: 'admin',
                action: 'UPDATE',
                targetType: type,
                targetId,
                details: `Atributo ${attributeId} marcado como ${mapping.isMandatory ? 'OBLIGATORIO' : 'OPCIONAL'}.`
            });
        }
    },

    /**
     * Reordena los mapeos de forma inmediata.
     */
    reorderMappings: (targetId: string, attributeIds: string[], type: 'category' | 'subcategory'): void => {
        const otherMappings = mappings.filter(m => {
            const isTarget = type === 'category' ? m.categoryId === targetId && !m.subcategoryId : m.subcategoryId === targetId;
            return !isTarget;
        });

        const targetMappings = mappings.filter(m => {
            return type === 'category' ? m.categoryId === targetId && !m.subcategoryId : m.subcategoryId === targetId;
        });

        const newTargetMappings = attributeIds.map((id, index) => {
            const mapping = targetMappings.find(m => m.attributeId === id);
            if (!mapping) return null;
            return { ...mapping, sortOrder: index };
        }).filter(m => m !== null) as ClassificationMapping[];

        mappings = [...otherMappings, ...newTargetMappings];

        auditLogs.push({
            id: `log_${Date.now()}`,
            timestamp: new Date(),
            user: 'admin',
            action: 'REORDER',
            targetType: type,
            targetId,
            details: `Reordenados atributos (${attributeIds.length} elementos).`
        });
    },

    /**
     * Upsert para casos generales.
     */
    upsertMapping: (mapping: ClassificationMapping): void => {
        const index = mappings.findIndex(m =>
            m.attributeId === mapping.attributeId &&
            m.categoryId === mapping.categoryId &&
            m.subcategoryId === mapping.subcategoryId
        );

        if (index > -1) {
            mappings[index] = mapping;
        } else {
            mappings.push(mapping);
        }

        const type = mapping.subcategoryId ? 'subcategory' : 'category';
        const targetId = mapping.subcategoryId || mapping.categoryId || 'unknown';

        auditLogs.push({
            id: `log_${Date.now()}`,
            timestamp: new Date(),
            user: 'admin',
            action: 'UPDATE',
            targetType: type,
            targetId,
            details: `Actualizado mapeo de atributo ${mapping.attributeId}.`
        });
    },

    /**
     * Obtiene los logs de auditoría.
     */
    getLogs: (targetId: string): AuditLog[] => {
        return auditLogs
            .filter(l => l.targetId === targetId)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
};
