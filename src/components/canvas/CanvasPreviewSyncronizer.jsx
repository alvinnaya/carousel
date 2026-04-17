import { useEffect, useRef } from 'react';
import * as fabric from 'fabric';
import { useCanvasContext } from '../../context/CanvasContext';
import { getUsedFonts, loadGoogleFont } from '../../utils/fontList';

const PREVIEW_MULTIPLIER = 0.2; // 20% size (approx 216px)
const PREVIEW_QUALITY = 0.6;    // 60% WebP quality
const DEFAULT_CANVAS_SIZE = 1080;

const CanvasPreviewSyncronizer = () => {
    const { canvases, activeCanvasIndex, updatePreview, canvas, isFontsReady } = useCanvasContext();
    const hasInitializedAllPreviewsRef = useRef(false);

    const syncPreviewForIndex = async (index, savedState) => {
        if (!savedState) return;

        // Load fonts first before rendering preview
        const usedFonts = getUsedFonts([savedState]);
        const fontLoadPromises = Object.entries(usedFonts).map(([fontName, weightsSet]) => {
            return loadGoogleFont(fontName, Array.from(weightsSet));
        });

        if (fontLoadPromises.length > 0) {
            try {
                await Promise.all(fontLoadPromises);
            } catch (err) {
                console.error('Error loading fonts for preview:', err);
            }
        }

        const offscreenEl = document.createElement('canvas');
        const offscreenCanvas = new fabric.StaticCanvas(offscreenEl, {
            width: savedState.width || DEFAULT_CANVAS_SIZE,
            height: savedState.height || DEFAULT_CANVAS_SIZE,
            backgroundColor: 'transparent' // Rely entirely on the artboard shape
        });

        try {
            await offscreenCanvas.loadFromJSON(savedState);
            
            // Ensure an artboard exists to provide the background color
            let artboard = offscreenCanvas.getObjects().find(o => o.isArtboard);
            if (!artboard) {
                let fallbackBg = savedState.background || '#ffffff';
                if (fallbackBg === '#e5e5e5') fallbackBg = '#ffffff'; // Correct legacy corruption
                
                artboard = new fabric.Rect({
                    width: savedState.width || DEFAULT_CANVAS_SIZE,
                    height: savedState.height || DEFAULT_CANVAS_SIZE,
                    fill: fallbackBg,
                    left: 0,
                    top: 0,
                    originX: 'left',
                    originY: 'top',
                    isArtboard: true
                });
                offscreenCanvas.add(artboard);
                offscreenCanvas.sendObjectToBack(artboard);
            }
            
            // Force artboard to back just in case
            offscreenCanvas.sendObjectToBack(artboard);
            offscreenCanvas.renderAll();

            const previewDataUrl = offscreenCanvas.toDataURL({
                format: 'webp',
                multiplier: PREVIEW_MULTIPLIER,
                quality: PREVIEW_QUALITY,
                enableRetinaScaling: true
            });
            updatePreview(index, previewDataUrl);
        } finally {
            offscreenCanvas.dispose();
        }
    };



    useEffect(() => {
        if (!isFontsReady || !Array.isArray(canvases) || canvases.length === 0) return;

        const syncAllPreviews = async () => {
            for (let i = 0; i < canvases.length; i += 1) {
                const savedState = canvases[i];
                if (!savedState) continue;

                try {
                    await syncPreviewForIndex(i, savedState);
                } catch (error) {
                    console.error('Failed to sync initial canvas preview:', error);
                }
            }
        };

        syncAllPreviews();
    }, [canvases.length, isFontsReady]); // Sync all when count changes or fonts are ready

    useEffect(() => {
        if (!isFontsReady) return;

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

        return () => { isCancelled = true; };
    }, [canvases, activeCanvasIndex, isFontsReady]);

    return null;
};

export default CanvasPreviewSyncronizer;
