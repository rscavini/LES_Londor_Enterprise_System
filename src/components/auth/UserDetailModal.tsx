import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X, Save, AlertCircle, Loader2 } from 'lucide-react';

interface UserDetailModalProps {
    user?: any | null;
    stores: any[];
    onClose: () => void;
    onSave: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, stores = [], onClose, onSave }) => {
    const { user: authUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: user?.email || '',
        displayName: user?.displayName || '',
        phone: user?.phone || '',
        roleId: user?.roleId || 'DEPENDIENTE',
        storeIds: user?.storeIds || [],
        sendPasswordReset: !user
    });

    const isEdit = !!user;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = await authUser?.getIdToken();
            const method = isEdit ? 'PATCH' : 'POST';
            const url = isEdit ? `/api/admin/users/${user.uid}` : '/api/admin/users';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Error al procesar la solicitud');
            }

            onSave();
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ocurrió un error inesperado');
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleStore = (storeId: string) => {
        setFormData(prev => ({
            ...prev,
            storeIds: prev.storeIds.includes(storeId)
                ? prev.storeIds.filter((id: string) => id !== storeId)
                : [...prev.storeIds, storeId]

        }));
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)'
        }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: 'white' }}>
                <div style={{ padding: '25px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>
                        {isEdit ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '25px' }}>
                    <div style={{ display: 'grid', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Nombre Completo</label>
                            <input
                                type="text" className="form-control" required
                                value={formData.displayName}
                                onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                                placeholder="P. ej. Ledis"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Email</label>
                            <input
                                type="email" className="form-control" required disabled={isEdit}
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="ledis@londor.com"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Teléfono (Opcional)</label>
                            <input
                                type="tel" className="form-control"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+34..."
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Rol</label>
                                <select
                                    className="form-control"
                                    value={formData.roleId}
                                    onChange={e => setFormData({ ...formData, roleId: e.target.value as any })}
                                >
                                    <option value="DEPENDIENTE">Dependiente</option>
                                    <option value="REPARTIDOR">Repartidor</option>
                                    <option value="ADMIN">Administrador</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Tiendas Asignadas</label>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {stores.map(store => (
                                    <button
                                        key={store.id} type="button"
                                        onClick={() => toggleStore(store.id)}
                                        style={{
                                            padding: '6px 12px', borderRadius: '20px', fontSize: '12px', border: '1px solid',
                                            cursor: 'pointer', transition: 'all 0.2s',
                                            backgroundColor: formData.storeIds.includes(store.id) ? 'var(--accent)' : 'white',
                                            color: formData.storeIds.includes(store.id) ? 'white' : 'var(--text-muted)',
                                            borderColor: formData.storeIds.includes(store.id) ? 'var(--accent)' : '#dee2e6'
                                        }}
                                    >
                                        {store.name}
                                    </button>
                                ))}
                                {stores.length === 0 && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No hay tiendas disponibles</span>}
                            </div>
                        </div>

                        {!isEdit && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="checkbox" id="sendReset"
                                    checked={formData.sendPasswordReset}
                                    onChange={e => setFormData({ ...formData, sendPasswordReset: e.target.checked })}
                                />
                                <label htmlFor="sendReset" style={{ fontSize: '13px' }}>Enviar email de bienvenida y reset de password</label>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div style={{
                            marginTop: '20px', padding: '12px', borderRadius: '8px',
                            backgroundColor: 'rgba(220, 53, 69, 0.1)', color: 'var(--error)',
                            display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px'
                        }}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div style={{ marginTop: '30px', display: 'flex', gap: '12px' }}>
                        <button type="button" onClick={onClose} className="btn" style={{ flex: 1, backgroundColor: '#f8f9fa', color: 'var(--text-muted)' }}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
                            {loading ? <Loader2 size={18} className="spinner" /> : <><Save size={18} /> {isEdit ? 'Guardar Cambios' : 'Crear Usuario'}</>}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`.spinner { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } } `}</style>
        </div>
    );
};
