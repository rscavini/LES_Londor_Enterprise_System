import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginView } from './components/auth/LoginView';
import { StoreSelector } from './components/auth/StoreSelector';
import { UserManagement } from './components/auth/UserManagement';
import CategoryManager from '@modules/inventario/src/components/CategoryManager';
import SubcategoryManager from '@modules/inventario/src/components/SubcategoryManager';
import DomainAttributeManager from '@modules/inventario/src/components/DomainAttributeManager';
import LocationStatusManager from '@modules/inventario/src/components/LocationStatusManager';
import InventoryManager from '@modules/inventario/src/components/InventoryManager';
import ClassificationControlTower from '@modules/inventario/src/components/ClassificationControlTower';
import CustomerManager from '@modules/inventario/src/components/CustomerManager';
import ReservationBandeja from '@modules/inventario/src/components/ReservationBandeja';
import SupplierManager from '@modules/inventario/src/components/SupplierManager';
import CajaManager from '@modules/caja/src/components/CajaManager';
import PurchaseModuleView from '@modules/caja/src/components/PurchaseModuleView';
import SequenceManager from './components/SequenceManager';
import { LogOut, User as UserIcon, Shield, Store } from 'lucide-react';

function AppContent() {
    const { user, profile, loading, activeStoreId, signOut } = useAuth();
    const [activeTab, setActiveTab] = useState<'inventory' | 'customers' | 'reservations' | 'suppliers' | 'caja' | 'purchases' | 'attributes' | 'logistics' | 'classification_config' | 'sequences' | 'admin_users'>('inventory');

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fdfdfd'
            }}>
                <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid var(--accent)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                    }} />
                    <h2 style={{ fontFamily: 'Outfit', margin: 0 }}>Sincronizando LES...</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Validando credenciales seguras</p>
                </div>
                <style>{`
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    if (!user) {
        return <LoginView />;
    }

    if (!profile) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
                    <Shield size={40} color="var(--error)" style={{ marginBottom: '15px' }} />
                    <h2 style={{ fontFamily: 'Outfit' }}>Acceso denegado</h2>
                    <p style={{ color: 'var(--text-muted)' }}>No tienes un perfil de usuario válido en el sistema.</p>
                    <button onClick={() => signOut()} className="btn btn-primary" style={{ marginTop: '20px' }}>Cerrar Sesión</button>
                </div>
            </div>
        );
    }

    if (!activeStoreId && profile.storeIds.length > 0) {
        return <StoreSelector />;
    }

    return (
        <div className="app-shell" style={{ minHeight: '100vh', backgroundColor: '#fdfdfd' }}>
            <nav style={{
                padding: '15px 0',
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                background: 'white',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <div className="container" style={{ padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                        <span style={{
                            fontFamily: 'Outfit',
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            color: 'var(--primary)',
                            letterSpacing: '1px'
                        }}>
                            LONDOR <span style={{ color: 'var(--accent)' }}>LES</span>
                        </span>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button onClick={() => setActiveTab('inventory')} className={`nav-link ${activeTab === 'inventory' ? 'active' : ''}`}>Inventario</button>
                            <button onClick={() => setActiveTab('customers')} className={`nav-link ${activeTab === 'customers' ? 'active' : ''}`}>Clientes</button>
                            <button onClick={() => setActiveTab('suppliers')} className={`nav-link ${activeTab === 'suppliers' ? 'active' : ''}`}>Proveedores</button>
                            <button onClick={() => setActiveTab('reservations')} className={`nav-link ${activeTab === 'reservations' ? 'active' : ''}`}>Apartados</button>
                            <button onClick={() => setActiveTab('caja')} className={`nav-link ${activeTab === 'caja' ? 'active' : ''}`}>Caja</button>
                            <button onClick={() => setActiveTab('purchases')} className={`nav-link ${activeTab === 'purchases' ? 'active' : ''}`}>Compras</button>

                            {profile.roleId === 'ADMIN' && (
                                <>
                                    <button onClick={() => setActiveTab('sequences')} className={`nav-link ${activeTab === 'sequences' ? 'active' : ''}`}>Numeradores</button>
                                    <button onClick={() => setActiveTab('classification_config')} className={`nav-link ${activeTab === 'classification_config' ? 'active' : ''}`}>Config. Clasificación</button>
                                    <button onClick={() => setActiveTab('attributes')} className={`nav-link ${activeTab === 'attributes' ? 'active' : ''}`}>Atributos</button>
                                    <button onClick={() => setActiveTab('admin_users')} className={`nav-link ${activeTab === 'admin_users' ? 'active' : ''}`}>Usuarios</button>
                                </>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ fontSize: '12px' }}>
                                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{profile.displayName}</div>
                                <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                                    <Store size={10} /> {activeStoreId || 'Sin Tienda'}
                                </div>
                            </div>
                            <button
                                onClick={() => signOut()}
                                style={{
                                    background: '#f8f9fa', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: 'var(--error)'
                                }}
                                title="Cerrar Sesión"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main style={{ padding: '20px' }} className="container">
                {activeTab === 'inventory' && <InventoryManager />}
                {activeTab === 'customers' && <CustomerManager />}
                {activeTab === 'suppliers' && <SupplierManager />}
                {activeTab === 'reservations' && <ReservationBandeja />}
                {activeTab === 'caja' && <CajaManager />}
                {activeTab === 'purchases' && <PurchaseModuleView />}
                {activeTab === 'classification_config' && profile.roleId === 'ADMIN' && <ClassificationControlTower />}
                {activeTab === 'attributes' && profile.roleId === 'ADMIN' && <DomainAttributeManager />}
                {activeTab === 'sequences' && profile.roleId === 'ADMIN' && <SequenceManager />}
                {activeTab === 'admin_users' && profile.roleId === 'ADMIN' && <UserManagement />}
            </main>
            <style>{`
                .nav-link {
                    background: none; border: none; fontFamily: 'Outfit'; fontWeight: 600; fontSize: '13px';
                    color: var(--text-muted); cursor: pointer; borderBottom: 2px solid transparent;
                    padding: 4px 0; transition: all 0.2s;
                }
                .nav-link.active {
                    color: var(--accent); borderBottom-color: var(--accent);
                }
            `}</style>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
