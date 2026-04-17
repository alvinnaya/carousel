import React, { useState, useEffect } from 'react';
import templateService from '../../../api/templateService';
import { useCanvasContext } from '../../../context/CanvasContext';
import { Loader2, Globe, Lock, Plus } from 'lucide-react';
import { getUsedFonts, loadGoogleFont } from '../../../utils/fontList';
import { promoteCanvasAssets } from '../../../utils/assetPromotion';

const AddTemplate = () => {
    const { addPage, activeId, isTemplate } = useCanvasContext();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Drilldown state
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [templatePages, setTemplatePages] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [processingPageId, setProcessingPageId] = useState(null);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setLoading(true);
                const response = await templateService.listTemplates(1, 40);
                if (response.success) {
                    setTemplates(response.data.items || response.data || []);
                } else {
                    setTemplates(response || []);
                }
            } catch (err) {
                console.error('Failed to fetch templates:', err);
                setError('Failed to load templates');
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, []);

    const handleTemplateClick = async (template) => {
        setSelectedTemplate(template);
        setLoadingDetails(true);
        setError(null);
        
        try {
            const response = await templateService.getTemplate(template.id);
            let pages = [];

            if (response.success && response.data) {
                 if (response.data.pages && response.data.pages.length > 0) {
                     pages = response.data.pages;
                 } else if (response.data.canvasJson) {
                     // Legacy single-page format disguised as multi-page
                     pages = [{
                         id: 'legacy-page',
                         canvasJson: response.data.canvasJson,
                         previewUrl: response.data.previewUrl || template.previewUrl,
                         order: 0
                     }];
                 }
            } else if (template.canvasJson) {
                 // Fallback to overview data
                 pages = [{
                     id: 'legacy-page',
                     canvasJson: template.canvasJson,
                     previewUrl: template.previewUrl,
                     order: 0
                 }];
            }
            
            if (pages.length === 0) {
                throw new Error("No pages found in template");
            }
            
            setTemplatePages(pages);
        } catch (err) {
            console.error('Failed to fetch template details:', err);
            setError('Failed to load template pages.');
            setSelectedTemplate(null);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handlePageClick = async (page) => {
        if (processingPageId) return;

        try {
            setProcessingPageId(page.id);
            
            let pageData = null;
            try {
                pageData = typeof page.canvasJson === 'string' ? JSON.parse(page.canvasJson) : page.canvasJson;
            } catch(e) {
                throw new Error("Invalid canvas data format");
            }

            if (!pageData) {
                throw new Error("No canvas data found in this page");
            }

            // Detect and load fonts before applying
            const fontMap = getUsedFonts([pageData]);
            const fontEntries = Object.entries(fontMap);

            if (fontEntries.length > 0) {
                console.log('Loading fonts for page:', fontEntries.map(([f]) => f));
                await Promise.all(fontEntries.map(([font, weights]) =>
                    loadGoogleFont(font, Array.from(weights))
                ));
            }

            // [FLOW B] Bulk Promote Assets before adding to design
            // This copies template-scoped images to the user's design-scoped storage.
            const promotedData = await promoteCanvasAssets(pageData, activeId, isTemplate);

            // Add the specific page with official design-scoped URLs
            await addPage(promotedData);
            
            // Optionally, we could go back to the list, or stay in drilldown. 
            // Staying is usually better in case they want to add multiple pages.
        } catch (err) {
            console.error('Failed to apply template page:', err);
        } finally {
            setProcessingPageId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Loading templates...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 rounded-xl border border-red-100 bg-red-50 text-center">
                <p className="text-xs font-bold text-red-500">{error}</p>
            </div>
        );
    }

    if (selectedTemplate) {
        return (
            <div className="space-y-6">
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <button 
                            onClick={() => {
                                setSelectedTemplate(null);
                                setTemplatePages([]);
                                setError(null);
                            }}
                            className="p-1.5 rounded-lg border border-[var(--border-light)] hover:bg-[var(--bg-main)] transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                        <div className="flex-1 overflow-hidden">
                            <h3 className="text-xs font-black text-[var(--text-primary)] truncate">{selectedTemplate.name}</h3>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Select a page to add</p>
                        </div>
                    </div>

                    {loadingDetails ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Loading Pages...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {templatePages.map((page, index) => (
                                <div
                                    key={page.id || index}
                                    onClick={() => handlePageClick(page)}
                                    className="mus-template-card-sm group mus-template-card-interactive"
                                >
                                    <div className="aspect-[4/5] flex items-center justify-center relative">
                                        {page.previewUrl ? (
                                            <img
                                                src={page.previewUrl}
                                                alt={`Page ${index + 1}`}
                                                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center mus-template-placeholder">
                                                Page {index + 1}
                                            </div>
                                        )}

                                        {/* Action Overlay */}
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-black/5">
                                            <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-lg">
                                                {processingPageId === page.id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <Plus size={16} strokeWidth={3} />
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="absolute bottom-0 left-0 right-0 mus-template-title-overlay p-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="mus-template-title-text !text-[8px] uppercase tracking-widest">
                                                Page {index + 1}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Templates Browser</h3>
                    <span className="text-[9px] font-bold text-zinc-300">{templates.length} found</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {templates.length === 0 ? (
                        <p className="text-center py-8 text-[10px] font-bold text-zinc-300 uppercase tracking-widest">No templates found</p>
                    ) : (
                        templates.map((template) => (
                            <div
                                key={template.id}
                                onClick={() => handleTemplateClick(template)}
                                className="mus-template-card-sm group mus-template-card-interactive"
                            >
                                {/* Preview Area */}
                                <div className="aspect-[4/5] flex items-center justify-center relative overflow-hidden">
                                    {template.previewUrl ? (
                                        <img
                                            src={template.previewUrl}
                                            alt={template.name}
                                            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 mus-template-placeholder">
                                            <span className="text-3xl">🎨</span>
                                        </div>
                                    )}

                                    {/* Action Overlay */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-black/5">
                                        <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-[var(--bg-main)] flex items-center justify-center shadow-lg">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="9 18 15 12 9 6"></polyline>
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Public/Private Badge Overlay */}
                                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className={template.isPublic ? 'mus-template-badge-public p-1' : 'mus-template-badge-private p-1'}>
                                            {template.isPublic ? <Globe size={12} /> : <Lock size={12} />}
                                        </div>
                                    </div>

                                    {/* Name Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-3 mus-template-title-overlay opacity-0 group-hover:opacity-100 transition-opacity">
                                        <h4 className="truncate mus-template-title-text !text-[10px]">
                                            {template.name}
                                        </h4>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default AddTemplate;
