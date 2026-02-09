import React, { useState, useEffect } from 'react';
import CategoryManager from './components/CategoryManager';
import SubcategoryManager from './components/SubcategoryManager';
import DomainAttributeManager from './components/DomainAttributeManager';
import LocationStatusManager from './components/LocationStatusManager';
import InventoryManager from './components/InventoryManager';
import ClassificationControlTower from './components/ClassificationControlTower';
import CustomerManager from './components/CustomerManager';
import ReservationBandeja from './components/ReservationBandeja';
import SupplierManager from './components/SupplierManager';
import CajaManager from '../../caja/src/components/CajaManager';
import { testPhase7 } from './test_phase7';


function App() {
    const [activeTab, setActiveTab] = useState<'inventory' | 'customers' | 'reservations' | 'suppliers' | 'caja' | 'attributes' | 'logistics' | 'classification_config'>('inventory');

    useEffect(() => {
        (window as any).testPhase7 = testPhase7;
        console.log("App mounted. testPhase7 exposed at window.testPhase7");
        // testPhase7(); 
    }, []);

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
                    </div>
                </div>
            </nav>

            <main style={{ paddingTop: '40px' }}>
                {activeTab === 'inventory' && <InventoryManager />}
                {activeTab === 'customers' && <CustomerManager />}
                {activeTab === 'suppliers' && <SupplierManager />}
                {activeTab === 'reservations' && <ReservationBandeja />}
                {activeTab === 'caja' && <CajaManager />}
                {activeTab === 'classification_config' && <ClassificationControlTower />}
                {activeTab === 'attributes' && <DomainAttributeManager />}
                {activeTab === 'logistics' && <LocationStatusManager />}
            </main>
        </div>
    );
}

export default App;
