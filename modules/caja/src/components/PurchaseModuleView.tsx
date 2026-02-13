import React, { useState, useEffect } from 'react';
import { 
    Scale, 
    Clock, 
    ArrowLeft, 
    PlusCircle,
    Info
} from 'lucide-react';
import { CajaService } from '../services/CajaService';
import { CajaDiaria } from '../models/cajaSchema';
import BuyBackForm from './BuyBackForm';
import LegalCustodyBandeja from './LegalCustodyBandeja';

const PurchaseModuleView: React.FC = () => {
    const [view, setView] = useState<'selection' | 'form' | 'custody'>('selection');
    const [currentCaja, setCurrentCaja] = useState<CajaDiaria | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedStore] = useState('STORE-DIP'); // Dataset store, could be made dynamic

    useEffect(() => {
        loadCajaStatus();
    }, [selectedStore]);

    const loadCajaStatus = async () => {
        setLoading(true);
        try {
            const caja = await CajaService.getCurrentCaja(selectedStore);
            setCurrentCaja(caja);
        } catch (error) {
            console.error("Error loading caja for purchases:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '80px', textAlign: 'center', fontFamily: 'Outfit' }}>Sincronizando con Caja y Normativa...</div>;
    }

    if (!currentCaja) {
        return (
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
                <div className="glass-card" style={{ padding: '60px', textAlign: 'center', border: '1px dashed var(--error)', backgroundColor: '#fff5f5' }}>
                    <Scale size={48} color="var(--error)" style={{ marginBottom: '24px' }} />
                    <h2 style={{ fontFamily: 'Outfit' }}>Caja Cerrada</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
                        Para realizar una Compra a Cliente (Ficha de Compra), es obligatorio que la caja de la tienda esté abierta, ya que implica un movimiento de salida de efectivo.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', color: 'var(--error)', fontSize: '14px', fontWeight: 600 }}>
                        <Info size={16} />
                        Por favor, abra la caja en el módulo de Caja antes de continuar.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px' }}>
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Compras y Fichas Legales</h1>
                <p style={{ color: 'var(--text-muted)' }}>Gestión de adquisiciones a particulares y cumplimiento de la normativa de seguridad</p>
            </header>

            {view === 'selection' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                    <div 
                        className="glass-card" 
                        style={{ padding: '40px', cursor: 'pointer', transition: 'all 0.3s', border: '1px solid transparent' }}
                        onClick={() => setView('form')}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                    >
                        <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                            <PlusCircle size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Nueva Compra</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                            Registrar una nueva pieza adquirida a un cliente. Incluye captura de DNI, fotos de la pieza y generación automática de la ficha legal.
                        </p>
                    </div>

                    <div 
                        className="glass-card" 
                        style={{ padding: '40px', cursor: 'pointer', transition: 'all 0.3s', border: '1px solid transparent' }}
                        onClick={() => setView('custody')}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                    >
                        <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                            <Scale size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Bandeja de Custodia</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                            Controlar el periodo legal de 15 días de custodia. Visualizar piezas pendientes de liberar para su exposición y venta en inventario.
                        </p>
                    </div>
                </div>
            )}

            {view === 'form' && (
                <div>
                    <button onClick={() => setView('selection')} className="btn" style={{ marginBottom: '24px', border: '1px solid #ddd' }}>
                        <ArrowLeft size={18} /> Volver
                    </button>
                    <BuyBackForm 
                        cajaId={currentCaja.id}
                        onSuccess={() => setView('custody')}
                        onCancel={() => setView('selection')}
                    />
                </div>
            )}

            {view === 'custody' && (
                <div>
                    <button onClick={() => setView('selection')} className="btn" style={{ marginBottom: '24px', border: '1px solid #ddd' }}>
                        <ArrowLeft size={18} /> Volver
                    </button>
                    <LegalCustodyBandeja />
                </div>
            )}
        </div>
    );
};

export default PurchaseModuleView;
