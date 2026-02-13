import admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin locally (requires GOOGLE_APPLICATION_CREDENTIALS)
// or just trust default if already logged in via gcloud
admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID
});

const auth = admin.auth();
const db = admin.firestore();

const initializeAdmins = async () => {
    const admins = [
        { email: 'catalina@londor.es', displayName: 'Catalina' },
        { email: 'paola@londor.es', displayName: 'Paola' }
    ];

    for (const adminData of admins) {
        try {
            console.log(`Buscando/Creando admin: ${adminData.email}...`);
            let user;
            try {
                user = await auth.getUserByEmail(adminData.email);
                console.log(`Usuario encontrado: ${user.uid}`);
            } catch (e) {
                user = await auth.createUser({
                    email: adminData.email,
                    displayName: adminData.displayName,
                    password: 'TemporaryPassword123!', // They should change this
                });
                console.log(`Usuario creado: ${user.uid}`);
            }

            await auth.setCustomUserClaims(user.uid, { role: 'ADMIN' });
            console.log(`Claims ADMIN asignados a ${user.uid}`);

            await db.collection('users').doc(user.uid).set({
                uid: user.uid,
                email: adminData.email,
                displayName: adminData.displayName,
                roleId: 'ADMIN',
                storeIds: [],
                status: 'ACTIVE',
                createdAt: new Date().toISOString()
            }, { merge: true });

            console.log(`Perfil de Firestore actualizado para ${user.uid}`);
        } catch (error) {
            console.error(`Error procesando ${adminData.email}:`, error);
        }
    }
};

initializeAdmins().then(() => {
    console.log('Proceso de inicialización terminado.');
    process.exit();
}).catch(err => {
    console.error('Fallo crítico:', err);
    process.exit(1);
});
