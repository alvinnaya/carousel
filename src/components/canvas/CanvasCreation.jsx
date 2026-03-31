import { useEffect, useRef } from 'react';
import * as fabric from 'fabric';
import { useCanvasContext } from '../../context/CanvasContext';
import { CanvasDefaultControllerStyling } from './CanvasControllerStyling';
import { ensureCORS } from '../../utils/canvasUtils';

const CanvasCreation = () => {
    const canvasRef = useRef(null);
    const {
        setCanvas,
        scale,
        translate,
        canvases,
        activeCanvasIndex,
        updateCanvasState,
        isFontsReady,
        viewportRef
    } = useCanvasContext();


    console.log("canvas creation", activeCanvasIndex, "fonts ready:", isFontsReady)

    const activeCanvasData = canvases[activeCanvasIndex] || {};
    const canvasWidth = activeCanvasData.width || 1080;
    const canvasHeight = activeCanvasData.height || 1080;

    useEffect(() => {
        if (!canvasRef.current || !isFontsReady) return;

        CanvasDefaultControllerStyling(fabric);

        const fabricCanvas = new fabric.Canvas(canvasRef.current, {
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor: '#ffffff',
        });

        // Helper function to dynamically load Google Fonts
        // const loadGoogleFont = (fontFamily) => {
        //     return new Promise((resolve) => {
        //         const link = document.createElement('link');
        //         link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@400;700&display=swap`;
        //         link.rel = 'stylesheet';
        //         link.onload = () => resolve();
        //         link.onerror = () => {
        //             console.warn(`Failed to load Google Font: ${fontFamily}`);
        //             resolve(); // Resolve even on error to not block other fonts
        //         };
        //         document.head.appendChild(link);
        //     });
        // };

        const syncCanvasState = () => {
            const currentJson = fabricCanvas.toJSON();
            updateCanvasState(activeCanvasIndex, {
                ...currentJson,
                width: fabricCanvas.width,
                height: fabricCanvas.height
            });
        };

        const loadContent = async () => {
            const savedState = canvases[activeCanvasIndex];

            // Check if savedState is not empty and has objects
            if (savedState && savedState.objects && savedState.objects.length > 0) {
                console.log('Loading state from context for index:', activeCanvasIndex);
                // Extra safety: ensure CORS on all images in the JSON
                const corsSafeState = ensureCORS(savedState);
                await fabricCanvas.loadFromJSON(corsSafeState);
                fabricCanvas.renderAll();
            } else {

            }

            syncCanvasState();
            setCanvas(fabricCanvas);
        };

        loadContent();

        // Generate preview


        // Cleanup on unmount or when activeCanvasIndex changes
        return () => {
            console.log("disposed canvas for index:", activeCanvasIndex);
            fabricCanvas.dispose();
            setCanvas(null);
        };


    }, [setCanvas, activeCanvasIndex, canvasWidth, canvasHeight, isFontsReady]);

    return (
        <>
            <div ref={viewportRef} className=""
                style={{
                    transformOrigin: 'center center',
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                    WebkitFontSmoothing: 'antialiased',
                    transformStyle: 'preserve-3d'
                }}>
                <div className="overflow-hidden relative border-black border-2 rounded-lg" style={{ backfaceVisibility: 'hidden' }}>
                    <canvas ref={canvasRef} id="main-canvas" />
                </div>
            </div>
        </>
    );
};

export default CanvasCreation;
