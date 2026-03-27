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
        const loadGoogleFont = (fontFamily) => {
            return new Promise((resolve) => {
                const link = document.createElement('link');
                link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@400;700&display=swap`;
                link.rel = 'stylesheet';
                link.onload = () => resolve();
                link.onerror = () => {
                    console.warn(`Failed to load Google Font: ${fontFamily}`);
                    resolve(); // Resolve even on error to not block other fonts
                };
                document.head.appendChild(link);
            });
        };

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
                // console.log('Initializing new canvas for index:', activeCanvasIndex);
                // // Default objects for new canvas
                // const rect = new fabric.Rect({
                //     top: 100,
                //     left: 100,
                //     width: 150,
                //     height: 150,
                //     fill: '#4f46e5',
                //     rx: 20,
                //     ry: 20,
                //     shadow: new fabric.Shadow({
                //         color: 'rgba(0,0,0,0.3)',
                //         blur: 15,
                //         offsetX: 5,
                //         offsetY: 5
                //     })
                // });
                // fabricCanvas.add(rect);

                // const text = new fabric.Textbox('Creative Design', {
                //     top: 150,
                //     left: 300,
                //     width: 250,
                //     fontSize: 32,
                //     fill: '#1f2937',
                //     fontFamily: 'Inter, ui-sans-serif, system-ui',
                //     fontWeight: 'bold',
                //     textAlign: 'center',
                //     // globalCompositeOperation: "destination-out"
                // });
                // fabricCanvas.add(text);

                // fabric.FabricImage.fromURL('https://picsum.photos/seed/picsum/400/300', {
                //     crossOrigin: 'anonymous'
                // }).then((img) => {
                //     img.set({
                //         top: 400,
                //         left: 150,
                //         scaleX: 0.6,
                //         scaleY: 0.6,
                //         strokeWidth: 0,
                //         strokeUniform: true
                //     });

                //     const clipRect = new fabric.Rect({
                //         width: img.width,
                //         height: img.height,
                //         rx: 40,
                //         ry: 40,
                //         originX: 'center',
                //         originY: 'center',
                //     });
                //     img.clipPath = clipRect;

                //     fabricCanvas.add(img);
                //     fabricCanvas.renderAll();
                //     syncCanvasState();
                // });
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
