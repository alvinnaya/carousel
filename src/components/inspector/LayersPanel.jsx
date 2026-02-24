import React, { useState } from 'react';
import { useCanvasContext } from '../../context/CanvasContext';
import LayerThumbnail from './LayerThumbnail';

/**
 * LayersPanel - Manages canvas pages with thumbnails and addition logic.
 */
const LayersPanel = () => {
    const { canvas, canvases, setCanvases, previews, setPreviews, activeCanvasIndex, setActiveCanvasIndex } = useCanvasContext();
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dropTargetIndex, setDropTargetIndex] = useState(null);

    const addCanvas = () => {
        setCanvases([...canvases, {}]);
        setPreviews([...previews, '']);
        setActiveCanvasIndex(canvases.length);
    };

    const moveItem = (arr, fromIndex, toIndex) => {
        const next = [...arr];
        const [movedItem] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, movedItem);
        return next;
    };

    const getReorderedActiveIndex = (currentActiveIndex, fromIndex, toIndex) => {
        if (currentActiveIndex === fromIndex) return toIndex;
        if (fromIndex < toIndex && currentActiveIndex > fromIndex && currentActiveIndex <= toIndex) {
            return currentActiveIndex - 1;
        }
        if (fromIndex > toIndex && currentActiveIndex >= toIndex && currentActiveIndex < fromIndex) {
            return currentActiveIndex + 1;
        }
        return currentActiveIndex;
    };

    const handleDrop = (targetIndex) => {
        if (draggedIndex === null || draggedIndex === targetIndex) return;

        setCanvases((prev) => moveItem(prev, draggedIndex, targetIndex));
        setPreviews((prev) => moveItem(prev, draggedIndex, targetIndex));
        setActiveCanvasIndex((prev) => getReorderedActiveIndex(prev, draggedIndex, targetIndex));

        setDraggedIndex(null);
        setDropTargetIndex(null);
    };

    // Calculate aspect ratio from the active canvas or fallback to 1/1
    const aspectRatio = canvas ? canvas.width / canvas.height : 1;

    return (
        <div className="flex-1 flex flex-col p-4 space-y-4 h-full overflow-y-scroll overflow-x-hidden custom-scrollbar">
            {/* Pages List */}
            <div className="flex-1 space-y-3  pb-4 ">
                {canvases.map((canvasJSON, index) => {
                    // Try to get aspect ratio from this specific canvas state
                    const itemAspectRatio = (canvasJSON.width && canvasJSON.height)
                        ? canvasJSON.width / canvasJSON.height
                        : aspectRatio;

                    return (
                        <div
                            key={index}
                            draggable
                            className="relative group"
                            onClick={() => setActiveCanvasIndex(index)}
                            onDragStart={(event) => {
                                event.dataTransfer.setData('text/plain', `${index}`);
                                event.dataTransfer.effectAllowed = 'move';
                                setDraggedIndex(index);
                            }}
                            onDragOver={(event) => {
                                event.preventDefault();
                                event.dataTransfer.dropEffect = 'move';
                                setDropTargetIndex(index);
                            }}
                            onDragLeave={() => {
                                setDropTargetIndex((current) => (current === index ? null : current));
                            }}
                            onDrop={(event) => {
                                event.preventDefault();
                                handleDrop(index);
                            }}
                            onDragEnd={() => {
                                setDraggedIndex(null);
                                setDropTargetIndex(null);
                            }}
                        >
                            <div className="absolute top-2 left-2 z-10 text-[10px] font-bold text-zinc-900 bg-white/80 px-1 rounded shadow-sm">
                                {index}
                            </div>

                            <div
                                className={`
                                    w-full rounded-xl border-2 flex items-center justify-center overflow-hidden transition-all cursor-pointer bg-white
                                    ${activeCanvasIndex === index ? 'border-indigo-500 ring-4 ring-indigo-50 shadow-lg' : 'border-zinc-100 hover:border-zinc-300'}
                                    ${dropTargetIndex === index ? 'border-zinc-400 bg-zinc-50' : ''}
                                `}
                                style={{ aspectRatio: itemAspectRatio }}
                            >
                                <LayerThumbnail previewUrl={previews[index]} />
                            </div>

                            <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Page Button */}
            <button
                onClick={addCanvas}
                className="w-full py-3 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-center text-zinc-600 hover:bg-zinc-100 transition-all hover:shadow-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
            </button>
        </div>
    );
};

export default LayersPanel;
