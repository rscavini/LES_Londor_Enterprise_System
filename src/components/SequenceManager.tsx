import React, { useState, useEffect } from 'react';
import {
    Hash,
    Plus,
    Edit3,
    Save,
    X,
    Settings,
    RefreshCcw,
    AlertTriangle,
    CheckCircle2,
    Calendar
} from 'lucide-react';
import { Sequence, SequenceService } from '../services/SequenceService';

const SequenceManager: React.FC = () => {
    const [sequences, setSequences] = useState<Sequence[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSeq, setEditingSeq] = useState<Sequence | null>(null);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    useEffect(() => {
        loadSequences();
    }, []);

    const loadSequences = async () => {
        setLoading(true);
        try {
            const data = await SequenceService.getAllSequences();
            setSequences(data);
        } catch (error) {
            console.error("Error loading sequences:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSeq) return;

        try {
            await SequenceService.setSequence(editingSeq.id, editingSeq);
            setStatus({ type: 'success', msg: 'Secuencia actualizada correctamente.' });
            setEditingSeq(null);
            loadSequences();
            setTimeout(() => setStatus(null), 3000);
        } catch (error) {
            setStatus({ type: 'error', msg: 'Error al actualizar la secuencia.' });
            setTimeout(() => setStatus(null), 3000);
        }
    };

    const initializeStandard = async () => {
        if (!confirm("¿Deseas inicializar los contadores estándar (Facturas, Pedidos, Compras)?")) return;

        const year = new Date().getFullYear();
        await SequenceService.setSequence('invoices', {
            name: 'Facturas de Venta',
            prefix: `F-${year}-`,
            currentValue: 0,
            padding: 6
        });
        await SequenceService.setSequence('buybacks', {
            name: 'Compras a Clientes',
            prefix: `C-${year}-`,
            currentValue: 0,
            padding: 6
        });
        await SequenceService.setSequence('inventory_transfer', {
            name: 'Traspasos de Inventario',
            prefix: `T-`,
            currentValue: 0,
            padding: 5
        });
        loadSequences();
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ margin: 0, fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Settings className="spin-slow" /> Gestión de Numeradores
                    </h1>
                    <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Control centralizado de correlativos y series fiscales</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn" onClick={loadSequences} disabled={loading}>
                        <RefreshCcw size={16} className={loading ? 'spin' : ''} /> Refrescar
                    </button>
                    <button className="btn btn-primary" onClick={initializeStandard}>
                        <Plus size={16} /> Inicializar Estándar
                    </button>
                </div>
            </div>

            {status && (
                <div style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: status.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                    color: status.type === 'success' ? '#065F46' : '#991B1B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '24px',
                    border: `1px solid ${status.type === 'success' ? '#A7F3D0' : '#FECACA'}`
                }}>
                    {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                    {status.msg}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {sequences.map(seq => (
                    <div key={seq.id} className="glass-card" style={{ padding: '24px', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <Hash size={24} />
                            </div>
                            <button className="btn-icon" onClick={() => setEditingSeq(seq)}>
                                <Edit3 size={16} />
                            </button>
                        </div>
                        <h3 style={{ margin: '0 0 4px 0' }}>{seq.name}</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>ID: {seq.id}</p>

                        <div style={{ padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Prefijo:</span>
                                <code style={{ fontWeight: 700 }}>{seq.prefix}</code>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Último valor:</span>
                                <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--primary)' }}>{seq.currentValue}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Ejemplo:</span>
                                <span style={{ fontSize: '13px', fontFamily: 'monospace' }}>
                                    {seq.prefix}{(seq.currentValue).toString().padStart(seq.padding, '0')}
                                </span>
                            </div>
                        </div>

                        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                            <Calendar size={12} />
                            Actualizado: {seq.lastUpdated?.toDate().toLocaleString() || 'N/A'}
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {editingSeq && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
                    <div className="glass-card" style={{ maxWidth: '500px', width: '90%', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0 }}>Editar Numerador</h2>
                            <button className="btn-icon" onClick={() => setEditingSeq(null)}><X /></button>
                        </div>

                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Nombre del Contador</label>
                                <input
                                    className="form-control"
                                    value={editingSeq.name}
                                    onChange={e => setEditingSeq({ ...editingSeq, name: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Prefijo</label>
                                    <input
                                        className="form-control"
                                        value={editingSeq.prefix}
                                        onChange={e => setEditingSeq({ ...editingSeq, prefix: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Padding (Ceros)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={editingSeq.padding}
                                        onChange={e => setEditingSeq({ ...editingSeq, padding: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Valor Actual (Contador)</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <input
                                        type="number"
                                        className="form-control"
                                        style={{ fontSize: '20px', fontWeight: 700 }}
                                        value={editingSeq.currentValue}
                                        onChange={e => setEditingSeq({ ...editingSeq, currentValue: parseInt(e.target.value) })}
                                    />
                                </div>
                                <p style={{ fontSize: '11px', color: '#B45309', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <AlertTriangle size={12} /> Cuidado: Editar este valor puede generar huecos o duplicados.
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setEditingSeq(null)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                                    <Save size={16} /> Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SequenceManager;
