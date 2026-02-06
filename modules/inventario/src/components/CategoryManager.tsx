import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderTree, ArrowLeft } from 'lucide-react';
import { CategoryService } from '../services/CategoryService';
import { Category } from '../models/schema';

const CategoryManager: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const cats = await CategoryService.getAll();
            setCategories(cats);
        } catch (error) {
            console.error("Error loading categories:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            await CategoryService.update(editingId, formData);
        } else {
            await CategoryService.create({ ...formData, createdBy: 'admin' });
        }
        setFormData({ name: '', description: '' });
        setIsAdding(false);
        setEditingId(null);
        await loadCategories();
    };

    const handleEdit = (category: Category) => {
        setFormData({ name: category.name, description: category.description || '' });
        setEditingId(category.id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Estás seguro de desactivar esta categoría?')) {
            await CategoryService.deleteLogic(id);
            await loadCategories();
        }
    };

    return (
        <div className="container">
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Gestor de Categorías</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Módulo de Inventario Troncal (P1)</p>
                </div>
                {!isAdding && (
                    <button className="btn btn-accent" onClick={() => setIsAdding(true)}>
                        <Plus size={20} />
                        Nueva Categoría
                    </button>
                )}
            </header>

            {isAdding ? (
                <div className="glass-card" style={{ padding: '30px', maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <button className="btn" onClick={() => { setIsAdding(false); setEditingId(null); }} style={{ padding: '8px' }}>
                            <ArrowLeft size={20} />
                        </button>
                        <h2 style={{ margin: 0 }}>{editingId ? 'Editar Categoría' : 'Añadir Categoría'}</h2>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Nombre de la Categoría</label>
                            <input
                                required
                                type="text"
                                placeholder="Ej. Anillos, Relojes..."
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Descripción (opcional)</label>
                            <textarea
                                rows={4}
                                placeholder="Breve descripción del tipo de joya"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            {editingId ? 'Guardar Cambios' : 'Crear Categoría'}
                        </button>
                    </form>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {categories.length > 0 ? categories.map(cat => (
                        <div key={cat.id} className="glass-card" style={{ padding: '24px', position: 'relative' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                backgroundColor: 'var(--accent-light)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--accent)',
                                marginBottom: '20px'
                            }}>
                                <FolderTree size={24} />
                            </div>
                            <h3 style={{ marginBottom: '8px' }}>{cat.name}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', minHeight: '42px' }}>
                                {cat.description || 'Sin descripción definida.'}
                            </p>
                            <div style={{ borderTop: '1px solid #f1f1f1', paddingTop: '16px', display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => handleEdit(cat)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px' }}
                                >
                                    <Edit2 size={14} /> Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '14px' }}
                                >
                                    <Trash2 size={14} /> Desactivar
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                            <FolderTree size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                            <p>No hay categorías registradas aún.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CategoryManager;
