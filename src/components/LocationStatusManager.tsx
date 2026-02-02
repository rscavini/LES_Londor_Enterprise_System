import React, { useState, useEffect } from 'react';
import { MapPin, Activity, Plus, Edit2, Trash2, ArrowRight, Home, Settings } from 'lucide-react';
import { LocationService } from '../services/LocationService';
import { OperationalStatusService } from '../services/OperationalStatusService';
import { Location, OperationalStatus, LocationType } from '../models/schema';
import LocationDetailView from './LocationDetailView';

const LocationStatusManager: React.FC = () => {
    const [view, setView] = useState<'locations' | 'statuses'>('locations');
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [locations, setLocations] = useState<Location[]>([]);
    const [statuses, setStatuses] = useState<OperationalStatus[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<{ id?: string, name: string, type: LocationType }>({ name: '', type: 'OTHER' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setLocations(LocationService.getAll());
        setStatuses(OperationalStatusService.getAll());
    };

    const handleOpenModal = (item?: Location) => {
        if (item) {
            setModalData({ id: item.id, name: item.name, type: item.type });
        } else {
            setModalData({ name: '', type: 'OTHER' });
        }
        setIsModalOpen(true);
    };

    const handleSaveList = () => {
        if (!modalData.name.trim()) return;

        if (view === 'locations') {
            if (modalData.id) {
                LocationService.update(modalData.id, { name: modalData.name, type: modalData.type });
            } else {
                LocationService.create({
                    name: modalData.name,
                    type: modalData.type,
                    createdBy: 'user',
                    metadata: {}
                });
            }
        } else {
            if (modalData.id) {
                OperationalStatusService.update(modalData.id, modalData.name);
            } else {
                OperationalStatusService.create(modalData.name);
            }
        }

        loadData();
        setIsModalOpen(false);
    };

    const handleSaveDetail = (updates: Partial<Location>) => {
        if (selectedLocation) {
            LocationService.update(selectedLocation.id, updates);
            loadData();
            setSelectedLocation(LocationService.getById(selectedLocation.id) || null);
        }
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('¿Estás seguro de desactivar este elemento?')) {
            if (view === 'locations') {
                LocationService.deleteLogic(id);
            } else {
                OperationalStatusService.deleteLogic(id);
            }
            loadData();
        }
    };

    if (selectedLocation) {
        return (
            <div className="container" style={{ paddingTop: '40px' }}>
                <LocationDetailView
                    location={selectedLocation}
                    onBack={() => setSelectedLocation(null)}
                    onSave={handleSaveDetail}
                />
            </div>
        );
    }

    const renderList = () => {
        const items = view === 'locations' ? locations : statuses;
        const Icon = view === 'locations' ? MapPin : Activity;
        const title = view === 'locations' ? 'Ubicaciones' : 'Estados Operativos';

        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h2 style={{ margin: 0 }}>{title}</h2>
                    <button className="btn btn-accent" onClick={() => handleOpenModal()}>
                        <Plus size={18} /> Nuevo {view === 'locations' ? 'Punto' : 'Estado'}
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {items.map(item => {
                        const locTypeLabel = (item as any).type ?
                            ((item as any).type === 'WORKSHOP' ? 'TALLER' :
                                (item as any).type === 'STORE' ? 'TIENDA' : 'OTRO') : null;

                        return (
                            <div
                                key={item.id}
                                className="glass-card"
                                style={{ padding: '24px', cursor: view === 'locations' ? 'pointer' : 'default', transition: 'all 0.2s' }}
                                onClick={() => view === 'locations' && setSelectedLocation(item as Location)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div style={{
                                        padding: '8px',
                                        backgroundColor: view === 'locations' ? 'rgba(52, 152, 219, 0.1)' : 'rgba(155, 89, 182, 0.1)',
                                        color: view === 'locations' ? 'var(--primary)' : '#9b59b6',
                                        borderRadius: '8px'
                                    }}>
                                        <Icon size={20} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        {locTypeLabel && (
                                            <span style={{
                                                fontSize: '10px',
                                                fontWeight: 800,
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                backgroundColor: '#f4f4f4',
                                                color: '#666'
                                            }}>
                                                {locTypeLabel}
                                            </span>
                                        )}
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>ID: {item.id}</span>
                                    </div>
                                </div>
                                <h3 style={{ marginBottom: '12px' }}>{item.name}</h3>
                                {view === 'locations' && (
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                        {(item as Location).metadata?.address || 'Sin dirección definida.'}
                                    </p>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f1f1', paddingTop: '16px' }}>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleOpenModal(item as Location); }}
                                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Edit2 size={14} /> Editar
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(item.id, e)}
                                            style={{ background: 'none', border: 'none', color: 'var(--error)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Trash2 size={14} /> Desactivar
                                        </button>
                                    </div>
                                    {view === 'locations' && <ArrowRight size={18} color="var(--primary)" />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="container" style={{ paddingBottom: '60px' }}>
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Control Logístico</h1>
                <p style={{ color: 'var(--text-muted)' }}>Gestión de ubicaciones físicas y estados de las piezas</p>

                <div className="glass-card" style={{
                    display: 'inline-flex',
                    padding: '6px',
                    marginTop: '24px',
                    borderRadius: '12px'
                }}>
                    <button
                        onClick={() => setView('locations')}
                        style={{
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 600,
                            fontSize: '14px',
                            backgroundColor: view === 'locations' ? 'var(--primary)' : 'transparent',
                            color: view === 'locations' ? 'white' : 'var(--text-muted)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <MapPin size={18} /> Ubicaciones
                    </button>
                    <button
                        onClick={() => setView('statuses')}
                        style={{
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 600,
                            fontSize: '14px',
                            backgroundColor: view === 'statuses' ? 'var(--primary)' : 'transparent',
                            color: view === 'statuses' ? 'white' : 'var(--text-muted)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Activity size={18} /> Estados
                    </button>
                </div>
            </header>

            {renderList()}

            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100
                }}>
                    <div className="glass-card" style={{ padding: '32px', width: '450px', backgroundColor: 'white' }}>
                        <h2 style={{ marginBottom: '24px' }}>{modalData.id ? 'Editar' : 'Nueva'} {view === 'locations' ? 'Ubicación' : 'Estado'}</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Nombre</label>
                                <input
                                    className="form-control"
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                                    value={modalData.name}
                                    onChange={e => setModalData({ ...modalData, name: e.target.value })}
                                    placeholder="Ej: Joyeros Unificados, Tienda Serrano..."
                                />
                            </div>

                            {view === 'locations' && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Tipo de Ubicación</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                        {(['WORKSHOP', 'STORE', 'OTHER'] as LocationType[]).map(t => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setModalData({ ...modalData, type: t })}
                                                style={{
                                                    padding: '10px 5px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #ddd',
                                                    fontSize: '12px',
                                                    fontWeight: 700,
                                                    backgroundColor: modalData.type === t ? 'var(--primary)' : 'white',
                                                    color: modalData.type === t ? 'white' : 'var(--text-main)',
                                                    cursor: 'pointer'
                                                }}>
                                                {t === 'WORKSHOP' ? 'TALLER' : t === 'STORE' ? 'TIENDA' : 'OTRO'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button className="btn" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSaveList}>Continuar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationStatusManager;
