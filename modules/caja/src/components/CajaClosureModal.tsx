import React, { useState } from 'react';
import {
    Lock,
    AlertCircle,
    CheckCircle2,
    X,
    Info,
    Calculator
} from 'lucide-react';
import { CajaDiaria, MovimientoCaja, PaymentMethod } from '../models/cajaSchema';
import { CajaService } from '../services/CajaService';

interface CajaClosureModalProps {
    caja: CajaDiaria;
    movements: MovimientoCaja[];
    onClose: () => void;
    onSuccess: () => void;
}

const CajaClosureModal: React.FC<CajaClosureModalProps> = ({ caja, movements, onClose, onSuccess }) => {
    const [realBalance, setRealBalance] = useState<number>(0);
    const [observations, setObservations] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1);

    const difference = realBalance - caja.theoreticalBalance;
    const isMatched = Math.abs(difference) < 0.01;

    // Calculate totals by payment method
    const totalsByMethod = movements.reduce((acc, current) => {
        const method = current.paymentMethod;
        const netAmount = current.direction === 'IN' ? current.amount : -current.amount;
        acc[method] = (acc[method] || 0) + netAmount;
        return acc;
    }, {} as Record<string, number>);

    const handleConfirmClosure = async () => {
        setIsSubmitting(true);
        try {
            await CajaService.closeCaja(caja.id, {
                realBalance,
                difference,
                observations: observations + (isMatched ? "" : ` [DESCUADRE DETECTADO: ${difference.toFixed(2)}€]`)
            });
            onSuccess();
        } catch (error) {
            console.error("Error closing caja:", error);
            alert("Error al cerrar la caja. Por favor, inténtalo de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '32px', border: '1px solid var(--accent)', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <Lock size={20} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontFamily: 'Outfit' }}>Cierre de Caja</h2>
                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Proceso de arqueo y fin de sesión</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={24} />
                    </button>
                </div>

                {step === 1 && (
                    <div>
                        <div style={{ padding: '20px', backgroundColor: '#fafafa', borderRadius: '12px', marginBottom: '24px', border: '1px solid #eee' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Saldo Teórico TOTAL:</span>
                                <span style={{ fontWeight: 700, fontSize: '16px' }}>{caja.theoreticalBalance.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '12px 0' }} />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {Object.entries(totalsByMethod).map(([method, total]) => (
                                    <div key={method} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                                        <span style={{ textTransform: 'uppercase' }}>{method}:</span>
                                        <span style={{ fontWeight: 600, color: total >= 0 ? 'inherit' : 'var(--error)' }}>
                                            {total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Info size={12} /> Desglose basado en {movements.length} movimientos.
                            </p>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--primary)' }}>
                                <Calculator size={14} /> SALDO REAL FÍSICO (€)
                            </label>
                            <input
                                type="number"
                                className="form-control"
                                style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', height: '60px' }}
                                placeholder="0.00"
                                value={realBalance || ''}
                                onChange={(e) => setRealBalance(parseFloat(e.target.value) || 0)}
                                autoFocus
                            />
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>OBSERVACIONES / JUSTIFICACIÓN</label>
                            <textarea
                                className="form-control"
                                rows={3}
                                placeholder="Indica cualquier incidencia o motivo del descuadre si lo hubiera..."
                                value={observations}
                                onChange={(e) => setObservations(e.target.value)}
                            />
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '16px', fontSize: '16px' }}
                            onClick={() => {
                                if (realBalance === 0) {
                                    if (confirm("¿Confirmas que el saldo real es 0.00€?")) {
                                        setStep(2);
                                    }
                                } else {
                                    setStep(2);
                                }
                            }}
                        >
                            Verificar Arqueo
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '32px' }}>
                            {!isMatched ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                    <AlertCircle size={64} color="var(--error)" />
                                    <h3 style={{ color: 'var(--error)' }}>Descuadre Detectado</h3>
                                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--error)' }}>
                                        {difference > 0 ? "+" : ""}{difference.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                    </div>
                                    <p style={{ color: 'var(--text-muted)' }}>Existe una diferencia entre el dinero físico y lo que el sistema esperaba.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                    <CheckCircle2 size={64} color="var(--success)" />
                                    <h3 style={{ color: 'var(--success)' }}>Arqueo Correcto</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>El saldo coincide perfectamente con los registros del sistema.</p>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn" style={{ flex: 1 }} onClick={() => setStep(1)} disabled={isSubmitting}>
                                Corregir Saldo
                            </button>
                            <button
                                className={`btn ${isMatched ? 'btn-primary' : 'btn-accent'}`}
                                style={{ flex: 2 }}
                                onClick={handleConfirmClosure}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Cerrando...' : 'Confirmar Cierre de Caja'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CajaClosureModal;
