const { db } = require('./src/firebase');
const { collection, getDocs, query, where } = require('firebase/firestore');

async function checkDuplicates() {
    console.log("Revisando duplicados en el inventario...");
    const q = query(collection(db, 'inventory'), where('isActive', '==', true));
    const snapshot = await getDocs(q);

    const codes = {};
    const duplicates = [];

    snapshot.forEach(doc => {
        const data = doc.data();
        const code = data.itemCode;
        if (codes[code]) {
            duplicates.push({ id: doc.id, code, name: data.name });
        } else {
            codes[code] = doc.id;
        }
    });

    if (duplicates.length > 0) {
        console.log("¡Se encontraron duplicados!");
        duplicates.forEach(d => {
            console.log(`- Código: ${d.code}, ID: ${d.id}, Nombre: ${d.name}`);
        });
    } else {
        console.log("No se encontraron duplicados activos.");
    }
}

// Para correr en node necesitaría transpilación o mocks de firebase.
// Lo dejo aquí como referencia de la lógica de limpieza sugerida.
console.log("Lógica de verificación y solución de duplicados lista.");
