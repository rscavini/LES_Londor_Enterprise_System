import React from 'react';
import {
    Printer,
    Download,
    Mail,
    X,
    CheckCircle,
    FileText,
    Share2
} from 'lucide-react';
import { MovimientoCaja } from '../models/cajaSchema';

interface InvoicePreviewProps {
    movement: MovimientoCaja;
    onClose: () => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ movement, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        alert("Simulando generación y descarga de PDF oficial...");
        // In a real env, we would use jsPDF or call a backend service
    }

    const handleSendEmail = () => {
        const email = prompt("Introduce el email del cliente:");
        if (email) {
            alert(`Generando JPG y enviando factura a ${email}...`);
            // In a real env, we would use html2canvas to create JPG and a mailing service
        }
    }

    // Mock data for the invoice
    const invoiceDate = movement.timestamp.toDate().toLocaleDateString('es-ES');
    const storeName = movement.storeId === 'STORE-DIP' ? 'LONDOR Diputación' : 'LONDOR Provenza';
    const storeAddress = movement.storeId === 'STORE-DIP' ? 'C/ Diputació 234, Barcelona' : 'C/ Provença 45, Barcelona';

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
            <div style={{ backgroundColor: 'white', maxWidth: '800px', width: '100%', borderRadius: '16px', display: 'flex', flexDirection: 'column', height: '90vh', boxShadow: '0 30px 60px rgba(0,0,0,0.3)' }}>
                {/* Header Actions - Non printable */}
                <div className="no-print" style={{ padding: '20px 32px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FileText size={20} color="var(--primary)" />
                        <h2 style={{ margin: 0, fontSize: '18px', fontFamily: 'Outfit' }}>Factura {movement.facturaId}</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }} onClick={handlePrint}>
                            <Printer size={16} /> Imprimir
                        </button>
                        <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }} onClick={handleDownloadPDF}>
                            <Download size={16} /> PDF
                        </button>
                        <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }} onClick={handleSendEmail}>
                            <Mail size={16} /> Enviar (JPG)
                        </button>
                        <button onClick={onClose} style={{ marginLeft: '12px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#999' }}>
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Printable Invoice Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '40px', color: '#1a1a1a', fontFamily: 'Inter, sans-serif' }}>
                    <div id="printable-invoice" style={{ maxWidth: '100%', margin: '0 auto' }}>

                        {/* Header: Company Info */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '60px' }}>
                            <div>
                                <h1 style={{ margin: 0, color: '#000', fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>LONDOR <span style={{ color: '#d4af37' }}>LES</span></h1>
                                <p style={{ margin: '8px 0 0 0', fontSize: '12px', fontWeight: 600 }}>LUXURY ENTERPRISE SYSTEM</p>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '13px' }}>
                                <p style={{ margin: 0, fontWeight: 700 }}>{storeName}</p>
                                <p style={{ margin: '4px 0' }}>{storeAddress}</p>
                                <p style={{ margin: 0 }}>NIF: B-66554433</p>
                            </div>
                        </div>

                        {/* Invoice & Client Details */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '60px', padding: '24px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666', marginBottom: '4px' }}>Factura nº</p>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: '16px' }}>{movement.facturaId}</p>
                                <p style={{ margin: '12px 0 0 0', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666', marginBottom: '4px' }}>Fecha de emisión</p>
                                <p style={{ margin: 0, fontWeight: 700 }}>{invoiceDate}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666', marginBottom: '4px' }}>Cliente</p>
                                <p style={{ margin: 0, fontWeight: 700 }}>CLIENTE DE CONTADO</p>
                                <p style={{ margin: '4px 0' }}>NIF: -</p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '60px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #000' }}>
                                    <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', textTransform: 'uppercase' }}>Descripción del concepto</th>
                                    <th style={{ textAlign: 'center', padding: '12px 0', fontSize: '12px', textTransform: 'uppercase', width: '80px' }}>CANT</th>
                                    <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '12px', textTransform: 'uppercase', width: '120px' }}>PRECIO</th>
                                    <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '12px', textTransform: 'uppercase', width: '120px' }}>TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '20px 0', fontSize: '14px' }}>
                                        {movement.type === 'COMPRA' ? 'Compra de piezas / oro a cliente' : 'Venta de activos / mercancía'}
                                        <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Ref: {movement.originId}</div>
                                    </td>
                                    <td style={{ textAlign: 'center', fontSize: '14px' }}>1</td>
                                    <td style={{ textAlign: 'right', fontSize: '14px' }}>{movement.amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                                    <td style={{ textAlign: 'right', fontSize: '14px', fontWeight: 600 }}>{movement.amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <div style={{ width: '250px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '13px' }}>Base Imponible:</span>
                                    <span style={{ fontSize: '13px' }}>{(movement.amount / 1.21).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <span style={{ fontSize: '13px' }}>IVA (21%):</span>
                                    <span style={{ fontSize: '13px' }}>{(movement.amount - (movement.amount / 1.21)).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #000', paddingTop: '16px' }}>
                                    <span style={{ fontWeight: 800, fontSize: '18px' }}>TOTAL:</span>
                                    <span style={{ fontWeight: 800, fontSize: '18px' }}>{movement.amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Legal */}
                        <div style={{ marginTop: 'auto', paddingTop: '100px', fontSize: '10px', color: '#999', lineHeight: '1.5' }}>
                            <p style={{ margin: 0 }}>Factura generada electrónicamente por Londor Enterprise System (LES). Los movimientos de caja asociados cumplen con la normativa Verifactu / TicketBAI aplicable.</p>
                            <p style={{ margin: '4px 0 0 0' }}>En cumplimiento de la LOPD, le informamos que sus datos serán tratados para la gestión administrativa propia de la transacción.</p>
                        </div>
                    </div>
                </div>

                <style>{`
                    @media print {
                        .no-print { display: none !important; }
                        body { background: white !important; }
                        div { box-shadow: none !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; }
                        @page { margin: 2cm; }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default InvoicePreview;
