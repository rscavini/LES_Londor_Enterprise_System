import React, { useState } from 'react';
import {
    Camera,
    Upload,
    User,
    Package,
    Euro,
    FileCheck,
    X,
    CheckCircle
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { CajaService } from '../services/CajaService';
import { PaymentMethod } from '../models/cajaSchema';

interface BuyBackFormProps {
    cajaId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

const BuyBackForm: React.FC<BuyBackFormProps> = ({ cajaId, onSuccess, onCancel }) => {
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    // Form fields
    const [clientId, setClientId] = useState('');
    const [amount, setAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EFECTIVO');
    const [observations, setObservations] = useState('');
    const [dniPhoto, setDniPhoto] = useState<string | null>(null);
    const [itemPhotos, setItemPhotos] = useState<string[]>([]);

    const handleSubmit = async () => {
        if (!clientId || !amount || !dniPhoto || itemPhotos.length === 0) {
            alert("Por favor, completa todos los campos obligatorios y adjunta las evidencias legales.");
            return;
        }

        setSubmitting(true);
        try {
            // 1. Add Cash Movement (OUT)
            const moveRef = await CajaService.addMovement({
                cajaId,
                type: 'COMPRA',
                amount,
                direction: 'OUT',
                paymentMethod,
                userId: 'admin', // Placeholder
                storeId: 'STORE-DIP', // Placeholder
                originId: `BUY-${Date.now()}` // Mock origin ID
            });

            // 2. Create Legal Ficha
            const custodyEndDate = new Date();
            custodyEndDate.setDate(custodyEndDate.getDate() + 15);

            await CajaService.createFichaLegal({
                movementId: moveRef.id,
                clientId,
                itemIds: ['PLACEHOLDER-ITEM-ID'], // This would come from item selection
                dniPhotoUrl: dniPhoto,
                itemPhotosUrls: itemPhotos,
                observations,
                sentToAuthorityDate: null,
                custodyEndDate: Timestamp.fromDate(custodyEndDate)
            });

            onSuccess();
        } catch (error) {
            console.error("Error in buy-back registration:", error);
            alert("Error al registrar la compra legal.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="glass-card" style={{ padding: '32px', maxWidth: '700px', margin: '0 auto', border: '1px solid var(--accent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <Euro size={20} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0 }}>Registro de Compra a Cliente</h2>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Trazabilidad legal obligatoria</p>
                    </div>
                </div>
                <button onClick={onCancel} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <X size={24} />
                </button>
            </div>

            {/* Stepper */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
                <div style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: step >= 1 ? 'var(--accent)' : '#eee' }} />
                <div style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: step >= 2 ? 'var(--accent)' : '#eee' }} />
                <div style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: step >= 3 ? 'var(--accent)' : '#eee' }} />
            </div>

            {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>CLIENTE (DNI/NIE)</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} />
                            <input
                                type="text"
                                className="form-control"
                                style={{ paddingLeft: '40px' }}
                                placeholder="Buscar o introducir cliente..."
                                title="Introduzca el DNI/NIE del cliente para buscarlo en la base de datos o registrarlo."
                                value={clientId}
                                onChange={e => setClientId(e.target.value)}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>IMPORTE A PAGAR (€)</label>
                            <input
                                type="number"
                                className="form-control"
                                title="Importe total acordado que se entregará al cliente por la pieza."
                                value={amount}
                                onChange={e => setAmount(parseFloat(e.target.value))}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>MEDIO DE PAGO</label>
                            <select
                                className="form-control"
                                title="Seleccione el método por el cual se realizará el pago al cliente."
                                value={paymentMethod}
                                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                            >
                                <option value="EFECTIVO">Efectivo</option>
                                <option value="TARJETA">Tarjeta (Devolución)</option>
                                <option value="TRANSFERENCIA">Transferencia</option>
                            </select>
                        </div>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%', padding: '14px' }} onClick={() => setStep(2)}>
                        Siguiente: Evidencias Legales
                    </button>
                </div>
            )}

            {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="glass-card" style={{ padding: '20px', backgroundColor: '#fdfdfd' }}>
                        <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileCheck size={18} color="var(--accent)" /> Imagen DNI / Identificación
                        </h4>
                        {!dniPhoto ? (
                            <div style={{ height: '120px', border: '2px dashed #ddd', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                                title="Es obligatorio capturar el DNI para cumplir con la normativa de seguridad ciudadana."
                                onClick={() => setDniPhoto('https://via.placeholder.com/300x200?text=DNI+FRONTAL')}>
                                <Camera size={24} color="#ccc" />
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Capturar o subir foto DNI</span>
                            </div>
                        ) : (
                            <div style={{ position: 'relative', height: '120px' }}>
                                <img src={dniPhoto} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                <button onClick={() => setDniPhoto(null)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', color: 'white', padding: '4px' }}>
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="glass-card" style={{ padding: '20px', backgroundColor: '#fdfdfd' }}>
                        <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Package size={18} color="var(--accent)" /> Fotos de la(s) Pieza(s)
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            {itemPhotos.map((url, idx) => (
                                <div key={idx} style={{ position: 'relative', height: '80px' }}>
                                    <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                </div>
                            ))}
                            <div style={{ height: '80px', border: '2px dashed #ddd', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                title="Añade fotos detalladas de la pieza para documentar su estado original de compra."
                                onClick={() => setItemPhotos([...itemPhotos, 'https://via.placeholder.com/150?text=PIEZA'])}>
                                <Upload size={20} color="#ccc" />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn" style={{ flex: 1, backgroundColor: '#eee' }} onClick={() => setStep(1)}>Atrás</button>
                        <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => setStep(3)}>Siguiente: Confirmación</button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: '32px' }}>
                        <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '16px' }} />
                        <h3>Resumen Final</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Revisa la operación antes de confirmarla.</p>
                    </div>
                    <div className="glass-card" style={{ padding: '24px', backgroundColor: '#fafafa', textAlign: 'left', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Cliente:</span>
                            <span style={{ fontWeight: 600 }}>{clientId}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Importe Pago:</span>
                            <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--error)' }}>-{amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Periodo Custodia:</span>
                            <span style={{ fontWeight: 600, color: 'var(--accent)' }}>15 días naturales</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn" style={{ flex: 1, backgroundColor: '#eee' }} onClick={() => setStep(2)}>Atrás</button>
                        <button
                            className="btn btn-primary"
                            style={{ flex: 2, padding: '16px', backgroundColor: 'var(--primary)', color: 'white', fontSize: '16px' }}
                            disabled={submitting}
                            onClick={handleSubmit}
                        >
                            {submitting ? 'Registrando...' : 'Confirmar y Finalizar Operación'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuyBackForm;
