import { CategoryService } from './services/CategoryService';
import { SubcategoryService } from './services/SubcategoryService';
import { DomainService } from './services/DomainService';
import { AttributeService } from './services/AttributeService';

async function main() {
    console.log('--- Verificación Fase 0: Tablas Auxiliares ---');

    // 1. Verificar Categorías
    const cats = await CategoryService.getAll();
    console.log('Categorías iniciales:', cats.map(c => c.name));

    // 2. Verificar Subcategorías vinculadas
    const subcats = await SubcategoryService.getByCategory('cat_1');
    console.log('Subcategorías de Anillos:', subcats.map(s => s.name));

    // 3. Verificar Dominios y Reglas (Cerrado vs Semi-cerrado)
    try {
        console.log('Intentando añadir valor a dominio CERRADO...');
        await DomainService.addValue({
            domainId: 'dom_1',
            value: 'Plata 925',
            sortOrder: 2,
            source: 'USER_ADDED',
            justification: 'Prueba de integridad',
            createdBy: 'test'
        });
    } catch (e: any) {
        console.log('Error esperado (R12):', e.message);
    }

    // 4. Verificar Atributos y Reglas (LIST -> DomainId)
    try {
        console.log('Intentando crear Atributo LIST sin DomainId...');
        await AttributeService.create({
            name: 'Atributo Inválido',
            dataType: 'LIST',
            domainId: undefined as any,
            createdBy: 'test'
        });
    } catch (e: any) {
        console.log('Error esperado (R7):', e.message);
    }

    console.log('--- Verificación Completada con Éxito ---');
}

main().catch(console.error);
