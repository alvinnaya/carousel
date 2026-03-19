import React, { useState, useRef } from 'react';
import { useCanvasContext } from '../../context/CanvasContext';
import LayerItem from './LayerItem';
import AddCanvasSection from './AddCanvasSection';

/**
 * LayersPanel - Manages canvas pages with thumbnails and addition logic.
 */
const LayersPanel = () => {
    const { canvas, canvases, setCanvases, previews, setPreviews, activeCanvasIndex, setActiveCanvasIndex } = useCanvasContext();
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dropTargetIndex, setDropTargetIndex] = useState(null);
    const [dropPosition, setDropPosition] = useState(null); // 'top' or 'bottom'
    const [dropdownOpenIndex, setDropdownOpenIndex] = useState(null);
    const scrollContainerRef = useRef(null);

    const duplicateCanvas = (index) => {
        const newCanvas = JSON.parse(JSON.stringify(canvases[index]));
        const newPreview = previews[index];

        const newCanvases = [...canvases];
        newCanvases.splice(index + 1, 0, newCanvas);
        setCanvases(newCanvases);

        const newPreviews = [...previews];
        newPreviews.splice(index + 1, 0, newPreview);
        setPreviews(newPreviews);

        setActiveCanvasIndex(index + 1);
        setDropdownOpenIndex(null);
    };

    const deleteCanvas = (index) => {
        if (canvases.length <= 1) return;

        const newCanvases = [...canvases];
        newCanvases.splice(index, 1);
        setCanvases(newCanvases);

        const newPreviews = [...previews];
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);

        // Update active index
        if (activeCanvasIndex === index) {
            // If deleting active, go to previous if last, else stay at index (which is now next)
            setActiveCanvasIndex(Math.max(0, index - 1));
        } else if (activeCanvasIndex > index) {
            // If deleting before active, adjust active index down
            setActiveCanvasIndex(activeCanvasIndex - 1);
        }
        setDropdownOpenIndex(null);
    };

    const insertCanvas = (index) => {
        const newCanvases = [...canvases];
        // For 'Add New', if we have an active canvas, clone its width/height dimensions if available
        const templateCanvas = canvases[activeCanvasIndex] || {};
        const width = templateCanvas.width || 1080;
        const height = templateCanvas.height || 1080;

        newCanvases.splice(index + 1, 0, { width, height });
        setCanvases(newCanvases);

        const newPreviews = [...previews];
        newPreviews.splice(index + 1, 0, '');
        setPreviews(newPreviews);

        setActiveCanvasIndex(index + 1);
        setDropdownOpenIndex(null);
    };

    const addCanvas = () => {
        // By default adding a canvas uses dimensions of the active canvas or defaults to 1080x1080
        const templateCanvas = canvases[activeCanvasIndex] || {};
        const width = templateCanvas.width || 1080;
        const height = templateCanvas.height || 1080;

        setCanvases([...canvases, { width, height }]);
        setPreviews([...previews, '']);
        setActiveCanvasIndex(canvases.length);
    };

    const handleCreateCustomCanvas = (width, height) => {
        setCanvases([...canvases, { width, height }]);
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

    const handleContainerDragOver = (e) => {
        e.preventDefault();
        if (!scrollContainerRef.current || draggedIndex === null) return;

        const container = scrollContainerRef.current;
        const rect = container.getBoundingClientRect();
        const y = e.clientY - rect.top;

        // Auto-scroll zones (e.g., top 10% and bottom 10% of the container)
        const scrollZoneHeight = rect.height * 0.1;
        const scrollSpeed = 10; // Pixels per frame

        if (y < scrollZoneHeight) {
            // Scroll Up
            container.scrollTop -= scrollSpeed;
        } else if (y > rect.height - scrollZoneHeight) {
            // Scroll Down
            container.scrollTop += scrollSpeed;
        }
    };

    return (
        <div
            className="flex-1 flex flex-col h-full relative overflow-hidden"
            style={{backgroundColor: 'var(--bg-main)'}}
            onDragOver={handleContainerDragOver}
        >
            {/* Pages List */}
            <div 
                ref={scrollContainerRef}
                className="flex-1 space-y-3 p-4 pb-4 overflow-y-scroll overflow-x-hidden custom-scrollbar"
            >
                {canvases.map((canvasJSON, index) => (
                    <LayerItem
                        key={index}
                        index={index}
                        canvasJSON={canvasJSON}
                        previewUrl={previews[index]}
                        aspectRatio={aspectRatio}
                        isActive={activeCanvasIndex === index}
                        isDragged={draggedIndex === index}
                        isDropTarget={dropTargetIndex === index}
                        dropPosition={dropPosition}
                        draggedIndex={draggedIndex}
                        isDropdownOpen={dropdownOpenIndex === index}
                        onSetActive={() => setActiveCanvasIndex(index)}
                        setDraggedIndex={setDraggedIndex}
                        setDropTargetIndex={setDropTargetIndex}
                        setDropPosition={setDropPosition}
                        handleDrop={() => handleDrop(index)}
                        toggleDropdown={() => setDropdownOpenIndex(dropdownOpenIndex === index ? null : index)}
                        closeDropdown={() => setDropdownOpenIndex(null)}
                        onDuplicate={() => duplicateCanvas(index)}
                        onInsert={() => insertCanvas(index)}
                        onDelete={() => deleteCanvas(index)}
                        canDelete={canvases.length > 1}
                    />
                ))}
            </div>

            {/* Add Page Button Section */}
            <div className="p-3 pt-3 border-t border-[#D4CBBA] z-10 w-full mt-auto" style={{backgroundColor: 'var(--bg-main)'}}>
                <AddCanvasSection
                    onAddDefault={addCanvas}
                    onDuplicateActive={() => duplicateCanvas(activeCanvasIndex)}
                    onAddNewNextToActive={() => insertCanvas(canvases.length - 1)}
                    onCreateCustom={(width, height) => handleCreateCustomCanvas(width, height)}
                />
            </div>
        </div>
    );
};

export default LayersPanel;
