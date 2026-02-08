import React, { useState, useEffect, useRef } from 'react';
import {
    X,
    Image as ImageIcon,
    Upload,
    ImagePlus,
    Copy,
    RotateCcw,
    Cpu,
    CheckCircle2,
    Calculator,
    Target, // Using Target icon for "Estrategia Comercial"
    Settings,
    Plus,
    Sparkles,
    Share2,
    Heart,
    Zap,
    Users
} from 'lucide-react';
import { InventoryService } from '../services/InventoryService';
import { ClassificationService } from '../services/ClassificationService';
import { DomainService } from '../services/DomainService';
import { AIService } from '../services/AIService';
import { InventoryItem, Category, Subcategory, Location, OperationalStatus, ClassificationMapping, Attribute, Supplier, DomainValue } from '../models/schema';
import DomainManagerModal from './DomainManagerModal';
import VoiceInput from './VoiceInput';

interface InventoryItemFormProps {
    initialData?: InventoryItem | null;
    categories: Category[];
    subcategories: Subcategory[];
    locations: Location[];
    statuses: OperationalStatus[];
    suppliers: Supplier[];
    allAttributes: Attribute[];
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
}

const InventoryItemForm: React.FC<InventoryItemFormProps> = ({
    initialData,
    categories,
    subcategories,
    locations,
    statuses,
    suppliers,
    allAttributes,
    onSubmit,
    onCancel
}) => {
    // -- State Definitions --
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
        isApproved: false,
        itemCode: '',
        comments: '',
        socialDescription: '',
        detailedDescription: {
            design: '',
            details: '',
            materials: '',
            technicalSpecs: '',
            symbolism: ''
        },
        commercialLine: '',
        collection: '',
        symbology: [] as string[],
        occasion: [] as string[],
        customerProfile: [] as string[],
        attributes: {} as Record<string, any>,
        supplierId: ''
    });

    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    // Dynamic Fields State
    const [dynamicFields, setDynamicFields] = useState<ClassificationMapping[]>([]);
    const [domainValuesMap, setDomainValuesMap] = useState<Record<string, any[]>>({});

    // Commercial Masters State (Local to form or fetched?)
    // To allow managing them, we might need the modals here or pass handlers. 
    // For simplicity, we'll fetch them here to populate dropdowns.
    const [lineValues, setLineValues] = useState<DomainValue[]>([]);
    const [collectionValues, setCollectionValues] = useState<DomainValue[]>([]);
    const [profileValues, setProfileValues] = useState<DomainValue[]>([]);
    const [symbologyValues, setSymbologyValues] = useState<DomainValue[]>([]);
    const [occasionValues, setOccasionValues] = useState<DomainValue[]>([]);

    // Domain Manager Modal State
    const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
    const [managedDomain, setManagedDomain] = useState<{ id: string, name: string }>({ id: '', name: '' });

    // Tabs State
    const [activeTab, setActiveTab] = useState<'general' | 'classification' | 'economy' | 'marketing'>('general');

    const fileInputRef = useRef<HTMLInputElement>(null);

    // -- Initialization --
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description,
                categoryId: initialData.categoryId,
                subcategoryId: initialData.subcategoryId,
                locationId: initialData.locationId,
                statusId: initialData.statusId,
                purchasePrice: initialData.purchasePrice || 0,
                salePrice: initialData.salePrice || 0,
                mainWeight: initialData.mainWeight || 0,
                isApproved: initialData.isApproved || false,
                itemCode: initialData.itemCode || '',
                comments: initialData.comments || '',
                socialDescription: initialData.socialDescription || '',
                detailedDescription: {
                    design: initialData.detailedDescription?.design || '',
                    details: initialData.detailedDescription?.details || '',
                    materials: initialData.detailedDescription?.materials || '',
                    technicalSpecs: initialData.detailedDescription?.technicalSpecs || '',
                    symbolism: initialData.detailedDescription?.symbolism || ''
                },
                commercialLine: initialData.commercialLine || '',
                collection: initialData.collection || '',
                symbology: initialData.symbology || [],
                occasion: initialData.occasion || [],
                customerProfile: initialData.customerProfile || [],
                attributes: initialData.attributes || {},
                supplierId: initialData.supplierId || ''
            });
            setUploadedImages(initialData.images || []);
        }
        fetchCommercialMasters();
    }, [initialData]);

    const fetchCommercialMasters = async () => {
        try {
            const [lines, cols, profs, sims, occs] = await Promise.all([
                DomainService.getValuesByDomain('dom_linea'),
                DomainService.getValuesByDomain('dom_coleccion'),
                DomainService.getValuesByDomain('dom_perfil_cli'),
                DomainService.getValuesByDomain('dom_simbol'),
                DomainService.getValuesByDomain('dom_ocasion')
            ]);
            setLineValues(lines);
            setCollectionValues(cols);
            setProfileValues(profs);
            setSymbologyValues(sims);
            setOccasionValues(occs);
        } catch (error) {
            console.error("Error loading commercial masters:", error);
        }
    };

    // -- Dynamic Fields Logic --
    useEffect(() => {
        const fetchFields = async () => {
            try {
                let fields: ClassificationMapping[] = [];
                if (formData.subcategoryId) {
                    fields = await ClassificationService.getAttributesBySubcategory(formData.subcategoryId, formData.categoryId);
                } else if (formData.categoryId) {
                    fields = await ClassificationService.getAttributesByCategory(formData.categoryId);
                }

                setDynamicFields(fields);

                // Load domain values for LIST fields
                const newDomainMap: Record<string, any[]> = {};
                for (const field of fields) {
                    const attr = allAttributes.find(a => a.id === field.attributeId);
                    if (attr?.dataType === 'LIST' && attr.domainId) {
                        newDomainMap[field.attributeId] = await DomainService.getValuesByDomain(attr.domainId);
                    }
                }
                setDomainValuesMap(newDomainMap);

                // Initialize empty attributes if new
                if (fields.length > 0 && !initialData) {
                    setFormData(prev => {
                        const newAttrs = { ...prev.attributes };
                        fields.forEach(f => {
                            if (newAttrs[f.attributeId] === undefined) {
                                newAttrs[f.attributeId] = '';
                            }
                        });
                        return { ...prev, attributes: newAttrs };
                    });
                }
            } catch (err) {
                console.error("Error en fetchFields:", err);
            }
        };
        fetchFields();
    }, [formData.subcategoryId, formData.categoryId, allAttributes, initialData]);

    // -- Handlers --
    const handleAttrChange = (attrId: string, value: any) => {
        setFormData(prev => {
            const newAttrs = { ...prev.attributes, [attrId]: value };

            // Logic for Stone Dependencies
            if (attrId === 'attr_tip_pie') {
                if (value === 'Sin Piedra') {
                    newAttrs['attr_col_pie'] = '';
                    newAttrs['attr_for_pie'] = '';
                    newAttrs['attr_engaste'] = '';
                    newAttrs['attr_pureza'] = '';
                    newAttrs['attr_col_dia'] = '';
                    newAttrs['attr_cort_dia'] = '';
                    newAttrs['attr_pes_gem'] = '';
                } else if (value !== 'Diamante') {
                    newAttrs['attr_col_dia'] = '';
                    newAttrs['attr_cort_dia'] = '';
                    newAttrs['attr_pes_gem'] = '';
                } else if (value === 'Diamante') {
                    newAttrs['attr_col_pie'] = '';
                }
            }

            // Logic for Engraving
            if (attrId === 'attr_gra_per' && !value) {
                newAttrs['attr_tex_gra'] = '';
            }

            return { ...prev, attributes: newAttrs };
        });
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const base64s = await Promise.all(files.map(file => fileToBase64(file)));
            setUploadedImages(prev => [...prev, ...base64s]);
            setUploadedFiles(prev => [...prev, ...files]);

            if (uploadedImages.length === 0) {
                handleAIAnalysis(files[0]);
            }
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files);
            const base64s = await Promise.all(files.map(file => fileToBase64(file)));
            setUploadedImages(prev => [...prev, ...base64s]);
            setUploadedFiles(prev => [...prev, ...files]);

            if (uploadedImages.length === 0) {
                handleAIAnalysis(files[0]);
            }
        }
    };

    const handleAIAnalysis = async (file: File) => {
        setIsScanning(true);
        try {
            const base64 = await fileToBase64(file);
            const result = await AIService.analyzeImage(base64, file.type, {
                attributes: allAttributes,
                mappings: dynamicFields,
                domainValuesMap: domainValuesMap
            });

            // Match Category/Subcategory ID/Name
            const finalCategoryId = categories.find(c =>
                c.id === result.categoryId ||
                c.name.toLowerCase() === (result.categoryId || "").toLowerCase()
            )?.id || result.categoryId || '';

            const finalSubcategoryId = subcategories.find(s =>
                s.id === result.subcategoryId ||
                s.name.toLowerCase() === (result.subcategoryId || "").toLowerCase()
            )?.id || result.subcategoryId || '';

            setFormData(prev => ({
                ...prev,
                name: result.name || prev.name,
                description: result.description || prev.description,
                socialDescription: result.socialDescription || prev.socialDescription,
                detailedDescription: {
                    ...prev.detailedDescription,
                    ...result.detailedDescription
                },
                commercialLine: result.commercialLine || prev.commercialLine,
                symbology: result.symbology || prev.symbology,
                occasion: result.occasion || prev.occasion,
                customerProfile: result.customerProfile || prev.customerProfile,
                categoryId: finalCategoryId,
                subcategoryId: finalSubcategoryId,
                attributes: {
                    ...prev.attributes,
                    ...(result.attributes || {})
                }
            }));
        } catch (error: any) {
            console.error("Error en análisis IA:", error);
            alert(error.message || "No se pudo completar el análisis de la imagen.");
        } finally {
            setIsScanning(false);
        }
    };

    const handleManualAICopywriting = async () => {
        setIsGeneratingAI(true);
        try {
            const context = {
                name: formData.name,
                category: categories.find(c => c.id === formData.categoryId)?.name || 'N/A',
                subcategory: subcategories.find(s => s.id === formData.subcategoryId)?.name || 'N/A',
                commercialLine: formData.commercialLine,
                collection: formData.collection,
                symbology: (formData.symbology || []).join(', '),
                occasion: (formData.occasion || []).join(', '),
                customerProfile: (formData.customerProfile || []).join(', ')
            };

            const result = await AIService.generateCopywriting(context);
            if (result) {
                setFormData(prev => ({
                    ...prev,
                    socialDescription: result.socialDescription || prev.socialDescription,
                    detailedDescription: {
                        ...prev.detailedDescription,
                        ...result.detailedDescription
                    }
                }));
                alert("Contenido generado con éxito.");
            }
        } catch (error) {
            console.error("Error generating AI content:", error);
            alert("Error al generar contenido con IA.");
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({
            ...formData,
            images: uploadedImages
        });
    };

    // -- Render Helpers --
    const renderDynamicField = (mapping: ClassificationMapping) => {
        const attributeItem = allAttributes.find(a => a.id === mapping.attributeId);
        if (!attributeItem) return null;

        // Visibility Logic from InventoryManager
        if (attributeItem.id === 'attr_tex_gra') {
            if (!formData.attributes['attr_gra_per']) return null;
        }

        const isStoneDependency = ['attr_col_pie', 'attr_for_pie', 'attr_engaste', 'attr_pureza', 'attr_col_dia', 'attr_cort_dia', 'attr_pes_gem'].includes(attributeItem.id);
        const isNoStone = formData.attributes['attr_tip_pie'] === 'Sin Piedra';
        const isDisabled = isStoneDependency && isNoStone;

        const isDiamondOnly = ['attr_col_dia', 'attr_cort_dia', 'attr_pes_gem'].includes(attributeItem.id);
        const isStoneColor = attributeItem.id === 'attr_col_pie';
        const stoneType = formData.attributes['attr_tip_pie'];

        if (stoneType === 'Diamante') {
            if (isStoneColor) return null;
        } else {
            if (isDiamondOnly) return null;
        }

        let options = domainValuesMap[attributeItem.id] || [];
        if (attributeItem.id === 'attr_ley') {
            const material = formData.attributes['attr_mat_pri'];
            if (material === 'Oro') options = options.filter((v: any) => v.value.includes('k'));
            else if (material === 'Plata') options = options.filter((v: any) => !v.value.includes('k') && (v.value.includes('925') || v.value.includes('950')));
        }

        if (attributeItem.id === 'attr_pureza') {
            if (stoneType === 'Diamante') options = options.filter((v: any) => !['AAA', 'AA'].includes(v.value));
            else if (['Circonita (CZ)', 'Zafiro', 'Rubí', 'Esmeralda'].includes(stoneType)) options = options.filter((v: any) => ['AAA', 'AA', 'N/A'].includes(v.value));
        }

        const purityDescriptions: Record<string, string> = {
            'FL': 'Flawless: Sin inclusiones externas ni internas (10x)',
            'IF': 'Internally Flawless: Sin inclusiones internas (10x)',
            'VVS1': 'Very Very Slightly Included: Inclusiones muy difíciles de ver (10x)',
            'VVS2': 'Very Very Slightly Included: Inclusiones difíciles de ver (10x)',
            'VS1': 'Very Slightly Included: Inclusiones difíciles de ver con lupa',
            'VS2': 'Very Slightly Included: Inclusiones algo más fáciles de ver con lupa',
            'SI1': 'Slightly Included: Inclusiones visibles con lupa',
            'SI2': 'Slightly Included: Inclusiones fácilmente visibles con lupa',
            'I1': 'Included: Inclusiones visibles a simple vista',
            'I2': 'Included: Inclusiones muy visibles a simple vista',
            'I3': 'Included: Inclusiones que afectan la durabilidad/brillo',
            'AAA': 'Calidad Comercial Superior: Máximo brillo y limpieza',
            'AA': 'Calidad Comercial Media: Buen color y transparencia'
        };

        const diamondColorDescriptions: Record<string, string> = {
            'D': 'Incoloro: Máxima blancura. Estándar de alta joyería.',
            'E': 'Incoloro: Blancura excepcional.',
            'F': 'Incoloro: Color casi imperceptible.',
            'G': 'Casi Incoloro: Color imperceptible a menos que se compare.',
            'H': 'Casi Incoloro: Excelente relación calidad-precio.',
            'I': 'Casi Incoloro: Tono muy leve detectable por expertos.',
            'J': 'Casi Incoloro: Límite de la gama incolora.',
            'K': 'Ligeramente Color: Se empieza a notar un tono amarillento.',
            'L': 'Ligeramente Color: Tono cálido visible.',
            'M': 'Ligeramente Color: Color evidente.',
            'N-R': 'Color Tenue: Tono amarillo o marrón claro visible.',
            'S-Z': 'Color Ligero: Color amarillo o marrón evidente.',
            'Fancy Color': 'Diamantes de colores intensos (Azul, Rosa, Amarillo intenso).'
        };

        const diamondCutDescriptions: Record<string, string> = {
            'Excellent (EX)': 'Excelente: Máximo brillo y centelleo. Refleja casi toda la luz.',
            'Very Good (VG)': 'Muy Bueno: Gran brillo. Difícil de distinguir de Excellent.',
            'Good (G)': 'Bueno: Refleja la mayor parte de la luz. Buena relación calidad-precio.',
            'Fair (F)': 'Aceptable: Brillo notablemente menor. La luz se escapa por los lados.',
            'Poor (P)': 'Pobre: Corte muy profundo o plano. Se ve opaco o sin vida.'
        };

        const descriptionsMap: Record<string, Record<string, string>> = {
            'attr_pureza': purityDescriptions,
            'attr_col_dia': diamondColorDescriptions,
            'attr_cort_dia': diamondCutDescriptions
        };

        const currentDescriptions = descriptionsMap[attributeItem.id] || {};
        const isFirstDiamondField = attributeItem.id === 'attr_col_dia';

        return (
            <React.Fragment key={attributeItem.id}>
                {isFirstDiamondField && (
                    <div style={{
                        gridColumn: '1 / -1',
                        padding: '12px',
                        backgroundColor: 'var(--primary-light)',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        borderLeft: '4px solid var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <CheckCircle2 size={18} color="var(--primary)" />
                        <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--primary)' }}>Certificación de Gema (Las 4 Cs)</span>
                    </div>
                )}
                <div style={{ marginBottom: '16px', opacity: isDisabled ? 0.6 : 1 }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                        {attributeItem.name} {mapping.isMandatory && <span style={{ color: 'var(--error)' }}>*</span>}
                        {isDisabled && <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '8px' }}>(No Aplica)</span>}
                    </label>

                    {attributeItem.dataType === 'LIST' ? (
                        <select
                            required={mapping.isMandatory && !isDisabled}
                            disabled={isDisabled}
                            value={formData.attributes[attributeItem.id] || ''}
                            onChange={e => handleAttrChange(attributeItem.id, e.target.value)}
                            className="form-control"
                            style={{ width: '100%' }}
                        >
                            <option value="">{isDisabled ? 'N/A' : 'Seleccione...'}</option>
                            {options.map((v: any) => (
                                <option key={v.id} value={v.value} title={currentDescriptions[v.value] || ''}>
                                    {v.value} {currentDescriptions[v.value] ? 'ⓘ' : ''}
                                </option>
                            ))}
                        </select>
                    ) : attributeItem.dataType === 'NUMBER' ? (
                        <div style={{ position: 'relative' }}>
                            <input
                                type="number"
                                step="0.01"
                                required={mapping.isMandatory && !isDisabled}
                                disabled={isDisabled}
                                className="form-control"
                                style={{ width: '100%' }}
                                value={formData.attributes[attributeItem.id] || ''}
                                onChange={e => handleAttrChange(attributeItem.id, e.target.value)}
                            />
                            {attributeItem.id === 'attr_pes_gem' && (
                                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>ct</span>
                            )}
                        </div>
                    ) : attributeItem.dataType === 'BOOLEAN' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                                type="checkbox"
                                disabled={isDisabled}
                                checked={!!formData.attributes[attributeItem.id]}
                                onChange={e => handleAttrChange(attributeItem.id, e.target.checked)}
                            />
                            <span style={{ fontSize: '13px' }}>Sí / No</span>
                        </div>
                    ) : (
                        <input
                            type="text"
                            required={mapping.isMandatory && !isDisabled}
                            disabled={isDisabled}
                            className="form-control"
                            style={{ width: '100%' }}
                            value={formData.attributes[attributeItem.id] || ''}
                            onChange={e => handleAttrChange(attributeItem.id, e.target.value)}
                        />
                    )}
                </div>
            </React.Fragment>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* --- HEADER --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px', borderBottom: '1px solid #f0f0f0', backgroundColor: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <h2 style={{ margin: 0 }}>{initialData ? 'Editar Pieza' : 'Alta de Nueva Pieza'}</h2>
                    <button
                        type="button"
                        className="btn btn-accent"
                        style={{ padding: '6px 16px', fontSize: '12px' }}
                        onClick={() => { if (uploadedFiles.length > 0) handleAIAnalysis(uploadedFiles[0]); else alert("Sube una imagen primero"); }}
                        disabled={isScanning}
                    >
                        <Cpu size={14} /> {isScanning ? 'Escaneando...' : 'Autocompletar con IA'}
                    </button>
                    <button
                        type="button"
                        className="btn"
                        style={{ padding: '6px 16px', fontSize: '12px', border: '1px solid #ddd' }}
                        onClick={() => setFormData({
                            name: '', description: '', categoryId: '', subcategoryId: '', locationId: '', statusId: '', purchasePrice: 0, salePrice: 0, mainWeight: 0, isApproved: false, itemCode: '', comments: '', socialDescription: '', detailedDescription: { design: '', details: '', materials: '', technicalSpecs: '', symbolism: '' }, commercialLine: '', collection: '', symbology: [], occasion: [], customerProfile: [], attributes: {}, supplierId: ''
                        })}
                    >
                        <RotateCcw size={14} /> Limpiar
                    </button>
                </div>
                <button className="btn" onClick={onCancel} style={{ border: 'none', background: 'transparent' }}><X size={24} color="#666" /></button>
            </div>

            {/* --- TABS NAVIGATION --- */}
            <div style={{ display: 'flex', gap: '2px', padding: '0 32px', backgroundColor: 'white', borderBottom: '1px solid #f0f0f0' }}>
                {[
                    { id: 'general', label: '1. General', icon: <ImageIcon size={16} /> },
                    { id: 'classification', label: '2. Clasificación', icon: <Settings size={16} /> },
                    { id: 'economy', label: '3. Economía y Logística', icon: <Calculator size={16} /> },
                    { id: 'marketing', label: '4. Marketing e IA', icon: <Sparkles size={16} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        style={{
                            padding: '16px 24px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: activeTab === tab.id ? 'var(--accent)' : '#666',
                            fontWeight: activeTab === tab.id ? 700 : 500,
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            borderBottom: activeTab === tab.id ? '3px solid var(--accent)' : '3px solid transparent',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* --- CONTENT SCROLLABLE --- */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                <form onSubmit={handleFormSubmit}>

                    {/* SECTION 1: IMAGES & CORE INFO (General Tab) */}
                    {activeTab === 'general' && (
                        <>
                            <div style={{ marginBottom: '40px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: 600, fontSize: '14px', color: '#444' }}>
                                    Galería de Imágenes (La primera será portada)
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileSelect}
                                    accept="image/*"
                                />
                                <div style={{
                                    border: isDragging ? '2px solid var(--accent)' : '2px dashed #e0e0e0',
                                    borderRadius: '16px',
                                    padding: '40px',
                                    textAlign: 'center',
                                    backgroundColor: isDragging ? 'var(--accent-light)' : '#fafafa',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    opacity: isDragging ? 0.8 : 1
                                }}
                                    className="upload-zone"
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                >
                                    <ImagePlus size={48} color={isDragging ? 'var(--accent)' : '#ccc'} style={{ marginBottom: '16px' }} />
                                    <p style={{ margin: 0, color: '#666', fontSize: '15px' }}>
                                        Arrastra las fotos aquí o <strong>haz clic para explorar</strong>
                                    </p>
                                    <p style={{ marginTop: '8px', color: '#999', fontSize: '12px' }}>Soporta múltiples imágenes JPG, PNG</p>
                                </div>

                                {uploadedImages.length > 0 && (
                                    <div style={{ display: 'flex', gap: '16px', marginTop: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
                                        {uploadedImages.map((src, idx) => (
                                            <div key={idx} style={{ position: 'relative', flexShrink: 0, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
                                                <img src={src} style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover' }} />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setUploadedImages(prev => prev.filter((_, i) => i !== idx));
                                                        setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
                                                    }}
                                                    style={{ position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--error)', color: 'white', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                >
                                                    <X size={14} />
                                                </button>
                                                {idx === 0 && (
                                                    <span style={{ position: 'absolute', bottom: '8px', left: '8px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>Principal</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '48px' }}>
                                {/* --- CORE INFO --- */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                    {/* Identificación */}
                                    <div className="glass-card" style={{ padding: '24px', backgroundColor: 'white', border: '1px solid #eee' }}>
                                        <label style={{ display: 'block', marginBottom: '16px', fontWeight: 700, fontSize: '14px', color: '#333', borderBottom: '2px solid var(--accent)', paddingBottom: '8px', width: 'fit-content' }}>1. Identificación</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                    <span style={{ fontSize: '11px', color: '#666', fontWeight: 600 }}>NOMBRE CORTO *</span>
                                                    <VoiceInput onResult={(text) => setFormData(prev => ({ ...prev, name: prev.name + (prev.name ? ' ' : '') + text }))} />
                                                </div>
                                                <input
                                                    required
                                                    className="form-control"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="Ej: Anillo Solitario Oro Blanco"
                                                    style={{ width: '100%', fontSize: '15px' }}
                                                />
                                            </div>
                                            <div>
                                                <span style={{ fontSize: '11px', color: '#666', fontWeight: 600 }}>CÓDIGO (REF)</span>
                                                <input
                                                    className="form-control"
                                                    value={formData.itemCode}
                                                    onChange={e => setFormData({ ...formData, itemCode: e.target.value })}
                                                    placeholder="Auto"
                                                    style={{ width: '100%', fontWeight: 700, color: 'var(--primary)', textAlign: 'center' }}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '11px', color: '#666', fontWeight: 600 }}>DESCRIPCIÓN TÉCNICA *</span>
                                                <VoiceInput onResult={(text) => setFormData(prev => ({ ...prev, description: prev.description + (prev.description ? ' ' : '') + text }))} />
                                            </div>
                                            <textarea
                                                required
                                                rows={3}
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Descripción detallada para inventario..."
                                                style={{ width: '100%', borderRadius: '8px', border: '1px solid #ddd', padding: '12px', marginTop: '4px' }}
                                            />
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '11px', color: '#666', fontWeight: 600 }}>COMENTARIOS INTERNOS</span>
                                                <VoiceInput onResult={(text) => setFormData(prev => ({ ...prev, comments: prev.comments + (prev.comments ? ' ' : '') + text }))} />
                                            </div>
                                            <textarea
                                                rows={2}
                                                value={formData.comments}
                                                onChange={e => setFormData({ ...formData, comments: e.target.value })}
                                                placeholder="Notas de taller, defectos, observaciones..."
                                                style={{ width: '100%', borderRadius: '8px', border: '1px solid #ddd', padding: '12px', fontSize: '13px', backgroundColor: '#fffcf5', marginTop: '4px' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* SECTION 2: CLASSIFICATION (Classification Tab) */}
                    {activeTab === 'classification' && (
                        <div className="glass-card" style={{ padding: '24px', backgroundColor: 'white', border: '1px solid #eee' }}>
                            <label style={{ display: 'block', marginBottom: '16px', fontWeight: 700, fontSize: '14px', color: '#333', borderBottom: '2px solid var(--accent)', paddingBottom: '8px', width: 'fit-content' }}>2. Clasificación</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                <div>
                                    <span style={{ fontSize: '11px', color: '#666', fontWeight: 600 }}>CATEGORÍA *</span>
                                    <select
                                        required
                                        className="form-control"
                                        value={formData.categoryId}
                                        onChange={e => setFormData({ ...formData, categoryId: e.target.value, subcategoryId: '' })}
                                        style={{ width: '100%' }}
                                    >
                                        <option value="" disabled>Seleccione...</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <span style={{ fontSize: '11px', color: '#666', fontWeight: 600 }}>SUBCATEGORÍA *</span>
                                    <select
                                        required
                                        className="form-control"
                                        value={formData.subcategoryId}
                                        onChange={e => setFormData({ ...formData, subcategoryId: e.target.value })}
                                        disabled={!formData.categoryId}
                                        style={{ width: '100%' }}
                                    >
                                        <option value="" disabled>Seleccione...</option>
                                        {subcategories.filter(s => s.categoryId === formData.categoryId).map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* CAMPOS DINÁMICOS */}
                            {dynamicFields.length > 0 && (
                                <div style={{ padding: '24px', backgroundColor: '#f8f9fa', borderRadius: '12px', border: '1px solid #e9ecef' }}>
                                    <h4 style={{ margin: '0 0 20px 0', fontSize: '12px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                                        Atributos de {subcategories.find(s => s.id === formData.subcategoryId)?.name}
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {dynamicFields.map(renderDynamicField)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECTION 3: ECONOMY & LOGISTICS (Economy Tab) */}
                    {activeTab === 'economy' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1.5fr) 1fr', gap: '48px' }}>
                            {/* Financial Card */}
                            <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #ffe8cc', boxShadow: '0 4px 15px rgba(230, 126, 34, 0.1)' }}>
                                <div style={{ backgroundColor: '#fff8f0', padding: '16px 24px', borderBottom: '1px solid #ffe8cc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: '#e67e22' }}>Valoración Financiera</label>
                                    <Calculator size={18} color="#e67e22" />
                                </div>
                                <div style={{ padding: '24px', backgroundColor: 'white' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                        <div>
                                            <span style={{ fontSize: '11px', color: '#666', fontWeight: 700 }}>COSTE COMPRA (€)</span>
                                            <input
                                                type="number"
                                                required
                                                step="0.01"
                                                className="form-control"
                                                value={formData.purchasePrice}
                                                onChange={e => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })}
                                                style={{ width: '100%', marginTop: '4px', fontSize: '16px' }}
                                            />
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '11px', color: '#666', fontWeight: 700 }}>PVP VENTA (€)</span>
                                            <input
                                                type="number"
                                                required
                                                step="0.01"
                                                className="form-control"
                                                value={formData.salePrice}
                                                onChange={e => setFormData({ ...formData, salePrice: parseFloat(e.target.value) })}
                                                style={{ width: '100%', marginTop: '4px', fontSize: '16px', fontWeight: 700 }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ padding: '16px', backgroundColor: 'rgba(39, 174, 96, 0.05)', borderRadius: '8px', border: '1px solid rgba(39, 174, 96, 0.2)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#2ecc71', fontSize: '13px', fontWeight: 600 }}>Margen Estimado</span>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 800, color: '#27ae60', fontSize: '18px' }}>
                                                    {((formData.salePrice - formData.purchasePrice) || 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#27ae60' }}>
                                                    {formData.purchasePrice > 0 ? (((formData.salePrice - formData.purchasePrice) / formData.purchasePrice) * 100).toFixed(1) : 0}% de rentabilidad
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Logistics */}
                            <div className="glass-card" style={{ padding: '24px', backgroundColor: 'white', border: '1px solid #eee' }}>
                                <label style={{ display: 'block', marginBottom: '16px', fontWeight: 700, fontSize: '14px', color: '#333', borderBottom: '2px solid var(--accent)', paddingBottom: '8px', width: 'fit-content' }}>Logística</label>

                                <div style={{ display: 'grid', gap: '16px' }}>
                                    <div>
                                        <span style={{ fontSize: '11px', color: '#666', fontWeight: 600 }}>UBICACIÓN FÍSICA *</span>
                                        <select
                                            required
                                            className="form-control"
                                            value={formData.locationId}
                                            onChange={e => setFormData({ ...formData, locationId: e.target.value })}
                                            style={{ width: '100%' }}
                                        >
                                            <option value="" disabled>Seleccione...</option>
                                            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '11px', color: '#666', fontWeight: 600 }}>ESTADO DE LA PIEZA *</span>
                                        <select
                                            required
                                            className="form-control"
                                            value={formData.statusId}
                                            onChange={e => setFormData({ ...formData, statusId: e.target.value })}
                                            style={{ width: '100%' }}
                                        >
                                            <option value="" disabled>Seleccione...</option>
                                            {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '11px', color: '#666', fontWeight: 600 }}>PROVEEDOR</span>
                                        <select
                                            className="form-control"
                                            value={formData.supplierId}
                                            onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                                            style={{ width: '100%' }}
                                        >
                                            <option value="">(Opcional)</option>
                                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '11px', color: '#666', fontWeight: 600 }}>PESO TOTAL (g) *</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            className="form-control"
                                            value={formData.mainWeight}
                                            onChange={e => setFormData({ ...formData, mainWeight: parseFloat(e.target.value) })}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECTION 4: MARKETING & IA (Marketing Tab) */}
                    {activeTab === 'marketing' && (
                        <>
                            <div style={{ padding: '32px', border: '1px solid #e0e0e0', borderRadius: '16px', backgroundColor: '#fdfdfd', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                    <Target size={24} color="var(--primary)" />
                                    <h3 style={{ margin: 0, fontSize: '18px' }}>Estrategia Comercial e Inteligencia</h3>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                                    {/* Línea */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <label style={{ margin: 0, fontWeight: 600, fontSize: '12px' }}>LÍNEA COMERCIAL</label>
                                            <button
                                                type="button"
                                                onClick={() => { setManagedDomain({ id: 'dom_linea', name: 'Línea Comercial' }); setIsDomainModalOpen(true); }}
                                                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0 }}
                                            >
                                                <Settings size={12} />
                                            </button>
                                        </div>
                                        <select
                                            className="form-control"
                                            value={formData.commercialLine}
                                            onChange={e => setFormData({ ...formData, commercialLine: e.target.value })}
                                            style={{ width: '100%' }}
                                        >
                                            <option value="">Seleccione...</option>
                                            {lineValues.map(v => <option key={v.id} value={v.value}>{v.value}</option>)}
                                        </select>
                                    </div>

                                    {/* Colección */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <label style={{ margin: 0, fontWeight: 600, fontSize: '12px' }}>COLECCIÓN</label>
                                            <button
                                                type="button"
                                                onClick={() => { setManagedDomain({ id: 'dom_coleccion', name: 'Colecciones' }); setIsDomainModalOpen(true); }}
                                                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0 }}
                                            >
                                                <Settings size={12} />
                                            </button>
                                        </div>
                                        <select
                                            className="form-control"
                                            value={formData.collection}
                                            onChange={e => setFormData({ ...formData, collection: e.target.value })}
                                            style={{ width: '100%' }}
                                        >
                                            <option value="">Seleccione...</option>
                                            {collectionValues.map(v => <option key={v.id} value={v.value}>{v.value}</option>)}
                                        </select>
                                    </div>

                                    {/* Ocasiones */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <label style={{ margin: 0, fontWeight: 600, fontSize: '12px' }}>OCASIÓN / MOTIVO</label>
                                            <button
                                                type="button"
                                                onClick={() => { setManagedDomain({ id: 'dom_ocasion', name: 'Ocasiones' }); setIsDomainModalOpen(true); }}
                                                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0 }}
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '8px', border: '1px solid #ddd', borderRadius: '8px', minHeight: '38px', backgroundColor: 'white' }}>
                                            {occasionValues.map(v => (
                                                <div
                                                    key={v.id}
                                                    onClick={() => {
                                                        const current = formData.occasion || [];
                                                        const next = current.includes(v.value) ? current.filter(p => p !== v.value) : [...current, v.value];
                                                        setFormData({ ...formData, occasion: next });
                                                    }}
                                                    style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '15px',
                                                        fontSize: '10px',
                                                        cursor: 'pointer',
                                                        backgroundColor: formData.occasion?.includes(v.value) ? '#9b59b6' : '#f0f2f5',
                                                        color: formData.occasion?.includes(v.value) ? 'white' : '#555',
                                                    }}
                                                >
                                                    {v.value}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Simbología */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <label style={{ margin: 0, fontWeight: 600, fontSize: '12px' }}>SIMBOLOGÍA</label>
                                            <button
                                                type="button"
                                                onClick={() => { setManagedDomain({ id: 'dom_simbol', name: 'Simbología' }); setIsDomainModalOpen(true); }}
                                                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0 }}
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '8px', border: '1px solid #ddd', borderRadius: '8px', minHeight: '38px', backgroundColor: 'white' }}>
                                            {symbologyValues.map(v => (
                                                <div
                                                    key={v.id}
                                                    onClick={() => {
                                                        const current = formData.symbology || [];
                                                        const next = current.includes(v.value) ? current.filter(p => p !== v.value) : [...current, v.value];
                                                        setFormData({ ...formData, symbology: next });
                                                    }}
                                                    style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '15px',
                                                        fontSize: '10px',
                                                        cursor: 'pointer',
                                                        backgroundColor: formData.symbology?.includes(v.value) ? '#e74c3c' : '#f0f2f5',
                                                        color: formData.symbology?.includes(v.value) ? 'white' : '#555',
                                                    }}
                                                >
                                                    {v.value}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Perfil Cliente */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <label style={{ margin: 0, fontWeight: 600, fontSize: '12px' }}>PERFIL CLIENTE</label>
                                            <button
                                                type="button"
                                                onClick={() => { setManagedDomain({ id: 'dom_perfil_cli', name: 'Perfiles de Cliente' }); setIsDomainModalOpen(true); }}
                                                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0 }}
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '8px', border: '1px solid #ddd', borderRadius: '8px', minHeight: '38px', backgroundColor: 'white' }}>
                                            {profileValues.map(v => (
                                                <div
                                                    key={v.id}
                                                    onClick={() => {
                                                        const current = formData.customerProfile || [];
                                                        const next = current.includes(v.value) ? current.filter(p => p !== v.value) : [...current, v.value];
                                                        setFormData({ ...formData, customerProfile: next });
                                                    }}
                                                    style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '15px',
                                                        fontSize: '10px',
                                                        cursor: 'pointer',
                                                        backgroundColor: formData.customerProfile?.includes(v.value) ? '#f39c12' : '#f0f2f5',
                                                        color: formData.customerProfile?.includes(v.value) ? 'white' : '#555',
                                                    }}
                                                >
                                                    {v.value}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 4: AI COPYWRITING */}
                            <div style={{ padding: '32px', border: '1px solid #c7d2fe', borderRadius: '16px', backgroundColor: '#eef2ff' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Sparkles size={24} color="#6366f1" />
                                        <h3 style={{ margin: 0, color: '#4338ca', fontSize: '18px' }}>Copywriting & Marketing Generativo</h3>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleManualAICopywriting}
                                        disabled={isGeneratingAI}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#6366f1', border: 'none' }}
                                    >
                                        {isGeneratingAI ? <><RotateCcw size={16} className="spin" /> Generando...</> : <><Sparkles size={16} /> Generar con IA</>}
                                    </button>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontWeight: 600, fontSize: '13px' }}>
                                            <Share2 size={16} /> Social Media Copy (Instagram/FB)
                                        </label>
                                        <VoiceInput onResult={(text) => setFormData(prev => ({ ...prev, socialDescription: prev.socialDescription + (prev.socialDescription ? ' ' : '') + text }))} />
                                    </div>
                                    <textarea
                                        rows={3}
                                        className="form-control"
                                        value={formData.socialDescription}
                                        onChange={e => setFormData({ ...formData, socialDescription: e.target.value })}
                                        placeholder="Caption creativo para redes sociales..."
                                        style={{ width: '100%', borderRadius: '12px', border: '1px solid #c7d2fe' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#666' }}>Detalles de Diseño</span>
                                            <VoiceInput onResult={(text) => setFormData(prev => ({ ...prev, detailedDescription: { ...prev.detailedDescription, design: prev.detailedDescription.design + (prev.detailedDescription.design ? ' ' : '') + text } }))} />
                                        </div>
                                        <textarea rows={2} className="form-control" value={formData.detailedDescription.design} onChange={e => setFormData({ ...formData, detailedDescription: { ...formData.detailedDescription, design: e.target.value } })} style={{ width: '100%', marginTop: '4px' }} />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#666' }}>Materiales y Acabados</span>
                                            <VoiceInput onResult={(text) => setFormData(prev => ({ ...prev, detailedDescription: { ...prev.detailedDescription, materials: prev.detailedDescription.materials + (prev.detailedDescription.materials ? ' ' : '') + text } }))} />
                                        </div>
                                        <textarea rows={2} className="form-control" value={formData.detailedDescription.materials} onChange={e => setFormData({ ...formData, detailedDescription: { ...formData.detailedDescription, materials: e.target.value } })} style={{ width: '100%', marginTop: '4px' }} />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#666' }}>Simbolismo de la Pieza</span>
                                            <VoiceInput onResult={(text) => setFormData(prev => ({ ...prev, detailedDescription: { ...prev.detailedDescription, symbolism: prev.detailedDescription.symbolism + (prev.detailedDescription.symbolism ? ' ' : '') + text } }))} />
                                        </div>
                                        <textarea
                                            rows={2}
                                            className="form-control"
                                            value={formData.detailedDescription.symbolism}
                                            onChange={e => setFormData({ ...formData, detailedDescription: { ...formData.detailedDescription, symbolism: e.target.value } })}
                                            style={{ width: '100%', marginTop: '4px' }}
                                        />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#666' }}>Especificaciones Técnicas</span>
                                            <VoiceInput onResult={(text) => setFormData(prev => ({ ...prev, detailedDescription: { ...prev.detailedDescription, technicalSpecs: prev.detailedDescription.technicalSpecs + (prev.detailedDescription.technicalSpecs ? ' ' : '') + text } }))} />
                                        </div>
                                        <textarea
                                            rows={2}
                                            className="form-control"
                                            value={formData.detailedDescription.technicalSpecs}
                                            onChange={e => setFormData({ ...formData, detailedDescription: { ...formData.detailedDescription, technicalSpecs: e.target.value } })}
                                            style={{ width: '100%', marginTop: '4px' }}
                                        />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#666' }}>Detalles Adicionales</span>
                                            <VoiceInput onResult={(text) => setFormData(prev => ({ ...prev, detailedDescription: { ...prev.detailedDescription, details: prev.detailedDescription.details + (prev.detailedDescription.details ? ' ' : '') + text } }))} />
                                        </div>
                                        <textarea
                                            rows={2}
                                            className="form-control"
                                            value={formData.detailedDescription.details}
                                            onChange={e => setFormData({ ...formData, detailedDescription: { ...formData.detailedDescription, details: e.target.value } })}
                                            style={{ width: '100%', marginTop: '4px' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingBottom: '40px' }}>
                        <button type="button" className="btn" onClick={onCancel} style={{ padding: '12px 24px' }}>Cancelar</button>
                        <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '16px' }}>
                            {initialData ? 'Guardar Cambios' : 'Crear Pieza'}
                        </button>
                    </div>

                </form>
            </div >

            <DomainManagerModal
                isOpen={isDomainModalOpen}
                onClose={() => setIsDomainModalOpen(false)}
                domainId={managedDomain.id}
                domainName={managedDomain.name}
                onUpdate={fetchCommercialMasters}
            />
        </div >
    );
};

export default InventoryItemForm;
