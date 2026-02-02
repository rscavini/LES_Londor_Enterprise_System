import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    Package,
    MapPin,
    Tag,
    ArrowRight,
    MoreVertical,
    LayoutGrid,
    List,
    Image as ImageIcon
} from 'lucide-react';
import { InventoryService } from '../services/InventoryService';
import { CategoryService } from '../services/CategoryService';
import { SubcategoryService } from '../services/SubcategoryService';
import { LocationService } from '../services/LocationService';
import { OperationalStatusService } from '../services/OperationalStatusService';
import { ClassificationService } from '../services/ClassificationService';
import { AttributeService } from '../services/AttributeService';
import { DomainService } from '../services/DomainService';
import { InventoryItem, Category, Subcategory, Location, OperationalStatus, ClassificationMapping, Attribute } from '../models/schema';

const InventoryManager: React.FC = () => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [statuses, setStatuses] = useState<OperationalStatus[]>([]);

    // Dynamic Fields State
    const [dynamicFields, setDynamicFields] = useState<ClassificationMapping[]>([]);
    const [allAttributes, setAllAttributes] = useState<Attribute[]>([]);

    // UI State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        categoryId: '',
        subcategoryId: '',
        locationId: '',
        statusId: '',
        purchasePrice: 0,
        salePrice: 0,
        mainWeight: 0,
        attributes: {} as Record<string, any>
    });

    useEffect(() => {
        loadData();
    }, []);

    // Cargar campos dinámicos cuando cambia la subcategoría
    useEffect(() => {
        if (formData.subcategoryId) {
            const fields = ClassificationService.getAttributesBySubcategory(formData.subcategoryId, formData.categoryId);
            setDynamicFields(fields);

            // Inicializar valores de atributos si no existen
            const newAttrs = { ...formData.attributes };
            fields.forEach(f => {
                if (newAttrs[f.attributeId] === undefined) {
                    newAttrs[f.attributeId] = '';
                }
            });
            setFormData(prev => ({ ...prev, attributes: newAttrs }));
        } else {
            setDynamicFields([]);
        }
    }, [formData.subcategoryId]);

    const loadData = () => {
        setItems(InventoryService.getAll());
        setCategories(CategoryService.getAll());
        setSubcategories(SubcategoryService.getAll());
        setLocations(LocationService.getAll());
        setStatuses(OperationalStatusService.getAll());
        setAllAttributes(AttributeService.getAll());
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        InventoryService.create({
            ...formData,
            images: [],
            createdBy: 'admin'
        });
        setIsAddModalOpen(false);
        resetForm();
        loadData();
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            categoryId: '',
            subcategoryId: '',
            locationId: '',
            statusId: '',
            purchasePrice: 0,
            salePrice: 0,
            mainWeight: 0,
            attributes: {}
        });
        setDynamicFields([]);
    };

    const handleAttrChange = (attrId: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            attributes: {
                ...prev.attributes,
                [attrId]: value
            }
        }));
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'N/A';
    const getLocationName = (id: string) => locations.find(l => l.id === id)?.name || 'N/A';
    const getStatusName = (id: string) => statuses.find(s => s.id === id)?.name || 'N/A';

    const renderDynamicField = (mapping: ClassificationMapping) => {
        const attributeItem = allAttributes.find(a => a.id === mapping.attributeId);
        if (!attributeItem) return null;

        return (
            <div key={attributeItem.id} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                    {attributeItem.name} {mapping.isMandatory && <span style={{ color: 'var(--error)' }}>*</span>}
                </label>

                {attributeItem.dataType === 'LIST' ? (
                    <select
                        required={mapping.isMandatory}
                        value={formData.attributes[attributeItem.id] || ''}
                        onChange={e => handleAttrChange(attributeItem.id, e.target.value)}
                        className="form-control"
                        style={{ width: '100%' }}
                    >
                        <option value="">Seleccione...</option>
                        {DomainService.getValuesByDomain((attributeItem as any).domainId || '').map((v: any) => (
                            <option key={v.id} value={v.value}>{v.value}</option>
                        ))}
                    </select>
                ) : attributeItem.dataType === 'NUMBER' ? (
                    <input
                        type="number"
                        required={mapping.isMandatory}
                        className="form-control"
                        style={{ width: '100%' }}
                        value={formData.attributes[attributeItem.id] || ''}
                        onChange={e => handleAttrChange(attributeItem.id, e.target.value)}
                    />
                ) : attributeItem.dataType === 'BOOLEAN' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="checkbox"
                            checked={!!formData.attributes[attributeItem.id]}
                            onChange={e => handleAttrChange(attributeItem.id, e.target.checked)}
                        />
                        <span style={{ fontSize: '13px' }}>Sí / No</span>
                    </div>
                ) : (
                    <input
                        type="text"
                        required={mapping.isMandatory}
                        className="form-control"
                        style={{ width: '100%' }}
                        value={formData.attributes[attributeItem.id] || ''}
                        onChange={e => handleAttrChange(attributeItem.id, e.target.value)}
                    />
                )}
            </div>
        );
    };

    return (
        <div className="container">
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Inventario de Activos</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Gestión centralizada de existencias y trazabilidad</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="glass-card" style={{ padding: '4px', display: 'flex', gap: '4px' }}>
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{
                                padding: '8px',
                                border: 'none',
                                background: viewMode === 'grid' ? 'var(--primary)' : 'transparent',
                                color: viewMode === 'grid' ? 'white' : 'var(--text-muted)',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}>
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            style={{
                                padding: '8px',
                                border: 'none',
                                background: viewMode === 'list' ? 'var(--primary)' : 'transparent',
                                color: viewMode === 'list' ? 'white' : 'var(--text-muted)',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}>
                            <List size={18} />
                        </button>
                    </div>
                    <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={20} /> Alta de Pieza
                    </button>
                </div>
            </header>

            {/* Filters Bar */}
            <div className="glass-card" style={{ padding: '16px 24px', marginBottom: '32px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o código..."
                        style={{ width: '100%', paddingLeft: '40px' }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn" style={{ border: '1px solid #ddd' }}>
                    <Filter size={18} /> Filtros
                </button>
            </div>

            {/* Content List */}
            {filteredItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <Package size={64} style={{ color: '#eee', marginBottom: '20px' }} />
                    <h3>No hay piezas registradas</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Empieza dando de alta tu primera joya en el sistema.</p>
                </div>
            ) : (
                <div style={{
                    display: viewMode === 'grid' ? 'grid' : 'block',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '24px'
                }}>
                    {filteredItems.map(item => (
                        <div key={item.id} className="glass-card" style={{ padding: '0', overflow: 'hidden', marginBottom: viewMode === 'list' ? '16px' : '0' }}>
                            <div style={{ height: '180px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', position: 'relative' }}>
                                <ImageIcon size={48} />
                                <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        backgroundColor: 'var(--primary)',
                                        color: 'white',
                                        fontSize: '10px',
                                        fontWeight: 800
                                    }}>
                                        {item.itemCode}
                                    </span>
                                </div>
                            </div>
                            <div style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700 }}>{getCategoryName(item.categoryId)}</span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{getStatusName(item.statusId)}</span>
                                </div>
                                <h3 style={{ marginBottom: '4px' }}>{item.name}</h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {item.description}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f1f1', paddingTop: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
                                        <MapPin size={14} />
                                        {getLocationName(item.locationId)}
                                    </div>
                                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                                        {item.salePrice?.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {isAddModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, backdropFilter: 'blur(4px)'
                }}>
                    <div className="glass-card" style={{ padding: '40px', width: '800px', backgroundColor: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h2 style={{ margin: 0 }}>Alta de Nueva Pieza</h2>
                            <button className="btn" onClick={() => setIsAddModalOpen(false)}>Esc</button>
                        </div>

                        <form onSubmit={handleCreate}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                                {/* Columna Izquierda: Identificación y Clasificación */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Identificación Básica</label>
                                        <input
                                            required
                                            className="form-control"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Nombre Corto..."
                                            style={{ width: '100%', marginBottom: '12px' }}
                                        />
                                        <textarea
                                            required
                                            rows={3}
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Descripción técnica..."
                                            style={{ width: '100%', borderRadius: '8px', border: '1px solid #ddd', padding: '12px' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Clasificación</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <select
                                                required
                                                value={formData.categoryId}
                                                onChange={e => setFormData({ ...formData, categoryId: e.target.value, subcategoryId: '' })}
                                            >
                                                <option value="" disabled>Categoría...</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                            <select
                                                required
                                                value={formData.subcategoryId}
                                                onChange={e => setFormData({ ...formData, subcategoryId: e.target.value })}
                                                disabled={!formData.categoryId}
                                            >
                                                <option value="" disabled>Subcategoría...</option>
                                                {subcategories.filter(s => s.categoryId === formData.categoryId).map(s => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* SECCIÓN DINÁMICA: Atributos específicos de la subcategoría */}
                                    {dynamicFields.length > 0 && (
                                        <div style={{ padding: '24px', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee' }}>
                                            <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--primary)', textTransform: 'uppercase' }}>Especificaciones de {subcategories.find(s => s.id === formData.subcategoryId)?.name}</h4>
                                            {dynamicFields.map(renderDynamicField)}
                                        </div>
                                    )}
                                </div>

                                {/* Columna Derecha: Logística y Precios */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Logística y Estado</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <select
                                                required
                                                value={formData.locationId}
                                                onChange={e => setFormData({ ...formData, locationId: e.target.value })}
                                            >
                                                <option value="" disabled>Ubicación...</option>
                                                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                            </select>
                                            <select
                                                required
                                                value={formData.statusId}
                                                onChange={e => setFormData({ ...formData, statusId: e.target.value })}
                                            >
                                                <option value="" disabled>Estado...</option>
                                                {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Pesos y Medidas</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            className="form-control"
                                            value={formData.mainWeight}
                                            onChange={e => setFormData({ ...formData, mainWeight: parseFloat(e.target.value) })}
                                            placeholder="Peso exacto (gr)..."
                                            style={{ width: '100%' }}
                                        />
                                    </div>

                                    <div style={{ backgroundColor: '#fff8f0', padding: '24px', borderRadius: '12px', border: '1px solid #ffe8cc' }}>
                                        <label style={{ display: 'block', marginBottom: '16px', fontWeight: 600, color: '#e67e22' }}>Valoración Aduanera / Venta</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div>
                                                <span style={{ fontSize: '11px', color: '#666', fontWeight: 600 }}>COSTE (€)</span>
                                                <input
                                                    type="number"
                                                    required
                                                    className="form-control"
                                                    value={formData.purchasePrice}
                                                    onChange={e => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })}
                                                    style={{ width: '100%', marginTop: '4px' }}
                                                />
                                            </div>
                                            <div>
                                                <span style={{ fontSize: '11px', color: '#666', fontWeight: 600 }}>PVP (€)</span>
                                                <input
                                                    type="number"
                                                    required
                                                    className="form-control"
                                                    value={formData.salePrice}
                                                    onChange={e => setFormData({ ...formData, salePrice: parseFloat(e.target.value) })}
                                                    style={{ width: '100%', marginTop: '4px' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" className="btn" onClick={() => setIsAddModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px' }}>
                                    Crear Pieza y Generar Código
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryManager;
