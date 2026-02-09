import { InventoryService } from './services/InventoryService';
import { MovementService } from './services/MovementService';
import { LocationService } from './services/LocationService';
import { OperationalStatusService } from './services/OperationalStatusService';

export async function testPhase7() {
    console.log("🚀 Iniciando Test Fase A7: Movimientos y Trazabilidad");

    try {
        // 1. Inicializar catálogos
        console.log("--- Inicializando catálogos ---");
        const locations = await LocationService.getAll();
        const statuses = await OperationalStatusService.getAll();
        const movementTypes = await MovementService.getMovementTypes();
        console.log(`✅ Catálogos listos. Tipos de movimiento: ${movementTypes.length}`);

        // 2. Crear una pieza (Debe generar movimiento CREATE)
        console.log("--- Test: Creación de pieza ---");
        const newItem = await InventoryService.create({
            name: "Test Movimientos",
            description: "Pieza para probar trazabilidad A7",
            categoryId: "cat_anillos", // Asumiendo que existen
            subcategoryId: "sub_alianzas",
            locationId: locations[0].id,
            statusId: statuses[0].id,
            itemCode: `TEST-${Date.now()}`,
            attributes: {},
            images: [],
            isApproved: true,
            createdBy: "tester"
        }, "tester");

        console.log(`✅ Pieza creada: ${newItem.itemCode} (ID: ${newItem.id})`);

        let history = await MovementService.getHistory(newItem.id);
        if (history.length === 1 && history[0].toStatusId === statuses[0].id) {
            console.log("✅ Movimiento CREATE registrado correctamente");
        } else {
            console.error("❌ Error: No se registró el movimiento CREATE correctamente", history);
        }

        // 3. Registrar un Traslado (TRANSFER)
        if (locations.length > 1) {
            console.log("--- Test: Traslado (TRANSFER) ---");
            const newLocId = locations[1].id;
            await MovementService.recordMovement({
                itemId: newItem.id,
                movementTypeCode: 'TRANSFER',
                toLocationId: newLocId,
                reason: "Traslado de prueba a vitrina B",
                performedBy: "tester"
            });

            const updatedItem = await InventoryService.getById(newItem.id);
            if (updatedItem?.locationId === newLocId) {
                console.log(`✅ Ubicación actualizada a: ${newLocId}`);
            } else {
                console.error("❌ Error: La ubicación no se actualizó", updatedItem);
            }

            history = await MovementService.getHistory(newItem.id);
            if (history.length === 2 && history[0].toLocationId === newLocId) {
                console.log("✅ Movimiento TRANSFER registrado en el historial");
            }
        }

        // 4. Registrar Cambio de Estado (STATUS_CHANGE)
        console.log("--- Test: Cambio de Estado (STATUS_CHANGE) ---");
        const newStatusId = statuses.find(s => s.name === 'Vendido')?.id || statuses[1].id;
        await MovementService.recordMovement({
            itemId: newItem.id,
            movementTypeCode: 'STATUS_CHANGE',
            toStatusId: newStatusId,
            reason: "Venta de prueba",
            performedBy: "tester"
        });

        const itemFinal = await InventoryService.getById(newItem.id);
        if (itemFinal?.statusId === newStatusId) {
            console.log(`✅ Estado actualizado a: ${newStatusId}`);
        }

        history = await MovementService.getHistory(newItem.id);
        console.log(`📋 Historial final de la pieza (${history.length} movimientos):`);
        history.forEach(m => {
            console.log(`- [${m.createdAt.toISOString()}] Tipo MT ID: ${m.movementTypeId} | Destino: ${m.toLocationId} | Estado: ${m.toStatusId} | Motivo: ${m.reason}`);
        });

        console.log("🏁 Test Fase A7 finalizado con éxito.");

    } catch (error) {
        console.error("🛑 Error en el test de Fase A7:", error);
    }
}
