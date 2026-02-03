const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc, serverTimestamp } = require("firebase/firestore");
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

// Data from CategoryService.ts
const categories = [
    { id: 'cat_anillos', name: 'Anillos', description: 'Piezas destinadas a ser llevadas en el dedo.', isActive: true },
    { id: 'cat_pendientes', name: 'Pendientes', description: 'Piezas destinadas a la oreja.', isActive: true },
    { id: 'cat_collares', name: 'Collares', description: 'Piezas completas destinadas al cuello.', isActive: true },
    { id: 'cat_colgantes', name: 'Colgantes', description: 'Piezas colgables independientes.', isActive: true },
    { id: 'cat_cadenas', name: 'Cadenas', description: 'Elementos lineales de cuello.', isActive: true },
    { id: 'cat_pulseras', name: 'Pulseras', description: 'Piezas destinadas a la muñeca (flexibles).', isActive: true },
    { id: 'cat_brazaletes', name: 'Brazaletes', description: 'Piezas rígidas o semi-rígidas de muñeca.', isActive: true },
    { id: 'cat_tobilleras', name: 'Tobilleras', description: 'Piezas destinadas al tobillo.', isActive: true },
    { id: 'cat_gemelos', name: 'Gemelos', description: 'Piezas destinadas a camisas.', isActive: true },
    { id: 'cat_broches', name: 'Broches', description: 'Piezas decorativas o funcionales para prendas.', isActive: true },
    { id: 'cat_relojes', name: 'Relojes', description: '(Solo si se incluye en inventario troncal) Instrumentos de medida del tiempo.', isActive: true },
    { id: 'cat_conjuntos', name: 'Conjuntos / Sets', description: 'Entidad lógica de agrupación de piezas.', isActive: true },
    { id: 'cat_otros', name: 'Otros / Especiales', description: 'Uso controlado y excepcional.', isActive: true }
];

// Data from SubcategoryService.ts
const subcategories = [
    { id: 'sub_an_solitario', categoryId: 'cat_anillos', name: 'Solitario', isActive: true },
    { id: 'sub_an_alianza', categoryId: 'cat_anillos', name: 'Alianza', isActive: true },
    { id: 'sub_an_media_alianza', categoryId: 'cat_anillos', name: 'Media alianza', isActive: true },
    { id: 'sub_an_roseton', categoryId: 'cat_anillos', name: 'Rosetón', isActive: true },
    { id: 'sub_an_sello', categoryId: 'cat_anillos', name: 'Sello', isActive: true },
    { id: 'sub_an_trilogy', categoryId: 'cat_anillos', name: 'Trilogy / Tresillo', isActive: true },
    { id: 'sub_an_piedra_central', categoryId: 'cat_anillos', name: 'Anillo con piedra central', isActive: true },
    { id: 'sub_an_sin_piedra', categoryId: 'cat_anillos', name: 'Anillo sin piedra', isActive: true },
    { id: 'sub_an_ajustable', categoryId: 'cat_anillos', name: 'Anillo ajustable', isActive: true },
    { id: 'sub_an_infantil', categoryId: 'cat_anillos', name: 'Anillo infantil', isActive: true },
    { id: 'sub_pe_boton', categoryId: 'cat_pendientes', name: 'Pendientes de botón', isActive: true },
    { id: 'sub_pe_aro', categoryId: 'cat_pendientes', name: 'Pendientes de aro', isActive: true },
    { id: 'sub_pe_largo', categoryId: 'cat_pendientes', name: 'Pendientes largos', isActive: true },
    { id: 'sub_pe_colgante', categoryId: 'cat_pendientes', name: 'Pendientes colgantes', isActive: true },
    { id: 'sub_pe_criolla', categoryId: 'cat_pendientes', name: 'Criollas', isActive: true },
    { id: 'sub_pe_trepador', categoryId: 'cat_pendientes', name: 'Trepadores (ear climbers)', isActive: true },
    { id: 'sub_pe_con_piedra', categoryId: 'cat_pendientes', name: 'Pendientes con piedra', isActive: true },
    { id: 'sub_pe_sin_piedra', categoryId: 'cat_pendientes', name: 'Pendientes sin piedra', isActive: true },
    { id: 'sub_pe_infantil', categoryId: 'cat_pendientes', name: 'Pendientes infantiles', isActive: true },
    { id: 'sub_co_corto', categoryId: 'cat_collares', name: 'Collar corto', isActive: true },
    { id: 'sub_co_largo', categoryId: 'cat_collares', name: 'Collar largo', isActive: true },
    { id: 'sub_co_rigido', categoryId: 'cat_collares', name: 'Collar rígido', isActive: true },
    { id: 'sub_co_flexible', categoryId: 'cat_collares', name: 'Collar flexible', isActive: true },
    { id: 'sub_co_colgante_fijo', categoryId: 'cat_collares', name: 'Collar con colgante fijo', isActive: true },
    { id: 'sub_co_colgante_desm', categoryId: 'cat_collares', name: 'Collar con colgante desmontable', isActive: true },
    { id: 'sub_cg_clasico', categoryId: 'cat_colgantes', name: 'Colgante clásico', isActive: true },
    { id: 'sub_cg_con_piedra', categoryId: 'cat_colgantes', name: 'Colgante con piedra', isActive: true },
    { id: 'sub_cg_sin_piedra', categoryId: 'cat_colgantes', name: 'Colgante sin piedra', isActive: true },
    { id: 'sub_cg_medalla', categoryId: 'cat_colgantes', name: 'Medalla', isActive: true },
    { id: 'sub_cg_cruz', categoryId: 'cat_colgantes', name: 'Cruz', isActive: true },
    { id: 'sub_cg_inicial', categoryId: 'cat_colgantes', name: 'Inicial / letra', isActive: true },
    { id: 'sub_cg_simbolo', categoryId: 'cat_colgantes', name: 'Símbolo', isActive: true },
    { id: 'sub_cg_religioso', categoryId: 'cat_colgantes', name: 'Colgante religioso', isActive: true },
    { id: 'sub_cg_infantil', categoryId: 'cat_colgantes', name: 'Colgante infantil', isActive: true },
    { id: 'sub_ca_fina', categoryId: 'cat_cadenas', name: 'Cadena fina', isActive: true },
    { id: 'sub_ca_media', categoryId: 'cat_cadenas', name: 'Cadena media', isActive: true },
    { id: 'sub_ca_gruesa', categoryId: 'cat_cadenas', name: 'Cadena gruesa', isActive: true },
    { id: 'sub_ca_rigida', categoryId: 'cat_cadenas', name: 'Cadena rígida', isActive: true },
    { id: 'sub_ca_flexible', categoryId: 'cat_cadenas', name: 'Cadena flexible', isActive: true },
    { id: 'sub_ca_cordon', categoryId: 'cat_cadenas', name: 'Cadena tipo cordón', isActive: true },
    { id: 'sub_ca_eslabon', categoryId: 'cat_cadenas', name: 'Cadena tipo eslabón', isActive: true },
    { id: 'sub_ca_infantil', categoryId: 'cat_cadenas', name: 'Cadena infantil', isActive: true },
    { id: 'sub_pu_cadena', categoryId: 'cat_pulseras', name: 'Pulsera cadena', isActive: true },
    { id: 'sub_pu_rigida', categoryId: 'cat_pulseras', name: 'Pulsera rígida', isActive: true },
    { id: 'sub_pu_flexible', categoryId: 'cat_pulseras', name: 'Pulsera flexible', isActive: true },
    { id: 'sub_pu_colgantes', categoryId: 'cat_pulseras', name: 'Pulsera con colgantes', isActive: true },
    { id: 'sub_pu_con_piedras', categoryId: 'cat_pulseras', name: 'Pulsera con piedras', isActive: true },
    { id: 'sub_pu_sin_piedras', categoryId: 'cat_pulseras', name: 'Pulsera sin piedras', isActive: true },
    { id: 'sub_pu_infantil', categoryId: 'cat_pulseras', name: 'Pulsera infantil', isActive: true },
    { id: 'sub_br_rigido', categoryId: 'cat_brazaletes', name: 'Brazalete rígido', isActive: true },
    { id: 'sub_br_abierto', categoryId: 'cat_brazaletes', name: 'Brazalete abierto', isActive: true },
    { id: 'sub_br_cerrado', categoryId: 'cat_brazaletes', name: 'Brazalete cerrado', isActive: true },
    { id: 'sub_br_con_piedras', categoryId: 'cat_brazaletes', name: 'Brazalete con piedras', isActive: true },
    { id: 'sub_br_sin_piedras', categoryId: 'cat_brazaletes', name: 'Brazalete sin piedras', isActive: true },
    { id: 'sub_to_cadena', categoryId: 'cat_tobilleras', name: 'Tobillera cadena', isActive: true },
    { id: 'sub_to_colgantes', categoryId: 'cat_tobilleras', name: 'Tobillera con colgantes', isActive: true },
    { id: 'sub_to_con_piedras', categoryId: 'cat_tobilleras', name: 'Tobillera con piedras', isActive: true },
    { id: 'sub_to_sin_piedras', categoryId: 'cat_tobilleras', name: 'Tobillera sin piedras', isActive: true },
    { id: 'sub_ge_clasicos', categoryId: 'cat_gemelos', name: 'Gemelos clásicos', isActive: true },
    { id: 'sub_ge_con_piedra', categoryId: 'cat_gemelos', name: 'Gemelos con piedra', isActive: true },
    { id: 'sub_ge_personalizado', categoryId: 'cat_gemelos', name: 'Gemelos personalizados', isActive: true },
    { id: 'sub_ge_infantil', categoryId: 'cat_gemelos', name: 'Gemelos infantiles', isActive: true },
    { id: 'sub_bc_clasico', categoryId: 'cat_broches', name: 'Broche clásico', isActive: true },
    { id: 'sub_bc_con_piedras', categoryId: 'cat_broches', name: 'Broche con piedras', isActive: true },
    { id: 'sub_bc_decorativo', categoryId: 'cat_broches', name: 'Broche decorativo', isActive: true },
    { id: 'sub_bc_funcional', categoryId: 'cat_broches', name: 'Broche funcional', isActive: true },
    { id: 'sub_re_pulsera', categoryId: 'cat_relojes', name: 'Reloj de pulsera', isActive: true },
    { id: 'sub_re_clasico', categoryId: 'cat_relojes', name: 'Reloj clásico', isActive: true },
    { id: 'sub_re_deportivo', categoryId: 'cat_relojes', name: 'Reloj deportivo', isActive: true },
    { id: 'sub_re_joya', categoryId: 'cat_relojes', name: 'Reloj joya', isActive: true },
    { id: 'sub_cj_anillo_pendientes', categoryId: 'cat_conjuntos', name: 'Conjunto anillo + pendientes', isActive: true },
    { id: 'sub_cj_collar_pendientes', categoryId: 'cat_conjuntos', name: 'Conjunto collar + pendientes', isActive: true },
    { id: 'sub_cj_pulsera_collar', categoryId: 'cat_conjuntos', name: 'Conjunto pulsera + collar', isActive: true },
    { id: 'sub_cj_completo', categoryId: 'cat_conjuntos', name: 'Conjunto completo', isActive: true },
    { id: 'sub_ot_personalizada', categoryId: 'cat_otros', name: 'Pieza personalizada', isActive: true },
    { id: 'sub_ot_unica', categoryId: 'cat_otros', name: 'Pieza única', isActive: true },
    { id: 'sub_ot_prototipo', categoryId: 'cat_otros', name: 'Prototipo / muestra', isActive: true },
    { id: 'sub_ot_historica', categoryId: 'cat_otros', name: 'Pieza histórica / especial', isActive: true }
];

async function populate() {
    try {
        await signInAnonymously(auth);
        console.log("Logged in anonymously");

        console.log("Upserting Categories...");
        for (const cat of categories) {
            await setDoc(doc(db, "categories", cat.id), {
                ...cat,
                createdBy: 'system',
                createdAt: serverTimestamp()
            }, { merge: true });
            console.log(` - Updated Category: ${cat.name} (${cat.id})`);
        }

        console.log("Upserting Subcategories...");
        for (const sub of subcategories) {
            await setDoc(doc(db, "subcategories", sub.id), {
                ...sub,
                createdBy: 'system',
                createdAt: serverTimestamp()
            }, { merge: true });
            console.log(` - Updated Subcategory: ${sub.name} (${sub.id})`);
        }

        console.log("\nPopulation Complete!");
        process.exit(0);

    } catch (error) {
        console.error("Error during population:", error);
        process.exit(1);
    }
}

populate();
