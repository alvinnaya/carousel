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
    const [dropPosition, setDropPosition] = useState(null); // 'top' or 'bottom'

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
        if (draggedIndex === null) return;

        let finalTargetIndex = targetIndex;
        if (draggedIndex < targetIndex) {
            finalTargetIndex = dropPosition === 'top' ? targetIndex - 1 : targetIndex;
        } else {
            finalTargetIndex = dropPosition === 'top' ? targetIndex : targetIndex + 1;
        }

        // Clamp
        finalTargetIndex = Math.max(0, Math.min(canvases.length - 1, finalTargetIndex));

        if (draggedIndex === finalTargetIndex) {
            setDraggedIndex(null);
            setDropTargetIndex(null);
            setDropPosition(null);
            return;
        }

        setCanvases((prev) => moveItem(prev, draggedIndex, finalTargetIndex));
        setPreviews((prev) => moveItem(prev, draggedIndex, finalTargetIndex));
        setActiveCanvasIndex((prev) => getReorderedActiveIndex(prev, draggedIndex, finalTargetIndex));

        setDraggedIndex(null);
        setDropTargetIndex(null);
        setDropPosition(null);
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

                    const isDragged = draggedIndex === index;
                    const isDropTarget = dropTargetIndex === index;

                    return (
                        <div
                            key={index}
                            draggable
                            className={`relative group transition-all duration-300 ${isDragged ? 'z-0' : 'z-10'}`}
                            onClick={() => setActiveCanvasIndex(index)}
                            onDragStart={(event) => {
                                event.dataTransfer.setData('text/plain', `${index}`);
                                event.dataTransfer.effectAllowed = 'move';
                                setDraggedIndex(index);

                                // Create a drag ghost image
                                const ghost = event.currentTarget.cloneNode(true);
                                ghost.style.opacity = '0.5';
                                ghost.style.position = 'absolute';
                                ghost.style.top = '-1000px';
                                document.body.appendChild(ghost);

                                // Calculate offset based on click position relative to the element
                                const rect = event.currentTarget.getBoundingClientRect();
                                const xOffset = event.clientX - rect.left;
                                const yOffset = event.clientY - rect.top;

                                event.dataTransfer.setDragImage(ghost, xOffset, yOffset);
                                setTimeout(() => document.body.removeChild(ghost), 0);
                            }}
                            onDragOver={(event) => {
                                event.preventDefault();
                                event.dataTransfer.dropEffect = 'move';

                                const rect = event.currentTarget.getBoundingClientRect();
                                const y = event.clientY - rect.top;
                                const position = y < rect.height / 2 ? 'top' : 'bottom';

                                if (dropTargetIndex !== index || dropPosition !== position) {
                                    setDropTargetIndex(index);
                                    setDropPosition(position);
                                }
                            }}
                            onDragLeave={(event) => {
                                const rect = event.currentTarget.getBoundingClientRect();
                                if (
                                    event.clientX < rect.left ||
                                    event.clientX >= rect.right ||
                                    event.clientY < rect.top ||
                                    event.clientY >= rect.bottom
                                ) {
                                    setDropTargetIndex(null);
                                    setDropPosition(null);
                                }
                            }}
                            onDrop={(event) => {
                                event.preventDefault();
                                handleDrop(index);
                            }}
                            onDragEnd={() => {
                                setDraggedIndex(null);
                                setDropTargetIndex(null);
                                setDropPosition(null);
                            }}
                        >
                            {/* Drop Indicator Line */}
                            {isDropTarget && draggedIndex !== index && (
                                <div
                                    className={`absolute left-0 right-0 h-1 bg-[#E8C04A] z-50 rounded-full transition-all duration-200 shadow-[0_0_10px_rgba(232,192,74,0.5)]
                                        ${dropPosition === 'top' ? '-top-3' : '-bottom-3'}
                                    `}
                                />
                            )}

                            <div className="absolute top-2 left-2 z-10 text-[10px] font-black mus-text-primary bg-white/90 border border-[#1A1A1A] px-1.5 rounded-md shadow-sm">
                                {index + 1}
                            </div>

                            <div
                                className={`
                                    w-full rounded-2xl border-2 flex items-center justify-center overflow-hidden transition-all duration-200 cursor-pointer bg-white
                                    ${activeCanvasIndex === index ? 'border-[#1A1A1A] ring-4 ring-[#E8C04A]/30 shadow-lg' : 'border-[#D4CBBA] hover:border-[#1A1A1A]'}
                                    ${isDragged ? 'opacity-40 grayscale scale-95 border-dashed' : 'opacity-100 grayscale-0 scale-100'}
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
                className="w-full py-4 mus-button-ghost hover:mus-button-ghost-active flex items-center justify-center"
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
