import React, { useState, useEffect } from 'react';
import { Calendar, Target, Zap, ChevronRight, Package, Heart, Users, Sparkles } from 'lucide-react';
import { CommercialService } from '../services/CommercialService';
import { InventoryService } from '../services/InventoryService';
import { CommercialEvent, InventoryItem } from '../models/schema';

interface CommercialDashboardProps {
    onClose: () => void;
    onSelectItem: (item: InventoryItem) => void;
}

const CommercialDashboard: React.FC<CommercialDashboardProps> = ({ onClose, onSelectItem }) => {
    const [events, setEvents] = useState<CommercialEvent[]>([]);
    const [activeEvents, setActiveEvents] = useState<CommercialEvent[]>([]);
    const [allItems, setAllItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [evts, activeEvts, items] = await Promise.all([
                CommercialService.getAllEvents(),
                CommercialService.getActiveEvents(),
                InventoryService.getAll()
            ]);
            setEvents(evts);
            setActiveEvents(activeEvts);
            setAllItems(items);
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getRecommendedItems = (event: CommercialEvent) => {
        return allItems.filter(item => {
            if (item.statusId !== 'stat_available') return false;

            // Coincidencia por Simbología
            const symMatch = event.targetSymbology?.some(s => item.symbology?.includes(s));
            // Coincidencia por Ocasión
            const occMatch = event.targetOccasion?.some(o => item.occasion?.includes(o));
            // Coincidencia por Perfil
            const profMatch = event.targetProfile?.some(p => item.customerProfile?.includes(p));

            return symMatch || occMatch || profMatch;
        }).slice(0, 4); // Mostrar top 4
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando Inteligencia Comercial...</div>;

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                        <Target size={32} color="var(--primary)" />
                        Dashboard de Oportunidades
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Estrategia de ventas impulsada por eventos y perfiles</p>
                </div>
                <button className="btn" onClick={onClose}>Volver al Inventario</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' }}>
                {/* Panel de Eventos Activos */}
                <div>
                    <h2 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={20} color="#e67e22" /> Eventos Próximos (Foco de Venta)
                    </h2>

                    {activeEvents.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {activeEvents.map(event => {
                                const recommendations = getRecommendedItems(event);
                                return (
                                    <div key={event.id} className="glass-card" style={{ padding: '24px', borderLeft: '6px solid var(--primary)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '20px' }}>{event.name}</h3>
                                                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                    FECHA: {event.triggerDate.day} / {event.triggerDate.month}
                                                </span>
                                            </div>
                                            <div style={{ backgroundColor: 'var(--primary-light)', padding: '4px 12px', borderRadius: '12px', color: 'var(--primary)', fontSize: '12px', fontWeight: 700 }}>
                                                PRIORIDAD ALTA
                                            </div>
                                        </div>

                                        <div>
                                            <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Sparkles size={14} /> PIEZAS RECOMENDADAS ({recommendations.length})
                                            </h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                                {recommendations.map(item => (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => onSelectItem(item)}
                                                        style={{
                                                            cursor: 'pointer',
                                                            borderRadius: '8px',
                                                            overflow: 'hidden',
                                                            border: '1px solid #eee',
                                                            backgroundColor: 'white',
                                                            transition: 'transform 0.2s'
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                                                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                                    >
                                                        <div style={{ height: '100px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {item.images && item.images[0] ? (
                                                                <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            ) : (
                                                                <Package size={24} color="#ccc" />
                                                            )}
                                                        </div>
                                                        <div style={{ padding: '8px', fontSize: '11px', fontWeight: 600, textAlign: 'center' }}>
                                                            {item.itemCode}
                                                        </div>
                                                    </div>
                                                ))}
                                                {recommendations.length === 0 && (
                                                    <div style={{ gridColumn: 'span 4', padding: '20px', textAlign: 'center', color: '#999', fontSize: '13px', border: '1px dashed #ddd', borderRadius: '8px' }}>
                                                        No hay piezas vinculadas a esta estrategia aún.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                            <Calendar size={48} color="#ddd" style={{ marginBottom: '16px' }} />
                            <p>No hay eventos comerciales activos en los próximos días.</p>
                        </div>
                    )}
                </div>

                {/* Sidebar de Estadísticas Rápidas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Métricas de Valor</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '13px', color: '#666' }}>Simbología completada:</span>
                                <span style={{ fontWeight: 700 }}>
                                    {allItems.length > 0
                                        ? Math.round((allItems.filter(i => i.symbology && i.symbology.length > 0).length / allItems.length) * 100)
                                        : 0}%
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '13px', color: '#666' }}>Perfilado de Cliente:</span>
                                <span style={{ fontWeight: 700 }}>
                                    {allItems.length > 0
                                        ? Math.round((allItems.filter(i => i.customerProfile && i.customerProfile.length > 0).length / allItems.length) * 100)
                                        : 0}%
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '24px', backgroundColor: '#fff8f0' }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#e67e22' }}>PRÓXIMO HIT</h4>
                        {events.find(e => {
                            const now = new Date();
                            const evDate = new Date(now.getFullYear(), e.triggerDate.month - 1, e.triggerDate.day);
                            return evDate > now;
                        }) ? (
                            <div>
                                <h3 style={{ margin: '0 0 4px 0' }}>{events.find(e => {
                                    const now = new Date();
                                    const evDate = new Date(now.getFullYear(), e.triggerDate.month - 1, e.triggerDate.day);
                                    return evDate > now;
                                })?.name}</h3>
                                <p style={{ fontSize: '12px', color: '#666' }}>Empieza a preparar el stock.</p>
                            </div>
                        ) : <p>Calculando...</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommercialDashboard;
