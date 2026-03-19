import { useEffect, useRef } from 'react';
import { useCanvasContext } from '../../context/CanvasContext';

const CanvasStateHandler = () => {
    const { canvas, updateCanvasState, updatePreview, activeCanvasIndex, recordHistory, histories, isInternalAction } = useCanvasContext();
    const debounceTimerRef = useRef(null);
    const lastJsonRef = useRef(null);

    useEffect(() => {
        if (!canvas) return;

        // Initialize history if empty
        const currentHistory = histories[activeCanvasIndex];
        if (!currentHistory || currentHistory.past.length === 0) {
            const initialJson = canvas.toJSON();
            recordHistory(activeCanvasIndex, {
                ...initialJson,
                width: canvas.width,
                height: canvas.height
            });
            lastJsonRef.current = JSON.stringify(initialJson);
        }

        const syncState = (e) => {
            // Skip sync if this change was triggered internally (e.g. undo/redo)
            if (isInternalAction.current) {
                console.log('Skipping sync for internal action');
                
                // Still update lastJsonRef to current to avoid double sync
                const currentJson = canvas.toJSON();
                lastJsonRef.current = JSON.stringify(currentJson);
                return;
            }

            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            debounceTimerRef.current = setTimeout(() => {
                const currentJson = canvas.toJSON();
                const jsonString = JSON.stringify(currentJson);

                // Only update if the content actually changed
                if (jsonString === lastJsonRef.current) {
                    return;
                }

                lastJsonRef.current = jsonString;

                const stateUpdate = {
                    ...currentJson,
                    width: canvas.width,
                    height: canvas.height
                };

                console.log('Recording canvas history for index:', activeCanvasIndex);
                recordHistory(activeCanvasIndex, stateUpdate);
                updateCanvasState(activeCanvasIndex, stateUpdate);
            }, 500);
        };

        // Structural and content change events
        const events = [
            'object:modified',
            'object:added',
            'object:removed',
            'path:created',
            'text:changed'
        ];

        events.forEach(eventName => {
            canvas.on(eventName, syncState);
        });

        return () => {
            events.forEach(eventName => {
                canvas.off(eventName, syncState);
            });
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [canvas, activeCanvasIndex, updateCanvasState, recordHistory, isInternalAction]);

    return null;
};

export default CanvasStateHandler;
