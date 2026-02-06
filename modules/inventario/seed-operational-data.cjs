const { initializeApp } = require("firebase/app");
const {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    limit,
    serverTimestamp,
    doc,
    updateDoc,
    Timestamp
} = require("firebase/firestore");
const { getAuth, signInAnonymously } = require("firebase/auth");

const firebaseConfig = {
    apiKey: "AIzaSyAgJyk3_wGde1-QM4nuuvAo3pnhqJs7Zts",
    authDomain: "les-londor-enterprise-system.firebaseapp.com",
    projectId: "les-londor-enterprise-system",
    storageBucket: "les-londor-enterprise-system.firebasestorage.app",
    messagingSenderId: "505326457231",
    appId: "1:505326457231:web:e17e3f024828bec6f0bbfa"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function seed() {
    try {
        await signInAnonymously(auth);
        console.log("Autenticado anónimamente.");

        // 1. Obtener Items de Inventario actuales
        const itemsSnap = await getDocs(query(collection(db, "inventory"), limit(10)));
        const items = itemsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (items.length < 5) {
            console.error("No hay suficientes ítems en el inventario para realizar el seed.");
            process.exit(1);
        }

        // 2. Crear 5 Clientes
        const customersData = [
            { firstName: "Elena", lastName: "García", dni: "12345678A", phone: "600111222", email: "elena@example.com", address: "Calle Mayor 1, Madrid", tags: ["VIP", "Recurrente"], isActive: true },
            { firstName: "Marco", lastName: "Polo", dni: "87654321B", phone: "600333444", email: "marco@example.com", tags: ["Nuevo"], isActive: true },
            { firstName: "Sofía", lastName: "Loren", dni: "11223344C", phone: "600555666", address: "Av. Diagonal 45, Barcelona", isActive: true },
            { firstName: "Javier", lastName: "Bardem", dni: "44332211D", phone: "600777888", tags: ["Mayorista"], isActive: true },
            { firstName: "Lucía", lastName: "Sánchez", dni: "55667788E", phone: "600999000", email: "lucia@example.com", isActive: true }
        ];

        const customerIds = [];
        console.log("Creando clientes...");
        for (const c of customersData) {
            const docRef = await addDoc(collection(db, "customers"), {
                ...c,
                createdAt: serverTimestamp(),
                createdBy: "seed_script"
            });
            customerIds.push(docRef.id);
            console.log(` - Cliente creado: ${c.firstName} (ID: ${docRef.id})`);
        }

        // 3. Crear 10 Apartados con diferentes estados
        const now = new Date();
        const future = (days) => {
            const d = new Date();
            d.setDate(d.getDate() + days);
            return Timestamp.fromDate(d);
        };
        const past = (days) => {
            const d = new Date();
            d.setDate(d.getDate() - days);
            return Timestamp.fromDate(d);
        };

        const reservationsData = [
            // 1. ACTIVA estándar
            { itemId: items[0].id, customerId: customerIds[0], status: 'ACTIVE', expiryDate: future(7), notes: "Apartado para regalo de cumpleaños" },
            // 2. ACTIVA próxima a vencer
            { itemId: items[1].id, customerId: customerIds[1], status: 'ACTIVE', expiryDate: future(1), notes: "Pendiente de confirmación bancaria" },
            // 3. ACTIVA ya vencida (para que el sistema la detecte)
            { itemId: items[2].id, customerId: customerIds[2], status: 'ACTIVE', expiryDate: past(2), notes: "Cliente no ha venido a recoger" },
            // 4. CADUCADA históricamente
            { itemId: items[3].id, customerId: customerIds[3], status: 'EXPIRED', expiryDate: past(10), resolutionNote: "Sistema marcó como caducado automáticamente", resolvedBy: "system", resolvedAt: past(5) },
            // 5. RESUELTA (Venta finalizada)
            { itemId: items[4].id, customerId: customerIds[4], status: 'RESOLVED', expiryDate: past(5), resolutionNote: "Venta consolidada en tienda", resolvedBy: "vendedor_01", resolvedAt: past(1) },
            // 6. CANCELADA (Liberada)
            { itemId: items[0].id, customerId: customerIds[1], status: 'CANCELLED', expiryDate: past(2), resolutionNote: "Cliente desistió de la compra", resolvedBy: "admin", resolvedAt: past(1) },
            // 7. ACTIVA VIP
            { itemId: items[1].id, customerId: customerIds[0], status: 'ACTIVE', expiryDate: future(15), notes: "Cliente VIP, plazo extendido" },
            // 8. OTRA ACTIVA
            { itemId: items[2].id, customerId: customerIds[3], status: 'ACTIVE', expiryDate: future(3) },
            // 9. OTRA CADUCADA
            { itemId: items[3].id, customerId: customerIds[4], status: 'EXPIRED', expiryDate: past(15), resolutionNote: "No se localizó al cliente", resolvedBy: "system", resolvedAt: past(14) },
            // 10. ACTIVA CRÍTICA
            { itemId: items[4].id, customerId: customerIds[2], status: 'ACTIVE', expiryDate: future(0.5), notes: "Recoge esta tarde sin falta" }
        ];

        console.log("Creando apartados...");
        for (const r of reservationsData) {
            await addDoc(collection(db, "reservations"), {
                ...r,
                locationId: "tienda_central",
                startDate: serverTimestamp(),
                createdAt: serverTimestamp(),
                createdBy: "seed_script"
            });

            // Actualizar estado de la pieza si está activa
            if (r.status === 'ACTIVE') {
                await updateDoc(doc(db, "inventory", r.itemId), {
                    statusId: "stat_reserved",
                    updatedAt: serverTimestamp()
                });
            }
            console.log(` - Apartado creado para Item: ${r.itemId} (Status: ${r.status})`);
        }

        console.log("\nSeeding completado con éxito!");
        process.exit(0);

    } catch (error) {
        console.error("Error en el seeding:", error);
        process.exit(1);
    }
}

seed();
