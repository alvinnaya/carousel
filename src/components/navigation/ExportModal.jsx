import React, { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import { useCanvasContext } from '../../context/CanvasContext';
import * as fabric from 'fabric';

/**
 * ExportModal - Allows users to select canvases and export them as images.
 */
const ExportModal = ({ isOpen, onClose }) => {
    const { canvases, previews, activeCanvasIndex } = useCanvasContext();
    const [selectedIndices, setSelectedIndices] = useState([activeCanvasIndex]);
    const [isExporting, setIsExporting] = useState(false);

    // Sync with active canvas when opened
    useEffect(() => {
        if (isOpen) {
            setSelectedIndices([activeCanvasIndex]);
        }
    }, [isOpen, activeCanvasIndex]);

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
        setIsExporting(true);

        try {
            // Create a temporary canvas for high-res export if needed, 
            // but for now we'll use a hidden fabric canvas
            const exportCanvas = new fabric.Canvas(null, {
                enableRetinaScaling: true
            });

            for (const index of selectedIndices) {
                const canvasData = canvases[index];
                
                // Clear and load state
                exportCanvas.clear();
                
                // Set dimensions from data
                exportCanvas.setDimensions({
                    width: canvasData.width || 1080,
                    height: canvasData.height || 1080
                });

                await exportCanvas.loadFromJSON(canvasData);
                exportCanvas.renderAll();

                // Generate data URL
                const dataUrl = exportCanvas.toDataURL({
                    format: 'png',
                    quality: 1
                });

                // Trigger download
                const link = document.createElement('a');
                link.download = `canvas-${index + 1}.png`;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Small delay to prevent browser blocking multiple downloads
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        } catch (error) {
            console.error("Export failed:", error);
        } finally {
            setIsExporting(false);
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Export as Image"
            footer={
                <>
                    <button 
                        onClick={onClose}
                        className="mus-button-ghost px-5 py-2.5 font-bold"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleExport}
                        disabled={selectedIndices.length === 0 || isExporting}
                        className="mus-button-amber px-6 py-2.5 font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExporting ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Exporting...
                            </>
                        ) : (
                            `Download ${selectedIndices.length} Image${selectedIndices.length > 1 ? 's' : ''}`
                        )}
                    </button>
                </>
            }
        >
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <span className="mus-tool-label">Select Canvases</span>
                    <div className="flex gap-3">
                        <button onClick={selectAll} className="text-[10px] font-bold uppercase text-[var(--accent)] hover:underline">Select All</button>
                        <button onClick={selectNone} className="text-[10px] font-bold uppercase mus-text-muted hover:underline">Deselect All</button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {canvases.map((_, index) => (
                        <div 
                            key={index}
                            onClick={() => toggleSelection(index)}
                            className={`
                                relative cursor-pointer mus-surface border transition-all duration-200 overflow-hidden aspect-square
                                ${selectedIndices.includes(index) 
                                    ? 'border-[var(--accent)] ring-2 ring-[var(--accent-light)]' 
                                    : 'border-[var(--border-light)] hover:border-[var(--accent)]'}
                            `}
                        >
                            {previews[index] ? (
                                <img src={previews[index]} alt={`Canvas ${index + 1}`} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-[var(--bg-main)] flex items-center justify-center text-[10px] font-bold text-[var(--text-muted)]">
                                    Canvas {index + 1}
                                </div>
                            )}
                            
                            <div className={`absolute top-2 right-2 w-5 h-5 rounded-md border flex items-center justify-center transition-colors
                                ${selectedIndices.includes(index) ? 'bg-[var(--accent)] border-[var(--accent)]' : 'bg-white/80 border-[var(--border-light)]'}
                            `}>
                                {selectedIndices.includes(index) && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                )}
                            </div>
                            
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] font-black py-1 px-2 uppercase tracking-tight">
                                Canvas {index + 1}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    );
};

export default ExportModal;
