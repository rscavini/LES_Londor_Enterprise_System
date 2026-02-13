import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Truck,
    Phone,
    Mail,
    MapPin,
    Globe,
    FileText,
    Edit2,
    Trash2,
    ArrowLeft,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { SupplierService } from '../services/SupplierService';
import { Supplier } from '../models/schema';
import SupplierDetails from './SupplierDetails';
import VoiceInput from './VoiceInput';

const SupplierManager: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        taxId: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        notes: ''
    });

    useEffect(() => {
        loadSuppliers();
    }, []);

    const loadSuppliers = async () => {
        setLoading(true);
        try {
            const data = await SupplierService.getAll();
            setSuppliers(data);
        } catch (error) {
            console.error("Error loading suppliers:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);
    };

    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm) ||
        supplier.taxId?.toLowerCase().includes(searchTerm) ||
        supplier.contactPerson?.toLowerCase().includes(searchTerm) ||
        supplier.email?.toLowerCase().includes(searchTerm)
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const supplierData = {
                ...formData,
                isActive: true
            };

            if (editingId) {
                await SupplierService.update(editingId, supplierData);
            } else {
                await SupplierService.create({
                    ...supplierData,
                    createdBy: 'admin'
                });
            }
            resetForm();
            loadSuppliers();
        } catch (error) {
            console.error("Error saving supplier:", error);
        }
    };

    const handleEdit = (supplier: Supplier) => {
        setFormData({
            name: supplier.name,
            taxId: supplier.taxId || '',
            contactPerson: supplier.contactPerson || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            address: supplier.address || '',
            website: supplier.website || '',
            notes: supplier.notes || ''
        });
        setEditingId(supplier.id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Desea eliminar este proveedor?')) {
            await SupplierService.deleteLogic(id);
            loadSuppliers();
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            taxId: '',
            contactPerson: '',
            email: '',
            phone: '',
            address: '',
            website: '',
            notes: ''
        });
        setEditingId(null);
        setIsAdding(false);
    };

    if (selectedSupplier) {
        return <SupplierDetails supplier={selectedSupplier} onBack={() => setSelectedSupplier(null)} />;
    }

    return (
        <div className="container" style={{ paddingBottom: '60px' }}>
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Gestión de Proveedores</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Administra la información de tus proveedores y contactos</p>
                </div>
                {!isAdding && (
                    <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
                        <Plus size={20} /> Nuevo Proveedor
                    </button>
                )}
            </header>

            {isAdding ? (
                <div className="glass-card" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                        <button className="btn" onClick={resetForm} style={{ padding: '8px' }}>
                            <ArrowLeft size={20} />
                        </button>
                        <h2 style={{ margin: 0 }}>{editingId ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}</h2>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Nombre Empresa / Comercial</label>
                            <input
                                required
                                className="form-control"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Nombre..."
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>CIF / NIF</label>
                            <input
                                className="form-control"
                                value={formData.taxId}
                                onChange={e => setFormData({ ...formData, taxId: e.target.value })}
                                placeholder="Identificación Fiscal..."
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Persona de Contacto</label>
                            <input
                                className="form-control"
                                value={formData.contactPerson}
                                onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                                placeholder="Nombre del contacto..."
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Teléfono</label>
                            <input
                                className="form-control"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="Teléfono..."
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Correo Electrónico</label>
                            <input
                                type="email"
                                className="form-control"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="correo@ejemplo.com"
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Sitio Web</label>
                            <input
                                type="url"
                                className="form-control"
                                value={formData.website}
                                onChange={e => setFormData({ ...formData, website: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Dirección</label>
                            <textarea
                                className="form-control"
                                rows={2}
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Dirección completa..."
                            />
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label style={{ margin: 0, fontWeight: 600, fontSize: '13px' }}>Notas Adicionales</label>
                                <VoiceInput onResult={(text) => setFormData(prev => ({ ...prev, notes: prev.notes + (prev.notes ? ' ' : '') + text }))} />
                            </div>
                            <textarea
                                className="form-control"
                                rows={3}
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Notas internas, condiciones, etc."
                            />
                        </div>

                        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', marginTop: '12px' }}>
                            <button type="button" className="btn" onClick={resetForm} style={{ flex: 1 }}>Cancelar</button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                                {editingId ? 'Guardar Cambios' : 'Crear Proveedor'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    <div className="glass-card" style={{ padding: '12px 20px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Search size={18} color="var(--text-muted)" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, CIF, contacto o email..."
                            style={{
                                border: 'none',
                                background: 'transparent',
                                width: '100%',
                                padding: '8px 0',
                                outline: 'none',
                                fontSize: '15px'
                            }}
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '100px 0' }}>
                            <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                            <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Cargando proveedores...</p>
                        </div>
                    ) : (
                        <div className="glass-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                            {filteredSuppliers.length > 0 ? filteredSuppliers.map(supplier => (
                                <div key={supplier.id} className="glass-card supplier-card" style={{ padding: '24px', transition: 'all 0.3s' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                        <div style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: '16px',
                                            backgroundColor: 'var(--primary-light)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--primary)'
                                        }}>
                                            <Truck size={28} />
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => handleEdit(supplier)}
                                                className="btn-icon"
                                                style={{ background: '#f8f9fa', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                                            >
                                                <Edit2 size={16} color="var(--text-muted)" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(supplier.id)}
                                                className="btn-icon"
                                                style={{ background: '#fff5f5', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={16} color="var(--error)" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 style={{ marginBottom: '4px', fontSize: '1.2rem' }}>{supplier.name}</h3>
                                    {supplier.contactPerson && (
                                        <p style={{ margin: '0 0 16px', color: 'var(--text-muted)', fontSize: '14px' }}>
                                            Contacto: <strong>{supplier.contactPerson}</strong>
                                        </p>
                                    )}

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #f1f1f1', paddingTop: '20px' }}>
                                        {supplier.taxId && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
                                                <FileText size={16} color="var(--primary)" />
                                                <span>{supplier.taxId}</span>
                                            </div>
                                        )}
                                        {supplier.phone && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
                                                <Phone size={16} color="var(--primary)" />
                                                <span>{supplier.phone}</span>
                                            </div>
                                        )}
                                        {supplier.email && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
                                                <Mail size={16} color="var(--primary)" />
                                                <span style={{
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>{supplier.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                                        <button
                                            className="btn"
                                            onClick={() => setSelectedSupplier(supplier)}
                                            style={{
                                                background: 'none',
                                                border: '1px solid var(--primary)',
                                                color: 'var(--primary)',
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                padding: '8px 16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                borderRadius: '8px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            VER FICHA COMPLETA <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                                    <Truck size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                                    <h3>No se encontraron proveedores</h3>
                                    <p>Intenta con otro término de búsqueda o registra un nuevo proveedor.</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SupplierManager;
