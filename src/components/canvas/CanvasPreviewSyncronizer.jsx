import { useEffect, useRef } from 'react';
import * as fabric from 'fabric';
import { useCanvasContext } from '../../context/CanvasContext';

const PREVIEW_MULTIPLIER = 0.2;
const PREVIEW_QUALITY = 0.5;
const DEFAULT_CANVAS_SIZE = 1080;

const CanvasPreviewSyncronizer = () => {
    const { canvases, activeCanvasIndex, updatePreview, canvas } = useCanvasContext();
    const hasInitializedAllPreviewsRef = useRef(false);

    const syncPreviewForIndex = async (index, savedState) => {
        if (!savedState) return;

        const offscreenEl = document.createElement('canvas');
        const offscreenCanvas = new fabric.StaticCanvas(offscreenEl, {
            width: savedState.width || DEFAULT_CANVAS_SIZE,
            height: savedState.height || DEFAULT_CANVAS_SIZE,
            backgroundColor: savedState.background || '#ffffff'
        });

        try {
            await offscreenCanvas.loadFromJSON(savedState);
            const previewDataUrl = offscreenCanvas.toDataURL({
                format: 'png',
                multiplier: PREVIEW_MULTIPLIER,
                quality: PREVIEW_QUALITY
            });
            updatePreview(index, previewDataUrl);
        } finally {
            offscreenCanvas.dispose();
        }
    };



    //     if (hasInitializedAllPreviewsRef.current) return;
    //     if (!Array.isArray(canvases) || canvases.length === 0) return;

    //     hasInitializedAllPreviewsRef.current = true;

    //     const syncAllPreviews = async () => {
    //         for (let i = 0; i < canvases.length; i += 1) {
    //             const savedState = canvases[i];
    //             if (!savedState) continue;

    //             try {
    //                 await syncPreviewForIndex(i, savedState);
    //             } catch (error) {
    //                 console.error('Failed to sync initial canvas preview:', error);
    //             }
    //         }
    //     };

    //     syncAllPreviews();
    // }, [canvas]);

    useEffect(() => {
        const savedState = canvases?.[activeCanvasIndex];
        if (!savedState) return;
        let isCancelled = false;

        const syncPreview = async () => {
            try {
                if (!isCancelled) {
                    await syncPreviewForIndex(activeCanvasIndex, savedState);
                }
            } catch (error) {
                console.error('Failed to sync canvas preview:', error);
            }
        };

        syncPreview();

    }, [canvases, activeCanvasIndex]);

    return null;
};

export default CanvasPreviewSyncronizer;
