import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers, ArrowLeft, Filter } from 'lucide-react';
import { SubcategoryService } from '../services/SubcategoryService';
import { CategoryService } from '../services/CategoryService';
import { Subcategory, Category } from '../models/schema';

const SubcategoryManager: React.FC = () => {
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        categoryId: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [cats, subs] = await Promise.all([
                CategoryService.getAll(),
                SubcategoryService.getAll()
            ]);
            setCategories(cats);
            setSubcategories(subs);
        } catch (error) {
            console.error("Error loading data:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            await SubcategoryService.update(editingId, formData);
        } else {
            await SubcategoryService.create({ ...formData, createdBy: 'admin' });
        }
        resetForm();
        await loadData();
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', categoryId: '' });
        setIsAdding(false);
        setEditingId(null);
    };

    const handleEdit = (sub: Subcategory) => {
        setFormData({
            name: sub.name,
            description: sub.description || '',
            categoryId: sub.categoryId
        });
        setEditingId(sub.id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Estás seguro de desactivar esta subcategoría?')) {
            await SubcategoryService.deleteLogic(id);
            await loadData();
        }
    };

    const filteredSubcategories = selectedCategoryId === 'all'
        ? subcategories
        : subcategories.filter(s => s.categoryId === selectedCategoryId);

    return (
        <div className="container">
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Gestor de Subcategorías</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Clasificación de tipologías por categoría</p>
                </div>
                {!isAdding && (
                    <button className="btn btn-accent" onClick={() => setIsAdding(true)}>
                        <Plus size={20} />
                        Nueva Subcategoría
                    </button>
                )}
            </header>

            {!isAdding && (
                <div className="glass-card" style={{ padding: '16px 24px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Filter size={18} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontWeight: 500, fontSize: '14px' }}>Filtrar por Categoría:</span>
                    <select
                        style={{ width: 'auto', padding: '8px 16px' }}
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                    >
                        <option value="all">Todas las categorías</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {isAdding ? (
                <div className="glass-card" style={{ padding: '30px', maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <button className="btn" onClick={resetForm} style={{ padding: '8px' }}>
                            <ArrowLeft size={20} />
                        </button>
                        <h2 style={{ margin: 0 }}>{editingId ? 'Editar Subcategoría' : 'Añadir Subcategoría'}</h2>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Categoría Padre</label>
                            <select
                                required
                                value={formData.categoryId}
                                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                            >
                                <option value="" disabled>Selecciona una categoría...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Nombre de la Subcategoría</label>
                            <input
                                required
                                type="text"
                                placeholder="Ej. Solitario, Alianza, Botón..."
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Descripción (opcional)</label>
                            <textarea
                                rows={4}
                                placeholder="Definición de la tipología constructiva"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            {editingId ? 'Guardar Cambios' : 'Crear Subcategoría'}
                        </button>
                    </form>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {filteredSubcategories.length > 0 ? filteredSubcategories.map(sub => {
                        const parentCat = categories.find(c => c.id === sub.categoryId);
                        return (
                            <div key={sub.id} className="glass-card" style={{ padding: '24px', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        backgroundColor: 'var(--primary)',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white'
                                    }}>
                                        <Layers size={20} />
                                    </div>
                                    <span style={{
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        backgroundColor: 'var(--accent-light)',
                                        color: 'var(--accent)',
                                        padding: '4px 8px',
                                        borderRadius: '4px'
                                    }}>
                                        {parentCat?.name || 'Categoría desconocida'}
                                    </span>
                                </div>
                                <h3 style={{ marginBottom: '8px' }}>{sub.name}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', minHeight: '42px' }}>
                                    {sub.description || 'Sin descripción definida.'}
                                </p>
                                <div style={{ borderTop: '1px solid #f1f1f1', paddingTop: '16px', display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => handleEdit(sub)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px' }}
                                    >
                                        <Edit2 size={14} /> Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(sub.id)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '14px' }}
                                    >
                                        <Trash2 size={14} /> Desactivar
                                    </button>
                                </div>
                            </div>
                        );
                    }) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                            <Layers size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                            <p>No hay subcategorías que coincidan con el filtro.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SubcategoryManager;
