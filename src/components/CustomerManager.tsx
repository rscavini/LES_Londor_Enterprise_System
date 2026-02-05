import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    User,
    Phone,
    Mail,
    CreditCard,
    MapPin,
    Tag,
    Edit2,
    Trash2,
    ArrowLeft,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { CustomerService } from '../services/CustomerService';
import { Customer } from '../models/schema';

const CustomerManager: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dni: '',
        phone: '',
        email: '',
        address: '',
        tags: [] as string[]
    });

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        setLoading(true);
        try {
            const data = await CustomerService.getAll();
            setCustomers(data);
        } catch (error) {
            console.error("Error loading customers:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.trim() === '') {
            loadCustomers();
        } else {
            const results = await CustomerService.search(value);
            setCustomers(results);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await CustomerService.update(editingId, formData);
            } else {
                await CustomerService.create({
                    ...formData,
                    createdBy: 'admin'
                });
            }
            resetForm();
            loadCustomers();
        } catch (error) {
            console.error("Error saving customer:", error);
        }
    };

    const handleEdit = (customer: Customer) => {
        setFormData({
            firstName: customer.firstName,
            lastName: customer.lastName,
            dni: customer.dni || '',
            phone: customer.phone,
            email: customer.email || '',
            address: customer.address || '',
            tags: customer.tags || []
        });
        setEditingId(customer.id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Desea desactivar este cliente?')) {
            await CustomerService.deleteLogic(id);
            loadCustomers();
        }
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            dni: '',
            phone: '',
            email: '',
            address: '',
            tags: []
        });
        setEditingId(null);
        setIsAdding(false);
    };

    return (
        <div className="container" style={{ paddingBottom: '60px' }}>
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Directorio de Clientes</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Gestión de identidades para ventas y apartados</p>
                </div>
                {!isAdding && (
                    <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
                        <Plus size={20} /> Nuevo Cliente
                    </button>
                )}
            </header>

            {isAdding ? (
                <div className="glass-card" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                        <button className="btn" onClick={resetForm} style={{ padding: '8px' }}>
                            <ArrowLeft size={20} />
                        </button>
                        <h2 style={{ margin: 0 }}>{editingId ? 'Editar Perfil de Cliente' : 'Registrar Nuevo Cliente'}</h2>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Nombre</label>
                            <input
                                required
                                className="form-control"
                                value={formData.firstName}
                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                placeholder="Nombre..."
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Apellidos</label>
                            <input
                                required
                                className="form-control"
                                value={formData.lastName}
                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                placeholder="Apellidos..."
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>DNI / Identificación</label>
                            <input
                                className="form-control"
                                value={formData.dni}
                                onChange={e => setFormData({ ...formData, dni: e.target.value })}
                                placeholder="Ej. 12345678X"
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Teléfono</label>
                            <input
                                required
                                className="form-control"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="Ej. +34 600 000 000"
                            />
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Correo Electrónico</label>
                            <input
                                type="email"
                                className="form-control"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="correo@ejemplo.com"
                            />
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Dirección</label>
                            <textarea
                                className="form-control"
                                rows={3}
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Dirección completa..."
                            />
                        </div>

                        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', marginTop: '12px' }}>
                            <button type="button" className="btn" onClick={resetForm} style={{ flex: 1 }}>Cancelar</button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                                {editingId ? 'Guardar Cambios' : 'Crear Cliente'}
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
                            placeholder="Buscar por nombre, apellidos, DNI o teléfono..."
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
                            <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Cargando base de datos...</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                            {customers.length > 0 ? customers.map(customer => (
                                <div key={customer.id} className="glass-card customer-card" style={{ padding: '24px', transition: 'all 0.3s' }}>
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
                                            <User size={28} />
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => handleEdit(customer)}
                                                className="btn-icon"
                                                style={{ background: '#f8f9fa', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                                            >
                                                <Edit2 size={16} color="var(--text-muted)" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(customer.id)}
                                                className="btn-icon"
                                                style={{ background: '#fff5f5', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={16} color="var(--error)" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 style={{ marginBottom: '4px', fontSize: '1.2rem' }}>{customer.firstName} {customer.lastName}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
                                        <CreditCard size={14} />
                                        <span>{customer.dni || 'Sin DNI'}</span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #f1f1f1', paddingTop: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
                                            <Phone size={16} color="var(--primary)" />
                                            <span>{customer.phone}</span>
                                        </div>
                                        {customer.email && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
                                                <Mail size={16} color="var(--primary)" />
                                                <span style={{
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>{customer.email}</span>
                                            </div>
                                        )}
                                        {customer.address && (
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px' }}>
                                                <MapPin size={16} color="var(--primary)" style={{ marginTop: '2px' }} />
                                                <span style={{ opacity: 0.8 }}>{customer.address}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                                        <button className="btn" style={{
                                            background: 'none',
                                            border: '1px solid var(--primary)',
                                            color: 'var(--primary)',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            padding: '8px 16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            VER HISTORIAL <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                                    <User size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                                    <h3>No se encontraron clientes</h3>
                                    <p>Intenta con otro término de búsqueda o registra un nuevo cliente.</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CustomerManager;
