import React, { useState, useEffect } from 'react';
import { Settings, Database, List, Plus, Edit2, Trash2, CheckCircle, AlertCircle, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { DomainService } from '../services/DomainService';
import { AttributeService } from '../services/AttributeService';
import { Domain, DomainValue, Attribute, DataType } from '../models/schema';

const DomainAttributeManager: React.FC = () => {
    const [selectedAttrId, setSelectedAttrId] = useState<string | null>(null);
    const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'attr_edit' | 'attr_new' | 'val_new' | 'val_edit' | 'dom_new' | null>(null);
    const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);
    const [editingValue, setEditingValue] = useState<DomainValue | null>(null);
    const [viewMode, setViewMode] = useState<'attributes' | 'domains'>('attributes');

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        dataType: 'TEXT' as DataType,
        domainId: '',
        newValue: '',
        newSortOrder: 1,
        newJustification: ''
    });

    // States for data
    const [domains, setDomains] = useState<Domain[]>([]);
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [selectedDomainValues, setSelectedDomainValues] = useState<DomainValue[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const d = DomainService.getDomains();
        const a = AttributeService.getAll();
        setDomains(d);
        setAttributes(a);
    };

    useEffect(() => {
        if (selectedAttrId) {
            const attr = attributes.find(a => a.id === selectedAttrId);
            if (attr?.domainId) {
                setSelectedDomainId(attr.domainId);
            } else {
                setSelectedDomainId(null);
            }
        }
    }, [selectedAttrId, attributes]);

    useEffect(() => {
        if (selectedDomainId) {
            setSelectedDomainValues(DomainService.getValuesByDomain(selectedDomainId));
        } else {
            setSelectedDomainValues([]);
        }
    }, [selectedDomainId]);

    const handleOpenModal = (type: 'attr_edit' | 'attr_new' | 'val_new' | 'val_edit' | 'dom_new', data?: any) => {
        setModalType(type);
        if (type === 'attr_edit' && data) {
            // ... existing
            setEditingAttribute(data);
            setFormData({
                ...formData,
                name: data.name,
                description: data.description || '',
                dataType: data.dataType,
                domainId: data.domainId || ''
            });
        } else if (type === 'dom_new') {
            setFormData({
                ...formData,
                name: '',
                description: 'CLOSED', // Usaremos description temporalmente para el tipo de dominio en dom_new
                dataType: 'TEXT',
                domainId: ''
            });
        } else if (type === 'val_edit' && data) {
            setEditingValue(data);
            setFormData({
                ...formData,
                newValue: data.value,
                newSortOrder: data.sortOrder,
                newJustification: data.justification || ''
            });
        } else {
            setFormData({
                name: '',
                description: '',
                dataType: 'TEXT',
                domainId: domains[0]?.id || '',
                newValue: '',
                newSortOrder: (selectedDomainValues.length + 1),
                newJustification: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = () => {
        try {
            if (modalType === 'attr_edit' && editingAttribute) {
                AttributeService.update(editingAttribute.id, {
                    name: formData.name,
                    description: formData.description,
                    dataType: formData.dataType,
                    domainId: formData.dataType === 'LIST' ? formData.domainId : undefined
                });
            } else if (modalType === 'attr_new') {
                AttributeService.create({
                    name: formData.name,
                    description: formData.description,
                    dataType: formData.dataType,
                    domainId: formData.dataType === 'LIST' ? formData.domainId : undefined,
                    createdBy: 'user'
                });
            } else if (modalType === 'val_new' && selectedDomainId) {
                DomainService.addValue({
                    domainId: selectedDomainId,
                    value: formData.newValue,
                    sortOrder: Number(formData.newSortOrder),
                    source: 'USER_ADDED',
                    justification: formData.newJustification,
                    createdBy: 'user'
                });
            } else if (modalType === 'val_edit' && editingValue) {
                DomainService.updateValue(editingValue.id, {
                    value: formData.newValue,
                    sortOrder: Number(formData.newSortOrder),
                    justification: formData.newJustification
                });
            } else if (modalType === 'dom_new') {
                DomainService.createDomain({
                    name: formData.name,
                    code: formData.name.toUpperCase().replace(/\s+/g, '_'),
                    type: formData.description as any, // 'CLOSED' o 'SEMI_CLOSED'
                    createdBy: 'admin'
                });
            }

            loadData();
            if (selectedDomainId) {
                setSelectedDomainValues(DomainService.getValuesByDomain(selectedDomainId));
            }
            setIsModalOpen(false);
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleDeleteAttribute = (id: string) => {
        const attr = attributes.find(a => a.id === id);
        if (!attr) return;

        if (window.confirm(`¿Seguro que desea eliminar el atributo "${attr.name}" del catálogo maestro?`)) {
            if (window.confirm(`ATENCIÓN: Esta acción es IRREVERSIBLE y podría afectar a las categorías que usan este atributo.\n\n¿ESTÁ ABSOLUTAMENTE SEGURO de querer borrarlo?`)) {
                AttributeService.deleteLogic(id);
                loadData();
                if (selectedAttrId === id) setSelectedAttrId(null);
            }
        }
    };

    const handleDeleteValue = (id: string, value: string) => {
        if (window.confirm(`¿Seguro que desea eliminar el valor "${value}" de este dominio?`)) {
            if (window.confirm(`Confirme nuevamente: ¿Está seguro de borrar "${value}"?`)) {
                DomainService.deleteValue(id);
                if (selectedDomainId) {
                    setSelectedDomainValues(DomainService.getValuesByDomain(selectedDomainId));
                }
            }
        }
    };

    const renderModal = () => {
        if (!isModalOpen) return null;

        return (
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
                zIndex: 100,
                padding: '20px'
            }}>
                <div className="glass-card" style={{
                    padding: '32px',
                    width: '100%',
                    maxWidth: '500px',
                    backgroundColor: 'white',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                }}>
                    <h2 style={{ marginBottom: '24px' }}>
                        {modalType === 'attr_edit' ? 'Editar Atributo' :
                            modalType === 'attr_new' ? 'Nuevo Atributo' :
                                modalType === 'dom_new' ? 'Nuevo Dominio Maestro' :
                                    modalType === 'val_edit' ? 'Editar Valor' : 'Añadir Valor al Dominio'}
                    </h2>

                    {modalType?.startsWith('attr') && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Nombre</label>
                                <input
                                    className="form-control"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Descripción</label>
                                <textarea
                                    className="form-control"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '80px' }}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Tipo de Dato</label>
                                    <select
                                        className="form-control"
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                        value={formData.dataType}
                                        onChange={e => setFormData({ ...formData, dataType: e.target.value as DataType })}
                                    >
                                        <option value="TEXT">TEXT</option>
                                        <option value="NUMBER">NUMBER</option>
                                        <option value="BOOLEAN">BOOLEAN</option>
                                        <option value="LIST">LIST (Dominio)</option>
                                        <option value="RANGE">RANGE</option>
                                        <option value="DATE">DATE</option>
                                    </select>
                                </div>
                                {formData.dataType === 'LIST' && (
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Dominio Asociado</label>
                                        <select
                                            className="form-control"
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                            value={formData.domainId}
                                            onChange={e => setFormData({ ...formData, domainId: e.target.value })}
                                        >
                                            <option value="">Seleccionar...</option>
                                            {domains.map(d => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {modalType === 'dom_new' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Nombre del Dominio</label>
                                <input
                                    className="form-control"
                                    placeholder="Ej: Tipos de Cierre, Calidades de Gema..."
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Tipo de Gobernanza</label>
                                <select
                                    className="form-control"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                >
                                    <option value="CLOSED">CERRADO (Solo Admin añade valores)</option>
                                    <option value="SEMI_CLOSED">SEMI-CERRADO (Joyero puede sugerir con justificación)</option>
                                </select>
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '8px' }}>
                                <strong>Tip:</strong> Un dominio es un diccionario reutilizable. Una vez creado, podrás vincularlo a uno o más atributos.
                            </p>
                        </div>
                    )}
                    {modalType?.startsWith('val') && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Valor</label>
                                <input
                                    className="form-control"
                                    placeholder="Ej: Oro Rosa"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                    value={formData.newValue}
                                    onChange={e => setFormData({ ...formData, newValue: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Orden</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                    value={formData.newSortOrder}
                                    onChange={e => setFormData({ ...formData, newSortOrder: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Justificación (Requerida por Anexo D)</label>
                                <textarea
                                    className="form-control"
                                    placeholder="Indique por qué es necesario este nuevo valor..."
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '80px' }}
                                    value={formData.newJustification}
                                    onChange={e => setFormData({ ...formData, newJustification: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                        <button className="btn" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                        <button className="btn btn-primary" onClick={handleSave}>Guardar Cambios</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="container" style={{ paddingBottom: '60px' }}>
            <div style={{
                backgroundColor: 'rgba(52, 152, 219, 0.05)',
                border: '1px solid rgba(52, 152, 219, 0.1)',
                padding: '16px 24px',
                borderRadius: '12px',
                marginBottom: '24px',
                display: 'flex',
                gap: '20px',
                alignItems: 'center'
            }}>
                <AlertCircle size={20} color="var(--primary)" />
                <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.5' }}>
                    <strong>Guía rápida:</strong> El <strong>Atributo</strong> es el campo técnico (ej: <em>"Acabado"</em>).
                    El <strong>Dominio</strong> es la lista de opciones (ej: <em>"Lista de Acabados"</em>: Pulido, Mate...).
                    Varios atributos pueden compartir el mismo dominio para mantener la consistencia.
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Torre de Control de Atributos</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Gestión técnica del catálogo de datos LES</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        className={`btn ${viewMode === 'attributes' ? 'btn-accent' : ''}`}
                        onClick={() => setViewMode('attributes')}
                        style={{ border: viewMode === 'attributes' ? 'none' : '1px solid #ddd' }}
                    >
                        <List size={18} /> Catálogo de Atributos
                    </button>
                    <button
                        className={`btn ${viewMode === 'domains' ? 'btn-accent' : ''}`}
                        onClick={() => setViewMode('domains')}
                        style={{ border: viewMode === 'domains' ? 'none' : '1px solid #ddd' }}
                    >
                        <Database size={16} /> Dominios Maestros
                    </button>
                </div>
                {viewMode === 'attributes' ? (
                    <button className="btn btn-primary" onClick={() => handleOpenModal('attr_new')}>
                        <Plus size={18} /> Nuevo Atributo
                    </button>
                ) : (
                    <button className="btn btn-primary" onClick={() => handleOpenModal('dom_new')}>
                        <Plus size={18} /> Nuevo Dominio
                    </button>
                )}
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr) minmax(400px, 1.5fr)',
                gap: '24px',
                alignItems: 'start'
            }}>
                {/* Columna 1: Atributos o Dominios */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', color: 'var(--text-muted)' }}>
                            {viewMode === 'attributes' ? 'Atributos Técnicos' : 'Dominios de Datos'}
                        </h4>
                        <Settings size={16} color="var(--primary)" opacity={0.5} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {viewMode === 'attributes' ? (
                            attributes.map(attr => (
                                <div
                                    key={attr.id}
                                    className={`selection-card ${selectedAttrId === attr.id ? 'active' : ''}`}
                                    onClick={() => setSelectedAttrId(attr.id)}
                                    style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        backgroundColor: selectedAttrId === attr.id ? 'var(--primary)' : 'white',
                                        color: selectedAttrId === attr.id ? 'white' : 'var(--text-main)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        border: '1px solid rgba(0,0,0,0.05)',
                                        boxShadow: selectedAttrId === attr.id ? '0 8px 16px rgba(52, 152, 219, 0.2)' : 'none'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <List size={16} opacity={0.7} />
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{attr.name}</div>
                                            <div style={{ fontSize: '10px', opacity: 0.7 }}>{attr.dataType}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleOpenModal('attr_edit', attr); }}
                                            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.6 }}
                                            title="Editar Atributo"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteAttribute(attr.id); }}
                                            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.6 }}
                                            title="Eliminar Atributo"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            domains.map(dom => (
                                <div
                                    key={dom.id}
                                    className={`selection-card ${selectedDomainId === dom.id ? 'active' : ''}`}
                                    onClick={() => setSelectedDomainId(dom.id)}
                                    style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        backgroundColor: selectedDomainId === dom.id ? 'var(--primary)' : 'white',
                                        color: selectedDomainId === dom.id ? 'white' : 'var(--text-main)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        border: '1px solid rgba(0,0,0,0.05)',
                                        boxShadow: selectedDomainId === dom.id ? '0 8px 16px rgba(52, 152, 219, 0.2)' : 'none'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Database size={16} opacity={0.7} />
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{dom.name}</div>
                                            <div style={{ fontSize: '10px', opacity: 0.7 }}>DOMINIO</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Columna 2: Dominio Asociado */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', color: 'var(--text-muted)' }}>Dominio de Datos</h4>
                        <Database size={16} color="var(--primary)" opacity={0.5} />
                    </div>
                    {selectedAttrId || (viewMode === 'domains' && selectedDomainId) ? (
                        <div>
                            {viewMode === 'attributes' && attributes.find(a => a.id === selectedAttrId)?.dataType === 'LIST' || viewMode === 'domains' ? (
                                <div style={{
                                    padding: '20px',
                                    borderRadius: '16px',
                                    backgroundColor: 'white',
                                    border: '1px solid var(--primary-light)',
                                    textAlign: 'center'
                                }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '12px',
                                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                                        color: 'var(--primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto 16px'
                                    }}>
                                        <Database size={24} />
                                    </div>
                                    <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>
                                        {domains.find(d => d.id === selectedDomainId)?.name || 'Sin Dominio'}
                                    </h3>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                        {domains.find(d => d.id === selectedDomainId)?.code}
                                    </p>
                                    <div style={{
                                        fontSize: '11px',
                                        backgroundColor: (domains.find(d => d.id === selectedDomainId)?.type === 'CLOSED') ? '#ebf5fb' : '#fff8e1',
                                        color: (domains.find(d => d.id === selectedDomainId)?.type === 'CLOSED') ? '#3498db' : '#f39c12',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        display: 'inline-block',
                                        fontWeight: 700
                                    }}>
                                        {domains.find(d => d.id === selectedDomainId)?.type}
                                    </div>

                                    {viewMode === 'domains' && (
                                        <div style={{ marginTop: '24px', textAlign: 'left' }}>
                                            <div style={{ borderTop: '1px solid #eee', margin: '16px 0' }} />
                                            <h5 style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '12px', letterSpacing: '0.5px' }}>USO EN CATÁLOGO GLOBAL</h5>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                {attributes.filter(a => a.domainId === selectedDomainId).map(a => (
                                                    <div key={a.id} style={{
                                                        fontSize: '11px',
                                                        padding: '6px 10px',
                                                        borderRadius: '6px',
                                                        backgroundColor: '#f8f9fa',
                                                        border: '1px solid #f1f1f1',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px'
                                                    }}>
                                                        <Settings size={12} opacity={0.5} />
                                                        {a.name}
                                                    </div>
                                                ))}
                                                {attributes.filter(a => a.domainId === selectedDomainId).length === 0 && (
                                                    <p style={{ fontSize: '11px', color: '#ccc', fontStyle: 'italic', margin: 0 }}>Sin atributos vinculados.</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px 20px', opacity: 0.5 }}>
                                    <AlertCircle size={32} style={{ margin: '0 auto 12px' }} />
                                    <p style={{ fontSize: '13px' }}>Este atributo no utiliza una lista de dominio cerrada.</p>
                                    <span style={{ fontSize: '11px' }}>Tipo: {attributes.find(a => a.id === selectedAttrId)?.dataType}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 20px', opacity: 0.3 }}>
                            <Database size={32} style={{ margin: '0 auto 12px' }} />
                            <p style={{ fontSize: '13px' }}>
                                {viewMode === 'attributes'
                                    ? 'Seleccione un atributo para ver su configuración de dominio.'
                                    : 'Seleccione un dominio para gestionar sus valores maestros.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Columna 3: Valores del Dominio */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', color: 'var(--text-muted)' }}>Valores Permitidos</h4>
                        {selectedDomainId && (
                            <button
                                className="btn btn-primary btn-sm"
                                style={{ padding: '4px 12px', fontSize: '11px' }}
                                onClick={() => handleOpenModal('val_new')}
                            >
                                <Plus size={14} /> Añadir
                            </button>
                        )}
                    </div>

                    {selectedDomainId ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {selectedDomainValues.map((val, index) => (
                                <div key={val.id} style={{
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    backgroundColor: 'white',
                                    border: '1px solid #f1f1f1',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#999', width: '20px' }}>{val.sortOrder}</div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{val.value}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {val.source === 'NORMATIVE' ? (
                                                    <div style={{ fontSize: '9px', color: '#1abc9c', fontWeight: 700 }}>NORMATIVO</div>
                                                ) : (
                                                    <div style={{ fontSize: '9px', color: '#f39c12', fontWeight: 700 }}>MANUAL</div>
                                                )}
                                                {val.justification && (
                                                    <div style={{
                                                        fontSize: '10px',
                                                        color: 'var(--text-muted)',
                                                        fontStyle: 'italic',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}>
                                                        <AlertCircle size={10} /> {val.justification}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => handleOpenModal('val_edit', val)}
                                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.5 }}
                                            title="Editar Valor"
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteValue(val.id, val.value)}
                                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.5 }}
                                            title="Eliminar Valor"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 20px', opacity: 0.3 }}>
                            <CheckCircle size={32} style={{ margin: '0 auto 12px' }} />
                            <p style={{ fontSize: '13px' }}>Gestione aquí los valores del dominio seleccionado.</p>
                        </div>
                    )}
                </div>
            </div>

            {renderModal()}
        </div>
    );
};

export default DomainAttributeManager;
