import { useEffect, useRef } from 'react';
import * as fabric from 'fabric';
import { useCanvasContext } from '../context/CanvasContext';
import { CanvasDefaultControllerStyling } from './CanvasControllerStyling';

const CanvasCreation = ({ width, height }) => {
    const canvasRef = useRef(null);
    const { setCanvas, scale, translate, canvases, activeCanvasIndex } = useCanvasContext();


    console.log("canvas creation", activeCanvasIndex)

    useEffect(() => {
        if (!canvasRef.current) return;

        CanvasDefaultControllerStyling(fabric);

        const fabricCanvas = new fabric.Canvas(canvasRef.current, {
            width: width,
            height: height,
            backgroundColor: '#ffffff',
        });

        const loadContent = async () => {
            const savedState = canvases[activeCanvasIndex];

            // Check if savedState is not empty (e.g., has objects)
            if (savedState && savedState.objects && savedState.objects.length > 0) {
                console.log('Loading state from context for index:', activeCanvasIndex);
                await fabricCanvas.loadFromJSON(savedState);
                fabricCanvas.renderAll();
            } else {
                console.log('Initializing new canvas for index:', activeCanvasIndex);
                // Default objects for new canvas
                const rect = new fabric.Rect({
                    top: 100,
                    left: 100,
                    width: 150,
                    height: 150,
                    fill: '#4f46e5',
                    rx: 20,
                    ry: 20,
                    shadow: new fabric.Shadow({
                        color: 'rgba(0,0,0,0.3)',
                        blur: 15,
                        offsetX: 5,
                        offsetY: 5
                    })
                });
                fabricCanvas.add(rect);

                const text = new fabric.Textbox('Creative Design', {
                    top: 150,
                    left: 300,
                    width: 250,
                    fontSize: 32,
                    fill: '#1f2937',
                    fontFamily: 'Inter, ui-sans-serif, system-ui',
                    fontWeight: 'bold',
                    textAlign: 'center',
                });
                fabricCanvas.add(text);

                fabric.FabricImage.fromURL('https://picsum.photos/seed/picsum/400/300', {
                    crossOrigin: 'anonymous'
                }).then((img) => {
                    img.set({
                        top: 400,
                        left: 150,
                        scaleX: 0.6,
                        scaleY: 0.6,
                        strokeWidth: 0,
                        strokeUniform: true
                    });

                    const clipRect = new fabric.Rect({
                        width: img.width,
                        height: img.height,
                        rx: 40,
                        ry: 40,
                        originX: 'center',
                        originY: 'center',
                    });
                    img.clipPath = clipRect;

                    fabricCanvas.add(img);
                    fabricCanvas.renderAll();
                });
            }

            setCanvas(fabricCanvas);
        };

        loadContent();

        // Cleanup on unmount or when activeCanvasIndex changes
        return () => {
            console.log("disposed canvas for index:", activeCanvasIndex);
            fabricCanvas.dispose();
            setCanvas(null);
        };
    }, [setCanvas, activeCanvasIndex, width, height]);

    return (
        <>
            <div className=""
                style={{
                    transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.05s linear',
                }}>
                <div className="overflow-hidden relative border-black border-2 rounded-lg">
                    <canvas ref={canvasRef} id="main-canvas" />
                </div>
            </div>
        </>

    );
};

export default CanvasCreation;
