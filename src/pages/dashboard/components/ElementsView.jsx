import React, { useState, useEffect, useRef } from 'react';
import textTemplateService from '../../../api/textTemplateService';
import { ConfirmModal, AlertModal, PromptModal } from '../../../components/ui/Modal';
import { Loader2, Trash2, Edit3, Globe, Lock, UploadCloud, MoreVertical, Layers } from 'lucide-react';

const CATEGORY_TABS = [
    { key: '', label: 'All' },
    { key: 'Text', label: 'Text' },
    { key: 'Shape', label: 'Shapes' },
    { key: 'Group', label: 'Groups' },
];

const ElementsView = ({ user }) => {
    const [elements, setElements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const svgInputRef = useRef(null);

    // Modal state
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false });
    const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', isDanger: false });
    const [promptModal, setPromptModal] = useState({ isOpen: false, title: '', message: '', defaultValue: '', onConfirm: null });

    const isAdmin = user?.roles?.includes('Admin');

    const showAlert = (title, message, isDanger = false) => {
        setAlertModal({ isOpen: true, title, message, isDanger });
    };

    useEffect(() => {
        fetchElements();
    }, [activeCategory]);

    const fetchElements = async () => {
        try {
            setLoading(true);
            const response = await textTemplateService.listTextTemplates(1, 100, activeCategory);
            if (response && response.success) {
                setElements(response.data?.items || response.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch elements:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (element) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Element?',
            message: `Are you sure you want to delete "${element.name}"? This action cannot be undone.`,
            isDanger: true,
            onConfirm: async () => {
                try {
                    const res = await textTemplateService.deleteTextTemplate(element.id);
                    if (res?.success !== false) {
                        setElements(prev => prev.filter(e => e.id !== element.id));
                    }
                } catch (err) {
                    console.error('Delete failed:', err);
                    showAlert('Delete Failed', err.response?.data?.message || 'An error occurred while deleting.', true);
                } finally {
                    setConfirmModal(s => ({ ...s, isOpen: false }));
                    setOpenMenuId(null);
                }
            }
        });
    };

    const handleRename = (element) => {
        setPromptModal({
            isOpen: true,
            title: 'Rename Element',
            message: 'Enter a new name for this element:',
            defaultValue: element.name,
            onConfirm: async (newName) => {
                if (!newName || newName === element.name) {
                    setPromptModal(s => ({ ...s, isOpen: false }));
                    return;
                }
                try {
                    const res = await textTemplateService.updateMetadata(element.id, {
                        name: newName,
                        category: element.category,
                        isPublic: element.isPublic,
                    });
                    if (res?.success !== false) {
                        setElements(prev => prev.map(e => e.id === element.id ? { ...e, name: newName } : e));
                    }
                } catch (err) {
                    console.error('Rename failed:', err);
                    showAlert('Rename Failed', err.response?.data?.message || 'An error occurred.', true);
                } finally {
                    setPromptModal(s => ({ ...s, isOpen: false }));
                    setOpenMenuId(null);
                }
            }
        });
    };

    const handleToggleVisibility = (element) => {
        const willBePublic = !element.isPublic;
        setConfirmModal({
            isOpen: true,
            title: willBePublic ? 'Make Public?' : 'Make Private?',
            message: willBePublic
                ? 'This element will be visible to all users.'
                : 'This element will only be visible to you.',
            isDanger: false,
            onConfirm: async () => {
                try {
                    const res = await textTemplateService.updateMetadata(element.id, {
                        name: element.name,
                        category: element.category,
                        isPublic: willBePublic,
                    });
                    if (res?.success !== false) {
                        setElements(prev => prev.map(e => e.id === element.id ? { ...e, isPublic: willBePublic } : e));
                    }
                } catch (err) {
                    console.error('Toggle visibility failed:', err);
                    showAlert('Failed', err.response?.data?.message || 'An error occurred.', true);
                } finally {
                    setConfirmModal(s => ({ ...s, isOpen: false }));
                    setOpenMenuId(null);
                }
            }
        });
    };

    const handleSvgUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.svg') && file.type !== 'image/svg+xml') {
            showAlert('Invalid File', 'Only SVG files are allowed.', true);
            return;
        }

        if (svgInputRef.current) svgInputRef.current.value = '';

        // Show a prompt for the name
        setPromptModal({
            isOpen: true,
            title: 'Upload SVG Shape',
            message: 'Enter a name for this shape:',
            defaultValue: file.name.replace('.svg', ''),
            onConfirm: async (name) => {
                if (!name) {
                    setPromptModal(s => ({ ...s, isOpen: false }));
                    return;
                }
                setPromptModal(s => ({ ...s, isOpen: false }));
                setUploading(true);
                try {
                    const formData = new FormData();
                    formData.append('name', name);
                    formData.append('category', 'Shape');
                    formData.append('type', 'SVG');
                    formData.append('assetFile', file);

                    // Generate a simple preview from the SVG
                    const svgPreview = await generateSvgPreview(file);
                    formData.append('previewImage', svgPreview);

                    const res = await textTemplateService.createTextTemplate(formData);
                    if (res?.success !== false) {
                        await fetchElements();
                    }
                } catch (err) {
                    console.error('SVG upload failed:', err);
                    showAlert('Upload Failed', err.response?.data?.message || 'An error occurred while uploading.', true);
                } finally {
                    setUploading(false);
                }
            }
        });
    };

    /**
     * Generates a WebP preview image from an SVG file.
     */
    const generateSvgPreview = (svgFile) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const size = 512;
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext('2d');

                    // Center the SVG in the canvas
                    const scale = Math.min(size / img.width, size / img.height) * 0.8;
                    const x = (size - img.width * scale) / 2;
                    const y = (size - img.height * scale) / 2;
                    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                    canvas.toBlob((blob) => {
                        resolve(new File([blob], 'preview.webp', { type: 'image/webp' }));
                    }, 'image/webp', 0.9);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(svgFile);
        });
    };

    const getCategoryBadge = (category) => {
        const colors = {
            Text: 'bg-blue-50 text-blue-600 border-blue-100',
            Shape: 'bg-purple-50 text-purple-600 border-purple-100',
            Group: 'bg-amber-50 text-amber-600 border-amber-100',
        };
        return colors[category] || 'bg-zinc-50 text-zinc-600 border-zinc-100';
    };

    const getTypeBadge = (type) => {
        return type === 'SVG'
            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
            : 'bg-zinc-50 text-zinc-500 border-zinc-100';
    };

    return (
        <div className="w-full">
            {/* Modals */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(s => ({ ...s, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDanger={confirmModal.isDanger}
                confirmLabel="Yes, continue"
                cancelLabel="Cancel"
            />
            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal(s => ({ ...s, isOpen: false }))}
                title={alertModal.title}
                message={alertModal.message}
                isDanger={alertModal.isDanger}
            />
            <PromptModal
                isOpen={promptModal.isOpen}
                onClose={() => setPromptModal(s => ({ ...s, isOpen: false }))}
                onConfirm={promptModal.onConfirm}
                title={promptModal.title}
                message={promptModal.message}
                defaultValue={promptModal.defaultValue}
            />

            <input
                type="file"
                ref={svgInputRef}
                className="hidden"
                accept=".svg"
                onChange={handleSvgUpload}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h2 className="text-2xl font-bold mus-text-primary">Elements Library</h2>

                <div className="mus-dashboard-nav flex p-1 gap-1">
                    {CATEGORY_TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveCategory(tab.key)}
                            className={`mus-dashboard-tab px-5 py-2 ${activeCategory === tab.key ? 'mus-dashboard-tab-active' : ''}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {isAdmin && (
                    <button
                        onClick={() => svgInputRef.current?.click()}
                        disabled={uploading}
                        className="mus-button-dashboard-action flex items-center gap-3 px-6 py-3"
                    >
                        {uploading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Uploading...</span>
                            </>
                        ) : (
                            <>
                                <UploadCloud size={16} />
                                <span>Upload SVG</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-zinc-400 h-8 w-8" />
                </div>
            ) : elements.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 border border-zinc-200 border-dashed rounded-xl bg-white/50">
                    <div className="p-4 bg-zinc-100 rounded-full mb-4">
                        <Layers className="text-zinc-300" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900 mb-1">No elements found</h3>
                    <p className="text-sm text-zinc-500 text-center max-w-sm">
                        {activeCategory
                            ? `No ${activeCategory.toLowerCase()} elements have been saved yet.`
                            : 'Save elements from the editor to see them here.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {elements.map(element => (
                        <div key={element.id} className="mus-asset-card group flex flex-col hover:shadow-md">
                            {/* Preview */}
                            <div className="aspect-square bg-zinc-100 relative flex items-center justify-center overflow-hidden p-4">
                                {element.previewUrl ? (
                                    <img
                                        src={element.previewUrl}
                                        alt={element.name}
                                        loading="lazy"
                                        crossOrigin="anonymous"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                ) : (
                                    <Layers className="text-zinc-300" size={40} />
                                )}

                                {/* Actions overlay */}
                                <div className="mus-asset-actions">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenMenuId(openMenuId === element.id ? null : element.id);
                                        }}
                                        className="mus-asset-action-btn"
                                    >
                                        <MoreVertical size={16} />
                                    </button>

                                    {openMenuId === element.id && (
                                        <div className="mus-context-menu absolute right-0 top-10 w-44 z-50">
                                            <div
                                                className="mus-menu-item"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(null);
                                                    handleRename(element);
                                                }}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <Edit3 size={13} />
                                                    Rename
                                                </span>
                                            </div>

                                            {isAdmin && (
                                                <div
                                                    className="mus-menu-item"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenuId(null);
                                                        handleToggleVisibility(element);
                                                    }}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        {element.isPublic ? <Lock size={13} /> : <Globe size={13} />}
                                                        {element.isPublic ? 'Make Private' : 'Make Public'}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="mus-menu-divider" />

                                            <div
                                                className="mus-menu-item mus-menu-item-danger"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(null);
                                                    handleDelete(element);
                                                }}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <Trash2 size={13} />
                                                    Delete
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Badges */}
                                <div className="absolute top-2 left-2 flex gap-1">
                                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${getCategoryBadge(element.category)}`}>
                                        {element.category}
                                    </span>
                                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${getTypeBadge(element.type)}`}>
                                        {element.type}
                                    </span>
                                </div>

                                {/* Public indicator */}
                                {element.isPublic && (
                                    <div className="absolute bottom-2 right-2">
                                        <div className="mus-asset-status-indicator bg-green-500" title="Public">
                                            <Globe size={12} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-3 mus-border-t-soft mus-bg-main flex items-center justify-between">
                                <p className="text-xs mus-text-muted font-medium truncate" title={element.name}>
                                    {element.name}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ElementsView;
