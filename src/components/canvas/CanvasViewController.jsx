import { useEffect, useRef } from 'react';
import { useCanvasContext } from '../../context/CanvasContext';

export default function CanvasViewController() {
    const { setScale, setTranslate, scale, translate, viewportRef, scaleRef, translateRef, canvas } = useCanvasContext();

    // Helper to apply direct DOM transformation
    const applyTransform = () => {
        if (!viewportRef.current) return;
        const s = scaleRef.current;
        const tx = Math.round(translateRef.current.x);
        const ty = Math.round(translateRef.current.y);
        viewportRef.current.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
    };

    // Fallback synchronization for state changes (e.g. from ZoomControls)
    useEffect(() => {
        applyTransform();
    }, [scale, translate]);

    useEffect(() => {
        const handleWheel = (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                // Zoom
                const delta = -e.deltaY * 0.0025;
                const newScale = Math.max(0.2, Math.min(3, scaleRef.current + delta));

                setScale(newScale); // Sync (Debounced in context)
            } else {
                // Pan
                const newTranslate = {
                    x: translateRef.current.x - e.deltaX,
                    y: translateRef.current.y - e.deltaY
                };

                setTranslate(newTranslate); // Sync (Debounced in context)
            }

            // INSTANT visual update via Ref
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
