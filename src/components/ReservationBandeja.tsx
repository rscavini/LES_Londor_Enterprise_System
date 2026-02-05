import React, { useState, useEffect } from 'react';
import {
    Clock,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Search,
    Calendar,
    User,
    Package,
    ArrowRight,
    Loader2,
    Filter
} from 'lucide-react';
import { ReservationService } from '../services/ReservationService';
import { CustomerService } from '../services/CustomerService';
import { InventoryService } from '../services/InventoryService';
import { Reservation, Customer, InventoryItem, ReservationStatus } from '../models/schema';

const ReservationBandeja: React.FC = () => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [customers, setCustomers] = useState<Record<string, Customer>>({});
    const [items, setItems] = useState<Record<string, InventoryItem>>({});
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<ReservationStatus | 'ALL'>('ALL');
    const [isResolving, setIsResolving] = useState<string | null>(null);
    const [resolutionNote, setResolutionNote] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            await ReservationService.checkExpirations(); // Actualizar caducados
            const resData = await ReservationService.getAll();
            setReservations(resData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));

            // Cargar datos relacionales (Optimización básica)
            const customerIds = Array.from(new Set(resData.map(r => r.customerId)));
            const itemIds = Array.from(new Set(resData.map(r => r.itemId)));

            const [custData, itemData] = await Promise.all([
                Promise.all(customerIds.map(id => CustomerService.getById(id))),
                Promise.all(itemIds.map(id => InventoryService.getById(id)))
            ]);

            const custMap: Record<string, Customer> = {};
            custData.forEach(c => { if (c) custMap[c.id] = c; });

            const itemMap: Record<string, InventoryItem> = {};
            itemData.forEach(i => { if (i) itemMap[i.id] = i; });

            setCustomers(custMap);
            setItems(itemMap);
        } catch (error) {
            console.error("Error loading reservations:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id: string, status: ReservationStatus) => {
        try {
            await ReservationService.resolveReservation(id, {
                status,
                note: resolutionNote,
                user: 'admin'
            });
            setIsResolving(null);
            setResolutionNote('');
            loadData();
        } catch (error) {
            console.error("Error resolving reservation:", error);
        }
    };

    const getStatusColor = (status: ReservationStatus) => {
        switch (status) {
            case 'ACTIVE': return '#3498db';
            case 'EXPIRED': return 'var(--error)';
            case 'RESOLVED': return '#27ae60';
            case 'CANCELLED': return '#95a5a6';
            default: return '#f1f1f1';
        }
    };

    const getStatusLabel = (status: ReservationStatus) => {
        switch (status) {
            case 'ACTIVE': return 'ACTIVA';
            case 'EXPIRED': return 'CADUCADA';
            case 'RESOLVED': return 'RESUELTA (VENTA)';
            case 'CANCELLED': return 'CANCELADA';
            default: return status;
        }
    };

    const filtered = reservations.filter(r => filterStatus === 'ALL' || r.status === filterStatus);

    return (
        <div className="container" style={{ paddingBottom: '60px' }}>
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Bandeja de Apartados</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Gestión de piezas reservadas y control de caducidades</p>
                </div>
                <div className="glass-card" style={{ display: 'flex', padding: '4px', borderRadius: '12px' }}>
                    {(['ALL', 'ACTIVE', 'EXPIRED', 'RESOLVED'] as const).map(s => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            style={{
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                backgroundColor: filterStatus === s ? 'var(--primary)' : 'transparent',
                                color: filterStatus === s ? 'white' : 'var(--text-muted)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {s === 'ALL' ? 'TODOS' : getStatusLabel(s as ReservationStatus)}
                        </button>
                    ))}
                </div>
            </header>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                    <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Cargando bandeja...</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filtered.length > 0 ? filtered.map(res => {
                        const customer = customers[res.customerId];
                        const item = items[res.itemId];
                        const isExpired = res.status === 'EXPIRED' || (res.status === 'ACTIVE' && res.expiryDate < new Date());

                        return (
                            <div key={res.id} className="glass-card" style={{
                                padding: '24px',
                                borderLeft: `6px solid ${getStatusColor(res.status)}`,
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1fr auto',
                                alignItems: 'center',
                                gap: '32px'
                            }}>
                                {/* Cliente y Estado */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <span style={{
                                            fontSize: '10px',
                                            fontWeight: 800,
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            backgroundColor: `${getStatusColor(res.status)}15`,
                                            color: getStatusColor(res.status)
                                        }}>
                                            {getStatusLabel(res.status)}
                                        </span>
                                        {isExpired && res.status === 'ACTIVE' && (
                                            <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <AlertCircle size={12} /> PENDIENTE DE CIERRE
                                            </span>
                                        )}
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{customer?.firstName} {customer?.lastName}</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>{customer?.phone}</p>
                                </div>

                                {/* Pieza */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Package size={20} color="var(--primary)" />
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 700, fontSize: '14px' }}>{item?.itemCode || 'Pieza desconocida'}</p>
                                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{item?.name}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Fechas */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                        <Calendar size={14} />
                                        <span>Inicio: {res.startDate.toLocaleDateString()}</span>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        color: isExpired ? 'var(--error)' : 'var(--text-main)'
                                    }}>
                                        <Clock size={14} />
                                        <span>Vence: {res.expiryDate.toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Acciones */}
                                <div>
                                    {res.status === 'ACTIVE' || res.status === 'EXPIRED' ? (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => setIsResolving(res.id)}
                                            style={{ padding: '10px 20px', fontSize: '13px' }}
                                        >
                                            Gestionar
                                        </button>
                                    ) : (
                                        <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)' }}>
                                            <p style={{ margin: 0 }}>Cerrado por: {res.resolvedBy}</p>
                                            <p style={{ margin: 0 }}>{res.resolvedAt?.toLocaleDateString()}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }) : (
                        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                            <Filter size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                            <h3>No hay apartados en esta sección</h3>
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Resolución */}
            {isResolving && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, backdropFilter: 'blur(4px)'
                }}>
                    <div className="glass-card" style={{ padding: '32px', width: '500px', backgroundColor: 'white' }}>
                        <h2 style={{ marginBottom: '24px' }}>Resolver Apartado</h2>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Nota de resolución</label>
                            <textarea
                                className="form-control"
                                rows={3}
                                value={resolutionNote}
                                onChange={e => setResolutionNote(e.target.value)}
                                placeholder="Indique el motivo (ej. venta finalizada, cliente desiste, caducidad no reclamada)..."
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <button
                                className="btn"
                                style={{ backgroundColor: '#fff5f5', color: 'var(--error)', border: '1px solid var(--error)' }}
                                onClick={() => handleResolve(isResolving, 'CANCELLED')}
                            >
                                <XCircle size={18} /> Liberar Pieza
                            </button>
                            <button
                                className="btn"
                                style={{ backgroundColor: '#f0fff4', color: '#27ae60', border: '1px solid #27ae60' }}
                                onClick={() => handleResolve(isResolving, 'RESOLVED')}
                            >
                                <CheckCircle2 size={18} /> Consolidar Venta
                            </button>
                        </div>
                        <button
                            className="btn"
                            style={{ width: '100%', marginTop: '16px' }}
                            onClick={() => setIsResolving(null)}
                        >
                            Volver
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReservationBandeja;
