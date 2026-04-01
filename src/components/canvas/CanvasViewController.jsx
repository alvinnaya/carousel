import { useEffect, useRef } from 'react';
import { useCanvasContext } from '../../context/CanvasContext';
import * as fabric from 'fabric';

export default function CanvasViewController() {
    const { setScale, setTranslate, scale, translate, viewportRef, scaleRef, translateRef, canvas } = useCanvasContext();

    // Initial centering of the artboard
    useEffect(() => {
        if (!canvas) return;
        
        const artboard = canvas.getObjects().find(o => o.isArtboard);
        if (artboard) {
            const vpt = canvas.viewportTransform;
            vpt[4] = (canvas.width / 2) - (artboard.width * scale) / 2;
            vpt[5] = (canvas.height / 2) - (artboard.height * scale) / 2;
            canvas.setViewportTransform(vpt);
            
            // Sync initial translate
            setTranslate({ x: vpt[4], y: vpt[5] });
        }
        
    }, [canvas]); // Run once when canvas is ready

    // Sync external scale changes into Fabric (e.g. from UI zoom controls)
    useEffect(() => {
        if (!canvas) return;
        const currentScale = canvas.getZoom();
        if (Math.abs(currentScale - scale) > 0.001) {
            canvas.zoomToPoint(new fabric.Point(canvas.width / 2, canvas.height / 2), scale);
        }
    }, [scale, canvas]);

    useEffect(() => {
        if (!canvas) return;

        const handleFabricWheel = (opt) => {
            const e = opt.e;
            if (e.ctrlKey) {
                e.preventDefault();
                // Zoom
                const delta = -e.deltaY * 0.0025;
                const newScale = Math.max(0.2, Math.min(3, scaleRef.current + delta));

                const point = new fabric.Point(e.offsetX, e.offsetY);
                canvas.zoomToPoint(point, newScale);
                
                setScale(newScale); // Sync
                opt.e.stopPropagation();
            } else {
                // Pan
                const point = new fabric.Point(-e.deltaX, -e.deltaY);
                canvas.relativePan(point);

                const vpt = canvas.viewportTransform;
                setTranslate({ x: vpt[4], y: vpt[5] }); // Sync

                opt.e.preventDefault();
                opt.e.stopPropagation();
            }
        };

        const handleKeyDown = (e) => {
            if (e.ctrlKey && (e.key === '=' || e.key === '-' || e.key === '+' || e.key === '0')) {
                e.preventDefault();
            }
            
            // Handle spacebar panning (optional enhancement)
            if (e.code === 'Space' && e.target === document.body) {
                e.preventDefault();
            }
        };

        canvas.on('mouse:wheel', handleFabricWheel);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            canvas.off('mouse:wheel', handleFabricWheel);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [canvas, setScale, setTranslate, scaleRef]);

    return null;
}
