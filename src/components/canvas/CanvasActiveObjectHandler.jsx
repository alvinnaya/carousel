import { useEffect } from 'react';
import { useCanvasContext } from '../../context/CanvasContext';

/**
 * CanvasActiveObjectHandler - Manages global state when objects are selected or active on the canvas.
 */
const CanvasActiveObjectHandler = () => {
    const { canvas, setActiveTool } = useCanvasContext();

    useEffect(() => {
        if (!canvas) return;

        const handleSelection = () => {
            // When an element is selected, switch the active tool to 'Tools'
            setActiveTool('Tools');
            console.log('selection:created', canvas.getActiveObject());
        };

        // Listen to Fabric.js selection events
        canvas.on('selection:created', handleSelection);
        canvas.on('selection:updated', handleSelection);

        return () => {
            // Cleanup listeners
            canvas.off('selection:created', handleSelection);
            canvas.off('selection:updated', handleSelection);
        };
    }, [canvas]);

    return null; // This component doesn't render anything
};

export default CanvasActiveObjectHandler;
