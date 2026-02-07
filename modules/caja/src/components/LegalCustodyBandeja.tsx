import React, { useState, useEffect } from 'react';
import {
    Clock,
    Unlock,
    AlertTriangle,
    Search,
    ChevronRight,
    Camera
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../../inventario/src/firebase';
import { FichaLegalCompra } from '../models/cajaSchema';

const LegalCustodyBandeja: React.FC = () => {
    const [fichas, setFichas] = useState<FichaLegalCompra[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFichas();
    }, []);

    const loadFichas = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, "fichas_legales_compra"),
                where("status", "in", ["CUSTODIA", "INCIDENCIA"]),
                orderBy("custodyEndDate", "asc")
            );
            const snapshot = await getDocs(q);
            setFichas(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FichaLegalCompra)));
        } catch (error) {
            console.error("Error loading legal custody items:", error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysRemaining = (endDate: Timestamp) => {
        const diff = endDate.toDate().getTime() - new Date().getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days;
    };

    if (loading) return <div className="p-8">Cargando bandeja de custodia...</div>;

    return (
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Clock size={20} color="var(--accent)" />
                    <h3 style={{ margin: 0 }}>Bandeja de Custodia Legal (15 días)</h3>
                </div>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} />
                    <input type="text" className="form-control" placeholder="Buscar cliente o ficha..." style={{ paddingLeft: '40px' }} />
                </div>
            </div>

            <table className="excel-table">
                <thead>
                    <tr>
                        <th>FICHA</th>
                        <th>CLIENTE</th>
                        <th>FECHA COMPRA</th>
                        <th>FIN CUSTODIA</th>
                        <th>ESTADO</th>
                        <th>DÍAS REST.</th>
                        <th style={{ textAlign: 'center' }}>ACCIONES</th>
                    </tr>
                </thead>
                <tbody>
                    {fichas.length === 0 ? (
                        <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                                No hay piezas en periodo de custodia legal.
                            </td>
                        </tr>
                    ) : (
                        fichas.map(ficha => {
                            const daysRest = getDaysRemaining(ficha.custodyEndDate);
                            const isReady = daysRest <= 0;

                            return (
                                <tr key={ficha.id}>
                                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{ficha.id.substring(0, 8).toUpperCase()}</td>
                                    <td>{ficha.clientId}</td>
                                    <td>-</td>
                                    <td className="date">{ficha.custodyEndDate.toDate().toLocaleDateString()}</td>
                                    <td>
                                        <span className={`excel-badge ${ficha.status === 'INCIDENCIA' ? 'excel-badge-warning' : (isReady ? 'excel-badge-success' : 'excel-badge-primary')}`}>
                                            {ficha.status === 'INCIDENCIA' ? 'Incidencia' : (isReady ? 'Lista para liberar' : 'En Custodia')}
                                        </span>
                                    </td>
                                    <td className="number" style={{ fontWeight: 800, color: isReady ? 'var(--success)' : (daysRest < 3 ? 'var(--error)' : 'inherit') }}>
                                        {isReady ? '0' : daysRest} d
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                            <button className="btn" style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: '#f0f0f0' }}>
                                                <Camera size={14} /> Ficha
                                            </button>
                                            <button
                                                className="btn btn-accent"
                                                disabled={!isReady || ficha.status === 'INCIDENCIA'}
                                                style={{ padding: '6px 12px', fontSize: '11px', opacity: (!isReady || ficha.status === 'INCIDENCIA') ? 0.5 : 1 }}
                                            >
                                                <Unlock size={14} /> Liberar
                                            </button>
                                            <button className="btn" style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: '#fff5f5', color: 'var(--error)' }}>
                                                <AlertTriangle size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default LegalCustodyBandeja;
