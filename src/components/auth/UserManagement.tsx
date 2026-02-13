import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    Users,
    UserPlus,
    Search,
    Filter,
    Edit2,
    ShieldAlert,
    UserX,
    UserCheck,
    Key,
    MoreVertical
} from 'lucide-react';

interface UserItem {
    uid: string;
    email: string;
    displayName: string;
    roleId: string;
    storeIds: string[];
    status: 'ACTIVE' | 'INACTIVE';
}

import { UserDetailModal } from './UserDetailModal';

export const UserManagement: React.FC = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = await user?.getIdToken();
            const response = await fetch('/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.items) setUsers(data.items);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (uid: string) => {
        if (!window.confirm('¿Estás seguro de que deseas enviar un correo de restablecimiento de contraseña a este usuario?')) return;

        try {
            const token = await user?.getIdToken();
            const response = await fetch(`/api/admin/users/${uid}/reset-password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert('Correo de restablecimiento enviado con éxito.');
            } else {
                const data = await response.json();
                alert('Error: ' + (data.error?.message || 'No se pudo enviar el correo.'));
            }
        } catch (error) {
            console.error("Error resetting password:", error);
            alert('Error técnico al procesar la solicitud.');
        }
    };

    const handleToggleStatus = async (uid: string, currentStatus: string) => {
        const action = currentStatus === 'ACTIVE' ? 'disable' : 'enable';
        const actionLabel = currentStatus === 'ACTIVE' ? 'desactivar' : 'activar';

        if (!window.confirm(`¿Estás seguro de que deseas ${actionLabel} este usuario?`)) return;

        try {
            const token = await user?.getIdToken();
            const response = await fetch(`/api/admin/users/${uid}/${action}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                fetchUsers();
            } else {
                const data = await response.json();
                alert('Error: ' + (data.error?.message || 'No se pudo cambiar el estado del usuario.'));
            }
        } catch (error) {
            console.error("Error toggling status:", error);
            alert('Error técnico al procesar la solicitud.');
        }
    };

    useEffect(() => {
        if (user) fetchUsers();
    }, [user]);

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter ? u.roleId === roleFilter : true;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="user-management-view">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Users color="var(--accent)" /> Gestión de Usuarios
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Control de acceso y roles del sistema</p>
                </div>
                <button
                    className="btn btn-accent"
                    onClick={() => { setSelectedUser(null); setShowModal(true); }}
                >
                    <UserPlus size={18} /> Nuevo Usuario
                </button>
            </div>

            <div className="glass-card" style={{ padding: '20px', marginBottom: '20px', display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        className="form-control"
                        style={{ paddingLeft: '40px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="form-control"
                    style={{ width: '200px' }}
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="">Todos los Roles</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="DEPENDIENTE">Dependiente</option>
                    <option value="REPARTIDOR">Repartidor</option>
                </select>
            </div>

            <div className="excel-container">
                <table className="excel-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Tiendas</th>
                            <th>Estado</th>
                            <th style={{ textAlign: 'center' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>Cargando usuarios...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>No se encontraron usuarios.</td></tr>
                        ) : filteredUsers.map(u => (
                            <tr key={u.uid}>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{u.displayName}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {u.uid.substring(0, 8)}...</div>
                                </td>
                                <td>{u.email}</td>
                                <td>
                                    <span className={`excel-badge ${u.roleId === 'ADMIN' ? 'excel-badge-warning' : 'excel-badge-primary'}`}>
                                        {u.roleId}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {u.storeIds.map(s => (
                                            <span key={s} style={{ fontSize: '10px', background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px' }}>{s}</span>
                                        ))}
                                    </div>
                                </td>
                                <td>
                                    <span style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        color: u.status === 'ACTIVE' ? 'var(--success)' : 'var(--error)',
                                        fontSize: '12px',
                                        fontWeight: 700
                                    }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                                        {u.status}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                        <button
                                            type="button"
                                            onClick={() => { setSelectedUser(u); setShowModal(true); }}
                                            title="Editar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleResetPassword(u.uid)}
                                            title="Reset Password" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                        >
                                            <Key size={16} />
                                        </button>
                                        {u.status === 'ACTIVE' ? (
                                            <button
                                                type="button"
                                                onClick={() => handleToggleStatus(u.uid, u.status)}
                                                title="Desactivar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)' }}
                                            >
                                                <UserX size={16} />
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleToggleStatus(u.uid, u.status)}
                                                title="Activar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--success)' }}
                                            >
                                                <UserCheck size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <UserDetailModal
                    user={selectedUser}
                    stores={[]}
                    onClose={() => setShowModal(false)}

                    onSave={() => {
                        setShowModal(false);
                        fetchUsers();
                    }}
                />
            )}
        </div>
    );
};
