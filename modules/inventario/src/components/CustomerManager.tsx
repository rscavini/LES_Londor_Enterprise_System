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
    Loader2,
    Calendar,
    Star,
    Hash,
    Ruler,
    Heart,
    Cake
} from 'lucide-react';
import { CustomerService } from '../services/CustomerService';
import { Customer } from '../models/schema';

const CustomerManager: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null); // This was already here? Let me check
    const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
    const [activeFormTab, setActiveFormTab] = useState<'general' | 'profile' | 'advanced'>('general');

    const [formData, setFormData] = useState<Omit<Customer, 'id' | 'createdAt' | 'isActive' | 'createdBy' | 'updatedAt'> & { preferences: NonNullable<Customer['preferences']> }>({
        firstName: '',
        lastName: '',
        dni: '',
        phone: '',
        email: '',
        address: '',
        birthDate: '',
        gender: 'NA' as 'M' | 'F' | 'OTHER' | 'NA',
        preferences: {
            preferredMaterials: [] as string[],
            ringSize: '',
            necklaceLength: '',
            style: [] as string[]
        },
        importantDates: [] as { label: string, date: string }[],
        loyaltyPoints: 0,
        clientLevel: 'BRONZE' as 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'VIP',
        notes: '',
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
            birthDate: customer.birthDate || '',
            gender: customer.gender || 'NA',
            preferences: customer.preferences || {
                preferredMaterials: [],
                ringSize: '',
                necklaceLength: '',
                style: []
            },
            importantDates: customer.importantDates || [],
            loyaltyPoints: customer.loyaltyPoints || 0,
            clientLevel: customer.clientLevel || 'BRONZE',
            notes: customer.notes || '',
            tags: customer.tags || []
        });
        setEditingId(customer.id);
        setIsAdding(true);
        setActiveFormTab('general');
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
            birthDate: '',
            gender: 'NA',
            preferences: {
                preferredMaterials: [],
                ringSize: '',
                necklaceLength: '',
                style: []
            },
            importantDates: [],
            loyaltyPoints: 0,
            clientLevel: 'BRONZE',
            notes: '',
            tags: []
        });
        setEditingId(null);
        setIsAdding(false);
        setActiveFormTab('general');
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
                <div className="glass-card" style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                        <button className="btn" onClick={resetForm} style={{ padding: '8px' }}>
                            <ArrowLeft size={20} />
                        </button>
                        <h2 style={{ margin: 0 }}>{editingId ? 'Editar Perfil Premium' : 'Registro de Cliente Premium'}</h2>
                    </div>

                    {/* Tabs Navigation */}
                    <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', borderBottom: '1px solid #eee' }}>
                        {(['general', 'profile', 'advanced'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveFormTab(tab)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '12px 4px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    color: activeFormTab === tab ? 'var(--accent)' : 'var(--text-muted)',
                                    borderBottom: activeFormTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {tab === 'general' ? 'Información General' : tab === 'profile' ? 'Perfil y Tallas' : 'Asuntos Avanzados'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit}>
                        {activeFormTab === 'general' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
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
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Fecha de Nacimiento</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={formData.birthDate}
                                        onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Género</label>
                                    <select
                                        className="form-control"
                                        value={formData.gender}
                                        onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                                    >
                                        <option value="NA">No especificado</option>
                                        <option value="M">Masculino</option>
                                        <option value="F">Femenino</option>
                                        <option value="OTHER">Otro</option>
                                    </select>
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
                            </div>
                        )}

                        {activeFormTab === 'profile' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Talla de Anillo (US/EU)</label>
                                    <input
                                        className="form-control"
                                        value={formData.preferences.ringSize}
                                        onChange={e => setFormData({
                                            ...formData,
                                            preferences: { ...formData.preferences, ringSize: e.target.value }
                                        })}
                                        placeholder="Ej. 14 / Large"
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Longitud Collar (cm)</label>
                                    <input
                                        className="form-control"
                                        value={formData.preferences.necklaceLength}
                                        onChange={e => setFormData({
                                            ...formData,
                                            preferences: { ...formData.preferences, necklaceLength: e.target.value }
                                        })}
                                        placeholder="Ej. 45cm"
                                    />
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Materiales Preferidos</label>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        {['Oro Amarillo', 'Oro Blanco', 'Plata', 'Platino', 'Diamantes', 'Gemas Color'].map(mat => (
                                            <label key={mat} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.preferences.preferredMaterials?.includes(mat)}
                                                    onChange={e => {
                                                        const current = formData.preferences.preferredMaterials || [];
                                                        const updated = e.target.checked
                                                            ? [...current, mat]
                                                            : current.filter(m => m !== mat);
                                                        setFormData({
                                                            ...formData,
                                                            preferences: { ...formData.preferences, preferredMaterials: updated }
                                                        });
                                                    }}
                                                />
                                                {mat}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Estilo Predominante</label>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        {['Clásico', 'Vintage', 'Minimalista', 'Moderno', 'Boho', 'Alta Joyería'].map(style => (
                                            <label key={style} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.preferences.style?.includes(style)}
                                                    onChange={e => {
                                                        const current = formData.preferences.style || [];
                                                        const updated = e.target.checked
                                                            ? [...current, style]
                                                            : current.filter(s => s !== style);
                                                        setFormData({
                                                            ...formData,
                                                            preferences: { ...formData.preferences, style: updated }
                                                        });
                                                    }}
                                                />
                                                {style}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeFormTab === 'advanced' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Nivel de Cliente</label>
                                    <select
                                        className="form-control"
                                        value={formData.clientLevel}
                                        onChange={e => setFormData({ ...formData, clientLevel: e.target.value as any })}
                                    >
                                        <option value="BRONZE">Bronce</option>
                                        <option value="SILVER">Plata</option>
                                        <option value="GOLD">Oro</option>
                                        <option value="PLATINUM">Platino</option>
                                        <option value="VIP">VIP</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Puntos acumulados</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={formData.loyaltyPoints}
                                        onChange={e => setFormData({ ...formData, loyaltyPoints: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Dirección de Entrega</label>
                                    <textarea
                                        className="form-control"
                                        rows={2}
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Dirección completa..."
                                    />
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Notas Internas / Preferencias Extra</label>
                                    <textarea
                                        className="form-control"
                                        rows={4}
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Anotaciones sobre gustos específicos, alergias, o trato preferencial..."
                                    />
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px', marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #eee' }}>
                            <button type="button" className="btn" onClick={resetForm} style={{ flex: 1 }}>Cancelar</button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                                {editingId ? 'Guardar Cambios Premium' : 'Crear Ficha Premium'}
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
                                        <div style={{ position: 'relative' }}>
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
                                            {customer.clientLevel && customer.clientLevel !== 'BRONZE' && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: -8,
                                                    right: -8,
                                                    background: customer.clientLevel === 'VIP' ? '#ffd700' : customer.clientLevel === 'PLATINUM' ? '#e5e4e2' : '#ffa500',
                                                    color: '#000',
                                                    fontSize: '10px',
                                                    fontWeight: 800,
                                                    padding: '2px 6px',
                                                    borderRadius: '10px',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}>
                                                    {customer.clientLevel}
                                                </div>
                                            )}
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
                                    </div>

                                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => setViewingCustomer(customer)}
                                            className="btn"
                                            style={{
                                                background: 'none',
                                                border: '1px solid var(--primary)',
                                                color: 'var(--primary)',
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                padding: '8px 16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            VER FICHA COMPLETA <ChevronRight size={14} />
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

            {/* Ficha Premium Modal */}
            {viewingCustomer && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div className="glass-card" style={{
                        width: '100%',
                        maxWidth: '800px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        padding: '40px',
                        position: 'relative',
                        backgroundColor: '#fff'
                    }}>
                        <button
                            onClick={() => setViewingCustomer(null)}
                            style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <Plus size={24} style={{ transform: 'rotate(45deg)' }} color="var(--text-muted)" />
                        </button>

                        <div style={{ display: 'flex', gap: '32px', marginBottom: '40px', alignItems: 'center' }}>
                            <div style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '24px',
                                backgroundColor: 'var(--primary-light)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary)'
                            }}>
                                <User size={48} />
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                    <h2 style={{ margin: 0, fontSize: '2rem' }}>{viewingCustomer.firstName} {viewingCustomer.lastName}</h2>
                                    <span style={{
                                        backgroundColor: viewingCustomer.clientLevel === 'VIP' ? '#ffd700' : '#f1f1f1',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: 800
                                    }}>{viewingCustomer.clientLevel}</span>
                                </div>
                                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Cliente desde {viewingCustomer.createdAt?.toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                            <div>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--primary)' }}>
                                    <Hash size={18} /> Datos de Identidad
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>DNI/ID:</span>
                                        <span style={{ fontWeight: 600 }}>{viewingCustomer.dni || '---'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Teléfono:</span>
                                        <span style={{ fontWeight: 600 }}>{viewingCustomer.phone}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                                        <span style={{ fontWeight: 600 }}>{viewingCustomer.email || '---'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Cumpleaños:</span>
                                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Cake size={14} /> {viewingCustomer.birthDate || '---'}
                                        </span>
                                    </div>
                                </div>

                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '32px', marginBottom: '16px', color: 'var(--primary)' }}>
                                    <Star size={18} /> Fidelización
                                </h4>
                                <div style={{ padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span>Puntos LONDOR:</span>
                                        <span style={{ fontWeight: 800, color: 'var(--accent)' }}>{viewingCustomer.loyaltyPoints || 0} pts</span>
                                    </div>
                                    <div style={{ height: '6px', backgroundColor: '#eee', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: `${Math.min((viewingCustomer.loyaltyPoints || 0) / 10, 100)}%`, height: '100%', backgroundColor: 'var(--accent)' }}></div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--primary)' }}>
                                    <Ruler size={18} /> Perfil y Tallas
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Talla Anillo:</span>
                                        <span style={{ fontWeight: 600 }}>{viewingCustomer.preferences?.ringSize || '---'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Collar (cm):</span>
                                        <span style={{ fontWeight: 600 }}>{viewingCustomer.preferences?.necklaceLength || '---'}</span>
                                    </div>
                                    <div>
                                        <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Estilo:</span>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {viewingCustomer.preferences?.style?.map(s => (
                                                <span key={s} style={{ fontSize: '11px', backgroundColor: '#eee', padding: '2px 8px', borderRadius: '4px' }}>{s}</span>
                                            )) || 'Sin definir'}
                                        </div>
                                    </div>
                                    <div>
                                        <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Materiales:</span>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {viewingCustomer.preferences?.preferredMaterials?.map(m => (
                                                <span key={m} style={{ fontSize: '11px', border: '1px solid #eee', padding: '2px 8px', borderRadius: '4px' }}>{m}</span>
                                            )) || 'Sin definir'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '1px solid #eee' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--primary)' }}>
                                <Heart size={18} /> Notas y Observaciones
                            </h4>
                            <p style={{ fontStyle: viewingCustomer.notes ? 'normal' : 'italic', color: viewingCustomer.notes ? 'inherit' : 'var(--text-muted)' }}>
                                {viewingCustomer.notes || 'No hay notas adicionales para este cliente.'}
                            </p>
                        </div>

                        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => { setViewingCustomer(null); handleEdit(viewingCustomer); }}
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                            >
                                Editar Ficha
                            </button>
                            <button
                                onClick={() => setViewingCustomer(null)}
                                className="btn"
                                style={{ flex: 1 }}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerManager;
