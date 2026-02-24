import { useEffect, useRef } from 'react';
import { useCanvasContext } from '../../context/CanvasContext';

const CanvasStateHandler = () => {
    const { canvas, updateCanvasState, updatePreview, activeCanvasIndex } = useCanvasContext();
    const debounceTimerRef = useRef(null);
    const lastJsonRef = useRef(null);

    useEffect(() => {
        if (!canvas) return;

        const syncState = () => {
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

                console.log('Syncing canvas state for index:', activeCanvasIndex);
                updateCanvasState(activeCanvasIndex, stateUpdate);

                // // Generate preview
                // const previewDataUrl = canvas.toDataURL({
                //     format: 'png',
                //     multiplier: 0.2, // Small preview for performance
                //     quality: 0.5
                // });
                // updatePreview(activeCanvasIndex, previewDataUrl);
            }, 250); // 250ms debounce
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
    }, [canvas, activeCanvasIndex, updateCanvasState]);

    return null;
};

export default CanvasStateHandler;
