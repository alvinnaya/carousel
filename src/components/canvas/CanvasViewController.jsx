import { useEffect, useRef } from 'react';
import { useCanvasContext } from '../../context/CanvasContext';

export default function CanvasViewController() {
    const { setScale, setTranslate, scale, translate, viewportRef } = useCanvasContext();
    
    // Mutable refs for zero-latency access and transformation
    const stateRef = useRef({ 
        scale, 
        translate,
        isUpdating: false 
    });

    // Initialize stateRef with current context values (once)
    useEffect(() => {
        stateRef.current.scale = scale;
        stateRef.current.translate = translate;
    }, []);

    // Helper to apply direct DOM transformation
    const applyTransform = () => {
        if (!viewportRef.current) return;
        const { scale, translate } = stateRef.current;
        const tx = Math.round(translate.x);
        const ty = Math.round(translate.y);
        viewportRef.current.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    };

    useEffect(() => {
        const handleWheel = (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                // Zoom
                const delta = -e.deltaY * 0.0025;
                const newScale = Math.max(0.2, Math.min(3, stateRef.current.scale + delta));
                
                stateRef.current.scale = newScale;
                setScale(newScale); // Sync for other components (Styling, etc)
            } else {
                // Pan
                const newTranslate = {
                    x: stateRef.current.translate.x - e.deltaX,
                    y: stateRef.current.translate.y - e.deltaY
                };
                
                stateRef.current.translate = newTranslate;
                setTranslate(newTranslate); // Sync for other components
            }

            // INSTANT visual update
            applyTransform();
        };

        const handleKeyDown = (e) => {
            if (e.ctrlKey && (e.key === '=' || e.key === '-' || e.key === '+' || e.key === '0')) {
                e.preventDefault();
            }
        };

        // Apply initial transform
        applyTransform();

        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [viewportRef, setScale, setTranslate]);

    return null;
}
