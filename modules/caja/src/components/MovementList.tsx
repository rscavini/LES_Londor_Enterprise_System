import React from 'react';
import {
    ArrowUpRight,
    ArrowDownLeft,
    Eye,
    Undo2,
    ReceiptText,
    ShieldCheck
} from 'lucide-react';
import { MovimientoCaja } from '../models/cajaSchema';

interface MovementListProps {
    movements: MovimientoCaja[];
}

const MovementList: React.FC<MovementListProps> = ({ movements }) => {
    return (
        <div className="excel-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="excel-table">
                <thead>
                    <tr>
                        <th style={{ width: '80px' }}>HORA</th>
                        <th style={{ width: '150px' }}>TIPO</th>
                        <th style={{ width: '100px' }}>IMPORTE</th>
                        <th style={{ width: '120px' }}>MEDIO PAGO</th>
                        <th style={{ width: '120px' }}>USUARIO</th>
                        <th style={{ width: '120px' }}>ORIGEN</th>
                        <th style={{ width: '120px' }}>FACTURA</th>
                        <th style={{ width: '60px' }}>ACCIONES</th>
                    </tr>
                </thead>
                <tbody>
                    {movements.length === 0 ? (
                        <tr>
                            <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                No hay movimientos registrados en esta sesión.
                            </td>
                        </tr>
                    ) : (
                        movements.map(move => (
                            <tr key={move.id}>
                                <td className="date">
                                    {move.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {move.direction === 'IN' ? (
                                            <ArrowUpRight size={16} color="var(--success)" />
                                        ) : (
                                            <ArrowDownLeft size={16} color="var(--error)" />
                                        )}
                                        <span style={{ fontWeight: 600, fontSize: '11px' }}>{move.type}</span>
                                    </div>
                                </td>
                                <td className="number" style={{ fontWeight: 700, color: move.direction === 'IN' ? 'var(--success)' : 'var(--error)' }}>
                                    {move.direction === 'OUT' && '-'}{move.amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                </td>
                                <td>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{move.paymentMethod}</span>
                                </td>
                                <td>{move.userId}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--accent)' }}>
                                        <History size={12} />
                                        {move.originId}
                                    </div>
                                </td>
                                <td>
                                    {move.facturaId ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <ReceiptText size={14} color="var(--accent)" />
                                            <span style={{ fontSize: '11px', fontWeight: 600 }}>{move.facturaId}</span>
                                            <ShieldCheck size={14} color="var(--success)" title="Verifactu OK" />
                                        </div>
                                    ) : (
                                        <span style={{ color: '#ccc', fontStyle: 'italic', fontSize: '11px' }}>Sin factura</span>
                                    )}
                                </td>
                                <td className="badge-cell">
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button title="Ver detalle" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                            <Eye size={16} />
                                        </button>
                                        <button title="Ajuste / Contra-movimiento" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                            <Undo2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default MovementList;
