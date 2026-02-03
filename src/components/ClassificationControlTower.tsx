import React, { useState, useEffect } from 'react';
import {
    ChevronRight,
    MoreHorizontal,
    Plus,
    GripVertical,
    Trash2,
    Settings2,
    Database,
    AlertCircle,
    Activity,
    Search,
    ChevronUp,
    ChevronDown,
    GripHorizontal
} from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CategoryService } from '../services/CategoryService';
import { SubcategoryService } from '../services/SubcategoryService';
import { AttributeService } from '../services/AttributeService';
import { ClassificationService, AuditLog } from '../services/ClassificationService';
import { DomainService } from '../services/DomainService';
import { Category, Subcategory, Attribute, ClassificationMapping } from '../models/schema';
import DomainAttributeManager from './DomainAttributeManager';

const ClassificationControlTower: React.FC = () => {
    // Data States
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [allAttributes, setAllAttributes] = useState<Attribute[]>([]);

    // Selection States
    const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
    const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
    const [mappedAttributes, setMappedAttributes] = useState<ClassificationMapping[]>([]);

    // UI States
    const [activeTab, setActiveTab] = useState<'atributos' | 'permisos' | 'logs'>('atributos');
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isAddAttrModalOpen, setIsAddAttrModalOpen] = useState(false);
    const [isDomainManagerModalOpen, setIsDomainManagerModalOpen] = useState(false);
    const [isEditGlobalModalOpen, setIsEditGlobalModalOpen] = useState(false);
    const [editingGlobalAttr, setEditingGlobalAttr] = useState<Attribute | null>(null);
    const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
    const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);
    const [attrSearchQuery, setAttrSearchQuery] = useState('');

    // Temp Form States
    const [newCatData, setNewCatData] = useState({ name: '', description: '' });
    const [newSubData, setNewSubData] = useState({ name: '', description: '' });

    useEffect(() => {
        loadBaseData();
    }, []);

    useEffect(() => {
        const fetchMapped = async () => {
            if (selectedSubId) {
                const attrs = await ClassificationService.getAttributesBySubcategory(selectedSubId, selectedCatId || undefined);
                setMappedAttributes(attrs);
            } else if (selectedCatId) {
                const attrs = await ClassificationService.getAttributesByCategory(selectedCatId);
                setMappedAttributes(attrs);
            } else {
                setMappedAttributes([]);
            }
        };
        fetchMapped();
    }, [selectedSubId, selectedCatId]);

    const loadBaseData = async () => {
        try {
            const [cats, subs, attrs] = await Promise.all([
                CategoryService.getAll(),
                SubcategoryService.getAll(),
                AttributeService.getAll()
            ]);

            setCategories(cats);
            setSubcategories(subs);
            setAllAttributes(attrs);

            // Seleccion inicial si hay datos
            if (cats.length > 0 && !selectedCatId) {
                setSelectedCatId(cats[0].id);
            }
        } catch (error) {
            console.error("Error loading base data:", error);
        }
    };

    const handleToggleMandatory = async (attrId: string) => {
        const targetId = selectedSubId || selectedCatId;
        const type = selectedSubId ? 'subcategory' : 'category';
        if (targetId) {
            await ClassificationService.toggleMandatory(targetId, attrId, type);
            await refreshMappedAttributes();
        }
    };

    const handleRemoveAttribute = async (attrId: string) => {
        const mapping = mappedAttributes.find(m => m.attributeId === attrId);
        if (!mapping) return;

        const isInherited = !!(selectedSubId && !mapping.subcategoryId);
        const targetId = mapping.subcategoryId || mapping.categoryId;
        const type = mapping.subcategoryId ? 'subcategory' : 'category';
        const targetName = mapping.subcategoryId ? 'subcategoría' : 'categoría';

        const attrName = getAttributeDetails(attrId)?.name || 'Atributo';

        let confirmMsg = `¿Seguro que desea eliminar el atributo "${attrName}" de esta ${targetName}?`;

        if (isInherited) {
            confirmMsg = `ATENCIÓN: El atributo "${attrName}" es HEREDADO.\n` +
                `Si lo elimina, se borrará de la CATEGORÍA PADRE y afectará a TODAS sus subcategorías.\n\n` +
                `¿Desea proceder con la eliminación global?`;
        }

        if (window.confirm(confirmMsg)) {
            if (targetId) {
                await ClassificationService.removeMapping(targetId, attrId, type);
                await refreshMappedAttributes();
            }
        }
    };

    const handleDeleteGlobalAttribute = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const attr = allAttributes.find(a => a.id === id);
        if (!attr) return;

        if (window.confirm(`¿Seguro que desea eliminar DEFINITIVAMENTE el atributo "${attr.name}" del catálogo maestro?`)) {
            if (window.confirm(`ESTA ACCIÓN ES IRREVERSIBLE.\nSe eliminará de todas las categorías y subcategorías donde esté vinculado.\n\n¿Está totalmente seguro?`)) {
                await AttributeService.deleteLogic(id);
                await loadBaseData(); // Refrescar lista global
                await refreshMappedAttributes(); // Refrescar vista actual
            }
        }
    };

    const handleAddAttribute = async (attrId: string) => {
        const targetId = selectedSubId || selectedCatId;
        const type = selectedSubId ? 'subcategory' : 'category';
        if (!targetId) return;

        await ClassificationService.addMapping(targetId, attrId, type);
        await refreshMappedAttributes();
        setIsAddAttrModalOpen(false);
        setAttrSearchQuery(''); // Reset search
    };

    const handleEditAttributeGlobal = (e: React.MouseEvent, attr: Attribute) => {
        e.stopPropagation();
        setEditingGlobalAttr(attr);
        setIsEditGlobalModalOpen(true);
    };

    const handleSaveGlobalAttr = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingGlobalAttr) return;

        await AttributeService.update(editingGlobalAttr.id, editingGlobalAttr);
        setIsEditGlobalModalOpen(false);
        setEditingGlobalAttr(null);
        await loadBaseData();
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = mappedAttributes.findIndex(m => m.attributeId === active.id);
        const newIndex = mappedAttributes.findIndex(m => m.attributeId === over.id);

        const newMapped = arrayMove(mappedAttributes, oldIndex, newIndex);
        setMappedAttributes(newMapped);

        const targetId = selectedSubId || selectedCatId;
        const type = selectedSubId ? 'subcategory' : 'category';

        if (targetId) {
            await ClassificationService.reorderMappings(targetId, newMapped.map(m => m.attributeId), type);
            if (activeTab === 'logs') await refreshLogs();
        }
    };


    const refreshLogs = async () => {
        const targetId = selectedSubId || selectedCatId;
        if (targetId) {
            const auditLogs = await ClassificationService.getLogs(targetId);
            setLogs(auditLogs);
        }
    };

    useEffect(() => {
        if (activeTab === 'logs') {
            refreshLogs();
        }
    }, [activeTab, selectedSubId, selectedCatId]);

    const refreshMappedAttributes = async () => {
        if (selectedSubId) {
            const attrs = await ClassificationService.getAttributesBySubcategory(selectedSubId, selectedCatId || undefined);
            setMappedAttributes(attrs);
        } else if (selectedCatId) {
            const attrs = await ClassificationService.getAttributesByCategory(selectedCatId);
            setMappedAttributes(attrs);
        }
        if (activeTab === 'logs') await refreshLogs();
    };

    const getAttributeDetails = (id: string) => allAttributes.find(a => a.id === id);

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        await CategoryService.create({ ...newCatData, createdBy: 'admin' });
        setNewCatData({ name: '', description: '' });
        setIsAddCatModalOpen(false);
        await loadBaseData();
    };

    const handleCreateSubcategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCatId) return;
        await SubcategoryService.create({
            ...newSubData,
            categoryId: selectedCatId,
            createdBy: 'admin'
        });
        setNewSubData({ name: '', description: '' });
        setIsAddSubModalOpen(false);
        await loadBaseData();
    };

    const handleDeleteCategory = async (id: string, name: string) => {
        if (window.confirm(`¿Seguro que desea eliminar la categoría "${name}"? Se desactivará del sistema.`)) {
            await CategoryService.deleteLogic(id);
            setSelectedCatId(null);
            setSelectedSubId(null);
            await loadBaseData();
        }
    };

    const handleDeleteSubcategory = async (id: string, name: string) => {
        if (window.confirm(`¿Seguro que desea eliminar la subcategoría "${name}"?`)) {
            await SubcategoryService.deleteLogic(id);
            setSelectedSubId(null);
            await loadBaseData();
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Configuración de Clasificación Dinámica</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Mapeo inteligente de metadatos y reglas por subcategoría</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn" style={{ backgroundColor: 'white', border: '1px solid #ddd' }} onClick={() => setIsDomainManagerModalOpen(true)}>
                        <Settings2 size={18} /> Gestionar Dominios
                    </button>
                    <button className="btn btn-primary">
                        <Plus size={18} /> Nuevo Atributo Global
                    </button>
                </div>
            </div>

            {/* Breadcrumb Visual */}
            <div className="glass-card" style={{ padding: '12px 24px', marginBottom: '32px', display: 'flex', gap: '12px', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Configuración</span>
                <ChevronRight size={14} color="#ccc" />
                <span style={{ fontWeight: 600 }}>{categories.find(c => c.id === selectedCatId)?.name || 'Seleccione Categoría'}</span>
                {selectedSubId && (
                    <>
                        <ChevronRight size={14} color="#ccc" />
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{subcategories.find(s => s.id === selectedSubId)?.name}</span>
                    </>
                )}
            </div>

            {/* Three Column Tower */}
            <div style={{ display: 'grid', gridTemplateColumns: '300px 300px 1fr', gap: '32px', alignItems: 'start' }}>

                {/* 1. Categorías */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', color: 'var(--text-muted)' }}>Categorías</h4>
                        <Plus
                            size={16}
                            color="var(--primary)"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setIsAddCatModalOpen(true)}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {categories.map(cat => (
                            <div
                                key={cat.id}
                                onClick={() => { setSelectedCatId(cat.id); setSelectedSubId(null); }}
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: selectedCatId === cat.id ? 'var(--primary)' : 'transparent',
                                    color: selectedCatId === cat.id ? 'white' : 'var(--text-main)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Database size={16} opacity={0.7} />
                                    <span style={{ fontWeight: 600 }}>{cat.name}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Trash2
                                        size={14}
                                        style={{
                                            cursor: 'pointer',
                                            color: selectedCatId === cat.id ? 'white' : 'var(--error)',
                                            opacity: 0.6
                                        }}
                                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id, cat.name); }}
                                    />
                                    <ChevronRight size={16} opacity={0.5} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Subcategorías */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', color: 'var(--text-muted)' }}>Subcategorías</h4>
                        <Plus
                            size={16}
                            color={selectedCatId ? "var(--primary)" : "#ccc"}
                            style={{ cursor: selectedCatId ? 'pointer' : 'not-allowed' }}
                            onClick={() => selectedCatId && setIsAddSubModalOpen(true)}
                        />
                    </div>
                    {selectedCatId ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {subcategories.filter(s => s.categoryId === selectedCatId).map(sub => (
                                <div
                                    key={sub.id}
                                    onClick={() => setSelectedSubId(sub.id)}
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        backgroundColor: selectedSubId === sub.id ? 'rgba(52, 152, 219, 0.1)' : 'transparent',
                                        border: selectedSubId === sub.id ? '1px solid var(--primary)' : '1px solid transparent',
                                        color: selectedSubId === sub.id ? 'var(--primary)' : 'var(--text-main)',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <span style={{ fontWeight: 600 }}>{sub.name}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Trash2
                                            size={14}
                                            style={{ cursor: 'pointer', color: 'var(--error)', opacity: 0.6 }}
                                            onClick={(e) => { e.stopPropagation(); handleDeleteSubcategory(sub.id, sub.name); }}
                                        />
                                        <ChevronRight size={16} opacity={0.5} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#ccc', padding: '20px' }}>
                            <AlertCircle size={32} style={{ marginBottom: '10px' }} />
                            <p style={{ fontSize: '12px' }}>Seleccione categoría</p>
                        </div>
                    )}
                </div>

                {/* 3. Atributos de la Subcategoría */}
                <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ borderBottom: '1px solid #f1f1f1', padding: '0 24px' }}>
                        <div style={{ display: 'flex', gap: '32px' }}>
                            {['Atributos', 'Permisos', 'Logs'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab.toLowerCase() as any)}
                                    style={{
                                        padding: '20px 0',
                                        background: 'none',
                                        border: 'none',
                                        borderBottom: activeTab === tab.toLowerCase() ? '2px solid var(--primary)' : '2px solid transparent',
                                        color: activeTab === tab.toLowerCase() ? 'var(--primary)' : 'var(--text-muted)',
                                        fontWeight: 600,
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ padding: '32px' }}>
                        {!selectedCatId ? (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: '#ccc' }}>
                                <Activity size={48} style={{ marginBottom: '20px' }} />
                                <h3>Gestión de Atributos</h3>
                                <p>Seleccione una categoría o subcategoría para editar su configuración dinámica.</p>
                            </div>
                        ) : (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <div>
                                        <h3 style={{ margin: 0 }}>
                                            {selectedSubId ? 'Atributos de Subcategoría' : 'Atributos de Categoría'}
                                        </h3>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                            {selectedSubId
                                                ? 'Campos activos para esta subcategoría (incluye heredados).'
                                                : 'Defina aquí los campos comunes a todas las subcategorías de esta categoría.'}
                                        </p>
                                    </div>
                                    <span style={{ backgroundColor: '#f4f4f4', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                                        {mappedAttributes.length} definidos
                                    </span>
                                </div>

                                {activeTab === 'atributos' && (
                                    <>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <DndContext
                                                sensors={sensors}
                                                collisionDetection={closestCenter}
                                                onDragEnd={handleDragEnd}
                                                modifiers={[restrictToVerticalAxis]}
                                            >
                                                <SortableContext
                                                    items={mappedAttributes.map(m => m.attributeId)}
                                                    strategy={verticalListSortingStrategy}
                                                >
                                                    {mappedAttributes.map((m) => (
                                                        <SortableAttributeItem
                                                            key={m.attributeId}
                                                            mapping={m}
                                                            attr={getAttributeDetails(m.attributeId)}
                                                            isInherited={!!(selectedSubId && !m.subcategoryId)}
                                                            onToggleMandatory={handleToggleMandatory}
                                                            onRemove={handleRemoveAttribute}
                                                        />
                                                    ))}
                                                </SortableContext>
                                            </DndContext>
                                        </div>

                                        <div
                                            onClick={() => setIsAddAttrModalOpen(true)}
                                            style={{
                                                marginTop: '24px',
                                                padding: '24px',
                                                border: '2px dashed #eee',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                gap: '12px',
                                                color: 'var(--text-muted)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = '#eee'}
                                        >
                                            <Plus size={20} />
                                            <span style={{ fontWeight: 600 }}>
                                                {selectedSubId ? 'Vincular atributo específico' : 'Añadir atributo común a la categoría'}
                                            </span>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'permisos' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div className="glass-card" style={{ padding: '20px', border: '1px solid var(--primary-light)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                                <AlertCircle size={20} color="var(--primary)" />
                                                <h4 style={{ margin: 0 }}>Gobernanza de Datos</h4>
                                            </div>
                                            <p style={{ fontSize: '13px', lineHeight: '1.6' }}>
                                                Esta sección define quién puede modificar los metadatos de clasificación.
                                                Los cambios afectan directamente a la validación de activos en el inventario.
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {[
                                                { role: 'Administrador', access: 'Total', color: '#1abc9c' },
                                                { role: 'Catalogador Senior', access: 'Edición Atributos', color: '#3498db' },
                                                { role: 'Auditor', access: 'Solo Lectura', color: '#95a5a6' }
                                            ].map(r => (
                                                <div key={r.role} style={{
                                                    padding: '12px 16px', borderRadius: '12px', border: '1px solid #f1f1f1',
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                                }}>
                                                    <span style={{ fontWeight: 600 }}>{r.role}</span>
                                                    <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: `${r.color}15`, color: r.color, padding: '4px 8px', borderRadius: '4px' }}>
                                                        {r.access}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'logs' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {logs.length > 0 ? logs.map(log => (
                                            <div key={log.id} style={{
                                                padding: '16px', borderRadius: '12px', border: '1px solid #f1f1f1',
                                                display: 'flex', gap: '16px'
                                            }}>
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '10px',
                                                    backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: 'var(--primary)'
                                                }}>
                                                    <Activity size={20} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                        <span style={{ fontWeight: 700, fontSize: '14px' }}>{log.user}</span>
                                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                            {log.timestamp.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-main)' }}>{log.details}</p>
                                                </div>
                                            </div>
                                        )) : (
                                            <div style={{ textAlign: 'center', padding: '40px', color: '#ccc' }}>
                                                <Database size={32} style={{ marginBottom: '12px' }} />
                                                <p>No hay registros de cambios para este elemento.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals outside main grid but inside container */}
            {isAddAttrModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, backdropFilter: 'blur(4px)'
                }}>
                    <div className="glass-card" style={{ padding: '32px', width: '500px', backgroundColor: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0 }}>Vincular Atributos</h2>
                            <button className="btn" onClick={() => setIsAddAttrModalOpen(false)}>Cerrar</button>
                        </div>

                        <div style={{ position: 'relative', marginBottom: '20px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} />
                            <input
                                type="text"
                                placeholder="Buscar atributo global..."
                                style={{ width: '100%', paddingLeft: '36px', height: '40px', borderRadius: '8px', border: '1px solid #eee' }}
                                value={attrSearchQuery}
                                onChange={(e) => setAttrSearchQuery(e.target.value)}
                            />
                        </div>

                        <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {allAttributes
                                .filter(a => !mappedAttributes.some(m => m.attributeId === a.id))
                                .filter(a => a.name.toLowerCase().includes(attrSearchQuery.toLowerCase()))
                                .map(attr => (
                                    <div
                                        key={attr.id}
                                        onClick={() => handleAddAttribute(attr.id)}
                                        style={{
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            border: '1px solid #f1f1f1',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 600 }}>{attr.name}</span>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={(e) => handleEditAttributeGlobal(e, attr)}
                                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.6 }}
                                                    title="Editar definición global"
                                                >
                                                    <Settings2 size={14} />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteGlobalAttribute(e, attr.id)}
                                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.6 }}
                                                    title="Eliminar del catálogo maestro"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                                <span style={{ fontSize: '10px', fontWeight: 800, color: '#999' }}>{attr.dataType}</span>
                                            </div>
                                        </div>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>{attr.description}</p>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}

            {isAddCatModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1100, backdropFilter: 'blur(4px)'
                }}>
                    <div className="glass-card" style={{ padding: '32px', width: '400px', backgroundColor: 'white' }}>
                        <h2 style={{ marginBottom: '24px' }}>Nueva Categoría</h2>
                        <form onSubmit={handleCreateCategory}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Nombre</label>
                                <input
                                    required
                                    className="form-control"
                                    value={newCatData.name}
                                    onChange={e => setNewCatData({ ...newCatData, name: e.target.value })}
                                    placeholder="Ej: Anillos..."
                                />
                            </div>
                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Descripción</label>
                                <textarea
                                    className="form-control"
                                    value={newCatData.description}
                                    onChange={e => setNewCatData({ ...newCatData, description: e.target.value })}
                                    placeholder="Breve descripción..."
                                    rows={3}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn" onClick={() => setIsAddCatModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Crear</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isAddSubModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1100, backdropFilter: 'blur(4px)'
                }}>
                    <div className="glass-card" style={{ padding: '32px', width: '400px', backgroundColor: 'white' }}>
                        <h2 style={{ marginBottom: '12px' }}>Nueva Subcategoría</h2>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                            Dentro de: <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{categories.find(c => c.id === selectedCatId)?.name}</span>
                        </p>
                        <form onSubmit={handleCreateSubcategory}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Nombre</label>
                                <input
                                    required
                                    className="form-control"
                                    value={newSubData.name}
                                    onChange={e => setNewSubData({ ...newSubData, name: e.target.value })}
                                    placeholder="Ej: Solitario..."
                                />
                            </div>
                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Descripción</label>
                                <textarea
                                    className="form-control"
                                    value={newSubData.description}
                                    onChange={e => setNewSubData({ ...newSubData, description: e.target.value })}
                                    placeholder="Breve descripción..."
                                    rows={3}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn" onClick={() => setIsAddSubModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Crear</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditGlobalModalOpen && editingGlobalAttr && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1200, backdropFilter: 'blur(4px)'
                }}>
                    <div className="glass-card" style={{ padding: '32px', width: '400px', backgroundColor: 'white' }}>
                        <h2 style={{ marginBottom: '24px' }}>Editar Atributo Global</h2>
                        <form onSubmit={handleSaveGlobalAttr}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Nombre</label>
                                <input
                                    required
                                    className="form-control"
                                    value={editingGlobalAttr.name}
                                    onChange={e => setEditingGlobalAttr({ ...editingGlobalAttr, name: e.target.value })}
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Descripción</label>
                                <textarea
                                    className="form-control"
                                    value={editingGlobalAttr.description}
                                    onChange={e => setEditingGlobalAttr({ ...editingGlobalAttr, description: e.target.value })}
                                    rows={2}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn" onClick={() => setIsEditGlobalModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDomainManagerModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'white', zIndex: 2000, overflowY: 'auto', padding: '40px'
                }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h2 style={{ margin: 0 }}>Gestión Maestra de Dominios y Atributos</h2>
                            <button className="btn" onClick={() => { setIsDomainManagerModalOpen(false); loadBaseData(); }}>Volver a Torre de Control</button>
                        </div>
                        <DomainAttributeManager />
                    </div>
                </div>
            )}
        </div>
    );
};

const SortableAttributeItem = ({ mapping, attr, isInherited, onToggleMandatory, onRemove }: any) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: mapping.attributeId, disabled: isInherited });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        position: 'relative' as 'relative',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: isInherited ? '1px dashed #d4af37' : '1px solid #f1f1f1',
        borderLeft: mapping.isMandatory ? '4px solid var(--primary)' : '4px solid #eee',
        backgroundColor: isInherited ? 'rgba(212, 175, 55, 0.05)' : isDragging ? '#f8f9fa' : '#fff',
        opacity: isInherited ? 0.9 : 1,
        borderRadius: '12px',
        boxShadow: isDragging ? '0 10px 25px rgba(0,0,0,0.1)' : 'none'
    };

    if (!attr) return null;

    return (
        <div ref={setNodeRef} style={style}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div
                    {...attributes}
                    {...listeners}
                    style={{
                        cursor: isInherited ? 'default' : 'grab',
                        color: isInherited ? '#eee' : '#ccc',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <GripVertical size={20} />
                </div>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700 }}>{attr.name}</span>
                        <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 800, backgroundColor: 'rgba(52, 152, 219, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                            {attr.dataType}
                        </span>
                        {isInherited && (
                            <span style={{ fontSize: '10px', color: '#d4af37', fontWeight: 800, backgroundColor: 'rgba(212, 175, 55, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                HEREDADO
                            </span>
                        )}
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{attr.description || 'Sin descripción.'}</p>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: mapping.isMandatory ? 'var(--primary)' : '#ccc' }}>OBLIGATORIO</span>
                    <div
                        onClick={() => !isInherited && onToggleMandatory(mapping.attributeId)}
                        style={{
                            width: '36px',
                            height: '20px',
                            borderRadius: '10px',
                            backgroundColor: mapping.isMandatory ? 'var(--primary)' : '#ddd',
                            position: 'relative',
                            cursor: isInherited ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            opacity: isInherited ? 0.5 : 1
                        }}>
                        <div style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            position: 'absolute',
                            top: '2px',
                            left: mapping.isMandatory ? '18px' : '2px',
                            transition: 'all 0.2s'
                        }} />
                    </div>
                </div>
                <button
                    onClick={() => onRemove(mapping.attributeId)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: isInherited ? '#ccc' : '#bbb',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
                    onMouseLeave={e => e.currentTarget.style.color = isInherited ? '#ccc' : '#bbb'}
                    title={isInherited ? "Eliminar de la categoría padre" : "Eliminar de esta subcategoría"}
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

export default ClassificationControlTower;
