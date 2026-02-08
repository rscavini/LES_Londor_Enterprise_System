import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Truck,
    Phone,
    Mail,
    MapPin,
    Globe,
    FileText,
    Package,
    Calendar,
    ChevronRight,
    Search,
    Loader2
} from 'lucide-react';
import { Supplier, InventoryItem } from '../models/schema';
import { InventoryService } from '../services/InventoryService';

interface SupplierDetailsProps {
    supplier: Supplier;
    onBack: () => void;
}

const SupplierDetails: React.FC<SupplierDetailsProps> = ({ supplier, onBack }) => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadSupplierItems();
    }, [supplier.id]);

    const loadSupplierItems = async () => {
        setLoading(true);
        try {
            const data = await InventoryService.getBySupplier(supplier.id);
            setItems(data);
        } catch (error) {
            console.error("Error loading supplier items:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalValue = items.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);

    return (
        <div className="container" style={{ paddingBottom: '60px' }}>
            {/* Header / Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button
                    className="btn-icon"
                    onClick={onBack}
                    style={{
                        background: 'white',
                        border: '1px solid #eee',
                        padding: '10px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                >
                    <ArrowLeft size={20} color="var(--text-muted)" />
                </button>
                <div>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>FICHA DE PROVEEDOR</span>
                    <h1 style={{ margin: 0, fontSize: '2rem' }}>{supplier.name}</h1>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
                {/* Information Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="glass-card" style={{ padding: '32px', position: 'sticky', top: '100px' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '24px',
                            backgroundColor: 'var(--primary-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary)',
                            marginBottom: '24px'
                        }}>
                            <Truck size={40} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <section>
                                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Contacto Principal</label>
                                <div style={{ marginTop: '8px', fontSize: '16px', fontWeight: 600 }}>{supplier.contactPerson || 'No especificado'}</div>
                            </section>

                            <div style={{ height: '1px', backgroundColor: '#f1f1f1' }} />

                            <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {supplier.taxId && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <FileText size={18} color="var(--primary)" />
                                        <div style={{ fontSize: '14px' }}>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>CIF / NIF</div>
                                            <div>{supplier.taxId}</div>
                                        </div>
                                    </div>
                                )}
                                {supplier.phone && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Phone size={18} color="var(--primary)" />
                                        <div style={{ fontSize: '14px' }}>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>TELÉFONO</div>
                                            <div>{supplier.phone}</div>
                                        </div>
                                    </div>
                                )}
                                {supplier.email && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Mail size={18} color="var(--primary)" />
                                        <div style={{ fontSize: '14px', overflow: 'hidden' }}>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>EMAIL</div>
                                            <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{supplier.email}</div>
                                        </div>
                                    </div>
                                )}
                                {supplier.website && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Globe size={18} color="var(--primary)" />
                                        <div style={{ fontSize: '14px' }}>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>SITIO WEB</div>
                                            <a href={supplier.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                                                {supplier.website.replace(/^https?:\/\//, '')}
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {supplier.address && (
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                        <MapPin size={18} color="var(--primary)" style={{ marginTop: '2px' }} />
                                        <div style={{ fontSize: '14px' }}>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>DIRECCIÓN</div>
                                            <div style={{ opacity: 0.8 }}>{supplier.address}</div>
                                        </div>
                                    </div>
                                )}
                            </section>

                            <div style={{ height: '1px', backgroundColor: '#f1f1f1' }} />

                            <section>
                                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Notas Internas</label>
                                <p style={{ marginTop: '8px', fontSize: '14px', color: '#666', lineHeight: '1.5', fontStyle: supplier.notes ? 'normal' : 'italic' }}>
                                    {supplier.notes || 'Sin notas adicionales.'}
                                </p>
                            </section>

                            <div style={{ height: '1px', backgroundColor: '#f1f1f1' }} />

                            <section>
                                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Miembro Desde</label>
                                <div style={{ marginTop: '8px', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Calendar size={18} color="var(--primary)" />
                                    <span>{supplier.createdAt?.toLocaleDateString() || 'No disponible'}</span>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                {/* Products / History Section */}
                <div>
                    {/* Stats Bricks */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ padding: '12px', background: '#f0fdf4', color: '#16a34a', borderRadius: '12px' }}>
                                <Package size={24} />
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>PRODUCTOS SUMINISTRADOS</div>
                                <div style={{ fontSize: '24px', fontWeight: 800 }}>{items.length}</div>
                            </div>
                        </div>
                        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ padding: '12px', background: '#fef2f2', color: '#dc2626', borderRadius: '12px' }}>
                                <FileText size={24} />
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>VALOR DE INVENTARIO</div>
                                <div style={{ fontSize: '24px', fontWeight: 800 }}>{totalValue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="glass-card" style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0 }}>Catálogo de Artículos</h3>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
                                <input
                                    type="text"
                                    placeholder="Buscar artículo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        padding: '8px 12px 8px 36px',
                                        borderRadius: '8px',
                                        border: '1px solid #eee',
                                        fontSize: '14px',
                                        outline: 'none',
                                        width: '250px'
                                    }}
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                                <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Cargando artículos...</p>
                            </div>
                        ) : filteredItems.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {filteredItems.map(item => (
                                    <div key={item.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        padding: '16px',
                                        borderRadius: '16px',
                                        border: '1px solid #f8f9fa',
                                        backgroundColor: '#fafafa',
                                        transition: 'all 0.2s'
                                    }}>
                                        <div style={{
                                            width: '64px',
                                            height: '64px',
                                            borderRadius: '12px',
                                            backgroundColor: '#fff',
                                            padding: '4px',
                                            border: '1px solid #eee'
                                        }}>
                                            {item.images?.[0] ? (
                                                <img
                                                    src={item.images[0]}
                                                    alt={item.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                                                />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eee' }}>
                                                    <Package size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 800 }}>{item.itemCode}</div>
                                            <div style={{ fontWeight: 600, fontSize: '15px' }}>{item.name}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.description.substring(0, 60)}...</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                                                {item.purchasePrice?.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Precio Compra</div>
                                        </div>
                                        <button className="btn-icon" style={{ padding: '8px' }}>
                                            <ChevronRight size={18} color="var(--text-muted)" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                                <Package size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
                                <div>No se han encontrado artículos para este proveedor.</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplierDetails;
