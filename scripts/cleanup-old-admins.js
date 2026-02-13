import admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin
admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID
});

const auth = admin.auth();
const db = admin.firestore();

const emailsToDelete = [
    'catalina@londor.com',
    'paola@londor.com'
];

const cleanup = async () => {
    for (const email of emailsToDelete) {
        try {
            console.log(`Buscando usuario para eliminar: ${email}...`);
            const user = await auth.getUserByEmail(email);

            // Delete from Auth
            await auth.deleteUser(user.uid);
            console.log(`[Auth] Usuario ${email} (UID: ${user.uid}) eliminado.`);

            // Delete from Firestore
            await db.collection('users').doc(user.uid).delete();
            console.log(`[Firestore] Perfil ${user.uid} eliminado.`);

        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                console.log(`El usuario ${email} ya no existe en Firebase Auth.`);
            } else {
                console.error(`Error eliminando ${email}:`, error);
            }
        }
    }
};

cleanup().then(() => {
    console.log('Limpieza completada.');
    process.exit(0);
}).catch(err => {
    console.error('Fallo en la limpieza:', err);
    process.exit(1);
});
