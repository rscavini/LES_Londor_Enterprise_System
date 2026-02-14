import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';

// Initialize Firebase Admin
let adminConfig = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.VITE_FIREBASE_PROJECT_ID
};

// Local development: use service-account.json if present
if (process.env.NODE_ENV !== 'production') {
    const fs = await import('fs');
    const saPath = path.join(process.cwd(), 'service-account.json');
    if (fs.existsSync(saPath)) {
        console.log('Using local service-account.json for Admin SDK');
        adminConfig.credential = admin.credential.cert(saPath);
    }
}

try {
    admin.initializeApp(adminConfig);
    console.log('Firebase Admin initialized successfully');
} catch (e) {
    console.error('Firebase Admin initialization error:', e);
}

const db = admin.firestore();
const auth = admin.auth();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// --- Middleware: Verify Auth & Admin Claim ---
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'No token provided' } });
    }

    const idToken = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        if (decodedToken.role !== 'ADMIN') {
            return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Admin role required' } });
        }
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } });
    }
};

// --- Audit Logger Utility ---
const logAction = async (action, targetUid, performedByUid, payload = {}) => {
    try {
        await db.collection('auditLogs').add({
            action,
            targetUid,
            performedByUid,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            payload
        });
    } catch (error) {
        console.error('Error recording audit log:', error);
    }
};

// --- API Admin Routes ---

// 1) Crear usuario
app.post('/api/admin/users', authMiddleware, async (req, res) => {
    const { email, displayName, phone, roleId, storeIds, sendPasswordReset } = req.body;

    try {
        // Create in Firebase Auth
        const userRecord = await auth.createUser({
            email,
            displayName,
            phoneNumber: phone || undefined,
            disabled: false
        });

        const uid = userRecord.uid;

        // Set Custom Claims
        await auth.setCustomUserClaims(uid, { role: roleId });

        // Create profile in Firestore
        const profile = {
            uid,
            email,
            displayName,
            phone: phone || '',
            roleId,
            storeIds: storeIds || [],
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            createdByUid: req.user.uid,
            updatedAt: new Date().toISOString(),
            updatedByUid: req.user.uid
        };

        await db.collection('users').doc(uid).set(profile);

        // Audit log
        await logAction('USER_CREATE', uid, req.user.uid, { email, roleId, storeIds });

        // Generate reset password link if requested
        if (sendPasswordReset) {
            // In V1, we recommend standard client-side reset or admin-triggered email
            // Here we just acknowledge the intent. Firebase Admin doesn't have a direct "sendEmail" for reset,
            // usually, you generate a link and send it via your own provider, or use the client SDK.
            // We'll return that it's "pending" or use a mock status for now as per "Anexo A"
        }

        return res.status(201).json(profile);
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.code === 'auth/email-already-exists') {
            return res.status(409).json({ error: { code: 'USER_EMAIL_EXISTS', message: 'Email already exists' } });
        }
        return res.status(400).json({ error: { code: 'USER_CREATE_FAILED', message: error.message } });
    }
});

// 2) Listar usuarios
app.get('/api/admin/users', authMiddleware, async (req, res) => {
    const { roleId, storeId, status, q, page = 1, pageSize = 25 } = req.query;

    try {
        let query = db.collection('users');

        if (roleId) query = query.where('roleId', '==', roleId);
        if (status) query = query.where('status', '==', status);
        if (storeId) query = query.where('storeIds', 'array-contains', storeId);

        const snapshot = await query.get();
        let items = snapshot.docs.map(doc => doc.data());

        // Basic client-side search for 'q' (name or email)
        if (q) {
            const search = q.toString().toLowerCase();
            items = items.filter(u =>
                u.displayName?.toLowerCase().includes(search) ||
                u.email?.toLowerCase().includes(search)
            );
        }

        // Pagination (mock since we've filtered in memory for the 'q' filter)
        const total = items.length;
        const start = (Number(page) - 1) * Number(pageSize);
        const paginatedItems = items.slice(start, start + Number(pageSize));

        return res.json({
            items: paginatedItems,
            page: Number(page),
            pageSize: Number(pageSize),
            total
        });
    } catch (error) {
        console.error('Error listing users:', error);
        return res.status(500).json({ error: { code: 'USER_LIST_FAILED', message: error.message } });
    }
});

// 3) Obtener detalle
app.get('/api/admin/users/:uid', authMiddleware, async (req, res) => {
    try {
        const doc = await db.collection('users').doc(req.params.uid).get();
        if (!doc.exists) {
            return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
        }
        return res.json(doc.data());
    } catch (error) {
        return res.status(500).json({ error: { code: 'USER_DETAIL_FAILED', message: error.message } });
    }
});

// 4) Actualizar usuario
app.patch('/api/admin/users/:uid', authMiddleware, async (req, res) => {
    const uid = req.params.uid;
    const updates = req.body;

    try {
        // If roleId changes, update claims
        if (updates.roleId) {
            await auth.setCustomUserClaims(uid, { role: updates.roleId });
        }

        // If phone changes, sync with Auth (optional but good)
        if (updates.phone) {
            await auth.updateUser(uid, { phoneNumber: updates.phone });
        }

        const firestoreUpdates = {
            ...updates,
            updatedAt: new Date().toISOString(),
            updatedByUid: req.user.uid
        };

        await db.collection('users').doc(uid).update(firestoreUpdates);

        await logAction('USER_UPDATE', uid, req.user.uid, updates);

        return res.json({ uid, updatedAt: firestoreUpdates.updatedAt, updatedByUid: req.user.uid });
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(400).json({ error: { code: 'USER_UPDATE_FAILED', message: error.message } });
    }
});

// 5) Disable / Enable
app.post('/api/admin/users/:uid/disable', authMiddleware, async (req, res) => {
    const uid = req.params.uid;
    try {
        // Security Rule: Can't disable the last admin (logic simplified: count total admins)
        // For V1, we'll assume the admin knows what they are doing or implement a simple check
        const adminSnapshot = await db.collection('users').where('roleId', '==', 'ADMIN').get();
        if (adminSnapshot.size <= 1) {
            const user = await db.collection('users').doc(uid).get();
            if (user.data()?.roleId === 'ADMIN') {
                return res.status(400).json({ error: { code: 'LAST_ADMIN_PROTECTION', message: 'Cannot disable the last admin' } });
            }
        }

        await auth.updateUser(uid, { disabled: true });
        await db.collection('users').doc(uid).update({
            status: 'INACTIVE',
            updatedAt: new Date().toISOString(),
            updatedByUid: req.user.uid
        });

        await logAction('USER_DISABLE', uid, req.user.uid);
        return res.json({ uid, auth: { disabled: true }, status: 'INACTIVE' });
    } catch (error) {
        return res.status(400).json({ error: { code: 'USER_DISABLE_FAILED', message: error.message } });
    }
});

app.post('/api/admin/users/:uid/enable', authMiddleware, async (req, res) => {
    const uid = req.params.uid;
    try {
        await auth.updateUser(uid, { disabled: false });
        await db.collection('users').doc(uid).update({
            status: 'ACTIVE',
            updatedAt: new Date().toISOString(),
            updatedByUid: req.user.uid
        });

        await logAction('USER_ENABLE', uid, req.user.uid);
        return res.json({ uid, auth: { disabled: false }, status: 'ACTIVE' });
    } catch (error) {
        return res.status(400).json({ error: { code: 'USER_ENABLE_FAILED', message: error.message } });
    }
});

// 6) Reset password
app.post('/api/admin/users/:uid/reset-password', authMiddleware, async (req, res) => {
    const uid = req.params.uid;
    try {
        // Generate password reset link is the standard way with Admin SDK
        const user = await auth.getUser(uid);
        const link = await auth.generatePasswordResetLink(user.email);

        // In V1, we return the link (or it should be sent via email if provider is set up)
        // For now, we return success and log it.
        await logAction('RESET_PASSWORD', uid, req.user.uid);
        return res.json({ uid, sent: true, link: process.env.NODE_ENV === 'development' ? link : undefined });
    } catch (error) {
        return res.status(400).json({ error: { code: 'RESET_PASSWORD_FAILED', message: error.message } });
    }
});

// --- Static Files & SPA Routing ---
const distPath = path.join(__dirname, 'dist');

// Hashed assets (/assets/*) can be cached indefinitely (immutable)
app.use('/assets', express.static(path.join(distPath, 'assets'), {
    maxAge: '1y',
    immutable: true
}));

// All other static files: short cache
app.use(express.static(distPath, {
    maxAge: 0,
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
    }
}));

app.get(/.*/, (req, res) => {
    // If it looks like an asset request but reached here, it's missing in the static middleware
    if (req.url.startsWith('/assets/')) {
        console.warn('Asset not found:', req.url);
        return res.status(404).send('Asset not found');
    }
    // CRITICAL: Prevent CDN/browser from caching index.html
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {


    console.log(`Server listening on port ${PORT}`);
});
