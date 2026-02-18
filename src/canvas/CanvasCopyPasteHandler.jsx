import { useEffect, useRef } from 'react';
import { useCanvasContext } from '../context/CanvasContext';
import * as fabric from 'fabric';

const CanvasCopyPasteHandler = () => {
    const { canvas } = useCanvasContext();
    const clipboardRef = useRef(null);

    useEffect(() => {
        if (!canvas) return;

        const handleKeyDown = async (e) => {
            // Check if focus is on an input or textarea
            if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
                return;
            }

            // Ctrl+C or Cmd+C
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                const activeObject = canvas.getActiveObject();
                if (activeObject) {
                    const cloned = await activeObject.clone();
                    clipboardRef.current = cloned;
                    console.log('Object copied to clipboard');
                }
            }

            // Ctrl+V or Cmd+V
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                if (!clipboardRef.current) return;

                const clonedObj = await clipboardRef.current.clone();

                canvas.discardActiveObject();
                clonedObj.set({
                    left: clonedObj.left + 20,
                    top: clonedObj.top + 20,
                    evented: true,
                });

                if (clonedObj instanceof fabric.ActiveSelection) {
                    // active selection needs a reference to the canvas.
                    clonedObj.canvas = canvas;
                    clonedObj.forEachObject((obj) => {
                        canvas.add(obj);
                    });
                    // this is necessary to settle the omitFromStackTrace
                    clonedObj.setCoords();
                } else {
                    canvas.add(clonedObj);
                }

                clipboardRef.current.top += 20;
                clipboardRef.current.left += 20;
                canvas.setActiveObject(clonedObj);
                canvas.requestRenderAll();
                console.log('Object pasted from clipboard');
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [canvas]);

    return null;
};

export default CanvasCopyPasteHandler;
