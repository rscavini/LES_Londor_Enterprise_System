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
    Image as ImageIcon,
    X,
    ChevronRight,
    CheckCircle2,
    Trash2,
    Download,
    Printer,
    ArrowUpDown,
    Check,
    Cpu,
    Upload,
    ImagePlus,
    Copy,
    RotateCcw,
    Calculator,
    Table,
    ChevronUp,
    ChevronDown,
    Clock,
    Heart,
    Sparkles,
    Share2,
    Target,
    Users,
    Calendar,
    Zap,
    Settings
} from 'lucide-react';
import { InventoryService } from '../services/InventoryService';
import { CategoryService } from '../services/CategoryService';
import { SubcategoryService } from '../services/SubcategoryService';
import { LocationService } from '../services/LocationService';
import { OperationalStatusService } from '../services/OperationalStatusService';
import { ClassificationService } from '../services/ClassificationService';
import { AttributeService } from '../services/AttributeService';
import { DomainService } from '../services/DomainService';
import { AIService } from '../services/AIService';
import { CustomerService } from '../services/CustomerService';
import { ReservationService } from '../services/ReservationService';
import { CommercialService } from '../services/CommercialService';
import { InventoryItem, Category, Subcategory, Location, OperationalStatus, ClassificationMapping, Attribute, Customer, DomainValue } from '../models/schema';
import CommercialDashboard from './CommercialDashboard';
import DomainManagerModal from './DomainManagerModal';

const InventoryManager: React.FC = () => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [statuses, setStatuses] = useState<OperationalStatus[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);

    // Estados para Maestros Dinámicos Comerciales
    const [lineValues, setLineValues] = useState<DomainValue[]>([]);
    const [collectionValues, setCollectionValues] = useState<DomainValue[]>([]);
    const [profileValues, setProfileValues] = useState<DomainValue[]>([]);
    const [symbologyValues, setSymbologyValues] = useState<DomainValue[]>([]);
    const [occasionValues, setOccasionValues] = useState<DomainValue[]>([]);
    const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
    const [managedDomain, setManagedDomain] = useState<{ id: string, name: string }>({ id: '', name: '' });
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    // Dynamic Fields State
    const [dynamicFields, setDynamicFields] = useState<ClassificationMapping[]>([]);
    const [allAttributes, setAllAttributes] = useState<Attribute[]>([]);
    const [domainValuesMap, setDomainValuesMap] = useState<Record<string, any[]>>({});

    // UI State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'excel'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);

    // Sales Assistant Mode
    const [isSalesAssistantActive, setIsSalesAssistantActive] = useState(false);
    const [salesIntent, setSalesIntent] = useState('');

    // Filters state
    const [filters, setFilters] = useState({
        categoryId: '',
        locationId: '',
        statusId: '',
        minPrice: '',
        maxPrice: ''
    });

    // Módulos de Inteligencia UI State
    const [showCommercialDashboard, setShowCommercialDashboard] = useState(false);
    const [showBulkTagging, setShowBulkTagging] = useState(false);
    const [bulkTags, setBulkTags] = useState({
        commercialLine: '',
        symbology: [] as string[],
        occasion: [] as string[],
        customerProfile: [] as string[]
    });

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
        attributes: {} as Record<string, any>
    });

    const [selectedDetailItem, setSelectedDetailItem] = useState<InventoryItem | null>(null);
    const [activeDetailImageIdx, setActiveDetailImageIdx] = useState(0);
    const [isScanning, setIsScanning] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Reservation State
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
    const [reservationExpiry, setReservationExpiry] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [customersList, setCustomersList] = useState<Customer[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const handleOpenReservation = async () => {
        setIsReservationModalOpen(true);
        // Sugerir caducidad en 3 días por defecto
        const threeDays = new Date();
        threeDays.setDate(threeDays.getDate() + 3);
        setReservationExpiry(threeDays.toISOString().split('T')[0]);

        try {
            const custs = await CustomerService.getAll();
            setCustomersList(custs);
        } catch (err) {
            console.error("Error loading customers for reservation:", err);
        }
    };

    const handleCreateReservation = async () => {
        if (!selectedDetailItem || !selectedCustomerId || !reservationExpiry) {
            alert("Por favor, selecciona un cliente y una fecha de vencimiento.");
            return;
        }

        try {
            await ReservationService.createReservation({
                itemId: selectedDetailItem.id,
                customerId: selectedCustomerId,
                locationId: selectedDetailItem.locationId,
                expiryDate: new Date(reservationExpiry),
                resolutionNote: '',
                createdBy: 'admin'
            });
            setIsReservationModalOpen(false);
            setSelectedDetailItem(null);
            await loadData();
            alert("Reserva creada con éxito.");
        } catch (err) {
            console.error("Error creating reservation:", err);
            alert("Error al crear la reserva.");
        }
    };

    // Cargar campos dinámicos cuando cambia la categoría o subcategoría
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

                // Cargar valores de dominio para campos de tipo LIST
                const newDomainMap: Record<string, any[]> = {};
                for (const field of fields) {
                    const attr = allAttributes.find(a => a.id === field.attributeId);
                    if (attr?.dataType === 'LIST' && attr.domainId) {
                        newDomainMap[field.attributeId] = await DomainService.getValuesByDomain(attr.domainId);
                    }
                }
                setDomainValuesMap(newDomainMap);

                if (fields.length > 0) {
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
    }, [formData.subcategoryId, formData.categoryId, allAttributes]);

    const loadData = async () => {
        console.log("Iniciando carga de datos...");
        try {
            const [
                itemsData,
                catsData,
                subsData,
                locsData,
                statsData,
                attrsData,
                custsData
            ] = await Promise.all([
                InventoryService.getAll(),
                CategoryService.getAll(),
                SubcategoryService.getAll(),
                LocationService.getAll(),
                OperationalStatusService.getAll(),
                AttributeService.getAll(),
                CustomerService.getAll()
            ]);

            console.log("Datos cargados:", { items: itemsData.length, cats: catsData.length, subs: subsData.length });
            setItems(itemsData);
            setCategories(catsData);
            setSubcategories(subsData);
            setLocations(locsData);
            setStatuses(statsData);
            setAllAttributes(attrsData);
            setCustomers(custsData);
            await fetchCommercialMasters();
        } catch (error: any) {
            console.error("Error crítico en loadData:", error);
            if (error.message?.includes("permissions")) {
                alert("Error de permisos en Firestore. Asegúrate de que las reglas de seguridad permitan el acceso de lectura/escritura.");
            } else {
                alert("Error al cargar los datos iniciales. Revisa la consola para más detalles.");
            }
        }
    };

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


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsScanning(true);
        try {
            const finalImages = [...uploadedImages];

            if (editingItemId) {
                await InventoryService.update(editingItemId, {
                    ...formData,
                    images: finalImages
                });
            } else {
                await InventoryService.create({
                    ...formData,
                    images: finalImages,
                    createdBy: 'admin',
                    socialDescription: formData.socialDescription,
                    detailedDescription: formData.detailedDescription,
                    commercialLine: formData.commercialLine,
                    collection: formData.collection,
                    symbology: formData.symbology,
                    occasion: formData.occasion,
                    customerProfile: formData.customerProfile
                });
            }
            setIsAddModalOpen(false);
            resetForm();
            await loadData();
        } catch (error) {
            console.error("Error saving item:", error);
            alert("No se pudo guardar la pieza.");
        } finally {
            setIsScanning(false);
        }
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
            symbology: [],
            occasion: [],
            customerProfile: [],
            attributes: {}
        });
        setDynamicFields([]);
        setEditingItemId(null);
        setUploadedImages([]);
        setUploadedFiles([]);
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

    const handleEdit = (item: InventoryItem) => {
        setFormData({
            name: item.name,
            description: item.description,
            categoryId: item.categoryId,
            subcategoryId: item.subcategoryId,
            locationId: item.locationId,
            statusId: item.statusId,
            purchasePrice: item.purchasePrice || 0,
            salePrice: item.salePrice || 0,
            mainWeight: item.mainWeight || 0,
            isApproved: item.isApproved || false,
            itemCode: item.itemCode || '',
            comments: item.comments || '',
            socialDescription: item.socialDescription || '',
            detailedDescription: {
                design: item.detailedDescription?.design || '',
                details: item.detailedDescription?.details || '',
                materials: item.detailedDescription?.materials || '',
                technicalSpecs: item.detailedDescription?.technicalSpecs || '',
                symbolism: item.detailedDescription?.symbolism || ''
            },
            commercialLine: item.commercialLine || '',
            collection: item.collection || '',
            symbology: item.symbology || [],
            occasion: item.occasion || [],
            customerProfile: item.customerProfile || [],
            attributes: item.attributes || {}
        });
        setEditingItemId(item.id);
        setUploadedImages(item.images || []);

        // Convertir base64 de vuelta a File objetos para que uploadedFiles sea consistente
        // Aunque para base64 almacenado directamente, podríamos simplemente usar uploadedImages
        // Para simplificar, si ya son base64, las mantenemos en uploadedImages y el handleSubmit
        // tendrá que distinguir entre lo que ya era base64 y lo que es un File nuevo.

        setSelectedDetailItem(null); // Close detail drawer
        setIsAddModalOpen(true);
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleAIAnalysis = async (file: File) => {
        setIsScanning(true);
        try {
            const base64 = await fileToBase64(file);
            // Pasar metadatos adicionales para un autocompletado preciso
            const result = await AIService.analyzeImage(base64, file.type, {
                attributes: allAttributes,
                mappings: dynamicFields,
                domainValuesMap: domainValuesMap
            });

            // Intentar emparejar por ID o por Nombre
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
                    design: result.detailedDescription?.design || prev.detailedDescription.design,
                    details: result.detailedDescription?.details || prev.detailedDescription.details,
                    materials: result.detailedDescription?.materials || prev.detailedDescription.materials,
                    technicalSpecs: result.detailedDescription?.technicalSpecs || prev.detailedDescription.technicalSpecs,
                    symbolism: result.detailedDescription?.symbolism || prev.detailedDescription.symbolism
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
            // Recopilar datos relevantes para el prompt
            const context = {
                name: formData.name,
                category: getCategoryName(formData.categoryId),
                subcategory: getSubcategoryName(formData.subcategoryId),
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


    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);

            // Convertir a base64 inmediatamente
            const base64s = await Promise.all(files.map(file => fileToBase64(file)));
            setUploadedImages(prev => [...prev, ...base64s]);
            setUploadedFiles(prev => [...prev, ...files]);

            // Trigger real AI Analysis on first upload
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

            // Convertir a base64 inmediatamente
            const base64s = await Promise.all(files.map(file => fileToBase64(file)));
            setUploadedImages(prev => [...prev, ...base64s]);
            setUploadedFiles(prev => [...prev, ...files]);

            // Trigger real AI Analysis on drop
            if (uploadedImages.length === 0) {
                handleAIAnalysis(files[0]);
            }
        }
    };

    const simulateAIScan = () => {
        if (uploadedFiles.length > 0) {
            handleAIAnalysis(uploadedFiles[0]);
        } else {
            alert("Sube una imagen primero para analizarla con IA.");
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = !filters.categoryId || item.categoryId === filters.categoryId;
        const matchesLocation = !filters.locationId || item.locationId === filters.locationId;
        const matchesStatus = !filters.statusId || item.statusId === filters.statusId;

        const price = item.salePrice || 0;
        const matchesMinPrice = !filters.minPrice || price >= parseFloat(filters.minPrice);
        const matchesMaxPrice = !filters.maxPrice || price <= parseFloat(filters.maxPrice);

        // Filtro de Asistente de Ventas (Búsqueda Emocional/Por Intento)
        let matchesIntent = true;
        if (isSalesAssistantActive && salesIntent) {
            const intent = salesIntent.toLowerCase();
            const commercialLine = (item.commercialLine || '').toLowerCase();
            const collection = (item.collection || '').toLowerCase();
            const symbology = (item.symbology || []).join(' ').toLowerCase();
            const occasion = (item.occasion || []).join(' ').toLowerCase();
            const profile = (item.customerProfile || []).join(' ').toLowerCase();

            matchesIntent = commercialLine.includes(intent) ||
                collection.includes(intent) ||
                symbology.includes(intent) ||
                occasion.includes(intent) ||
                profile.includes(intent);
        }

        return matchesSearch && matchesCategory && matchesLocation && matchesStatus && matchesMinPrice && matchesMaxPrice && matchesIntent;
    }).sort((a, b) => {
        if (!sortConfig) return 0;
        const { field, direction } = sortConfig;
        let aVal: any = (a as any)[field];
        let bVal: any = (b as any)[field];

        // Manejo especial para fechas y números
        if (field === 'createdAt') {
            aVal = new Date(aVal).getTime();
            bVal = new Date(bVal).getTime();
        }

        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    const toggleSelectAll = () => {
        if (selectedItems.length === filteredItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(filteredItems.map(item => item.id));
        }
    };

    const toggleSelectItem = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSort = (field: string) => {
        setSortConfig(prev => {
            if (prev?.field === field) {
                return { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { field, direction: 'asc' };
        });
    };

    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'N/A';
    const getSubcategoryName = (id: string) => subcategories.find(s => s.id === id)?.name || 'N/A';
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
                        {(domainValuesMap[attributeItem.id] || []).map((v: any) => (
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

    const renderExcelView = () => {
        const renderSortIcon = (field: string) => {
            if (sortConfig?.field !== field) return <ArrowUpDown size={12} className="sort-icon" />;
            return sortConfig.direction === 'asc' ? <ChevronUp size={12} className="sort-icon" /> : <ChevronDown size={12} className="sort-icon" />;
        };

        return (
            <div className="excel-container">
                <table className="excel-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }} className="badge-cell">
                                <input
                                    type="checkbox"
                                    checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th style={{ width: '50px' }} className="sortable" onClick={() => handleSort('can')}>
                                CAN {renderSortIcon('can')}
                            </th>
                            <th style={{ width: '100px' }} className={`sortable ${sortConfig?.field === 'createdAt' ? 'active-sort' : ''}`} onClick={() => handleSort('createdAt')}>
                                FECHA {renderSortIcon('createdAt')}
                            </th>
                            <th style={{ width: '60px' }}>IMAGEN</th>
                            <th style={{ width: '120px' }} className={`sortable ${sortConfig?.field === 'itemCode' ? 'active-sort' : ''}`} onClick={() => handleSort('itemCode')}>
                                REF {renderSortIcon('itemCode')}
                            </th>
                            <th className="sortable" onClick={() => handleSort('description')}>
                                DESCRIPCIÓN {renderSortIcon('description')}
                            </th>
                            <th style={{ width: '100px' }} className={`sortable ${sortConfig?.field === 'purchasePrice' ? 'active-sort' : ''}`} onClick={() => handleSort('purchasePrice')}>
                                COSTE {renderSortIcon('purchasePrice')}
                            </th>
                            <th style={{ width: '80px' }} className={`sortable ${sortConfig?.field === 'mainWeight' ? 'active-sort' : ''}`} onClick={() => handleSort('mainWeight')}>
                                PESO {renderSortIcon('mainWeight')}
                            </th>
                            <th style={{ width: '100px' }} className={`sortable ${sortConfig?.field === 'salePrice' ? 'active-sort' : ''}`} onClick={() => handleSort('salePrice')}>
                                P. VENTA {renderSortIcon('salePrice')}
                            </th>
                            <th style={{ width: '110px' }}>DISPONIBLE</th>
                            <th>COMENTARIOS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map(item => (
                            <tr
                                key={item.id}
                                className={selectedItems.includes(item.id) ? 'selected' : ''}
                                onClick={() => {
                                    setSelectedDetailItem(item);
                                    setActiveDetailImageIdx(0);
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                <td className="badge-cell" onClick={(e) => { e.stopPropagation(); toggleSelectItem(item.id); }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.includes(item.id)}
                                        readOnly
                                    />
                                </td>
                                <td className="number">1</td>
                                <td className="date">{new Date(item.createdAt).toLocaleDateString()}</td>
                                <td className="badge-cell">
                                    <div className="excel-thumbnail-container">
                                        {item.images && item.images.length > 0 ? (
                                            <img src={item.images[0]} alt={item.name} className="excel-thumbnail" />
                                        ) : (
                                            <ImageIcon size={16} color="#ccc" />
                                        )}
                                    </div>
                                </td>
                                <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{item.itemCode}</td>
                                <td title={item.description}>{item.description}</td>
                                <td className="number">{item.purchasePrice?.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                                <td className="number">{item.mainWeight}g</td>
                                <td className="number" style={{ fontWeight: 600 }}>{item.salePrice?.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                                <td className="badge-cell">
                                    <span className={`excel-badge ${item.statusId === 'stat_available' ? 'excel-badge-success' : 'excel-badge-warning'}`}>
                                        {item.statusId === 'stat_available' ? 'SÍ' : (item.statusId === 'stat_sold' ? 'VEND' : 'NO')}
                                    </span>
                                </td>
                                <td style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                                    {item.comments || (
                                        <span style={{ opacity: 0.5 }}>-</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="container">
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Inventario de Activos</h1>
                        <span style={{ fontSize: '10px', backgroundColor: 'var(--accent)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, marginTop: '-15px' }}>v1.2.2</span>
                    </div>
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
                        <button
                            onClick={() => setViewMode('excel')}
                            style={{
                                padding: '8px',
                                border: 'none',
                                background: viewMode === 'excel' ? 'var(--primary)' : 'transparent',
                                color: viewMode === 'excel' ? 'white' : 'var(--text-muted)',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}>
                            <Table size={18} />
                        </button>
                    </div>
                    <button
                        className="btn"
                        style={{ backgroundColor: '#f0f4ff', color: '#4338ca', border: '1px solid #c7d2fe', display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={() => setShowCommercialDashboard(true)}
                    >
                        <Target size={18} /> Dashboard de Oportunidades
                    </button>
                    <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={20} /> Alta de Pieza
                    </button>
                </div>
            </header>

            {/* SECCIÓN ASISTENTE DE VENTAS (MODAL O BARRA DEDICADA) */}
            <div className="glass-card" style={{
                marginBottom: '32px',
                padding: '24px',
                backgroundColor: isSalesAssistantActive ? 'var(--primary)' : 'white',
                border: '1px solid var(--primary)',
                transition: 'all 0.3s ease'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isSalesAssistantActive ? '16px' : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: isSalesAssistantActive ? 'white' : 'var(--primary)' }}>
                        <Zap size={24} />
                        <h2 style={{ margin: 0, fontSize: '18px' }}>Asistente de Ventas & Inteligencia</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: isSalesAssistantActive ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>
                            {isSalesAssistantActive ? 'Modo Estratégico Activo' : 'Activar Modo Consultivo'}
                        </span>
                        <div
                            onClick={() => setIsSalesAssistantActive(!isSalesAssistantActive)}
                            style={{
                                width: '50px',
                                height: '24px',
                                backgroundColor: isSalesAssistantActive ? '#27ae60' : '#ddd',
                                borderRadius: '12px',
                                position: 'relative',
                                cursor: 'pointer',
                                padding: '2px'
                            }}
                        >
                            <div style={{
                                width: '20px',
                                height: '20px',
                                backgroundColor: 'white',
                                borderRadius: '50%',
                                position: 'absolute',
                                left: isSalesAssistantActive ? '28px' : '2px',
                                transition: 'left 0.2s ease'
                            }} />
                        </div>
                    </div>
                </div>

                {isSalesAssistantActive && (
                    <div style={{ display: 'flex', gap: '16px', animation: 'fadeIn 0.3s ease' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)' }} size={20} />
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Busca por intención: 'Aniversario', 'Minimalista', 'Protección', 'Graduación'..."
                                style={{
                                    paddingLeft: '48px',
                                    height: '52px',
                                    backgroundColor: 'rgba(255,255,255,0.15)',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    color: 'white',
                                    fontSize: '16px'
                                }}
                                value={salesIntent}
                                onChange={e => setSalesIntent(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {['Nupcial', 'Juvenil', 'Alta Joyería', 'Daily Wear'].map(line => (
                                <button
                                    key={line}
                                    className="btn"
                                    onClick={() => setSalesIntent(line)}
                                    style={{
                                        backgroundColor: salesIntent === line ? 'white' : 'rgba(255,255,255,0.1)',
                                        color: salesIntent === line ? 'var(--primary)' : 'white',
                                        border: 'none',
                                        fontSize: '12px',
                                        fontWeight: 700
                                    }}
                                >
                                    {line}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

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
                <button className="btn" style={{ border: '1px solid #ddd' }} onClick={() => setIsFilterDrawerOpen(true)}>
                    <Filter size={18} /> Filtros {Object.values(filters).filter(f => f !== '').length > 0 && `(${Object.values(filters).filter(f => f !== '').length})`}
                </button>
            </div>

            {/* Bulk Actions Bar */}
            {selectedItems.length > 0 && (
                <div style={{
                    position: 'fixed',
                    bottom: '32px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    padding: '16px 32px',
                    backgroundColor: 'var(--primary)',
                    borderRadius: '50px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                    color: 'white'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderRight: '1px solid rgba(255,255,255,0.2)', paddingRight: '24px' }}>
                        <span style={{ fontWeight: 600 }}>{selectedItems.length} seleccionados</span>
                        <button
                            onClick={() => setSelectedItems([])}
                            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex' }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button className="bulk-btn" style={{ backgroundColor: '#fdf2f2', color: 'var(--primary)', borderColor: '#fee2e2' }} onClick={() => setShowBulkTagging(true)}>
                            <Sparkles size={18} />
                            <span>Estrategia IA</span>
                        </button>
                        <button className="bulk-btn" title="Cambiar Ubicación/Estado">
                            <MapPin size={18} />
                            <span>Mover</span>
                        </button>
                        <button className="bulk-btn" title="Imprimir Etiquetas">
                            <Printer size={18} />
                            <span>Etiquetas</span>
                        </button>
                        <button className="bulk-btn" title="Exportar">
                            <Download size={18} />
                            <span>Exportar</span>
                        </button>
                        <button className="bulk-btn" style={{ color: '#ff4d4d' }} title="Eliminar">
                            <Trash2 size={18} />
                            <span>Borrar</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Content List */}
            {filteredItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <Package size={64} style={{ color: '#eee', marginBottom: '20px' }} />
                    <h3>No hay piezas registradas</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Empieza dando de alta tu primera joya en el sistema.</p>
                </div>
            ) : viewMode === 'excel' ? (
                renderExcelView()
            ) : (
                <div style={{
                    display: viewMode === 'grid' ? 'grid' : 'block',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '24px'
                }}>
                    {filteredItems.map(item => (
                        <div
                            key={item.id}
                            className={`glass-card item-card ${selectedItems.includes(item.id) ? 'selected' : ''}`}
                            onClick={(e) => {
                                if (e.ctrlKey || e.metaKey) {
                                    toggleSelectItem(item.id);
                                }
                            }}
                            style={{ padding: '0', overflow: 'hidden', marginBottom: viewMode === 'list' ? '16px' : '0', cursor: 'pointer', position: 'relative' }}
                        >
                            {/* Selection Checkbox */}
                            <div
                                onClick={(e) => { e.stopPropagation(); toggleSelectItem(item.id); }}
                                style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    zIndex: 10,
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '6px',
                                    border: '2px solid white',
                                    backgroundColor: selectedItems.includes(item.id) ? 'var(--accent)' : 'rgba(0,0,0,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {selectedItems.includes(item.id) && <Check size={16} color="white" strokeWidth={3} />}
                            </div>

                            <div style={{ height: '180px', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', position: 'relative' }}>
                                {item.images && item.images.length > 0 ? (
                                    <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                    <ImageIcon size={48} />
                                )}
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
                                {new Date().getTime() - new Date(item.createdAt || 0).getTime() < 172800000 && (
                                    <div style={{ position: 'absolute', top: '12px', left: '80px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            backgroundColor: 'var(--success)',
                                            color: 'white',
                                            fontSize: '10px',
                                            fontWeight: 800,
                                            textTransform: 'uppercase'
                                        }}>
                                            Nuevo
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '20px' }} onClick={() => {
                                setSelectedDetailItem(item);
                                setActiveDetailImageIdx(0);
                            }}>
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <h2 style={{ margin: 0 }}>{editingItemId ? 'Editar Pieza' : 'Alta de Nueva Pieza'}</h2>
                                <button
                                    type="button"
                                    className="btn btn-accent"
                                    style={{ padding: '6px 16px', fontSize: '12px' }}
                                    onClick={simulateAIScan}
                                    disabled={isScanning}
                                >
                                    <Cpu size={14} /> {isScanning ? 'Escaneando...' : 'Autocompletar con IA'}
                                </button>
                                <button
                                    type="button"
                                    className="btn"
                                    style={{ padding: '6px 16px', fontSize: '12px', border: '1px solid #ddd' }}
                                    onClick={() => {
                                        if (items.length > 0) {
                                            const lastItem = items[items.length - 1];
                                            setFormData({
                                                ...formData,
                                                name: `${lastItem.name} (Copia)`,
                                                categoryId: lastItem.categoryId,
                                                subcategoryId: lastItem.subcategoryId,
                                                locationId: lastItem.locationId,
                                                purchasePrice: lastItem.purchasePrice || 0,
                                                salePrice: lastItem.salePrice || 0,
                                                mainWeight: lastItem.mainWeight || 0,
                                                attributes: { ...(lastItem.attributes || {}) }
                                            });
                                        }
                                    }}
                                >
                                    <Copy size={14} /> Duplicar Último
                                </button>
                                <button
                                    type="button"
                                    className="btn"
                                    style={{ padding: '6px 16px', fontSize: '12px', border: '1px solid #ddd' }}
                                    onClick={resetForm}
                                >
                                    <RotateCcw size={14} /> Limpiar
                                </button>
                            </div>
                            <button className="btn" onClick={() => setIsAddModalOpen(false)}>Esc</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600 }}>Media (Fotos de la Pieza)</label>
                                <input
                                    type="file"
                                    multiple
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileSelect}
                                    accept="image/*"
                                />
                                <div style={{
                                    border: isDragging ? '2px solid var(--accent)' : '2px dashed #ddd',
                                    borderRadius: '12px',
                                    padding: '40px',
                                    textAlign: 'center',
                                    backgroundColor: isDragging ? 'var(--accent-light)' : '#fafafa',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    opacity: isDragging ? 0.7 : 1
                                }}
                                    className="upload-zone"
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                >
                                    <ImagePlus size={40} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
                                        Arrastra las fotos aquí o <strong>haz clic para explorar</strong>
                                    </p>
                                    <p style={{ marginTop: '4px', color: '#999', fontSize: '11px' }}>Soporta múltiples imágenes JPG, PNG (Max 5MB)</p>
                                </div>

                                {uploadedImages.length > 0 && (
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
                                        {uploadedImages.map((src, idx) => (
                                            <div key={idx} style={{ position: 'relative', flexShrink: 0 }}>
                                                <img src={src} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #eee' }} />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setUploadedImages(prev => prev.filter((_, i) => i !== idx));
                                                        setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
                                                    }}
                                                    style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--error)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' }}
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                                {/* Columna Izquierda: Identificación y Clasificación */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Identificación Básica</label>
                                        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                            <div style={{ flex: 1 }}>
                                                <input
                                                    required
                                                    className="form-control"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="Nombre Corto..."
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                            <div style={{ width: '180px' }}>
                                                <input
                                                    className="form-control"
                                                    value={formData.itemCode}
                                                    onChange={e => setFormData({ ...formData, itemCode: e.target.value })}
                                                    placeholder="REF (Auto si vacío)"
                                                    style={{ width: '100%', fontWeight: 700, color: 'var(--primary)' }}
                                                />
                                            </div>
                                        </div>
                                        <textarea
                                            required
                                            rows={3}
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Descripción técnica..."
                                            style={{ width: '100%', borderRadius: '8px', border: '1px solid #ddd', padding: '12px', marginBottom: '12px' }}
                                        />
                                        <textarea
                                            rows={2}
                                            value={formData.comments}
                                            onChange={e => setFormData({ ...formData, comments: e.target.value })}
                                            placeholder="Comentarios y notas internas..."
                                            style={{ width: '100%', borderRadius: '8px', border: '1px solid #ddd', padding: '12px', fontSize: '13px', backgroundColor: '#fffcf5' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Clasificación</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <select
                                                required
                                                className="form-control"
                                                value={formData.categoryId}
                                                onChange={e => setFormData({ ...formData, categoryId: e.target.value, subcategoryId: '' })}
                                            >
                                                <option value="" disabled>Categoría...</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                            <select
                                                required
                                                className="form-control"
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
                                                className="form-control"
                                                value={formData.locationId}
                                                onChange={e => setFormData({ ...formData, locationId: e.target.value })}
                                            >
                                                <option value="" disabled>Ubicación...</option>
                                                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                            </select>
                                            <select
                                                required
                                                className="form-control"
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
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <label style={{ fontWeight: 600, color: '#e67e22', margin: 0 }}>Valoración y Margen</label>
                                            <Calculator size={16} color="#e67e22" />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
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
                                        <div style={{ padding: '12px', backgroundColor: 'rgba(230, 126, 34, 0.05)', borderRadius: '8px', border: '1px solid rgba(230, 126, 34, 0.1)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                                <span style={{ color: '#666' }}>Margen Bruto:</span>
                                                <span style={{ fontWeight: 700, color: '#27ae60' }}>
                                                    {((formData.salePrice - formData.purchasePrice) || 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                                    ({formData.purchasePrice > 0 ? (((formData.salePrice - formData.purchasePrice) / formData.purchasePrice) * 100).toFixed(1) : 0}%)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* MÓDULO DE ESTRATEGIA COMERCIAL */}
                            <div style={{ marginTop: '40px', padding: '32px', border: '1px solid #e0e0e0', borderRadius: '16px', backgroundColor: '#fdfdfd' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                    <Target size={24} color="var(--primary)" />
                                    <h3 style={{ margin: 0 }}>Estrategia Comercial e Inteligencia</h3>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <label style={{ margin: 0, fontWeight: 600, fontSize: '13px' }}>Línea Comercial</label>
                                            <button
                                                type="button"
                                                onClick={() => { setManagedDomain({ id: 'dom_linea', name: 'Línea Comercial' }); setIsDomainModalOpen(true); }}
                                                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0 }}
                                            >
                                                <Settings size={14} />
                                            </button>
                                        </div>
                                        <select
                                            className="form-control"
                                            value={formData.commercialLine}
                                            onChange={e => setFormData({ ...formData, commercialLine: e.target.value })}
                                            style={{ width: '100%' }}
                                        >
                                            <option value="">Seleccione línea...</option>
                                            {lineValues.map(v => <option key={v.id} value={v.value}>{v.value}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <label style={{ margin: 0, fontWeight: 600, fontSize: '13px' }}>Colección</label>
                                            <button
                                                type="button"
                                                onClick={() => { setManagedDomain({ id: 'dom_coleccion', name: 'Colecciones' }); setIsDomainModalOpen(true); }}
                                                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0 }}
                                            >
                                                <Settings size={14} />
                                            </button>
                                        </div>
                                        <select
                                            className="form-control"
                                            value={formData.collection}
                                            onChange={e => setFormData({ ...formData, collection: e.target.value })}
                                            style={{ width: '100%' }}
                                        >
                                            <option value="">Seleccione colección...</option>
                                            {collectionValues.map(v => <option key={v.id} value={v.value}>{v.value}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <label style={{ margin: 0, fontWeight: 600, fontSize: '13px' }}>Perfil de Cliente</label>
                                            <button
                                                type="button"
                                                onClick={() => { setManagedDomain({ id: 'dom_perfil_cli', name: 'Perfiles de Cliente' }); setIsDomainModalOpen(true); }}
                                                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0 }}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '8px', border: '1px solid #ddd', borderRadius: '8px', minHeight: '42px', backgroundColor: 'white' }}>
                                            {profileValues.map(v => (
                                                <div
                                                    key={v.id}
                                                    onClick={() => {
                                                        const current = formData.customerProfile || [];
                                                        const next = current.includes(v.value)
                                                            ? current.filter(p => p !== v.value)
                                                            : [...current, v.value];
                                                        setFormData({ ...formData, customerProfile: next });
                                                    }}
                                                    style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '15px',
                                                        fontSize: '11px',
                                                        cursor: 'pointer',
                                                        backgroundColor: formData.customerProfile?.includes(v.value) ? 'var(--primary)' : '#f0f2f5',
                                                        color: formData.customerProfile?.includes(v.value) ? 'white' : '#555',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {v.value}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '20px' }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <label style={{ margin: 0, fontWeight: 600, fontSize: '13px' }}>Simbología (Tags)</label>
                                            <button
                                                type="button"
                                                onClick={() => { setManagedDomain({ id: 'dom_simbol', name: 'Simbologías' }); setIsDomainModalOpen(true); }}
                                                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0 }}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '8px', border: '1px solid #ddd', borderRadius: '8px', minHeight: '42px', backgroundColor: 'white' }}>
                                            {symbologyValues.map(v => (
                                                <div
                                                    key={v.id}
                                                    onClick={() => {
                                                        const current = formData.symbology || [];
                                                        const next = current.includes(v.value)
                                                            ? current.filter(p => p !== v.value)
                                                            : [...current, v.value];
                                                        setFormData({ ...formData, symbology: next });
                                                    }}
                                                    style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '15px',
                                                        fontSize: '11px',
                                                        cursor: 'pointer',
                                                        backgroundColor: formData.symbology?.includes(v.value) ? 'var(--accent)' : '#f0f2f5',
                                                        color: formData.symbology?.includes(v.value) ? 'white' : '#555',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {v.value}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <label style={{ margin: 0, fontWeight: 600, fontSize: '13px' }}>Ocasión / Motivo</label>
                                            <button
                                                type="button"
                                                onClick={() => { setManagedDomain({ id: 'dom_ocasion', name: 'Ocasiones' }); setIsDomainModalOpen(true); }}
                                                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0 }}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '8px', border: '1px solid #ddd', borderRadius: '8px', minHeight: '42px', backgroundColor: 'white' }}>
                                            {occasionValues.map(v => (
                                                <div
                                                    key={v.id}
                                                    onClick={() => {
                                                        const current = formData.occasion || [];
                                                        const next = current.includes(v.value)
                                                            ? current.filter(p => p !== v.value)
                                                            : [...current, v.value];
                                                        setFormData({ ...formData, occasion: next });
                                                    }}
                                                    style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '15px',
                                                        fontSize: '11px',
                                                        cursor: 'pointer',
                                                        backgroundColor: formData.occasion?.includes(v.value) ? '#9b59b6' : '#f0f2f5',
                                                        color: formData.occasion?.includes(v.value) ? 'white' : '#555',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {v.value}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* MÓDULO DE COPYWRITING IA */}
                            <div style={{ marginTop: '24px', padding: '32px', border: '1px solid #e0e0e0', borderRadius: '16px', backgroundColor: '#f8f9ff' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Sparkles size={24} color="#6366f1" />
                                        <h3 style={{ margin: 0, color: '#4338ca' }}>Copywriting & Marketing IA</h3>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleManualAICopywriting}
                                        disabled={isGeneratingAI}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#6366f1', border: 'none' }}
                                    >
                                        {isGeneratingAI ? (
                                            <>
                                                <RotateCcw size={16} className="spin" />
                                                Generando...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={16} />
                                                Generar con IA
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: 600 }}>
                                        <Share2 size={16} /> Social Media Copy (Instagram/FB)
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="form-control"
                                        value={formData.socialDescription}
                                        onChange={e => setFormData({ ...formData, socialDescription: e.target.value })}
                                        placeholder="Caption generado para RRSS..."
                                        style={{ width: '100%', borderRadius: '12px', border: '1px solid #c7d2fe' }}
                                    />
                                </div>

                                <label style={{ display: 'block', marginBottom: '16px', fontWeight: 600 }}>Ficha Técnica Enriquecida</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#666' }}>1. Diseño y Estructura</span>
                                        <textarea
                                            rows={3}
                                            className="form-control"
                                            value={formData.detailedDescription.design}
                                            onChange={e => setFormData({ ...formData, detailedDescription: { ...formData.detailedDescription, design: e.target.value } })}
                                            style={{ width: '100%', marginTop: '4px' }}
                                        />
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#666' }}>2. Detalles de la Pieza</span>
                                        <textarea
                                            rows={3}
                                            className="form-control"
                                            value={formData.detailedDescription.details}
                                            onChange={e => setFormData({ ...formData, detailedDescription: { ...formData.detailedDescription, details: e.target.value } })}
                                            style={{ width: '100%', marginTop: '4px' }}
                                        />
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#666' }}>3. Materiales y Acabados</span>
                                        <textarea
                                            rows={3}
                                            className="form-control"
                                            value={formData.detailedDescription.materials}
                                            onChange={e => setFormData({ ...formData, detailedDescription: { ...formData.detailedDescription, materials: e.target.value } })}
                                            style={{ width: '100%', marginTop: '4px' }}
                                        />
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#666' }}>4. Especificaciones Técnicas</span>
                                        <textarea
                                            rows={3}
                                            className="form-control"
                                            value={formData.detailedDescription.technicalSpecs}
                                            onChange={e => setFormData({ ...formData, detailedDescription: { ...formData.detailedDescription, technicalSpecs: e.target.value } })}
                                            style={{ width: '100%', marginTop: '4px' }}
                                        />
                                    </div>
                                </div>
                                <div style={{ marginTop: '20px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#666' }}>
                                        <Heart size={14} /> 5. Simbolismo de la Pieza
                                    </span>
                                    <textarea
                                        rows={3}
                                        className="form-control"
                                        value={formData.detailedDescription.symbolism}
                                        onChange={e => setFormData({ ...formData, detailedDescription: { ...formData.detailedDescription, symbolism: e.target.value } })}
                                        style={{ width: '100%', marginTop: '4px' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" className="btn" onClick={() => setIsAddModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px' }}>
                                    {editingItemId ? 'Guardar Cambios' : 'Crear Pieza y Generar Código'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Filter Drawer */}
            {isFilterDrawerOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 2000,
                    display: 'flex', justifyContent: 'flex-end'
                }} onClick={() => setIsFilterDrawerOpen(false)}>
                    <div
                        style={{
                            width: '400px', height: '100%', backgroundColor: 'white',
                            padding: '40px', display: 'flex', flexDirection: 'column',
                            boxShadow: '-10px 0 40px rgba(0,0,0,0.1)',
                            animation: 'slideIn 0.3s ease-out'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h2 style={{ margin: 0 }}>Filtros Avanzados</h2>
                            <button className="btn" onClick={() => setIsFilterDrawerOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Categoría</label>
                                <select
                                    value={filters.categoryId}
                                    onChange={e => setFilters({ ...filters, categoryId: e.target.value })}
                                    className="form-control"
                                >
                                    <option value="">Todas las categorías</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Ubicación</label>
                                <select
                                    value={filters.locationId}
                                    onChange={e => setFilters({ ...filters, locationId: e.target.value })}
                                    className="form-control"
                                >
                                    <option value="">Todas las ubicaciones</option>
                                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Estado</label>
                                <select
                                    value={filters.statusId}
                                    onChange={e => setFilters({ ...filters, statusId: e.target.value })}
                                    className="form-control"
                                >
                                    <option value="">Todos los estados</option>
                                    {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Rango de Precio (€)</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.minPrice}
                                        onChange={e => setFilters({ ...filters, minPrice: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.maxPrice}
                                        onChange={e => setFilters({ ...filters, maxPrice: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <button
                                className="btn"
                                style={{ justifyContent: 'center' }}
                                onClick={() => setFilters({ categoryId: '', locationId: '', statusId: '', minPrice: '', maxPrice: '' })}
                            >
                                Limpiar
                            </button>
                            <button
                                className="btn btn-primary"
                                style={{ justifyContent: 'center' }}
                                onClick={() => setIsFilterDrawerOpen(false)}
                            >
                                Aplicar Filtros
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick View Drawer */}
            {selectedDetailItem && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1500,
                    display: 'flex', justifyContent: 'flex-end'
                }} onClick={() => setSelectedDetailItem(null)}>
                    <div
                        style={{
                            width: '600px', height: '100%', backgroundColor: 'white',
                            display: 'flex', flexDirection: 'column',
                            boxShadow: '-10px 0 40px rgba(0,0,0,0.1)',
                            animation: 'slideIn 0.3s ease-out',
                            position: 'relative'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedDetailItem(null)}
                            style={{
                                position: 'absolute', top: '20px', left: '-50px',
                                width: '40px', height: '40px', borderRadius: '50%',
                                backgroundColor: 'white', border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '-2px 0 10px rgba(0,0,0,0.1)'
                            }}
                        >
                            <X size={20} />
                        </button>

                        <div style={{ height: '300px', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', position: 'relative', overflow: 'hidden' }}>
                            {selectedDetailItem.images && selectedDetailItem.images.length > 0 ? (
                                <img src={selectedDetailItem.images[activeDetailImageIdx] || selectedDetailItem.images[0]} alt={selectedDetailItem.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                                <ImageIcon size={64} />
                            )}
                        </div>

                        {selectedDetailItem.images && selectedDetailItem.images.length > 1 && (
                            <div style={{ display: 'flex', gap: '8px', padding: '12px 40px', overflowX: 'auto', borderBottom: '1px solid #eee' }}>
                                {selectedDetailItem.images.map((img, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setActiveDetailImageIdx(idx)}
                                        style={{
                                            flexShrink: 0, width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden',
                                            border: idx === activeDetailImageIdx ? '2px solid var(--accent)' : '1px solid #ddd',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <img src={img} style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#f8f9fa' }} />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ padding: '40px', flex: 1, overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                <div>
                                    <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {getCategoryName(selectedDetailItem.categoryId)} / {getSubcategoryName(selectedDetailItem.subcategoryId)}
                                    </span>
                                    <h2 style={{ fontSize: '24px', margin: '4px 0 8px 0' }}>{selectedDetailItem.name}</h2>
                                    <code style={{ fontSize: '12px', backgroundColor: '#f1f1f1', padding: '2px 8px', borderRadius: '4px' }}>{selectedDetailItem.itemCode}</code>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>
                                        {(selectedDetailItem.salePrice || 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                    </div>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>PVP Estimado</span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                                <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #eee' }}>
                                    <MapPin size={18} color="var(--text-muted)" />
                                    <div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>UBICACIÓN</div>
                                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{getLocationName(selectedDetailItem.locationId)}</div>
                                    </div>
                                </div>
                                <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #eee' }}>
                                    <Tag size={18} color="var(--text-muted)" />
                                    <div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>ESTADO</div>
                                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{getStatusName(selectedDetailItem.statusId)}</div>
                                    </div>
                                </div>
                                <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #eee' }}>
                                    <Calculator size={18} color="var(--text-muted)" />
                                    <div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>PESO</div>
                                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{selectedDetailItem.mainWeight || 0} gr</div>
                                    </div>
                                </div>
                                <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #eee' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#e67e22' }}>€</div>
                                    <div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>COSTE</div>
                                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{(selectedDetailItem.purchasePrice || 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <h4 style={{ fontSize: '14px', marginBottom: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Descripción Técnica</h4>
                                <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#444' }}>{selectedDetailItem.description}</p>
                            </div>

                            {/* NUEVA SECCIÓN: STORYTELLING Y MARKETING */}
                            <div className="glass-card" style={{ marginBottom: '32px', padding: '24px', backgroundColor: '#f8f9ff', border: '1px solid #e0e7ff' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                    <Sparkles size={20} color="#4f46e5" />
                                    <h4 style={{ fontSize: '14px', margin: 0, color: '#4338ca', textTransform: 'uppercase' }}>Marketing & Storytelling</h4>
                                </div>

                                {selectedDetailItem.socialDescription && (
                                    <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: 'white', borderRadius: '8px', border: '1px dashed #c7d2fe' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#6366f1' }}>SOCIAL MEDIA COPY</span>
                                            <button className="btn-icon" onClick={() => navigator.clipboard.writeText(selectedDetailItem.socialDescription || '')}>
                                                <Copy size={12} />
                                            </button>
                                        </div>
                                        <p style={{ fontSize: '13px', margin: 0, fontStyle: 'italic', color: '#444' }}>{selectedDetailItem.socialDescription}</p>
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                                    {selectedDetailItem.commercialLine && (
                                        <span style={{ padding: '4px 10px', backgroundColor: '#4338ca', color: 'white', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>
                                            {selectedDetailItem.commercialLine}
                                        </span>
                                    )}
                                    {selectedDetailItem.occasion?.map(occ => (
                                        <span key={occ} style={{ padding: '4px 10px', backgroundColor: '#e0e7ff', color: '#4338ca', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>
                                            <Zap size={10} style={{ marginRight: '4px' }} /> {occ}
                                        </span>
                                    ))}
                                    {selectedDetailItem.customerProfile?.map(prof => (
                                        <span key={prof} style={{ padding: '4px 10px', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>
                                            <Users size={10} style={{ marginRight: '4px' }} /> {prof}
                                        </span>
                                    ))}
                                </div>

                                {selectedDetailItem.detailedDescription?.symbolism && (
                                    <div style={{ padding: '12px', backgroundColor: '#fff5f5', borderRadius: '8px', borderLeft: '3px solid #f87171' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#dc2626', marginBottom: '6px' }}>
                                            <Heart size={14} /> SIMBOLOGÍA E HISTORIA
                                        </span>
                                        <p style={{ fontSize: '13px', margin: 0, color: '#7f1d1d' }}>{selectedDetailItem.detailedDescription.symbolism}</p>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginBottom: '32px', padding: '16px', backgroundColor: '#fdf7e6', borderRadius: '8px', borderLeft: '4px solid #f39c12' }}>
                                <h4 style={{ fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', color: '#a0522d', fontWeight: 700 }}>Comentarios Internos</h4>
                                {selectedDetailItem.comments ? (
                                    <p style={{ fontSize: '13px', color: '#5d4037', margin: 0 }}>{selectedDetailItem.comments}</p>
                                ) : (
                                    <p style={{ fontSize: '13px', color: '#999', margin: 0, fontStyle: 'italic' }}>Sin comentarios adicionales.</p>
                                )}
                            </div>

                            {Object.keys(selectedDetailItem.attributes || {}).length > 0 && (
                                <div>
                                    <h4 style={{ fontSize: '14px', marginBottom: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Especificaciones</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        {Object.entries(selectedDetailItem.attributes || {}).map(([key, value]) => {
                                            const attr = allAttributes.find(a => a.id === key);
                                            return (
                                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f1f1' }}>
                                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{attr?.name || key}</span>
                                                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{String(value)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ padding: '24px 40px', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    className="btn btn-primary"
                                    style={{ flex: 1, justifyContent: 'center' }}
                                    onClick={() => handleEdit(selectedDetailItem)}
                                >
                                    Editar Ficha
                                </button>
                                <button className="btn" style={{ flex: 1, justifyContent: 'center', border: '1px solid #ddd' }}>
                                    Ver Historial
                                </button>
                            </div>
                            {selectedDetailItem.statusId === 'stat_available' && (
                                <button
                                    className="btn"
                                    style={{ width: '100%', backgroundColor: '#fff8e1', border: '1px solid #ffe082', color: '#856404', fontWeight: 700 }}
                                    onClick={handleOpenReservation}
                                >
                                    <Clock size={16} /> Apartar Pieza
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Reserva */}
            {isReservationModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 2000, backdropFilter: 'blur(4px)'
                }}>
                    <div className="glass-card" style={{ padding: '32px', width: '450px', backgroundColor: 'white' }}>
                        <h2 style={{ marginBottom: '24px' }}>Realizar Apartado</h2>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Seleccionar Cliente</label>
                            <select
                                className="form-control"
                                value={selectedCustomerId}
                                onChange={e => setSelectedCustomerId(e.target.value)}
                                style={{ width: '100%' }}
                            >
                                <option value="">Elija un cliente...</option>
                                {customersList.map(c => (
                                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.dni})</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Fecha de Vencimiento</label>
                            <input
                                type="date"
                                className="form-control"
                                value={reservationExpiry}
                                onChange={e => setReservationExpiry(e.target.value)}
                                style={{ width: '100%' }}
                            />
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                                La pieza se marcará como CADUCADA automáticamente en esta fecha.
                            </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button className="btn" onClick={() => setIsReservationModalOpen(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleCreateReservation}>Crear Apartado</button>
                        </div>
                    </div>
                </div>
            )}

            <style>
                {`
                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .bulk-btn {
                    background: transparent;
                    border: none;
                    color: white;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    cursor: pointer;
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    transition: opacity 0.2s;
                    padding: 0 8px;
                }
                .bulk-btn:hover {
                    opacity: 0.8;
                }
                .item-card {
                    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
                }
                .item-card:hover {
                    transform: translateY(-4px);
                }
                .item-card.selected {
                    border: 2px solid var(--accent) !important;
                    background-color: rgba(212, 175, 55, 0.02) !important;
                }
                .upload-zone:hover {
                    border-color: var(--accent) !important;
                    background-color: var(--accent-light) !important;
                    opacity: 0.7;
                }
                `}
            </style>
            {/* Dashboard Comercial */}
            {showCommercialDashboard && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: '#fff', zIndex: 3000, overflowY: 'auto'
                }}>
                    <CommercialDashboard
                        onClose={() => setShowCommercialDashboard(false)}
                        onSelectItem={(item) => {
                            setShowCommercialDashboard(false);
                            setSelectedDetailItem(item);
                        }}
                    />
                </div>
            )}

            {/* Modal de Etiquetado Masivo */}
            {showBulkTagging && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 2500, backdropFilter: 'blur(4px)'
                }}>
                    <div className="glass-card" style={{ padding: '32px', width: '500px', backgroundColor: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0 }}>Etiquetado Masivo ({selectedItems.length} piezas)</h2>
                            <button className="btn" onClick={() => setShowBulkTagging(false)}><X size={20} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Línea Comercial</label>
                                <select
                                    className="form-control"
                                    value={bulkTags.commercialLine}
                                    onChange={e => setBulkTags({ ...bulkTags, commercialLine: e.target.value })}
                                    style={{ width: '100%' }}
                                >
                                    <option value="">No cambiar</option>
                                    <option value="Nupcial">Nupcial</option>
                                    <option value="Juvenil">Juvenil</option>
                                    <option value="Alta Joyería">Alta Joyería</option>
                                    <option value="Daily Wear">Daily Wear</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Añadir Ocasiones (separadas por coma)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ej: Compromiso, Boda..."
                                    style={{ width: '100%' }}
                                    onChange={e => setBulkTags({ ...bulkTags, occasion: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Añadir Simbología (separadas por coma)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ej: Amor, Infinito..."
                                    style={{ width: '100%' }}
                                    onChange={e => setBulkTags({ ...bulkTags, symbology: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button className="btn" onClick={() => setShowBulkTagging(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={async () => {
                                try {
                                    for (const itemId of selectedItems) {
                                        const item = items.find(i => i.id === itemId);
                                        if (item) {
                                            await InventoryService.update(itemId, {
                                                commercialLine: bulkTags.commercialLine || item.commercialLine,
                                                occasion: [...new Set([...(item.occasion || []), ...bulkTags.occasion])],
                                                symbology: [...new Set([...(item.symbology || []), ...bulkTags.symbology])]
                                            });
                                        }
                                    }
                                    await loadData();
                                    setShowBulkTagging(false);
                                    setSelectedItems([]);
                                    alert(`Se han actualizado ${selectedItems.length} piezas.`);
                                } catch (error) {
                                    console.error("Error en etiquetado masivo:", error);
                                    alert("Error al actualizar las piezas.");
                                }
                            }}>Aplicar a seleccionados</button>
                        </div>
                    </div>
                </div>
            )}

            <DomainManagerModal
                isOpen={isDomainModalOpen}
                onClose={() => setIsDomainModalOpen(false)}
                domainId={managedDomain.id}
                domainName={managedDomain.name}
                onUpdate={fetchCommercialMasters}
            />
        </div>
    );
};

export default InventoryManager;
