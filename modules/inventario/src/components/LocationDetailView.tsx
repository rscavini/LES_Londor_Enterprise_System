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
    Activity,
    Settings,
    ArrowRight,
    Trash2,
    Calendar,
    Save,
    X,
    Image as ImageIcon
} from 'lucide-react';
import { Location, WorkshopSpecialty, InventoryItem, SpecialDate } from '../models/schema';
import { InventoryService } from '../services/InventoryService';

interface Props {
    location: Location;
    onBack: () => void;
    onSave: (updates: Partial<Location>) => void;
}

const daysOfWeek = [
    { key: 'monday', label: 'Lunes' },
    { key: 'tuesday', label: 'Martes' },
    { key: 'wednesday', label: 'Miércoles' },
    { key: 'thursday', label: 'Jueves' },
    { key: 'friday', label: 'Viernes' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' },
] as const;

const LocationDetailView: React.FC<Props> = ({ location, onBack, onSave }) => {
    const [activeTab, setActiveTab] = useState<'orders' | 'history' | 'docs'>('orders');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ ...location });
    const [selectedShowcaseIndex, setSelectedShowcaseIndex] = useState(0);
    const [isAddingShowcase, setIsAddingShowcase] = useState(false);
    const [newShowcaseName, setNewShowcaseName] = useState('');
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [newOrder, setNewOrder] = useState({ pieceId: '', workType: 'ENGASTE' });
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [isLoadingInventory, setIsLoadingInventory] = useState(false);
    const [storeActiveTab, setStoreActiveTab] = useState<'info' | 'schedule' | 'showcases' | 'general_stock'>('info');
    const [isAssigningPiece, setIsAssigningPiece] = useState(false);
    const [isAddingSpecialDate, setIsAddingSpecialDate] = useState(false);
    const [newSpecialDate, setNewSpecialDate] = useState({ date: '', label: '', isClosed: true });

    // Vitrinas por defecto si no hay ninguna
    const defaultShowcases = [
        { id: '1', name: 'Vitrina Principal A', details: ['Iluminación LED cálida', 'Cristal reforzado 10mm', 'Sensor de proximidad'] },
        { id: '2', name: 'Boutique Alta Gama', details: ['Cierre electrónico biométrico', 'Iluminación focalizada', 'Exhibición vertical'] },
        { id: '3', name: 'Escaparate Exterior', details: ['Cristal blindado Nivel 1', 'Protección UV', 'Iluminación 24/7'] },
        { id: '4', name: 'Caja Fuerte / Stock', details: ['Protección Ignífuga', 'Acceso restringido auditado', 'Control humedad'] }
    ];

    const showcases = editData.metadata?.showcases || defaultShowcases;

    // Sincronizar estado cuando cambia la ubicación
    React.useEffect(() => {
        setEditData({ ...location });
        setIsEditing(false);
        setSelectedShowcaseIndex(0);

        if (location.type === 'STORE') {
            fetchInventory();
        }
    }, [location.id]);

    const fetchInventory = async () => {
        setIsLoadingInventory(true);
        try {
            const data = await InventoryService.getByLocation(location.id);
            setInventory(data);
        } catch (error) {
            console.error('Error fetching store inventory:', error);
        } finally {
            setIsLoadingInventory(false);
        }
    };

    const handleAddShowcase = () => {
        if (!newShowcaseName.trim()) return;

        const newShowcase = {
            id: Date.now().toString(),
            name: newShowcaseName,
            details: ['Nueva Vitrina']
        };

        const updatedShowcases = [...showcases, newShowcase];
        setEditData({
            ...editData,
            metadata: {
                ...editData.metadata,
                showcases: updatedShowcases,
                showcasesCount: updatedShowcases.length
            }
        });
        setNewShowcaseName('');
        setIsAddingShowcase(false);
        setSelectedShowcaseIndex(updatedShowcases.length - 1);
    };

    const handleUpdateShowcaseDetails = (index: number, details: string[]) => {
        const updatedShowcases = [...showcases];
        updatedShowcases[index] = { ...updatedShowcases[index], details };

        setEditData({
            ...editData,
            metadata: {
                ...editData.metadata,
                showcases: updatedShowcases
            }
        });
    };

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

    const handleAddSpecialDate = () => {
        if (!newSpecialDate.date || !newSpecialDate.label) return;

        const dateObj: SpecialDate = {
            id: Date.now().toString(),
            ...newSpecialDate
        };

        const currentDates = editData.metadata?.specialDates || [];
        setEditData({
            ...editData,
            metadata: {
                ...editData.metadata,
                specialDates: [...currentDates, dateObj]
            }
        });

        setNewSpecialDate({ date: '', label: '', isClosed: true });
        setIsAddingSpecialDate(false);
    };

    const handleRemoveSpecialDate = (id: string) => {
        const currentDates = editData.metadata?.specialDates || [];
        setEditData({
            ...editData,
            metadata: {
                ...editData.metadata,
                specialDates: currentDates.filter(d => d.id !== id)
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
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Teléfono Fijo</label>
                    <input
                        className="form-control"
                        disabled={!isEditing}
                        value={editData.metadata?.phoneFixed || ''}
                        onChange={e => setEditData({ ...editData, metadata: { ...editData.metadata, phoneFixed: e.target.value } })}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Teléfono Móvil</label>
                    <input
                        className="form-control"
                        disabled={!isEditing}
                        value={editData.metadata?.phoneMobile || ''}
                        onChange={e => setEditData({ ...editData, metadata: { ...editData.metadata, phoneMobile: e.target.value } })}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}
                    />
                </div>
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

            <button
                className="btn"
                onClick={() => alert(`Desactivando ${editData.name}...`)}
                style={{ width: '100%', marginTop: '20px', backgroundColor: '#ffdada', color: '#c0392b', justifyContent: 'center' }}
            >
                Desactivar Taller
            </button>
        </div>
    );

    const renderWorkshopView = () => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
            {renderWorkshopSideInfo()}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
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

                <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '24px 32px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>Piezas en Taller</h3>
                        <button
                            className="btn btn-primary btn-sm"
                            style={{ padding: '8px 16px' }}
                            onClick={() => setIsOrderModalOpen(true)}
                        >
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
                    <button
                        className="btn"
                        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                        onClick={() => alert('Abriendo Contrato de Servicios...')}
                    >
                        Ver PDF
                    </button>
                </div>
            </div>
        </div>
    );

    const renderStoreView = () => {
        const currentShowcase = showcases[selectedShowcaseIndex];

        const currentStock = inventory.filter(item => item.showcaseId === currentShowcase?.id);

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Store Tabs */}
                <div className="glass-card" style={{ padding: '6px', borderRadius: '12px', display: 'inline-flex', alignSelf: 'flex-start' }}>
                    <button
                        className={`btn-sm ${storeActiveTab === 'info' ? 'btn-primary' : ''}`}
                        onClick={() => setStoreActiveTab('info')}
                        style={{ border: 'none', background: storeActiveTab === 'info' ? 'var(--primary)' : 'transparent', color: storeActiveTab === 'info' ? 'white' : 'var(--text-muted)', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                    >
                        Información
                    </button>
                    <button
                        className={`btn-sm ${storeActiveTab === 'schedule' ? 'btn-primary' : ''}`}
                        onClick={() => setStoreActiveTab('schedule')}
                        style={{ border: 'none', background: storeActiveTab === 'schedule' ? 'var(--primary)' : 'transparent', color: storeActiveTab === 'schedule' ? 'white' : 'var(--text-muted)', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                    >
                        Horarios y Calendario
                    </button>
                    <button
                        className={`btn-sm ${storeActiveTab === 'showcases' ? 'btn-primary' : ''}`}
                        onClick={() => setStoreActiveTab('showcases')}
                        style={{ border: 'none', background: storeActiveTab === 'showcases' ? 'var(--primary)' : 'transparent', color: storeActiveTab === 'showcases' ? 'white' : 'var(--text-muted)', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                    >
                        Vitrinas y Operación
                    </button>
                    <button
                        className={`btn-sm ${storeActiveTab === 'general_stock' ? 'btn-primary' : ''}`}
                        onClick={() => setStoreActiveTab('general_stock')}
                        style={{ border: 'none', background: storeActiveTab === 'general_stock' ? 'var(--primary)' : 'transparent', color: storeActiveTab === 'general_stock' ? 'white' : 'var(--text-muted)', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                    >
                        Stock General
                    </button>
                </div>

                {storeActiveTab === 'info' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent)' }}>
                                <User size={24} />
                                <h3 style={{ margin: 0 }}>Contacto y Ubicación</h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Responsable / Gerente</label>
                                    <input
                                        className="form-control"
                                        disabled={!isEditing}
                                        value={editData.metadata?.managerName || ''}
                                        onChange={e => setEditData({ ...editData, metadata: { ...editData.metadata, managerName: e.target.value } })}
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Correo Electrónico</label>
                                    <input
                                        className="form-control"
                                        disabled={!isEditing}
                                        value={editData.metadata?.email || ''}
                                        onChange={e => setEditData({ ...editData, metadata: { ...editData.metadata, email: e.target.value } })}
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Tel. Fijo</label>
                                        <input
                                            className="form-control"
                                            disabled={!isEditing}
                                            value={editData.metadata?.phoneFixed || ''}
                                            onChange={e => setEditData({ ...editData, metadata: { ...editData.metadata, phoneFixed: e.target.value } })}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Tel. Móvil</label>
                                        <input
                                            className="form-control"
                                            disabled={!isEditing}
                                            value={editData.metadata?.phoneMobile || ''}
                                            onChange={e => setEditData({ ...editData, metadata: { ...editData.metadata, phoneMobile: e.target.value } })}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Dirección Física</label>
                                    <textarea
                                        className="form-control"
                                        disabled={!isEditing}
                                        rows={3}
                                        value={editData.metadata?.address || ''}
                                        onChange={e => setEditData({ ...editData, metadata: { ...editData.metadata, address: e.target.value } })}
                                        style={{ width: '100%', resize: 'none' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                                <FileText size={24} />
                                <h3 style={{ margin: 0 }}>Notas Adicionales</h3>
                            </div>
                            <textarea
                                className="form-control"
                                disabled={!isEditing}
                                rows={10}
                                value={editData.metadata?.managerNotes || ''}
                                onChange={e => setEditData({ ...editData, metadata: { ...editData.metadata, managerNotes: e.target.value } })}
                                placeholder="Notas internas para la gestión de la tienda..."
                                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #eee', resize: 'none', flex: 1 }}
                            />
                        </div>
                    </div>
                )}

                {storeActiveTab === 'schedule' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 2fr', gap: '32px' }}>
                        {/* Business Hours Column */}
                        <div className="glass-card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent)' }}>
                                    <Clock size={24} />
                                    <h3 style={{ margin: 0 }}>Horarios Semanales</h3>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {daysOfWeek.map(day => {
                                    const schedule = editData.metadata?.businessHours?.[day.key] || {
                                        morning: { open: '10:00', close: '14:00', isClosed: false },
                                        afternoon: { open: '17:00', close: '20:30', isClosed: false }
                                    };

                                    return (
                                        <div key={day.key} style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f9f9f9', border: '1px solid #eee' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase' }}>{day.label}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {isEditing && (
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={schedule.isClosed}
                                                                onChange={e => {
                                                                    const bh = editData.metadata?.businessHours || {};
                                                                    setEditData({
                                                                        ...editData,
                                                                        metadata: {
                                                                            ...editData.metadata,
                                                                            businessHours: { ...bh, [day.key]: { ...schedule, isClosed: e.target.checked } }
                                                                        }
                                                                    });
                                                                }}
                                                            />
                                                            CERRADO
                                                        </label>
                                                    )}
                                                </div>
                                            </div>

                                            {!schedule.isClosed ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                                                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>MAÑANA:</span>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <input type="time" disabled={!isEditing} value={schedule.morning?.open} className="form-control-sm" onChange={e => {
                                                                const bh = editData.metadata?.businessHours || {};
                                                                const d = bh[day.key] || schedule;
                                                                setEditData({ ...editData, metadata: { ...editData.metadata, businessHours: { ...bh, [day.key]: { ...d, morning: { ...d.morning!, open: e.target.value } } } } });
                                                            }} />
                                                            <span>-</span>
                                                            <input type="time" disabled={!isEditing} value={schedule.morning?.close} className="form-control-sm" onChange={e => {
                                                                const bh = editData.metadata?.businessHours || {};
                                                                const d = bh[day.key] || schedule;
                                                                setEditData({ ...editData, metadata: { ...editData.metadata, businessHours: { ...bh, [day.key]: { ...d, morning: { ...d.morning!, close: e.target.value } } } } });
                                                            }} />
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                                                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>TARDE:</span>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <input type="time" disabled={!isEditing} value={schedule.afternoon?.open} className="form-control-sm" onChange={e => {
                                                                const bh = editData.metadata?.businessHours || {};
                                                                const d = bh[day.key] || schedule;
                                                                setEditData({ ...editData, metadata: { ...editData.metadata, businessHours: { ...bh, [day.key]: { ...d, afternoon: { ...d.afternoon!, open: e.target.value } } } } });
                                                            }} />
                                                            <span>-</span>
                                                            <input type="time" disabled={!isEditing} value={schedule.afternoon?.close} className="form-control-sm" onChange={e => {
                                                                const bh = editData.metadata?.businessHours || {};
                                                                const d = bh[day.key] || schedule;
                                                                setEditData({ ...editData, metadata: { ...editData.metadata, businessHours: { ...bh, [day.key]: { ...d, afternoon: { ...d.afternoon!, close: e.target.value } } } } });
                                                            }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ textAlign: 'center', padding: '10px', color: 'var(--error)', fontSize: '12px', fontWeight: 700 }}>ESTABLECIMIENTO CERRADO</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Holidays Column */}
                        <div className="glass-card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent)' }}>
                                    <Calendar size={24} />
                                    <h3 style={{ margin: 0 }}>Días Festivos y Cierres Especiales</h3>
                                </div>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => setIsAddingSpecialDate(true)}
                                    disabled={!isEditing}
                                >
                                    <Plus size={16} /> Añadir Fecha
                                </button>
                            </div>

                            {isAddingSpecialDate && (
                                <div className="glass-card" style={{ padding: '20px', backgroundColor: '#fcfcfc', border: '1px solid var(--primary)', marginBottom: '24px' }}>
                                    <h4 style={{ margin: '0 0 16px 0', fontSize: '14px' }}>Nueva Fecha Especial</h4>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>FECHA</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={newSpecialDate.date}
                                                onChange={e => setNewSpecialDate({ ...newSpecialDate, date: e.target.value })}
                                            />
                                        </div>
                                        <div style={{ flex: 2 }}>
                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>DESCRIPCIÓN</label>
                                            <input
                                                className="form-control"
                                                placeholder="Ej: Festivo Local / Inventario"
                                                value={newSpecialDate.label}
                                                onChange={e => setNewSpecialDate({ ...newSpecialDate, label: e.target.value })}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn btn-primary" onClick={handleAddSpecialDate}><Save size={16} /></button>
                                            <button className="btn" onClick={() => setIsAddingSpecialDate(false)}><X size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                                {(editData.metadata?.specialDates || []).length === 0 ? (
                                    <div style={{ gridColumn: '1/-1', padding: '40px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px dashed #ddd', color: 'var(--text-muted)' }}>
                                        No hay fechas especiales registradas para este año.
                                    </div>
                                ) : (
                                    (editData.metadata?.specialDates || []).sort((a, b) => a.date.localeCompare(b.date)).map(date => (
                                        <div key={date.id} style={{
                                            padding: '16px 20px',
                                            borderRadius: '12px',
                                            backgroundColor: 'white',
                                            border: '1px solid #eee',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                <div style={{ textAlign: 'center', minWidth: '50px' }}>
                                                    <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                                                        {new Date(date.date).toLocaleDateString('es-ES', { month: 'short' })}
                                                    </div>
                                                    <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                                                        {new Date(date.date).getDate() + 1}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{date.label}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--error)', fontWeight: 600 }}>CIERRE TOTAL</div>
                                                </div>
                                            </div>
                                            {isEditing && (
                                                <Trash2
                                                    size={16}
                                                    color="var(--error)"
                                                    style={{ cursor: 'pointer', opacity: 0.6 }}
                                                    onClick={() => handleRemoveSpecialDate(date.id)}
                                                />
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {storeActiveTab === 'showcases' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 350px 1fr', gap: '32px', alignItems: 'start' }}>
                        {/* 1. SELECTOR DE VITRINAS */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className="glass-card" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', color: 'var(--text-muted)' }}>Gestión de Vitrinas</h4>
                                    <Plus
                                        size={16}
                                        color="var(--primary)"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setIsAddingShowcase(true)}
                                    />
                                </div>

                                {isAddingShowcase && (
                                    <div style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
                                        <input
                                            className="form-control"
                                            autoFocus
                                            placeholder="Nombre vitrina"
                                            value={newShowcaseName}
                                            onChange={e => setNewShowcaseName(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleAddShowcase()}
                                            style={{ flex: 1, fontSize: '12px', padding: '8px' }}
                                        />
                                        <button className="btn btn-primary btn-sm" onClick={handleAddShowcase}>OK</button>
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {showcases.map((v, i) => (
                                        <div key={v.id || i}
                                            onClick={() => setSelectedShowcaseIndex(i)}
                                            style={{
                                                padding: '12px 16px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                backgroundColor: i === selectedShowcaseIndex ? 'var(--primary)' : 'transparent',
                                                color: i === selectedShowcaseIndex ? 'white' : 'var(--text-main)',
                                                transition: 'all 0.2s',
                                                border: '1px solid transparent'
                                            }}
                                            onMouseEnter={(e) => i !== selectedShowcaseIndex && (e.currentTarget.style.backgroundColor = '#f9f9f9')}
                                            onMouseLeave={(e) => i !== selectedShowcaseIndex && (e.currentTarget.style.backgroundColor = 'transparent')}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <Package size={16} opacity={0.7} />
                                                <span style={{ fontWeight: 600 }}>{v.name}</span>
                                            </div>
                                            <ArrowRight size={16} opacity={0.5} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="glass-card" style={{ padding: '24px' }}>
                                <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '16px' }}>Seguridad</h4>
                                <select
                                    className="form-control"
                                    disabled={!isEditing}
                                    value={editData.metadata?.securityLevel || 'MEDIUM'}
                                    onChange={e => setEditData({ ...editData, metadata: { ...editData.metadata, securityLevel: e.target.value as any } })}
                                    style={{ width: '100%', fontSize: '13px', padding: '8px' }}
                                >
                                    <option value="LOW">Básica</option>
                                    <option value="MEDIUM">Estándar</option>
                                    <option value="HIGH">Alta</option>
                                    <option value="ELITE">Máxima</option>
                                </select>
                            </div>
                        </div>

                        {/* 3. CONTENIDO Y DETALLES DE VITRINA */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 style={{ margin: 0 }}>Stock en Vitrina</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {isEditing && !isAssigningPiece && (
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => setIsAssigningPiece(true)}
                                                style={{ fontSize: '11px', padding: '4px 12px' }}
                                            >
                                                <Plus size={14} /> Asignar Pieza
                                            </button>
                                        )}
                                        <span style={{ fontSize: '11px', fontWeight: 800, backgroundColor: '#f4f4f4', padding: '4px 8px', borderRadius: '4px' }}>{currentStock.length} PIEZAS</span>
                                    </div>
                                </div>
                                {isAssigningPiece && (
                                    <div style={{ padding: '20px 24px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <h5 style={{ margin: 0, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Seleccionar Pieza Aprobada</h5>
                                            <button className="btn-icon" onClick={() => setIsAssigningPiece(false)}><X size={14} /></button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto', paddingRight: '12px' }}>
                                            {inventory
                                                .filter(item => !item.showcaseId)
                                                .length === 0 ? (
                                                <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                                                    No hay piezas disponibles para asignar en esta ubicación.
                                                </div>
                                            ) : (
                                                inventory
                                                    .filter(item => !item.showcaseId)
                                                    .map(item => (
                                                        <div
                                                            key={item.id}
                                                            onClick={async () => {
                                                                try {
                                                                    const updates: any = { showcaseId: currentShowcase?.id };
                                                                    if (!item.isApproved) {
                                                                        updates.isApproved = true;
                                                                    }
                                                                    await InventoryService.update(item.id!, updates, 'admin');
                                                                    setIsAssigningPiece(false);
                                                                    fetchInventory();
                                                                } catch (error) {
                                                                    console.error('Error assigning item:', error);
                                                                }
                                                            }}
                                                            style={{
                                                                padding: '10px 14px',
                                                                backgroundColor: 'white',
                                                                border: '1px solid #eee',
                                                                borderRadius: '10px',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                transition: 'all 0.2s'
                                                            }}
                                                            onMouseEnter={e => {
                                                                e.currentTarget.style.borderColor = 'var(--primary)';
                                                                e.currentTarget.style.transform = 'translateX(4px)';
                                                            }}
                                                            onMouseLeave={e => {
                                                                e.currentTarget.style.borderColor = '#eee';
                                                                e.currentTarget.style.transform = 'translateX(0)';
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                {/* Thumbnail Mini */}
                                                                <div style={{
                                                                    width: '40px',
                                                                    height: '40px',
                                                                    borderRadius: '8px',
                                                                    backgroundColor: '#f8f9fa',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    overflow: 'hidden',
                                                                    border: '1px solid #eee'
                                                                }}>
                                                                    {item.images?.[0] ? (
                                                                        <img src={item.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                    ) : (
                                                                        <ImageIcon size={16} color="#ccc" />
                                                                    )}
                                                                </div>
                                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)' }}>{item.itemCode}</span>
                                                                        {!item.isApproved && (
                                                                            <span style={{ fontSize: '8px', fontWeight: 800, backgroundColor: '#fdedec', color: '#e74c3c', padding: '1px 4px', borderRadius: '3px' }}>PENDIENTE</span>
                                                                        )}
                                                                    </div>
                                                                    <span style={{ fontSize: '12px', color: 'var(--text-main)', marginTop: '2px', fontWeight: 500 }}>{item.name || item.description}</span>
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                {item.mainWeight && <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)' }}>{item.mainWeight}g</span>}
                                                                <div style={{ backgroundColor: 'rgba(241, 196, 15, 0.1)', color: 'var(--primary)', padding: '4px', borderRadius: '6px' }}>
                                                                    <Plus size={14} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                            )}
                                        </div>
                                    </div>
                                )}
                                <div style={{ padding: '0' }}>
                                    {currentStock.length === 0 ? (
                                        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                                            No hay piezas asignadas a esta vitrina.
                                        </div>
                                    ) : (
                                        currentStock.map((item, i) => (
                                            <div key={item.id} style={{
                                                padding: '16px 24px',
                                                borderBottom: i === currentStock.length - 1 ? 'none' : '1px solid #f8f8f8',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                    {/* Thumbnail Mini */}
                                                    <div style={{
                                                        width: '44px',
                                                        height: '44px',
                                                        borderRadius: '8px',
                                                        backgroundColor: '#f8f9fa',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        overflow: 'hidden',
                                                        border: '1px solid #eee'
                                                    }}>
                                                        {item.images?.[0] ? (
                                                            <img src={item.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <ImageIcon size={18} color="#ccc" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--primary)' }}>{item.itemCode || item.id}</span>
                                                        <p style={{ margin: '2px 0 0 0', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{item.name || item.description}</p>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                    {isEditing && (
                                                        <button
                                                            className="btn-icon"
                                                            title="Quitar de vitrina"
                                                            onClick={async () => {
                                                                try {
                                                                    await InventoryService.update(item.id!, { showcaseId: undefined }, 'admin');
                                                                    fetchInventory();
                                                                } catch (error) {
                                                                    console.error('Error removing item from showcase:', error);
                                                                }
                                                            }}
                                                        >
                                                            <X size={14} color="var(--error)" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="glass-card" style={{ padding: '24px' }}>
                                <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '16px' }}>Especificaciones de {currentShowcase?.name}</h4>
                                <div style={{ backgroundColor: '#f9f9f9', padding: '16px', borderRadius: '12px' }}>
                                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                        {(currentShowcase?.details || []).map((detail, idx) => (
                                            <li key={idx} style={{ marginBottom: '8px' }}>
                                                {isEditing ? (
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <input
                                                            className="form-control"
                                                            value={detail}
                                                            onChange={e => {
                                                                const newDetails = [...currentShowcase.details];
                                                                newDetails[idx] = e.target.value;
                                                                handleUpdateShowcaseDetails(selectedShowcaseIndex, newDetails);
                                                            }}
                                                            style={{ flex: 1, padding: '4px 8px', fontSize: '12px' }}
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                const newDetails = currentShowcase.details.filter((_, i) => i !== idx);
                                                                handleUpdateShowcaseDetails(selectedShowcaseIndex, newDetails);
                                                            }}
                                                            style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                ) : detail}
                                            </li>
                                        ))}
                                        {isEditing && (
                                            <li style={{ listStyle: 'none', marginTop: '12px' }}>
                                                <button
                                                    className="btn-sm"
                                                    onClick={() => {
                                                        const newDetails = [...(currentShowcase.details || []), 'Nueva característica'];
                                                        handleUpdateShowcaseDetails(selectedShowcaseIndex, newDetails);
                                                    }}
                                                    style={{ fontSize: '11px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                                                >
                                                    + Añadir característica
                                                </button>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {storeActiveTab === 'general_stock' && (
                    /* STOCK GENERAL VIEW */
                    <div className="glass-card" style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <div>
                                <h3 style={{ margin: 0 }}>Stock Físico en {location.name}</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
                                    Listado completo de piezas asignadas a esta ubicación.
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>TOTAL PIEZAS</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{inventory.length}</div>
                                </div>
                            </div>
                        </div>

                        {isLoadingInventory ? (
                            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                Cargando inventario...
                            </div>
                        ) : inventory.length === 0 ? (
                            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: '#fcfcfc', borderRadius: '12px', border: '1px dashed #ddd' }}>
                                <Package size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                                <p>No hay piezas registradas en esta ubicación.</p>
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                gap: '24px'
                            }}>
                                {inventory.map(item => (
                                    <div key={item.id} className="glass-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #eee' }}>
                                        <div style={{ height: '160px', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', position: 'relative' }}>
                                            {item.images && item.images.length > 0 ? (
                                                <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            ) : (
                                                <ImageIcon size={40} />
                                            )}
                                        </div>
                                        <div style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--primary)', backgroundColor: 'rgba(241, 196, 15, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                                    {item.itemCode}
                                                </span>
                                                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>
                                                    {item.mainWeight}g
                                                </span>
                                            </div>
                                            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {item.name}
                                            </h4>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                    PVPR: <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.salePrice?.toLocaleString() || '0'}€</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {item.showcaseId && (
                                                        <span style={{ fontSize: '9px', fontWeight: 800, backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '4px' }}>
                                                            {editData.metadata?.showcases?.find(s => s.id === item.showcaseId)?.name || 'VITRINA'}
                                                        </span>
                                                    )}
                                                    <div
                                                        onClick={async () => {
                                                            if (!isEditing) return;
                                                            try {
                                                                await InventoryService.update(item.id!, { isApproved: !item.isApproved }, 'admin');
                                                                fetchInventory();
                                                            } catch (error) {
                                                                console.error('Error toggling approval:', error);
                                                            }
                                                        }}
                                                        style={{
                                                            fontSize: '10px',
                                                            fontWeight: 800,
                                                            backgroundColor: item.isApproved ? '#e8f6f3' : '#fdedec',
                                                            color: item.isApproved ? '#1abc9c' : '#e74c3c',
                                                            padding: '4px 10px',
                                                            borderRadius: '20px',
                                                            cursor: isEditing ? 'pointer' : 'default'
                                                        }}
                                                    >
                                                        {item.isApproved ? 'APROBADO' : 'PENDIENTE'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderOtherView = () => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
            <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                    <MapPin size={24} />
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Detalles de Ubicación</h3>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Nombre / Alias</label>
                    <input
                        className="form-control"
                        disabled={!isEditing}
                        value={editData.name}
                        onChange={e => setEditData({ ...editData, name: e.target.value })}
                        style={{ width: '100%' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Persona de Contacto</label>
                    <input
                        className="form-control"
                        disabled={!isEditing}
                        value={editData.metadata?.contactPerson || ''}
                        onChange={e => setEditData({ ...editData, metadata: { ...editData.metadata, contactPerson: e.target.value } })}
                        style={{ width: '100%' }}
                    />
                </div>
            </div>

            <div className="glass-card" style={{ padding: '32px' }}>
                <h4 style={{ margin: '0 0 16px 0', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', color: 'var(--text-muted)' }}>Notas y Observaciones</h4>
                <textarea
                    className="form-control"
                    disabled={!isEditing}
                    rows={10}
                    value={editData.metadata?.notes || ''}
                    onChange={e => setEditData({ ...editData, metadata: { ...editData.metadata, notes: e.target.value } })}
                    placeholder="Escriba aquí cualquier información relevante sobre esta ubicación..."
                    style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #eee', resize: 'none' }}
                />
            </div>
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
            {location.type === 'WORKSHOP' ? renderWorkshopView() :
                location.type === 'STORE' ? renderStoreView() : renderOtherView()}

            {/* Modal Nueva Orden */}
            {isOrderModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div className="glass-card" style={{ width: '400px', padding: '32px', backgroundColor: 'white' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '24px' }}>Nueva Orden de Trabajo</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>ID de la Pieza</label>
                                <input
                                    className="form-control"
                                    placeholder="Ej: LD-5001"
                                    value={newOrder.pieceId}
                                    onChange={e => setNewOrder({ ...newOrder, pieceId: e.target.value })}
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Tipo de Trabajo</label>
                                <select
                                    className="form-control"
                                    value={newOrder.workType}
                                    onChange={e => setNewOrder({ ...newOrder, workType: e.target.value })}
                                    style={{ width: '100%', padding: '12px' }}
                                >
                                    {specialties.map(s => <option key={s} value={s.toUpperCase()}>{s}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => {
                                    alert(`Orden para ${newOrder.pieceId} creada con éxito.`);
                                    setIsOrderModalOpen(false);
                                }}>
                                    Generar Orden
                                </button>
                                <button className="btn" style={{ flex: 1 }} onClick={() => setIsOrderModalOpen(false)}>
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationDetailView;
