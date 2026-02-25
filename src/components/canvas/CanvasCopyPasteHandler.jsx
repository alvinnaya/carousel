import { useEffect, useRef } from 'react';
import { useCanvasContext } from '../../context/CanvasContext';
import * as fabric from 'fabric';

const CanvasCopyPasteHandler = () => {
    const { canvas, clipboard, setClipboard } = useCanvasContext();

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
                    setClipboard(cloned);
                    console.log('Object copied to clipboard');
                }
            }

            // Ctrl+V or Cmd+V
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                if (!clipboard) return;

                const clonedObj = await clipboard.clone();

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

                // Update clipboard position for next paste
                const updatedClipboard = await clipboard.clone();
                updatedClipboard.set({
                    left: updatedClipboard.left + 20,
                    top: updatedClipboard.top + 20
                });
                setClipboard(updatedClipboard);

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
