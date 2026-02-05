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

const initialDomains = [
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
    { id: 'dom_color_diamante', code: 'COLOR_DIAMANTE', name: 'Color de Diamante (GIA)', type: 'CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_corte_diamante', code: 'CORTE_DIAMANTE', name: 'Calidad de Corte', type: 'CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_iva', code: 'IVA', name: 'IVA Aplicable', type: 'CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_linea', code: 'COMMERCIAL_LINE', name: 'Línea Comercial', type: 'CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_coleccion', code: 'COLLECTION', name: 'Colección', type: 'SEMI_CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_perfil_cli', code: 'CUSTOMER_PROFILE', name: 'Perfil de Cliente', type: 'SEMI_CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_simbol', code: 'SYMBOLOGY', name: 'Simbología', type: 'SEMI_CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dom_ocasion', code: 'OCCASION', name: 'Ocasión / Motivo', type: 'SEMI_CLOSED', isActive: true, createdAt: new Date(), createdBy: 'system' }
];

const initialValues = [
    // Origen
    { id: 'dv_og_new', domainId: 'dom_origen', value: 'Nueva', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_og_re', domainId: 'dom_origen', value: 'Recompra', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // Color de la Piedra
    { id: 'dv_cp_bla', domainId: 'dom_color_piedra', value: 'Blanco (Incoloro)', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_cp_azu', domainId: 'dom_color_piedra', value: 'Azul', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_cp_roj', domainId: 'dom_color_piedra', value: 'Rojo', sortOrder: 3, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_cp_ver', domainId: 'dom_color_piedra', value: 'Verde', sortOrder: 4, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_cp_ros', domainId: 'dom_color_piedra', value: 'Rosa', sortOrder: 5, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_cp_ama', domainId: 'dom_color_piedra', value: 'Amarillo', sortOrder: 6, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_cp_neg', domainId: 'dom_color_piedra', value: 'Negro', sortOrder: 7, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_cp_cha', domainId: 'dom_color_piedra', value: 'Champagne', sortOrder: 8, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_cp_vio', domainId: 'dom_color_piedra', value: 'Violeta', sortOrder: 9, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_cp_mul', domainId: 'dom_color_piedra', value: 'Multicolor', sortOrder: 10, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // Forma de la Piedra
    { id: 'dv_fp_bri', domainId: 'dom_forma_piedra', value: 'Brillante (Redonda)', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_fp_pri', domainId: 'dom_forma_piedra', value: 'Princesa (Cuadrada)', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_fp_esm', domainId: 'dom_forma_piedra', value: 'Esmeralda', sortOrder: 3, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_fp_per', domainId: 'dom_forma_piedra', value: 'Pera', sortOrder: 4, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_fp_ova', domainId: 'dom_forma_piedra', value: 'Oval', sortOrder: 5, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_fp_mar', domainId: 'dom_forma_piedra', value: 'Marquise', sortOrder: 6, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_fp_coj', domainId: 'dom_forma_piedra', value: 'Cojín (Cushion)', sortOrder: 7, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_fp_cor', domainId: 'dom_forma_piedra', value: 'Corazón', sortOrder: 8, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_fp_bag', domainId: 'dom_forma_piedra', value: 'Baguette', sortOrder: 9, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_fp_tri', domainId: 'dom_forma_piedra', value: 'Trillón', sortOrder: 10, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // Tipo de Piedra
    { id: 'dv_tp_dia', domainId: 'dom_tipo_piedra', value: 'Diamante', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_tp_cir', domainId: 'dom_tipo_piedra', value: 'Circonita (CZ)', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_tp_zaf', domainId: 'dom_tipo_piedra', value: 'Zafiro', sortOrder: 3, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_tp_rub', domainId: 'dom_tipo_piedra', value: 'Rubí', sortOrder: 4, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_tp_esm', domainId: 'dom_tipo_piedra', value: 'Esmeralda', sortOrder: 5, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_tp_ama', domainId: 'dom_tipo_piedra', value: 'Amatista', sortOrder: 6, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_tp_top', domainId: 'dom_tipo_piedra', value: 'Topacio', sortOrder: 7, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_tp_per', domainId: 'dom_tipo_piedra', value: 'Perla', sortOrder: 8, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_tp_agu', domainId: 'dom_tipo_piedra', value: 'Aguamarina', sortOrder: 9, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_tp_tur', domainId: 'dom_tipo_piedra', value: 'Turmalina', sortOrder: 10, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_tp_sin', domainId: 'dom_tipo_piedra', value: 'Sin Piedra', sortOrder: 11, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // Material Principal
    { id: 'dv_mat_oro', domainId: 'dom_material', value: 'Oro', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_mat_plata', domainId: 'dom_material', value: 'Plata', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_mat_pla', domainId: 'dom_material', value: 'Platino', sortOrder: 3, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_mat_ace', domainId: 'dom_material', value: 'Acero Inoxidable', sortOrder: 4, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_mat_tit', domainId: 'dom_material', value: 'Titanio', sortOrder: 5, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // Ley / Quilataje
    { id: 'dv_ley_24k', domainId: 'dom_ley', value: '24k (999)', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_ley_22k', domainId: 'dom_ley', value: '22k (916)', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_ley_18k', domainId: 'dom_ley', value: '18k (750)', sortOrder: 3, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_ley_14k', domainId: 'dom_ley', value: '14k (585)', sortOrder: 4, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_ley_9k', domainId: 'dom_ley', value: '9k (375)', sortOrder: 5, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_ley_925', domainId: 'dom_ley', value: '925 (Sterling)', sortOrder: 6, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_ley_950', domainId: 'dom_ley', value: '950', sortOrder: 7, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // Color del Metal
    { id: 'dv_col_ama', domainId: 'dom_color_metal', value: 'Amarillo', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_col_bla', domainId: 'dom_color_metal', value: 'Blanco', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_col_ros', domainId: 'dom_color_metal', value: 'Rosa', sortOrder: 3, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_col_bic', domainId: 'dom_color_metal', value: 'Bicolor', sortOrder: 4, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_col_tri', domainId: 'dom_color_metal', value: 'Tricolor', sortOrder: 5, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // Acabado del Metal
    { id: 'dv_ac_pul', domainId: 'dom_acabado', value: 'Pulido (Brillo)', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_ac_mat', domainId: 'dom_acabado', value: 'Mate (Satinado)', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_ac_dia', domainId: 'dom_acabado', value: 'Diamantado', sortOrder: 3, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_ac_are', domainId: 'dom_acabado', value: 'Arenado', sortOrder: 4, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_ac_mar', domainId: 'dom_acabado', value: 'Martillado', sortOrder: 5, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_ac_env', domainId: 'dom_acabado', value: 'Envejecido (Oxidado)', sortOrder: 6, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // Tipo de Engaste
    { id: 'dv_en_gar', domainId: 'dom_engaste', value: 'Garras (Prongs)', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_en_bis', domainId: 'dom_engaste', value: 'Bisel (Bezel)', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_en_pav', domainId: 'dom_engaste', value: 'Pavé', sortOrder: 3, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_en_car', domainId: 'dom_engaste', value: 'Carril (Channel)', sortOrder: 4, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_en_gra', domainId: 'dom_engaste', value: 'Grano', sortOrder: 5, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_en_ten', domainId: 'dom_engaste', value: 'Tensión', sortOrder: 6, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // IVA
    { id: 'dv_iva_21', domainId: 'dom_iva', value: '21%', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_iva_0', domainId: 'dom_iva', value: '0%', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_iva_4', domainId: 'dom_iva', value: '4%', sortOrder: 3, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // Comerciales
    { id: 'dv_line_nup', domainId: 'dom_linea', value: 'Nupcial', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_line_juv', domainId: 'dom_linea', value: 'Juvenil', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_line_alt', domainId: 'dom_linea', value: 'Alta Joyería', sortOrder: 3, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_line_dai', domainId: 'dom_linea', value: 'Daily Wear', sortOrder: 4, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },

    { id: 'dv_sim_amo', domainId: 'dom_simbol', value: 'Amor', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_sim_inf', domainId: 'dom_simbol', value: 'Infinito', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_sim_pro', domainId: 'dom_simbol', value: 'Protección', sortOrder: 3, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_sim_exe', domainId: 'dom_simbol', value: 'Exito', sortOrder: 4, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_sim_vin', domainId: 'dom_simbol', value: 'Vinculo', sortOrder: 5, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_sim_fam', domainId: 'dom_simbol', value: 'Familia', sortOrder: 6, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_sim_flu', domainId: 'dom_simbol', value: 'Fluidez', sortOrder: 7, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_sim_ide', domainId: 'dom_simbol', value: 'Identidad', sortOrder: 8, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },

    { id: 'dv_occ_com', domainId: 'dom_ocasion', value: 'Compromiso', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_occ_ani', domainId: 'dom_ocasion', value: 'Aniversario', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_occ_15a', domainId: 'dom_ocasion', value: '15 Años', sortOrder: 3, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_occ_gra', domainId: 'dom_ocasion', value: 'Graduación', sortOrder: 4, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_occ_nac', domainId: 'dom_ocasion', value: 'Nacimiento', sortOrder: 5, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_occ_val', domainId: 'dom_ocasion', value: 'San Valentín', sortOrder: 6, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_occ_sjo', domainId: 'dom_ocasion', value: 'Sant Jordi', sortOrder: 7, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_occ_rey', domainId: 'dom_ocasion', value: 'Reyes', sortOrder: 8, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_occ_nav', domainId: 'dom_ocasion', value: 'Navidad', sortOrder: 9, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_occ_aut', domainId: 'dom_ocasion', value: 'Auto-regalo', sortOrder: 10, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },

    { id: 'dv_pro_rom', domainId: 'dom_perfil_cli', value: 'Romántico', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_pro_min', domainId: 'dom_perfil_cli', value: 'Minimalista', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_pro_cla', domainId: 'dom_perfil_cli', value: 'Clásico', sortOrder: 3, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_pro_tre', domainId: 'dom_perfil_cli', value: 'Trendsetter', sortOrder: 4, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_occ_aut', domainId: 'dom_ocasion', value: 'Auto-regalo', sortOrder: 10, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },

    { id: 'dv_pro_rom', domainId: 'dom_perfil_cli', value: 'Romántico', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_pro_min', domainId: 'dom_perfil_cli', value: 'Minimalista', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_pro_cla', domainId: 'dom_perfil_cli', value: 'Clásico', sortOrder: 3, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_pro_tre', domainId: 'dom_perfil_cli', value: 'Trendsetter', sortOrder: 4, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_pro_det', domainId: 'dom_perfil_cli', value: 'Detallista', sortOrder: 5, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_pro_inv', domainId: 'dom_perfil_cli', value: 'Inversionista', sortOrder: 6, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // Pureza / Claridad
    { id: 'dv_pu_fl', domainId: 'dom_pureza', value: 'FL', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_pu_if', domainId: 'dom_pureza', value: 'IF', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_pu_vvs1', domainId: 'dom_pureza', value: 'VVS1', sortOrder: 3, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_pu_vvs2', domainId: 'dom_pureza', value: 'VVS2', sortOrder: 4, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_pu_vs1', domainId: 'dom_pureza', value: 'VS1', sortOrder: 5, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_pu_vs2', domainId: 'dom_pureza', value: 'VS2', sortOrder: 6, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_pu_si1', domainId: 'dom_pureza', value: 'SI1', sortOrder: 7, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_pu_si2', domainId: 'dom_pureza', value: 'SI2', sortOrder: 8, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_pu_i1', domainId: 'dom_pureza', value: 'I1', sortOrder: 9, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_pu_i2', domainId: 'dom_pureza', value: 'I2', sortOrder: 10, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_pu_i3', domainId: 'dom_pureza', value: 'I3', sortOrder: 11, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_pu_aaa', domainId: 'dom_pureza', value: 'AAA', sortOrder: 12, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_pu_aa', domainId: 'dom_pureza', value: 'AA', sortOrder: 13, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_pu_na', domainId: 'dom_pureza', value: 'N/A', sortOrder: 14, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // Color de Diamante (Escala GIA)
    { id: 'dv_cd_d', domainId: 'dom_color_diamante', value: 'D', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_cd_e', domainId: 'dom_color_diamante', value: 'E', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_cd_f', domainId: 'dom_color_diamante', value: 'F', sortOrder: 3, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_cd_g', domainId: 'dom_color_diamante', value: 'G', sortOrder: 4, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_cd_h', domainId: 'dom_color_diamante', value: 'H', sortOrder: 5, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_cd_i', domainId: 'dom_color_diamante', value: 'I', sortOrder: 6, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_cd_j', domainId: 'dom_color_diamante', value: 'J', sortOrder: 7, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_cd_k', domainId: 'dom_color_diamante', value: 'K', sortOrder: 8, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_cd_l', domainId: 'dom_color_diamante', value: 'L', sortOrder: 9, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_cd_m', domainId: 'dom_color_diamante', value: 'M', sortOrder: 10, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_cd_nr', domainId: 'dom_color_diamante', value: 'N-R', sortOrder: 11, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_cd_sz', domainId: 'dom_color_diamante', value: 'S-Z', sortOrder: 12, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_cd_fc', domainId: 'dom_color_diamante', value: 'Fancy Color', sortOrder: 13, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_cd_na', domainId: 'dom_color_diamante', value: 'N/A', sortOrder: 14, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },

    // Calidad de Corte
    { id: 'dv_ct_ex', domainId: 'dom_corte_diamante', value: 'Excellent (EX)', sortOrder: 1, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_ct_vg', domainId: 'dom_corte_diamante', value: 'Very Good (VG)', sortOrder: 2, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_ct_g', domainId: 'dom_corte_diamante', value: 'Good (G)', sortOrder: 3, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_ct_f', domainId: 'dom_corte_diamante', value: 'Fair (F)', sortOrder: 4, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_ct_p', domainId: 'dom_corte_diamante', value: 'Poor (P)', sortOrder: 5, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'dv_ct_na', domainId: 'dom_corte_diamante', value: 'N/A', sortOrder: 6, source: 'NORMATIVE', isActive: true, createdAt: new Date(), createdBy: 'system' }
];

const initialAttributes = [
    { id: 'attr_mat_pri', name: 'Material Principal', description: 'Metal base de la pieza', dataType: 'LIST', domainId: 'dom_material', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_ley', name: 'Ley / Quilataje', description: 'Pureza del metal precioso', dataType: 'LIST', domainId: 'dom_ley', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_col_met', name: 'Color del Metal', description: 'Tonalidad del metal', dataType: 'LIST', domainId: 'dom_color_metal', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_acabado', name: 'Acabado del Metal', description: 'Tratamiento superficial del metal', dataType: 'LIST', domainId: 'dom_acabado', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_engaste', name: 'Tipo de Engaste', description: 'Método de sujeción de piedras', dataType: 'LIST', domainId: 'dom_engaste', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_tip_pie', name: 'Tipo de Piedra', description: 'Gema o piedra principal', dataType: 'LIST', domainId: 'dom_tipo_piedra', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_col_pie', name: 'Color de la Piedra', description: 'Tonalidad de la gema', dataType: 'LIST', domainId: 'dom_color_piedra', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_for_pie', name: 'Forma de la Piedra', description: 'Corte o talla de la gema', dataType: 'LIST', domainId: 'dom_forma_piedra', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_pureza', name: 'Pureza / Claridad', description: 'Transparencia y limpieza de la gema', dataType: 'LIST', domainId: 'dom_pureza', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_col_dia', name: 'Color de Diamante (GIA)', description: 'Ausencia de color en diamantes incoloros', dataType: 'LIST', domainId: 'dom_color_diamante', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_cort_dia', name: 'Calidad de Corte', description: 'Determinante del brillo y fuego del diamante', dataType: 'LIST', domainId: 'dom_corte_diamante', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_pes_gem', name: 'Peso de la Gema (ct)', description: 'Peso del diamante o piedra en Quilates', dataType: 'NUMBER', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_tal', name: 'Talla', description: 'Tamaño de la pieza', dataType: 'NUMBER', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_lon', name: 'Longitud (mm)', description: 'Largo de cadena o pulsera', dataType: 'NUMBER', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_pes_met', name: 'Peso del Metal (gr)', description: 'Peso neto del metal', dataType: 'NUMBER', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_anc_ban', name: 'Ancho de la Banda (mm)', description: 'Grosor del anillo', dataType: 'NUMBER', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_gra_per', name: 'Grabado Personalizado', description: 'Si la pieza permite grabado', dataType: 'BOOLEAN', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_tex_gra', name: 'Texto del Grabado', description: 'Contenido a grabar', dataType: 'TEXT', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_cer_aut', name: 'Certificado de Autenticidad', description: 'Si incluye certificado', dataType: 'BOOLEAN', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_iva', name: 'IVA Aplicable', description: 'Régimen fiscal', dataType: 'LIST', domainId: 'dom_iva', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_linea', name: 'Línea Comercial', description: 'Segmento comercial', dataType: 'LIST', domainId: 'dom_linea', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_colec', name: 'Colección', description: 'Colección de diseño', dataType: 'TEXT', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_simbol', name: 'Simbología', description: 'Significado de la pieza', dataType: 'LIST', domainId: 'dom_simbol', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_ocasion', name: 'Ocasión / Motivo', description: 'Uso recomendado', dataType: 'LIST', domainId: 'dom_ocasion', isActive: true, createdAt: new Date(), createdBy: 'system' },
    { id: 'attr_perfil', name: 'Perfil de Cliente', description: 'Target psicográfico', dataType: 'LIST', domainId: 'dom_perfil_cli', isActive: true, createdAt: new Date(), createdBy: 'system' }
];

const initialMappings = [
    // Mapeo genérico para Anillos (cat_anillos)
    { id: 'map_an_mat', categoryId: 'cat_anillos', attributeId: 'attr_mat_pri', isMandatory: true, sortOrder: 1 },
    { id: 'map_an_ley', categoryId: 'cat_anillos', attributeId: 'attr_ley', isMandatory: true, sortOrder: 2 },
    { id: 'map_an_col', categoryId: 'cat_anillos', attributeId: 'attr_col_met', isMandatory: true, sortOrder: 3 },
    { id: 'map_an_tal', categoryId: 'cat_anillos', attributeId: 'attr_tal', isMandatory: false, sortOrder: 4 },
    { id: 'map_an_tip_p', categoryId: 'cat_anillos', attributeId: 'attr_tip_pie', isMandatory: true, sortOrder: 5 },
    { id: 'map_an_col_p', categoryId: 'cat_anillos', attributeId: 'attr_col_pie', isMandatory: false, sortOrder: 6 },
    { id: 'map_an_for_p', categoryId: 'cat_anillos', attributeId: 'attr_for_pie', isMandatory: false, sortOrder: 7 },
    { id: 'map_an_pur_p', categoryId: 'cat_anillos', attributeId: 'attr_pureza', isMandatory: false, sortOrder: 8 },
    { id: 'map_an_cdi_p', categoryId: 'cat_anillos', attributeId: 'attr_col_dia', isMandatory: false, sortOrder: 9 },
    { id: 'map_an_cor_p', categoryId: 'cat_anillos', attributeId: 'attr_cort_dia', isMandatory: false, sortOrder: 10 },
    { id: 'map_an_car_p', categoryId: 'cat_anillos', attributeId: 'attr_pes_gem', isMandatory: false, sortOrder: 11 },
    { id: 'map_an_eng', categoryId: 'cat_anillos', attributeId: 'attr_engaste', isMandatory: false, sortOrder: 12 },
    { id: 'map_an_gra', categoryId: 'cat_anillos', attributeId: 'attr_gra_per', isMandatory: false, sortOrder: 13 },
    { id: 'map_an_tgra', categoryId: 'cat_anillos', attributeId: 'attr_tex_gra', isMandatory: false, sortOrder: 14 },
    { id: 'map_an_cer', categoryId: 'cat_anillos', attributeId: 'attr_cer_aut', isMandatory: false, sortOrder: 15 },
    { id: 'map_an_iva', categoryId: 'cat_anillos', attributeId: 'attr_iva', isMandatory: true, sortOrder: 16 },

    // Mapeo genérico para Pendientes (cat_pendientes)
    { id: 'map_pe_mat', categoryId: 'cat_pendientes', attributeId: 'attr_mat_pri', isMandatory: true, sortOrder: 1 },
    { id: 'map_pe_ley', categoryId: 'cat_pendientes', attributeId: 'attr_ley', isMandatory: true, sortOrder: 2 },
    { id: 'map_pe_col', categoryId: 'cat_pendientes', attributeId: 'attr_col_met', isMandatory: true, sortOrder: 3 },
    { id: 'map_pe_tip_p', categoryId: 'cat_pendientes', attributeId: 'attr_tip_pie', isMandatory: true, sortOrder: 4 },
    { id: 'map_pe_col_p', categoryId: 'cat_pendientes', attributeId: 'attr_col_pie', isMandatory: false, sortOrder: 5 },
    { id: 'map_pe_pur_p', categoryId: 'cat_pendientes', attributeId: 'attr_pureza', isMandatory: false, sortOrder: 6 },
    { id: 'map_pe_cdi_p', categoryId: 'cat_pendientes', attributeId: 'attr_col_dia', isMandatory: false, sortOrder: 7 },
    { id: 'map_pe_eng', categoryId: 'cat_pendientes', attributeId: 'attr_engaste', isMandatory: false, sortOrder: 8 },
    { id: 'map_pe_iva', categoryId: 'cat_pendientes', attributeId: 'attr_iva', isMandatory: true, sortOrder: 9 }
];

async function seed() {
    try {
        await signInAnonymously(auth);
        console.log("Autenticado");

        // 1. Seed Domains
        console.log("Sembrando Dominios...");
        for (const dom of initialDomains) {
            await setDoc(doc(db, 'domains', dom.id), { ...dom, createdAt: serverTimestamp() });
        }

        // 2. Seed Domain Values
        console.log("Sembrando Valores de Dominio...");
        for (const val of initialValues) {
            await setDoc(doc(db, 'domain_values', val.id), { ...val, createdAt: serverTimestamp() });
        }

        // 3. Seed Attributes
        console.log("Sembrando Atributos...");
        for (const attr of initialAttributes) {
            await setDoc(doc(db, 'attributes', attr.id), { ...attr, createdAt: serverTimestamp() });
        }

        // 4. Seed Mappings
        console.log("Sembrando Mapeos de Clasificación...");
        for (const map of initialMappings) {
            await setDoc(doc(db, 'classification_mappings', map.id), { ...map, createdAt: serverTimestamp() });
        }

        console.log("¡Siembra completada con éxito!");
        process.exit(0);
    } catch (error) {
        console.error("Error en la siembra:", error);
        process.exit(1);
    }
}

seed();
