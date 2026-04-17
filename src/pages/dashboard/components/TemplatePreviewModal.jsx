import React, { useState, useEffect } from 'react';
import Modal from '../../../components/shared/Modal';
import { Loader2, AlertCircle, Copy, Layers } from 'lucide-react';
import templateService from '../../../api/templateService';
import { useNavigate } from 'react-router-dom';

const TemplatePreviewModal = ({ isOpen, onClose, templateId }) => {
    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [activePageIndex, setActivePageIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && templateId) {
            fetchTemplateDetails(templateId);
        }
    }, [isOpen, templateId]);

    const fetchTemplateDetails = async (id) => {
        setLoading(true);
        setError('');
        try {
            const response = await templateService.getTemplate(id);
            if (response.success && response.data) {
                setTemplate(response.data);
                if (response.data.pages && response.data.pages.length > 0) {
                    setActivePageIndex(0);
                }
            } else {
                setError('Failed to fetch template details.');
            }
        } catch (err) {
            console.error('Fetch template details error:', err);
            setError('An error occurred while loading template.');
        } finally {
            setLoading(false);
        }
    };

    const handleUseTemplate = async () => {
        setIsCreating(true);
        setError('');
        try {
            const response = await templateService.useTemplate(templateId);
            if (response.success && response.data?.id) {
                // Redirect user to the new project
                navigate(`/editor/${response.data.id}`);
            } else {
                setError(response.message || 'Failed to create project from template');
            }
        } catch (err) {
            console.error('Use template error:', err);
            setError('An error occurred while creating project.');
        } finally {
            setIsCreating(false);
        }
    };

    if (!isOpen) return null;

    const pages = template?.pages || [];
    const hasPages = pages.length > 0;
    
    // Determine active preview URL (either from the active page, or fallback to the template root previewUrl)
    const activePreviewUrl = hasPages && pages[activePageIndex]?.previewUrl 
        ? pages[activePageIndex].previewUrl 
        : template?.previewUrl;

    return (
        <Modal
            isOpen={isOpen}
            onClose={isCreating ? () => {} : onClose}
            className="max-w-4xl" // Larger modal for preview
            title={<div className="font-black text-xl text-[var(--text-primary)]">Template Preview</div>}
            footer={
                <div className="flex justify-between w-full items-center">
                    <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-muted)]">
                        <Layers size={16} />
                        {hasPages ? `${pages.length} Pages` : '1 Page'}
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={onClose}
                            disabled={isCreating}
                            className="mus-button-ghost px-5 py-2"
                        >
                            Close
                        </button>
                        <button 
                            onClick={handleUseTemplate}
                            disabled={isCreating || loading || !!error}
                            className="mus-button-amber px-6 py-2 flex items-center gap-2"
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Creating Project...</span>
                                </>
                            ) : (
                                <>
                                    <Copy size={16} />
                                    <span>Use this Template</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            }
        >
            <div className="flex flex-col min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center flex-1 py-20">
                        <Loader2 className="animate-spin text-[var(--accent)] mb-4" size={40} />
                        <span className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Loading Preview...</span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center flex-1 py-10 px-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-[var(--danger)] mb-4">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-[var(--danger)]">Error Loading Template</h3>
                        <p className="text-sm text-[var(--text-muted)] mt-2">{error}</p>
                    </div>
                ) : template && (
                    <div className="flex flex-col md:flex-row gap-6 w-full">
                        {/* Details Section */}
                        <div className="w-full md:w-1/3 flex flex-col gap-4 order-2 md:order-1">
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2">{template.name}</h2>
                                {template.description && (
                                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                                        {template.description}
                                    </p>
                                )}
                            </div>
                            
                            {hasPages && pages.length > 1 && (
                                <div className="mt-4">
                                    <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">
                                        Pages in this template
                                    </h4>
                                    <div className="grid grid-cols-3 gap-2 pr-2 custom-scrollbar max-h-[300px] overflow-y-auto">
                                        {pages.map((p, idx) => (
                                            <div 
                                                key={p.id || idx}
                                                onClick={() => setActivePageIndex(idx)}
                                                className={`
                                                    aspect-square border-2 rounded-lg cursor-pointer overflow-hidden transition-all bg-[var(--bg-main)]
                                                    ${activePageIndex === idx 
                                                        ? 'border-[var(--accent)] ring-2 ring-[var(--accent-light)]' 
                                                        : 'border-[var(--border-light)] hover:border-[var(--border-dark)]'
                                                    }
                                                `}
                                            >
                                                {p.previewUrl ? (
                                                    <img src={p.previewUrl} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-[var(--text-muted)]">
                                                        {idx + 1}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Preview Image Section */}
                        <div className="w-full md:w-2/3 bg-[var(--bg-main)] rounded-xl border border-[var(--border-light)] flex items-center justify-center overflow-hidden min-h-[300px] order-1 md:order-2">
                            {activePreviewUrl ? (
                                <img 
                                    src={activePreviewUrl} 
                                    alt={`${template.name} preview`} 
                                    className="max-w-full max-h-[500px] object-contain shadow-sm"
                                />
                            ) : (
                                <div className="text-center p-8">
                                    <div className="text-[var(--text-muted)] opacity-50 mb-4 flex justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                            <polyline points="21 15 16 10 5 21"></polyline>
                                        </svg>
                                    </div>
                                    <p className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-xs">No preview available</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default TemplatePreviewModal;
