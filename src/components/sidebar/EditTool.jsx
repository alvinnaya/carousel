import React, { useState, useEffect } from 'react';
import { useCanvasContext } from '../../context/CanvasContext';
import CanvasTools from './tools/CanvasTools';
import ImageTools from './tools/ImageTools';
import TextTools from './tools/TextTools';
import ShapeTools from './tools/ShapeTools';

/**
 * EditTool - Dynamically renders the appropriate toolset based on the active object on the canvas.
 */
const EditTool = () => {
    const { canvas } = useCanvasContext();
    const [selectedObject, setSelectedObject] = useState(null);
    const [, setUpdateTick] = useState(0);

    useEffect(() => {
        if (!canvas) {
            setSelectedObject(null);
            return;
        }

        const forceUpdate = () => setUpdateTick(tick => tick + 1);

        // Handler to update the local state when selection changes
        const handleSelection = () => {
            setSelectedObject(canvas.getActiveObject());
            forceUpdate();
        };

        // Listen to Fabric.js selection events
        canvas.on('selection:created', handleSelection);
        canvas.on('selection:updated', handleSelection);
        canvas.on('selection:cleared', handleSelection);

        // Listen to modification events to sync properties (position, rotation, etc.)
        canvas.on('object:moving', forceUpdate);
        canvas.on('object:scaling', forceUpdate);
        canvas.on('object:rotating', forceUpdate);
        canvas.on('object:modified', forceUpdate);

        // Finalize initial state
        setSelectedObject(canvas.getActiveObject());

        return () => {
            // Cleanup listeners
            canvas.off('selection:created', handleSelection);
            canvas.off('selection:updated', handleSelection);
            canvas.off('selection:cleared', handleSelection);
            canvas.off('object:moving', forceUpdate);
            canvas.off('object:scaling', forceUpdate);
            canvas.off('object:rotating', forceUpdate);
            canvas.off('object:modified', forceUpdate);
        };
    }, [canvas]);

    // If canvas isn't initialized yet
    if (!canvas) {
        return (
            <div className="h-full flex items-center justify-center opacity-30">
                <p className="text-[10px] font-bold uppercase tracking-widest">Initializing...</p>
            </div>
        );
    }

    // Case: No object selected - Show Canvas Settings
    if (!selectedObject) {
        return <CanvasTools canvas={canvas} />;
    }

    // Case: Object selected - Determine which toolset to show
    const type = selectedObject.type;

    if (type === 'image') {
        return <ImageTools canvas={canvas} activeObject={selectedObject} />;
    }

    if (['textbox', 'text', 'i-text'].includes(type)) {
        return <TextTools canvas={canvas} activeObject={selectedObject} />;
    }

    // Default: Basic shapes (rect, circle, etc.)
    return <ShapeTools canvas={canvas} activeObject={selectedObject} />;
};

export default EditTool;
