import React, { useState, useEffect, useRef } from 'react';
import { useCanvasContext } from '../../context/CanvasContext';

/**
 * ZoomControls - Scale display and adjustment buttons for TopNavigation.
 */
const ZoomControls = () => {
    const { scale, setScale } = useCanvasContext();
    const [zoomInput, setZoomInput] = useState(Math.round(scale * 100).toString());
    const inputRef = useRef(null);

    // Sync input with context scale (debounced React state)
    useEffect(() => {
        setZoomInput(Math.round(scale * 100).toString());
    }, [scale]);

    // Fast-path for zero-latency UI feedback during high-frequency interaction
    useEffect(() => {
        const handleFastScale = (e) => {
            if (inputRef.current) {
                inputRef.current.value = Math.round(e.detail * 100).toString();
            }
        };
        window.addEventListener('canvas:scale:fast', handleFastScale);
        return () => window.removeEventListener('canvas:scale:fast', handleFastScale);
    }, []);

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
        <div className="mus-zoom-controls">
            <button 
                onClick={zoomOut}
                className="mus-zoom-btn"
                aria-label="Zoom out"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
            
            <div className="flex items-center px-1">
                <input 
                    ref={inputRef}
                    type="text"
                    value={zoomInput}
                    onChange={handleZoomChange}
                    onBlur={applyZoom}
                    onKeyDown={(e) => e.key === 'Enter' && applyZoom()}
                    className="mus-zoom-input"
                />
                <span className="text-[10px] font-bold mus-text-muted mr-1.5">%</span>
            </div>

            <button 
                onClick={zoomIn}
                className="mus-zoom-btn"
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
