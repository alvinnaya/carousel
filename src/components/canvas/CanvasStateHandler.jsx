import { useEffect, useRef } from 'react';
import { useCanvasContext } from '../../context/CanvasContext';

const CanvasStateHandler = () => {
    const { canvas, updateCanvasState, activeCanvasIndex } = useCanvasContext();
    const debounceTimerRef = useRef(null);

    useEffect(() => {
        if (!canvas) return;

        const syncState = () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            debounceTimerRef.current = setTimeout(() => {
                const json = canvas.toJSON();
                console.log('Syncing canvas state for index:', activeCanvasIndex);
                updateCanvasState(activeCanvasIndex, json);
            }, 500); // 500ms debounce
        };

        // Events that trigger a state update
        const events = [
            'object:modified',
            'object:added',
            'object:removed',
            'path:created',
            'text:changed',
            'selection:updated' // Optional: if you want to save selection state? probably not needed for persistence
        ];

        events.forEach(eventName => {
            canvas.on(eventName, syncState);
        });

        // Initial sync if the canvas is empty or newly loaded
        // syncState(); 

        return () => {
            events.forEach(eventName => {
                canvas.off(eventName, syncState);
            });
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [canvas, activeCanvasIndex, updateCanvasState]);

    return null;
};

export default CanvasStateHandler;
