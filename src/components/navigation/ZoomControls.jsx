import React, { useState, useEffect } from 'react';
import { useCanvasContext } from '../../context/CanvasContext';

/**
 * ZoomControls - Scale display and adjustment buttons for TopNavigation.
 */
const ZoomControls = () => {
    const { scale, setScale } = useCanvasContext();
    const [zoomInput, setZoomInput] = useState(Math.round(scale * 100).toString());

    // Sync input with context scale (e.g. from mouse wheel)
    useEffect(() => {
        setZoomInput(Math.round(scale * 100).toString());
    }, [scale]);

    const handleZoomChange = (e) => {
        const val = e.target.value;
        // Only allow positive integers
        if (val === '' || /^\d+$/.test(val)) {
            setZoomInput(val);
        }
    };

    const applyZoom = () => {
        const numericVal = parseInt(zoomInput);
        if (!isNaN(numericVal)) {
            const nextScale = Math.max(0.2, Math.min(3, numericVal / 100));
            setScale(nextScale);
            setZoomInput(Math.round(nextScale * 100).toString());
        } else {
            // Revert on invalid input
            setZoomInput(Math.round(scale * 100).toString());
        }
    };

    const zoomIn = () => setScale(prev => Math.min(3, prev + 0.1));
    const zoomOut = () => setScale(prev => Math.max(0.2, prev - 0.1));

    return (
        <div className="flex items-center bg-[var(--bg-main)] rounded-lg border border-[var(--border-light)] p-0.5 shadow-sm">
            <button 
                onClick={zoomOut}
                className="w-7 h-7 flex items-center justify-center hover:bg-[var(--bg-surface)] rounded-md transition-colors mus-text-primary"
                aria-label="Zoom out"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
            
            <div className="flex items-center px-1">
                <input 
                    type="text"
                    value={zoomInput}
                    onChange={handleZoomChange}
                    onBlur={applyZoom}
                    onKeyDown={(e) => e.key === 'Enter' && applyZoom()}
                    className="w-10 bg-transparent text-center mus-text-primary font-bold text-[12px] outline-none"
                />
                <span className="text-[10px] font-bold mus-text-muted mr-1.5">%</span>
            </div>

            <button 
                onClick={zoomIn}
                className="w-7 h-7 flex items-center justify-center hover:bg-[var(--bg-surface)] rounded-md transition-colors mus-text-primary"
                aria-label="Zoom in"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
        </div>
    );
};

export default ZoomControls;
