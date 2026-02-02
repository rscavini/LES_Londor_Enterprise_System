import React, { useState } from 'react';
import {
    ArrowLeft,
    MapPin,
    Phone,
    Mail,
    User,
    CheckCircle,
    Star,
    Clock,
    Package,
    FileText,
    ExternalLink,
    MoreHorizontal,
    Plus,
    Activity
} from 'lucide-react';
import { Location, WorkshopSpecialty } from '../models/schema';

interface Props {
    location: Location;
    onBack: () => void;
    onSave: (updates: Partial<Location>) => void;
}

const LocationDetailView: React.FC<Props> = ({ location, onBack, onSave }) => {
    const [activeTab, setActiveTab] = useState<'orders' | 'history' | 'docs'>('orders');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ ...location });

    const specialties: WorkshopSpecialty[] = ['Pulido', 'Engaste', 'Grabado', 'Ajuste de Talla', 'Reparación General', 'Limpieza'];

    const handleToggleSpecialty = (s: WorkshopSpecialty) => {
        const current = editData.metadata?.specialties || [];
        const next = current.includes(s)
            ? current.filter(x => x !== s)
            : [...current, s];

        setEditData({
            ...editData,
            metadata: {
                ...editData.metadata,
                specialties: next
            }
        });
    };

    const handleSave = () => {
        onSave(editData);
        setIsEditing(false);
    };

    const renderWorkshopSideInfo = () => (
        <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent)' }}>
                <Activity size={24} />
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Información del Taller</h3>
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Nombre del Taller
                </label>
                <input
                    className="form-control"
                    disabled={!isEditing}
                    value={editData.name}
                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}
                />
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Persona de Contacto
                </label>
                <input
                    className="form-control"
                    disabled={!isEditing}
                    value={editData.metadata?.contactPerson || ''}
                    onChange={e => setEditData({ ...editData, metadata: { ...editData.metadata, contactPerson: e.target.value } })}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Teléfono</label>
                    <input
                        className="form-control"
                        disabled={!isEditing}
                        value={editData.metadata?.phone || ''}
                        onChange={e => setEditData({ ...editData, metadata: { ...editData.metadata, phone: e.target.value } })}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Email</label>
                    <input
                        className="form-control"
                        disabled={!isEditing}
                        value={editData.metadata?.email || ''}
                        onChange={e => setEditData({ ...editData, metadata: { ...editData.metadata, email: e.target.value } })}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}
                    />
                </div>
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Dirección</label>
                <textarea
                    className="form-control"
                    disabled={!isEditing}
                    rows={3}
                    value={editData.metadata?.address || ''}
                    onChange={e => setEditData({ ...editData, metadata: { ...editData.metadata, address: e.target.value } })}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #eee', resize: 'none' }}
                />
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Especialidades</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {specialties.map(s => (
                        <div key={s}
                            onClick={() => isEditing && handleToggleSpecialty(s)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid #eee',
                                backgroundColor: editData.metadata?.specialties?.includes(s) ? 'rgba(241, 196, 15, 0.1)' : 'white',
                                color: editData.metadata?.specialties?.includes(s) ? '#d4ac0d' : 'var(--text-main)',
                                cursor: isEditing ? 'pointer' : 'default',
                                fontSize: '13px',
                                fontWeight: 500,
                                transition: 'all 0.2s'
                            }}>
                            <CheckCircle size={16} color={editData.metadata?.specialties?.includes(s) ? '#f1c40f' : '#ddd'} />
                            {s}
                        </div>
                    ))}
                </div>
            </div>

            <button className="btn" style={{ width: '100%', marginTop: '20px', backgroundColor: '#ffdada', color: '#c0392b', justifyContent: 'center' }}>
                Desactivar Taller
            </button>
        </div>
    );

    return (
        <div style={{ paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        <span>Gestión de Ubicaciones</span>
                        <span>/</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Ficha de {location.type === 'WORKSHOP' ? 'Taller' : 'Tienda'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <h1 style={{ margin: 0, fontSize: '2.5rem' }}>{location.name}</h1>
                        <span style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            backgroundColor: location.isActive ? '#e8f6f3' : '#fdedec',
                            color: location.isActive ? '#1abc9c' : '#e74c3c',
                            padding: '4px 10px',
                            borderRadius: '20px'
                        }}>
                            {location.isActive ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                        {location.type === 'WORKSHOP' ? 'Gestión integral de talleres externos y servicios de alta gama.' : 'Punto de venta directo y exhibición.'}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn" onClick={onBack}>
                        Volver al Listado
                    </button>
                    {isEditing ? (
                        <button className="btn btn-primary" onClick={handleSave}>
                            Guardar Cambios
                        </button>
                    ) : (
                        <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                            Editar Ficha
                        </button>
                    )}
                </div>
            </div>

            {/* Content Sidebar + Main */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>

                {/* Side Info */}
                {renderWorkshopSideInfo()}

                {/* Main Content Areas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    {/* Tabs */}
                    <div className="glass-card" style={{ padding: '6px', borderRadius: '12px', display: 'inline-flex', alignSelf: 'flex-start' }}>
                        <button className={`btn-sm ${activeTab === 'orders' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('orders')} style={{ border: 'none', background: activeTab === 'orders' ? 'var(--primary)' : 'transparent', color: activeTab === 'orders' ? 'white' : 'var(--text-muted)', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                            Órdenes Activas
                        </button>
                        <button className={`btn-sm ${activeTab === 'history' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('history')} style={{ border: 'none', background: activeTab === 'history' ? 'var(--primary)' : 'transparent', color: activeTab === 'history' ? 'white' : 'var(--text-muted)', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                            Historial de Servicios
                        </button>
                        <button className={`btn-sm ${activeTab === 'docs' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('docs')} style={{ border: 'none', background: activeTab === 'docs' ? 'var(--primary)' : 'transparent', color: activeTab === 'docs' ? 'white' : 'var(--text-muted)', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                            Documentación
                        </button>
                    </div>

                    {/* Table / List */}
                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '24px 32px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>Piezas en Taller</h3>
                            <button className="btn btn-primary btn-sm" style={{ padding: '8px 16px' }}>
                                <Plus size={16} /> Nueva Orden
                            </button>
                        </div>
                        <div style={{ padding: '20px 32px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #f8f8f8' }}>
                                        <th style={{ padding: '12px 0', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800 }}>ID PIEZA</th>
                                        <th style={{ padding: '12px 0', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800 }}>DESCRIPCIÓN</th>
                                        <th style={{ padding: '12px 0', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800 }}>TIPO DE TRABAJO</th>
                                        <th style={{ padding: '12px 0', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800 }}>ESTADO</th>
                                        <th style={{ padding: '12px 0', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800 }}>FECHA ENTREGA</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid #f8f8f8' }}>
                                        <td style={{ padding: '20px 0', fontWeight: 700, fontSize: '14px' }}>#LD-4592</td>
                                        <td>Anillo de compromiso 18K</td>
                                        <td><span style={{ fontSize: '10px', fontWeight: 800, padding: '4px 8px', borderRadius: '4px', backgroundColor: '#f4f4f4' }}>ENGASTE</span></td>
                                        <td><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f1c40f' }}></div> En proceso</div></td>
                                        <td>12 Oct, 2023</td>
                                        <td><MoreHorizontal size={18} color="#ccc" /></td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #f8f8f8' }}>
                                        <td style={{ padding: '20px 0', fontWeight: 700, fontSize: '14px' }}>#LD-8821</td>
                                        <td>Brazalete rígido oro blanco</td>
                                        <td><span style={{ fontSize: '10px', fontWeight: 800, padding: '4px 8px', borderRadius: '4px', backgroundColor: '#f4f4f4' }}>PULIDO</span></td>
                                        <td><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#e67e22' }}></div> Retrasado</div></td>
                                        <td style={{ color: 'var(--error)' }}>08 Oct, 2023</td>
                                        <td><MoreHorizontal size={18} color="#ccc" /></td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '20px 0', fontWeight: 700, fontSize: '14px' }}>#LD-1029</td>
                                        <td>Pendientes Brillantes 1.2ct</td>
                                        <td><span style={{ fontSize: '10px', fontWeight: 800, padding: '4px 8px', borderRadius: '4px', backgroundColor: '#f4f4f4' }}>REPARACIÓN</span></td>
                                        <td><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2ecc71' }}></div> Listo para entrega</div></td>
                                        <td>15 Oct, 2023</td>
                                        <td><MoreHorizontal size={18} color="#ccc" /></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Bottom Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                        <div className="glass-card" style={{ padding: '24px', backgroundColor: '#fcfcfc' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>ÓRDENES TOTALES</span>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px' }}>124</div>
                        </div>
                        <div className="glass-card" style={{ padding: '24px', backgroundColor: '#fcfcfc' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>TIEMPO PROMEDIO</span>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px' }}>{location.metadata?.slaDays || 4.2} Días</div>
                        </div>
                        <div className="glass-card" style={{ padding: '24px', backgroundColor: '#fcfcfc' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>CALIFICACIÓN</span>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {location.metadata?.rating || 4.8} <Star size={20} fill="#f1c40f" color="#f1c40f" />
                            </div>
                        </div>
                    </div>

                    {/* Contract Alert */}
                    <div className="glass-card" style={{ backgroundColor: '#111', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--accent)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                <FileText size={24} />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Contrato de Servicios 2024</h4>
                                <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.7 }}>Tarifas preferenciales y SLAs de entrega actualizados.</p>
                            </div>
                        </div>
                        <button className="btn" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
                            Ver PDF
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default LocationDetailView;
