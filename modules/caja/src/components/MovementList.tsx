import React from 'react';
import {
    ArrowUpRight,
    ArrowDownLeft,
    Eye,
    Undo2,
    ReceiptText,
    ShieldCheck,
    History as HistoryIcon
} from 'lucide-react';
import { MovimientoCaja } from '../models/cajaSchema';
import { CajaService } from '../services/CajaService';

interface MovementListProps {
    movements: MovimientoCaja[];
    onRefresh: () => void;
    onViewInvoice: (move: MovimientoCaja) => void;
}

const MovementList: React.FC<MovementListProps> = ({ movements, onRefresh, onViewInvoice }) => {
    const handleCounterMovement = async (move: MovimientoCaja) => {
        if (!confirm(`¿Estás seguro de que quieres realizar un contra-movimiento para anular esta operación de ${move.amount}€?`)) return;

        try {
            await CajaService.counterMovement(move);
            onRefresh();
        } catch (error) {
            console.error("Error creating counter-movement:", error);
            alert("Error al realizar el contra-movimiento.");
        }
    };
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
                                        <HistoryIcon size={12} />
                                        {move.originId}
                                    </div>
                                </td>
                                <td>
                                    {move.facturaId ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <ReceiptText size={14} color="var(--accent)" />
                                            <span style={{ fontSize: '11px', fontWeight: 600 }}>{move.facturaId}</span>
                                            <ShieldCheck size={14} color="var(--success)" />
                                        </div>
                                    ) : (
                                        <span style={{ color: '#ccc', fontStyle: 'italic', fontSize: '11px' }}>Sin factura</span>
                                    )}
                                </td>
                                <td className="badge-cell">
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button
                                            title={move.facturaId ? "Ver Factura" : "Ver detalle"}
                                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: move.facturaId ? 'var(--primary)' : 'var(--text-muted)' }}
                                            onClick={() => move.facturaId && onViewInvoice(move)}
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            title="Ajuste / Contra-movimiento"
                                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--accent)' }}
                                            onClick={() => handleCounterMovement(move)}
                                        >
                                            <Undo2 size={16} />
                                        </button>
                                        {!move.facturaId && (move.type === 'VENTA' || move.type === 'COMPRA') && (
                                            <button
                                                title="Emitir Factura"
                                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--primary)' }}
                                                onClick={async () => {
                                                    if (!confirm("¿Deseas emitir la factura oficial para este movimiento?")) return;
                                                    await CajaService.generateInvoice(move.id);
                                                    onRefresh();
                                                }}
                                            >
                                                <ReceiptText size={16} />
                                            </button>
                                        )}
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
