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

    useEffect(() => {
        if (!canvas) {
            setSelectedObject(null);
            return;
        }

        // Handler to update the local state when selection changes
        const handleSelection = () => {
            setSelectedObject(canvas.getActiveObject());
        };

        // Listen to Fabric.js selection events
        canvas.on('selection:created', handleSelection);
        canvas.on('selection:updated', handleSelection);
        canvas.on('selection:cleared', handleSelection);

        // Finalize initial state
        setSelectedObject(canvas.getActiveObject());

        return () => {
            // Cleanup listeners
            canvas.off('selection:created', handleSelection);
            canvas.off('selection:updated', handleSelection);
            canvas.off('selection:cleared', handleSelection);
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
