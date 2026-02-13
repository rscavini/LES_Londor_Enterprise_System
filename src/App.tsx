import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
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


function App() {
    const [activeTab, setActiveTab] = useState<'inventory' | 'customers' | 'reservations' | 'suppliers' | 'caja' | 'purchases' | 'attributes' | 'logistics' | 'classification_config' | 'sequences'>('inventory');
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("Sesión de Firebase sincronizada");
                setIsAuthReady(true);
            }
        });
        return () => unsubscribe();
    }, []);

    if (!isAuthReady) {
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
                    <h2 style={{ fontFamily: 'Outfit', margin: 0 }}>Iniciando Sesión Segura...</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Sincronizando con Londor Enterprise System</p>
                </div>
                <style>{`
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    return (
        <div className="app-shell" style={{ minHeight: '100vh', backgroundColor: '#fdfdfd' }}>
            <nav style={{
                padding: '20px 0',
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                background: 'white',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <div className="container" style={{ padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                        fontFamily: 'Outfit',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        color: 'var(--primary)',
                        letterSpacing: '1px'
                    }}>
                        LONDOR <span style={{ color: 'var(--accent)' }}>LES</span>
                    </span>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={`nav-link ${activeTab === 'inventory' ? 'active' : ''}`}
                            style={{
                                background: 'none', border: 'none', fontFamily: 'Outfit', fontWeight: 600, fontSize: '13px',
                                color: activeTab === 'inventory' ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer',
                                borderBottom: activeTab === 'inventory' ? '2px solid var(--accent)' : '2px solid transparent',
                                padding: '4px 0', transition: 'all 0.2s'
                            }}
                        >
                            Inventario
                        </button>
                        <button
                            onClick={() => setActiveTab('customers')}
                            style={{
                                background: 'none', border: 'none', fontFamily: 'Outfit', fontWeight: 600, fontSize: '13px',
                                color: activeTab === 'customers' ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer',
                                borderBottom: activeTab === 'customers' ? '2px solid var(--accent)' : '2px solid transparent',
                                padding: '4px 0', transition: 'all 0.2s'
                            }}
                        >
                            Clientes
                        </button>
                        <button
                            onClick={() => setActiveTab('suppliers')}
                            style={{
                                background: 'none', border: 'none', fontFamily: 'Outfit', fontWeight: 600, fontSize: '13px',
                                color: activeTab === 'suppliers' ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer',
                                borderBottom: activeTab === 'suppliers' ? '2px solid var(--accent)' : '2px solid transparent',
                                padding: '4px 0', transition: 'all 0.2s'
                            }}
                        >
                            Proveedores
                        </button>

                        <button
                            onClick={() => setActiveTab('reservations')}
                            style={{
                                background: 'none', border: 'none', fontFamily: 'Outfit', fontWeight: 600, fontSize: '13px',
                                color: activeTab === 'reservations' ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer',
                                borderBottom: activeTab === 'reservations' ? '2px solid var(--accent)' : '2px solid transparent',
                                padding: '4px 0', transition: 'all 0.2s'
                            }}
                        >
                            Apartados
                        </button>

                        <button
                            onClick={() => setActiveTab('caja')}
                            style={{
                                background: 'none', border: 'none', fontFamily: 'Outfit', fontWeight: 600, fontSize: '13px',
                                color: activeTab === 'caja' ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer',
                                borderBottom: activeTab === 'caja' ? '2px solid var(--accent)' : '2px solid transparent',
                                padding: '4px 0', transition: 'all 0.2s'
                            }}
                        >
                            Caja
                        </button>
                        <button
                            onClick={() => setActiveTab('purchases')}
                            style={{
                                background: 'none', border: 'none', fontFamily: 'Outfit', fontWeight: 600, fontSize: '13px',
                                color: activeTab === 'purchases' ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer',
                                borderBottom: activeTab === 'purchases' ? '2px solid var(--accent)' : '2px solid transparent',
                                padding: '4px 0', transition: 'all 0.2s'
                            }}
                        >
                            Compras
                        </button>
                        <button
                            onClick={() => setActiveTab('classification_config')}
                            style={{
                                background: 'none', border: 'none', fontFamily: 'Outfit', fontWeight: 600, fontSize: '13px',
                                color: activeTab === 'classification_config' ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer',
                                borderBottom: activeTab === 'classification_config' ? '2px solid var(--accent)' : '2px solid transparent',
                                padding: '4px 0', transition: 'all 0.2s'
                            }}
                        >
                            Config. Clasificación
                        </button>
                        <button
                            onClick={() => setActiveTab('attributes')}
                            style={{
                                background: 'none', border: 'none', fontFamily: 'Outfit', fontWeight: 600, fontSize: '13px',
                                color: activeTab === 'attributes' ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer',
                                borderBottom: activeTab === 'attributes' ? '2px solid var(--accent)' : '2px solid transparent',
                                padding: '4px 0', transition: 'all 0.2s'
                            }}
                        >
                            Catálogo de Atributos
                        </button>
                        <button
                            onClick={() => setActiveTab('logistics')}
                            style={{
                                background: 'none', border: 'none', fontFamily: 'Outfit', fontWeight: 600, fontSize: '13px',
                                color: activeTab === 'logistics' ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer',
                                borderBottom: activeTab === 'logistics' ? '2px solid var(--accent)' : '2px solid transparent',
                                padding: '4px 0', transition: 'all 0.2s'
                            }}
                        >
                            Logística
                        </button>
                        <button
                            onClick={() => setActiveTab('sequences')}
                            style={{
                                background: 'none', border: 'none', fontFamily: 'Outfit', fontWeight: 600, fontSize: '13px',
                                color: activeTab === 'sequences' ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer',
                                borderBottom: activeTab === 'sequences' ? '2px solid var(--accent)' : '2px solid transparent',
                                padding: '4px 0', transition: 'all 0.2s'
                            }}
                        >
                            Numeradores
                        </button>
                    </div>
                </div>
            </nav>

            <main style={{ paddingTop: '40px' }}>
                {activeTab === 'inventory' && <InventoryManager />}
                {activeTab === 'customers' && <CustomerManager />}
                {activeTab === 'suppliers' && <SupplierManager />}
                {activeTab === 'reservations' && <ReservationBandeja />}
                {activeTab === 'caja' && <CajaManager />}
                {activeTab === 'purchases' && <PurchaseModuleView />}
                {activeTab === 'classification_config' && <ClassificationControlTower />}
                {activeTab === 'attributes' && <DomainAttributeManager />}
                {activeTab === 'logistics' && <LocationStatusManager />}
                {activeTab === 'sequences' && <SequenceManager />}
            </main>
        </div>
    );
}

export default App;
