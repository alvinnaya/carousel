import { useEffect, useRef } from 'react';
import { useCanvasContext } from '../../context/CanvasContext';

const CanvasStateHandler = () => {
    const { canvas, canvases, updateCanvasState, updatePreview, activeCanvasIndex, recordHistory, histories, isInternalAction } = useCanvasContext();
    const debounceTimerRef = useRef(null);
    const lastJsonRef = useRef(null);

    useEffect(() => {
        if (!canvas) return;

        // Sync lastJsonRef to current page state when switching/rendering
        // This baseline ensures the next user action is correctly detected as a change
        // and prevents "dirty" initialization steps in history.
        const currentJson = canvas.toJSON(['imageKey']);
        const artboard = canvas.getObjects().find(o => o.isArtboard);
        if (artboard) {
            currentJson.background = artboard.fill;
        }
        lastJsonRef.current = JSON.stringify(currentJson);

        const syncState = (e) => {
            // Skip sync if this change was triggered internally (e.g. undo/redo)
            if (isInternalAction.current) {
                console.log('Skipping sync for internal action');

                // Still update lastJsonRef to current to avoid double sync
                const currentJson = canvas.toJSON(['imageKey']);
                const artboard = canvas.getObjects().find(o => o.isArtboard);
                if (artboard) {
                    currentJson.background = artboard.fill;
                }
                lastJsonRef.current = JSON.stringify(currentJson);
                return;
            }

            console.log('Syncing canvas state');

            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            debounceTimerRef.current = setTimeout(() => {
                const currentJson = canvas.toJSON(['imageKey']);
                const artboard = canvas.getObjects().find(o => o.isArtboard);
                if (artboard) {
                    currentJson.background = artboard.fill;
                }
                const jsonString = JSON.stringify(currentJson);

                // Only update if the content actually changed
                if (jsonString === lastJsonRef.current) {
                    console.log('Skipping sync: No content change detected');
                    return;
                }

                lastJsonRef.current = jsonString;

                // Use proper logical dimensions rather than arbitrary screen bounds
                const ab = canvas.getObjects().find(o => o.isArtboard);
                const finalWidth = ab ? ab.width : (canvases[activeCanvasIndex]?.width || 1080);
                const finalHeight = ab ? ab.height : (canvases[activeCanvasIndex]?.height || 1080);

                const stateUpdate = {
                    ...currentJson,
                    width: finalWidth,
                    height: finalHeight
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
            'text:changed',
            'canvas:modified' // Listen to custom canvas-level changes (e.g. background)
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
