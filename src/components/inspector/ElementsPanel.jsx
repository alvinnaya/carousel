import React, { useEffect, useState } from 'react';
import { useCanvasContext } from '../../context/CanvasContext';

/**
 * ElementsPanel - Lists and manages individual objects on the current canvas.
 */
const ElementsPanel = () => {
    const { canvas, canvases, activeCanvasIndex } = useCanvasContext();
    const [elements, setElements] = useState([]);

    useEffect(() => {
        if (!canvas) {
            setElements([]);
            return;
        }

        const refreshElements = () => {
            const objects = canvas.getObjects();
            // Reverse to show topmost elements first (z-order)
            const elementsData = [...objects].reverse().map((obj) => {
                let preview = '';
                try {
                    // Generate a small preview
                    const padding = 10;
                    const size = 64;
                    const scale = (size - padding * 2) / Math.max(obj.width * obj.scaleX, obj.height * obj.scaleY, 1);

                    const tempCanvas = obj.toCanvasElement({
                        multiplier: scale,
                    });
                    preview = tempCanvas.toDataURL();
                } catch (e) {
                    console.warn('Could not generate preview for object:', obj.type, e);
                }

                return {
                    id: obj.id || Math.random().toString(36).substr(2, 9),
                    type: obj.type,
                    preview: preview,
                    ref: obj
                };
            });
            setElements(elementsData);
        };

        refreshElements();

        // Note: CanvasStateHandler updates `canvases` in context on every modification (debounced).
        // This useEffect depends on `canvases`, so it will re-run and refresh the previews.

    }, [canvas, canvases, activeCanvasIndex]);

    return (
        <div className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
            {elements.map((el, index) => (
                <div
                    key={`${el.type}-${index}`}
                    className="flex items-center p-2 rounded-lg bg-zinc-50 border border-zinc-100 hover:border-zinc-300 hover:bg-white cursor-pointer transition-all group shadow-sm"
                    onClick={() => {
                        canvas.setActiveObject(el.ref);
                        canvas.requestRenderAll();
                    }}
                >
                    <div className="w-10 h-10 rounded-md bg-white border border-zinc-100 flex items-center justify-center mr-3 overflow-hidden shadow-inner">
                        {el.preview ? (
                            <img src={el.preview} alt={el.type} className="max-w-full max-h-full object-contain" />
                        ) : (
                            <div className="text-[10px] text-zinc-400 font-bold uppercase">{el.type.charAt(0)}</div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{el.type}</span>
                        <span className="text-xs font-semibold text-zinc-800">Element {elements.length - index}</span>
                    </div>
                </div>
            ))}

            {elements.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2 opacity-30">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p className="text-[10px] font-bold">No elements found</p>
                </div>
            )}
        </div>
    );
};

export default ElementsPanel;
