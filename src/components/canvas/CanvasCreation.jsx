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

    // Derive correct design dimensions instead of passing HTML canvas scale
    let designWidth = activeCanvasData.width || 1080;
    let designHeight = activeCanvasData.height || 1080;

    // Auto-heal: If the bug previously saved viewport size (e.g. 1920x1080 window) 
    // into the design dimension history, we sanitize it back to the typical maximum square/portrait bounds
    // if (designWidth > 1350 || designHeight > 1920) {
    //     designWidth = 1080;
    //     designHeight = 1080;
    // }

    const canvasWidth = designWidth;
    const canvasHeight = designHeight;

    useEffect(() => {
        if (!canvasRef.current || !viewportRef.current || !isFontsReady) return;

        CanvasDefaultControllerStyling(fabric);

        const container = viewportRef.current;

        // Initialize with container size
        const initWidth = container.offsetWidth || window.innerWidth;
        const initHeight = container.offsetHeight || window.innerHeight;

        const fabricCanvas = new fabric.Canvas(canvasRef.current, {
            width: initWidth,
            height: initHeight,
            backgroundColor: '#e5e5e5', // Workspace background
            preserveObjectStacking: true // Keep active object on top without changing its z-index
        });

        // FIX: Override clearContext to always clear the FULL physical canvas buffer.
        // Fabric's default clearContext uses CSS dimensions (this.width/this.height) with clearRect.
        // If the retina scaling transform isn't active at clear-time, only CSS-width pixels
        // get cleared, leaving physical pixels on the right/bottom uncovered → trail/brush artifacts.
        // This override resets to identity and clears the full physical buffer every time.
        fabricCanvas.clearContext = function (ctx) {
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.restore();
        };

        // Clip all rendered objects to artboard bounds.
        // _renderObjects is called AFTER viewportTransform is applied to ctx,
        // so (0,0)-(canvasWidth,canvasHeight) = artboard area in logical coords.
        // Controls render on the upper canvas, so handles stay visible outside the clip.
        const origRenderObjects = fabricCanvas._renderObjects.bind(fabricCanvas);
        fabricCanvas._renderObjects = function (ctx, objects) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, canvasWidth, canvasHeight);
            ctx.clip();
            origRenderObjects(ctx, objects);
            ctx.restore();
        };

        const createDefaultArtboard = (fallbackBg = '#ffffff') => {
            return new fabric.Rect({
                width: canvasWidth,
                height: canvasHeight,
                fill: fallbackBg,
                left: 0,
                top: 0,
                originX: 'left',
                originY: 'top',
                selectable: false,
                evented: false,
                hasControls: false,
                hasBorders: false,
                lockMovementX: true,
                lockMovementY: true,
                lockRotation: true,
                lockScalingX: true,
                lockScalingY: true,
                hoverCursor: 'default',
                excludeFromExport: true, // IMPORTANT: Never let server see this!
                isArtboard: true, // Identify as the artboard
                shadow: new fabric.Shadow({
                    color: 'rgba(0,0,0,0.1)',
                    blur: 15,
                    offsetX: 0,
                    offsetY: 10
                })
            });
        };

        const applyArtboardLogic = (targetCanvas, artboardColor = '#ffffff') => {
            // 1. Remove ANY existing artboards or legacy zombie rects
            targetCanvas.getObjects().slice().forEach(obj => {
                if (obj.isArtboard ||
                    (obj.type === 'rect' &&
                        !obj.selectable &&
                        (Math.round(obj.getScaledWidth()) === canvasWidth || Math.round(obj.width) === canvasWidth) &&
                        (Math.round(obj.getScaledHeight()) === canvasHeight || Math.round(obj.height) === canvasHeight) &&
                        Math.abs(obj.left || 0) < 1 &&
                        Math.abs(obj.top || 0) < 1)) {
                    targetCanvas.remove(obj);
                }
            });

            // 2. Ensure workspace background is always gray
            targetCanvas.backgroundColor = '#e5e5e5';

            // 3. Create fresh artboard with correct color
            if (artboardColor === '#e5e5e5') artboardColor = '#ffffff'; // heal gray corruption
            const artboardRect = createDefaultArtboard(artboardColor);

            targetCanvas.add(artboardRect);
            targetCanvas.sendObjectToBack(artboardRect);
            targetCanvas.requestRenderAll();
        };

        // EXPOSE METHOD to undo/redo system
        fabricCanvas.ensureArtboard = (color) => applyArtboardLogic(fabricCanvas, color);

        const activeCanvasData = canvases[activeCanvasIndex] || {};

        // Handle resizing of the app window/sidebar
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                if (entry.target === container) {
                    const { width, height } = entry.contentRect;
                    if (width > 0 && height > 0) {
                        fabricCanvas.setDimensions({ width, height });
                        fabricCanvas.requestRenderAll();
                    }
                }
            }
        });

        resizeObserver.observe(container);

        const syncCanvasState = () => {
            const currentJson = fabricCanvas.toJSON(['imageKey']); // isArtboard is irrelevant since it's excluded

            const artboard = fabricCanvas.getObjects().find(o => o.isArtboard);
            if (artboard) {
                currentJson.background = artboard.fill;
            }

            // When saving state, we STILL want the virtual artboard dimensions saved
            updateCanvasState(activeCanvasIndex, {
                ...currentJson,
                width: canvasWidth, // Keep the original artboard width
                height: canvasHeight // Keep the original artboard height
            });
        };

        const loadContent = async () => {
            const savedState = canvases[activeCanvasIndex];

            if (savedState && savedState.objects && savedState.objects.length > 0) {
                console.log('Loading state from context for index:', activeCanvasIndex);
                const corsSafeState = ensureCORS(savedState);
                await fabricCanvas.loadFromJSON(corsSafeState);
            }

            // Apply artboard logic (this heals the artboard missing from loadFromJSON + sets workspace color)
            let artboardColor = savedState?.background || '#ffffff';
            applyArtboardLogic(fabricCanvas, artboardColor);

            // Save clean state back → artboard excluded via excludeFromExport,
            // zombies removed, DB gets cleaned permanently
            syncCanvasState();
            setCanvas(fabricCanvas);
        };

        loadContent();

        // Generate preview


        // Cleanup on unmount or when activeCanvasIndex changes
        return () => {
            console.log("disposed canvas for index:", activeCanvasIndex);
            resizeObserver.disconnect();
            fabricCanvas.dispose();
            setCanvas(null);
        };


    }, [setCanvas, activeCanvasIndex, canvasWidth, canvasHeight, isFontsReady]);

    return (
        <>
            <div ref={viewportRef} className="absolute inset-0 w-full h-full overflow-hidden bg-[#e5e5e5]">
                <canvas ref={canvasRef} id="main-canvas" className="w-full h-full" />
            </div>
        </>
    );
};

export default CanvasCreation;
