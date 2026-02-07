import React, { useState, useEffect } from 'react';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    Lock,
    Unlock,
    History,
    FileText,
    PlusCircle,
    Store,
    Scale,
    ArrowLeft,
    Clock
} from 'lucide-react';
import { CajaService } from '../services/CajaService';
import { CajaDiaria, MovimientoCaja } from '../models/cajaSchema';
import MovementList from './MovementList';
import BuyBackForm from './BuyBackForm';
import LegalCustodyBandeja from './LegalCustodyBandeja';

const CajaManager: React.FC = () => {
    const [view, setView] = useState<'summary' | 'buyback' | 'custody'>('summary');
    const [currentCaja, setCurrentCaja] = useState<CajaDiaria | null>(null);
    const [movements, setMovements] = useState<MovimientoCaja[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedStore, setSelectedStore] = useState('STORE-DIP'); // Dataset store

    useEffect(() => {
        loadCajaStatus();
    }, [selectedStore]);

    const loadCajaStatus = async () => {
        setLoading(true);
        setError(null);
        try {
            const caja = await CajaService.getCurrentCaja(selectedStore);
            setCurrentCaja(caja);
            if (caja) {
                const moves = await CajaService.getMovementsByCaja(caja.id);
                // Sort in memory to avoid index requirement
                moves.sort((a, b) => {
                    const timeA = a.timestamp?.toMillis() || 0;
                    const timeB = b.timestamp?.toMillis() || 0;
                    return timeB - timeA;
                });
                setMovements(moves);
            } else {
                setMovements([]);
            }
        } catch (error: any) {
            console.error("Error loading caja status:", error);
            setError("Error de base de datos: " + (error.message || "Error desconocido"));
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCaja = async () => {
        const initial = prompt("Introduce el saldo inicial de caja (€):", "200");
        if (initial === null) return;

        try {
            await CajaService.openCaja({
                storeId: selectedStore,
                userId: 'admin',
                initialBalance: parseFloat(initial),
                theoreticalBalance: parseFloat(initial),
                endTime: null,
                realBalance: null,
                difference: null,
                observations: ''
            });
            await loadCajaStatus();
        } catch (error) {
            console.error("Error opening caja:", error);
        }
    };

    if (loading) return <div style={{ padding: '80px', textAlign: 'center', fontFamily: 'Outfit' }}>Cargando infraestructura económica...</div>;

    if (view === 'buyback' && currentCaja) {
        return (
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
                <button onClick={() => setView('summary')} className="btn" style={{ marginBottom: '24px', border: '1px solid #ddd' }}>
                    <ArrowLeft size={18} /> Volver a Caja
                </button>
                <BuyBackForm
                    cajaId={currentCaja.id}
                    onSuccess={() => { setView('summary'); loadCajaStatus(); }}
                    onCancel={() => setView('summary')}
                />
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Gobierno de Caja</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Control económico y trazabilidad legal de activos</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="glass-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Store size={18} color="var(--accent)" />
                        <select
                            value={selectedStore}
                            onChange={(e) => setSelectedStore(e.target.value)}
                            style={{ border: 'none', background: 'transparent', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
                        >
                            <option value="STORE-DIP">LONDOR Diputación</option>
                            <option value="STORE-PRO">LONDOR Provenza</option>
                        </select>
                    </div>
                    {!currentCaja ? (
                        <button className="btn btn-accent" onClick={handleOpenCaja}>
                            <Unlock size={18} /> Apertura de Caja
                        </button>
                    ) : (
                        <button className="btn btn-primary">
                            <Lock size={18} /> Cierre de Caja
                        </button>
                    )}
                </div>
            </header>

            {error && (
                <div className="glass-card" style={{
                    padding: '20px',
                    marginBottom: '32px',
                    backgroundColor: '#fff5f5',
                    border: '1px solid var(--error)',
                    color: 'var(--error)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <AlertCircle size={20} />
                    <strong>{error}</strong>
                    <button
                        onClick={() => loadCajaStatus()}
                        style={{ marginLeft: 'auto', background: 'none', border: '1px solid var(--error)', color: 'var(--error)', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {!currentCaja ? (
                <div className="glass-card" style={{ padding: '80px', textAlign: 'center', backgroundColor: '#fff5f5', border: '1px dashed var(--error)' }}>
                    <AlertCircle size={48} color="var(--error)" style={{ marginBottom: '20px' }} />
                    <h2 style={{ fontFamily: 'Outfit', color: 'var(--primary)' }}>Caja no abierta</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Es necesario abrir la caja de esta tienda para registrar cualquier operación económica.</p>
                    <button className="btn btn-primary" style={{ padding: '12px 32px' }} onClick={handleOpenCaja}>
                        Abrir Caja en {selectedStore === 'STORE-DIP' ? 'Diputación' : 'Provenza'}
                    </button>
                </div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
                        <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--accent)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-muted)' }}>
                                <Wallet size={20} />
                                <span style={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Saldo Teórico</span>
                            </div>
                            <div style={{ fontSize: '2.2rem', fontWeight: 700, fontFamily: 'Outfit' }}>
                                {currentCaja.theoreticalBalance.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                            </div>
                        </div>
                        <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--success)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--success)' }}>
                                <TrendingUp size={20} />
                                <span style={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Entradas Hoy</span>
                            </div>
                            <div style={{ fontSize: '2.2rem', fontWeight: 700, fontFamily: 'Outfit' }}>
                                {movements.filter(m => m.direction === 'IN').reduce((acc, m) => acc + m.amount, 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                            </div>
                        </div>
                        <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--error)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--error)' }}>
                                <TrendingDown size={20} />
                                <span style={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Salidas Hoy</span>
                            </div>
                            <div style={{ fontSize: '2.2rem', fontWeight: 700, fontFamily: 'Outfit' }}>
                                {movements.filter(m => m.direction === 'OUT').reduce((acc, m) => acc + m.amount, 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '24px', marginBottom: '40px' }}>
                        <button
                            className="btn"
                            style={{ flex: 1, backgroundColor: 'var(--primary)', color: 'white', padding: '16px' }}
                            onClick={() => setView('buyback')}
                        >
                            <Scale size={20} /> Registro de Compra a Cliente
                        </button>
                        <button
                            className={`btn ${view === 'custody' ? 'btn-accent' : ''}`}
                            style={{ flex: 1, border: '1px solid #ddd', padding: '16px' }}
                            onClick={() => setView('custody')}
                        >
                            <Clock size={20} /> Bandeja Custodia Legal
                        </button>
                    </div>

                    {view === 'summary' ? (
                        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ padding: '24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <History size={20} />
                                    <h3 style={{ margin: 0 }}>Últimos Movimientos</h3>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn" style={{ fontSize: '12px' }}>
                                        <FileText size={16} /> Exportar
                                    </button>
                                    <button className="btn btn-primary" style={{ fontSize: '12px' }}>
                                        <PlusCircle size={16} /> Ajuste Manual
                                    </button>
                                </div>
                            </div>
                            <MovementList movements={movements} />
                        </div>
                    ) : (
                        <div>
                            <button onClick={() => setView('summary')} className="btn" style={{ marginBottom: '24px', border: '1px solid #ddd' }}>
                                <ArrowLeft size={18} /> Volver a Resumen
                            </button>
                            <LegalCustodyBandeja />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CajaManager;
