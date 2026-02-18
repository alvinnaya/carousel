import { useEffect, useRef } from 'react';
import { useCanvasContext } from '../context/CanvasContext';

export default function CanvasViewController() {
    const { setScale, setTranslate } = useCanvasContext();

    useEffect(() => {
        const handleWheel = (e) => {
            // Prevent browser zoom (Ctrl + Mouse Wheel)
            if (e.ctrlKey) {
                e.preventDefault();
                setScale((prev) => {
                    let next = prev - e.deltaY * 0.0025;
                    return Math.max(0.2, Math.min(3, next));
                });
            } else {
                // Handle panning (Shift + Scroll or just Scroll depends on UX)
                // For now, let's keep it as is
                setTranslate((prev) => ({
                    x: prev.x - e.deltaX,
                    y: prev.y - e.deltaY,
                }));
            }
        };

        const handleKeyDown = (e) => {
            // Prevent browser zoom shortcuts (Ctrl + + / - / 0)
            if (e.ctrlKey && (e.key === '=' || e.key === '-' || e.key === '+' || e.key === '0')) {
                e.preventDefault();
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return null;
}

