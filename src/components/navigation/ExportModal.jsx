import React, { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import { useCanvasContext } from '../../context/CanvasContext';
import templateService from '../../api/templateService';
import * as fabric from 'fabric';
import { generateHighQualityPreview } from '../../utils/canvasUtils';

/**
 * ExportModal - Allows users to select canvases and either export them as images
 * or save them as a new template.
 */
const ExportModal = ({ isOpen, onClose }) => {
    const { canvases, previews, activeCanvasIndex, designInfo } = useCanvasContext();
    const [activeTab, setActiveTab] = useState('download'); // 'download' or 'template'
    const [selectedIndices, setSelectedIndices] = useState([activeCanvasIndex]);
    
    // Shared State
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Download State
    const [exportFormat, setExportFormat] = useState('png');
    const [exportMultiplier, setExportMultiplier] = useState(1);
    
    // Template State
    const [templateName, setTemplateName] = useState('');
    const [templateDescription, setTemplateDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Sync with active canvas and reset fields when opened
    useEffect(() => {
        if (isOpen) {
            setSelectedIndices([activeCanvasIndex]);
            setTemplateName(`${designInfo?.title || 'Project'} Template`);
            setTemplateDescription('');
            setIsPublic(false);
            setError('');
            setSuccess(false);
            setActiveTab('download'); // reset tab
        }
    }, [isOpen, activeCanvasIndex, designInfo]);

    const toggleSelection = (index) => {
        setSelectedIndices(prev => 
            prev.includes(index) 
                ? prev.filter(i => i !== index) 
                : [...prev, index]
        );
    };

    const selectAll = () => {
        setSelectedIndices(canvases.map((_, i) => i));
    };

    const selectNone = () => {
        setSelectedIndices([]);
    };

    const handleExport = async () => {
        if (selectedIndices.length === 0) return;
        setIsProcessing(true);

        try {
            const exportCanvas = new fabric.Canvas(null, {
                enableRetinaScaling: true
            });

            for (const index of selectedIndices) {
                const canvasData = canvases[index];
                
                exportCanvas.clear();
                exportCanvas.setDimensions({
                    width: canvasData.width || 1080,
                    height: canvasData.height || 1080
                });

                await exportCanvas.loadFromJSON(canvasData);
                exportCanvas.renderAll();

                const dataUrl = exportCanvas.toDataURL({
                    format: exportFormat,
                    quality: (exportFormat === 'jpeg' || exportFormat === 'webp') ? 0.9 : 1,
                    multiplier: exportMultiplier
                });

                const link = document.createElement('a');
                link.download = `canvas-${index + 1}.${exportFormat}`;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        } catch (error) {
            console.error("Export failed:", error);
        } finally {
            setIsProcessing(false);
            onClose();
        }
    };

    const handleSaveAsTemplate = async () => {
        if (selectedIndices.length === 0) return;
        if (!templateName.trim()) {
            setError('Template name is required');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('ProjectId', designInfo?.id);
            formData.append('Name', templateName);
            formData.append('Description', templateDescription || '');
            formData.append('IsPublic', isPublic);

            // Sequentially render high quality previews for each selected canvas
            // We do this BEFORE calling the API to ensure backend gets the latest visual state
            console.log(`ExportModal: Rendering ${selectedIndices.length} previews...`);
            
            for (const index of selectedIndices) {
                const canvasData = canvases[index];
                if (!canvasData._pageId) continue;

                // 1. Append the Page ID
                formData.append('SelectedPageIds', canvasData._pageId);

                // 2. Render and append the high-quality preview file
                try {
                    const previewFile = await generateHighQualityPreview(canvasData);
                    if (previewFile) {
                        formData.append('files', previewFile);
                    }
                } catch (renderErr) {
                    console.error(`Failed to render preview for page index ${index}`, renderErr);
                    // We continue even if one fails, backend typically handles partials 
                    // or we might want to fail the whole process depending on UX requirements.
                }
            }

            const response = await templateService.createFromProject(formData);

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setError(response.message || 'Failed to create template');
            }
        } catch (err) {
            console.error("Save as template failed:", err);
            setError(err.message || "An error occurred while creating template.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAction = () => {
        if (activeTab === 'download') {
            handleExport();
        } else {
            handleSaveAsTemplate();
        }
    };

    const getActionText = () => {
        if (isProcessing) {
            return activeTab === 'download' ? 'Exporting...' : 'Publishing...';
        }
        return activeTab === 'download' 
            ? `Download ${selectedIndices.length} Image${selectedIndices.length > 1 ? 's' : ''}`
            : `Publish ${selectedIndices.length} Page${selectedIndices.length > 1 ? 's' : ''}`;
    };

    // Calculate dynamic layout based on success state for template tab
    const isSuccessState = activeTab === 'template' && success;

    return (
        <Modal
            isOpen={isOpen}
            onClose={isProcessing ? () => {} : onClose}
            title="Export Options"
            maxWidthClass={isSuccessState ? "max-w-md" : "max-w-4xl"}
            footer={
                isSuccessState ? null : (
                <>
                    <button 
                        onClick={onClose}
                        disabled={isProcessing}
                        className="mus-button-ghost"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleAction}
                        disabled={selectedIndices.length === 0 || isProcessing || (activeTab === 'template' && !templateName.trim())}
                        className="mus-button-amber"
                    >
                        {isProcessing ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {getActionText()}
                            </>
                        ) : (
                            getActionText()
                        )}
                    </button>
                </>
                )
            }
        >
            <div className="flex flex-col gap-6">
                
                {/* Tabs Header */}
                {!isSuccessState && (
                    <div className="flex gap-4 border-b border-[var(--border-light)] pb-2">
                        <button 
                            className={`pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'download' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                            onClick={() => setActiveTab('download')}
                        >
                            Download Images
                        </button>
                        <button 
                            className={`pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'template' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                            onClick={() => setActiveTab('template')}
                        >
                            Save as Template
                        </button>
                    </div>
                )}

                {isSuccessState ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)]">Template Created!</h3>
                        <p className="text-[var(--text-muted)] text-sm mt-2 mb-6">
                            Your template has been successfully saved to your gallery.
                        </p>
                        <button 
                            onClick={onClose}
                            className="mus-button-ghost w-full justify-center"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                        {/* Left Side: Canvas Selection */}
                        <div className="md:col-span-3 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <span className="mus-tool-label">Select Pages</span>
                                <div className="flex gap-3">
                                    <button onClick={selectAll} className="mus-btn-text text-[var(--accent)] hover:underline">Select All</button>
                                    <button onClick={selectNone} className="mus-btn-text mus-text-muted hover:underline">Deselect All</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {canvases.map((_, index) => (
                                    <div 
                                        key={index}
                                        onClick={() => toggleSelection(index)}
                                        className={`
                                            mus-export-card aspect-square relative
                                            ${selectedIndices.includes(index) ? 'mus-export-card-selected ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-main)]' : 'ring-1 ring-[var(--border-light)] hover:ring-[var(--border-soft)]'}
                                        `}
                                    >
                                        {previews[index] ? (
                                            <img src={previews[index]} alt={`Canvas ${index + 1}`} className="w-full h-full object-cover rounded-md p-1" />
                                        ) : (
                                            <div className="w-full h-full bg-[var(--bg-main)] flex items-center justify-center text-[10px] font-bold text-[var(--text-muted)] rounded-md">
                                                Page {index + 1}
                                            </div>
                                        )}
                                        
                                        <div className={`absolute top-2 right-2 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shadow-sm
                                            ${selectedIndices.includes(index) ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'bg-white/80 border-[var(--border-light)] text-transparent'}
                                        `}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                        
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-[10px] font-bold py-1.5 px-2 tracking-wide rounded-b-md">
                                            Page {index + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Side: Options depending on tab */}
                        <div className="md:col-span-2 flex flex-col gap-4 border-l border-[var(--border-light)] pl-8">
                            {activeTab === 'download' ? (
                                <div className="flex flex-col gap-6">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-sm font-bold text-[var(--text-primary)]">Download Options</h3>
                                        <p className="text-xs text-[var(--text-muted)]">Select the pages you want to export. They will be downloaded directly to your device with the specified format and resolution.</p>
                                    </div>
                                    
                                    <div className="bg-[var(--bg-main)] rounded-lg p-4 border border-[var(--border-light)] flex flex-col gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                                                Format
                                            </label>
                                            <select 
                                                value={exportFormat}
                                                onChange={(e) => setExportFormat(e.target.value)}
                                                className="w-full px-3 py-2 bg-white border border-[var(--border-soft)] rounded-md focus:outline-none focus:border-[var(--accent)] text-sm transition-colors"
                                            >
                                                <option value="png">PNG (Best for graphics)</option>
                                                <option value="jpeg">JPEG (Smaller file size)</option>
                                                <option value="webp">WebP (Modern compression)</option>
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                                                Resolution / Scale
                                            </label>
                                            <select 
                                                value={exportMultiplier}
                                                onChange={(e) => setExportMultiplier(Number(e.target.value))}
                                                className="w-full px-3 py-2 bg-white border border-[var(--border-soft)] rounded-md focus:outline-none focus:border-[var(--accent)] text-sm transition-colors"
                                            >
                                                <option value={1}>1x (Standard)</option>
                                                <option value={2}>2x (High / Retina)</option>
                                                <option value={3}>3x (Maximum)</option>
                                            </select>
                                        </div>

                                        <div className="flex justify-between items-center pt-3 mt-1 border-t border-[var(--border-light)]">
                                            <span className="text-xs font-bold text-[var(--text-primary)]">Total Files</span>
                                            <span className="text-sm font-bold text-[var(--accent)]">{selectedIndices.length}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 flex-1">
                                    <div className="flex flex-col gap-1 mb-2">
                                        <h3 className="text-sm font-bold text-[var(--text-primary)]">Template Details</h3>
                                        <p className="text-xs text-[var(--text-muted)]">Publish selected pages as a reusable template to your gallery.</p>
                                    </div>

                                    {error && (
                                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-xs font-medium">
                                            {error}
                                        </div>
                                    )}
                                    
                                    <div className="flex flex-col gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                                                Template Name *
                                            </label>
                                            <input 
                                                type="text" 
                                                value={templateName}
                                                onChange={(e) => setTemplateName(e.target.value)}
                                                className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-soft)] rounded-md focus:outline-none focus:border-[var(--accent)] text-sm transition-colors"
                                                placeholder="My Awesome Template"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                                                Description (Optional)
                                            </label>
                                            <textarea 
                                                value={templateDescription}
                                                onChange={(e) => setTemplateDescription(e.target.value)}
                                                className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-soft)] rounded-md focus:outline-none focus:border-[var(--accent)] text-sm resize-none h-24 transition-colors custom-scrollbar"
                                                placeholder="What is this template for?"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ExportModal;
