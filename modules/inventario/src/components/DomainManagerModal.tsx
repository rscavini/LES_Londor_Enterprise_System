import React, { useState, useEffect } from 'react';
import { DomainService } from '../services/DomainService';
import { DomainValue } from '../models/schema';
import { X, Plus, Edit2, Trash2, Check, AlertCircle } from 'lucide-react';

interface DomainManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    domainId: string;
    domainName: string;
    onUpdate?: () => void;
}

const DomainManagerModal: React.FC<DomainManagerModalProps> = ({ isOpen, onClose, domainId, domainName, onUpdate }) => {
    const [values, setValues] = useState<DomainValue[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingValue, setEditingValue] = useState<DomainValue | null>(null);
    const [formData, setFormData] = useState({
        value: '',
        sortOrder: 1,
        justification: ''
    });

    useEffect(() => {
        if (isOpen && domainId) {
            loadValues();
        }
    }, [isOpen, domainId]);

    const loadValues = async () => {
        setLoading(true);
        try {
            const data = await DomainService.getValuesByDomain(domainId);
            setValues(data);
        } catch (error) {
            console.error("Error loading domain values:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.value) return;

        try {
            if (editingValue) {
                await DomainService.updateValue(editingValue.id, {
                    value: formData.value,
                    sortOrder: Number(formData.sortOrder),
                    justification: formData.justification
                });
            } else {
                await DomainService.addValue({
                    domainId,
                    value: formData.value,
                    sortOrder: Number(formData.sortOrder),
                    source: 'USER_ADDED',
                    justification: formData.justification,
                    createdBy: 'user'
                });
            }
            setFormData({ value: '', sortOrder: values.length + 2, justification: '' });
            setEditingValue(null);
            await loadValues();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Error saving domain value:", error);
            alert("Error al guardar el valor");
        }
    };

    const handleDelete = async (id: string, value: string) => {
        if (window.confirm(`¿Seguro que desea eliminar "${value}"?`)) {
            await DomainService.deleteValueLogic(id);
            await loadValues();
            if (onUpdate) onUpdate();
        }
    };

    const handleEdit = (val: DomainValue) => {
        setEditingValue(val);
        setFormData({
            value: val.value,
            sortOrder: val.sortOrder,
            justification: val.justification || ''
        });
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px',
            backdropFilter: 'blur(4px)'
        }}>
            <div className="glass-card" style={{
                padding: '32px',
                width: '100%',
                maxWidth: '600px',
                backgroundColor: 'white',
                maxHeight: '90vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px' }}>Gestionar Maestro: {domainName}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    border: '1px solid #eee'
                }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', textTransform: 'uppercase', color: '#666' }}>
                        {editingValue ? 'Editar Valor' : 'Añadir Nuevo Valor'}
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 80px', gap: '12px', marginBottom: '12px' }}>
                        <input
                            className="form-control"
                            placeholder="Ej: Nueva Colección, Graduación..."
                            value={formData.value}
                            onChange={e => setFormData({ ...formData, value: e.target.value })}
                        />
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Orden"
                            value={formData.sortOrder}
                            onChange={e => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <textarea
                            className="form-control"
                            placeholder="Justificación necesaria para auditoría..."
                            style={{ flex: 1, minHeight: '40px' }}
                            value={formData.justification}
                            onChange={e => setFormData({ ...formData, justification: e.target.value })}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={!formData.value}
                            style={{ alignSelf: 'flex-end', height: '42px' }}
                        >
                            {editingValue ? <Check size={18} /> : <Plus size={18} />}
                        </button>
                    </div>
                    {editingValue && (
                        <button
                            onClick={() => { setEditingValue(null); setFormData({ value: '', sortOrder: values.length + 1, justification: '' }); }}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', marginTop: '8px', cursor: 'pointer' }}
                        >
                            Cancelar edición
                        </button>
                    )}
                </div>

                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {loading ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Cargando valores...</div>
                    ) : values.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                            <AlertCircle size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
                            <p>No hay valores definidos para este maestro.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {values.map((v) => (
                                <div key={v.id} style={{
                                    padding: '12px 16px',
                                    borderRadius: '10px',
                                    backgroundColor: 'white',
                                    border: '1px solid #eee',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'background 0.2s'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#ccc', width: '20px' }}>{v.sortOrder}</span>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{v.value}</div>
                                            <div style={{ fontSize: '10px', color: '#999' }}>{v.source === 'NORMATIVE' ? 'SISTEMA' : 'MANUAL'}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => handleEdit(v)}
                                            style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: '4px' }}
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        {v.source !== 'NORMATIVE' && (
                                            <button
                                                onClick={() => handleDelete(v.id, v.value)}
                                                style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: '4px' }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DomainManagerModal;
