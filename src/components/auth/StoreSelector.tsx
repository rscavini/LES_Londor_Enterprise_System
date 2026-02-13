import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Store, ChevronRight, LogOut } from 'lucide-react';

export const StoreSelector: React.FC = () => {
    const { profile, setActiveStoreId, signOut } = useAuth();

    if (!profile) return null;

    return (
        <div className="store-selector-container" style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: '20px'
        }}>
            <div className="glass-card" style={{
                width: '100%',
                maxWidth: '500px',
                padding: '40px',
                textAlign: 'center'
            }}>
                <div style={{ marginBottom: '30px' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        backgroundColor: 'var(--accent-light)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        color: 'var(--accent)'
                    }}>
                        <Store size={30} />
                    </div>
                    <h2 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', marginBottom: '8px' }}>
                        Selecciona tu Tienda
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        Hola, {profile.displayName}. Elige la sede para operar en esta sesión.
                    </p>
                </div>

                <div style={{ display: 'grid', gap: '12px' }}>
                    {profile.storeIds.map((storeId) => (
                        <button
                            key={storeId}
                            onClick={() => setActiveStoreId(storeId)}
                            className="btn btn-glass"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '16px 20px',
                                background: 'white',
                                border: '1px solid rgba(0,0,0,0.05)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'left'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = 'var(--accent)';
                                e.currentTarget.style.transform = 'translateX(4px)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--primary)'
                                }}>
                                    <Store size={18} />
                                </div>
                                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                                    {storeId}
                                </span>
                            </div>
                            <ChevronRight size={18} color="var(--text-muted)" />
                        </button>
                    ))}
                </div>

                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <button
                        onClick={() => signOut()}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--error)',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            margin: '0 auto'
                        }}
                    >
                        <LogOut size={16} />
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
};
