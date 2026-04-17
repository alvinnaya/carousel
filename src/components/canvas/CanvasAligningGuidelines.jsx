import { useEffect } from 'react';
import { useCanvasContext } from '../../context/CanvasContext';
import { AligningGuidelines } from '../../../lib/aligning-guidelines';

const CanvasAligningGuidelines = () => {
    const { canvas } = useCanvasContext();

    useEffect(() => {
        if (!canvas) return;

        console.log('Initializing AligningGuidelines');
        const aligningGuidelines = new AligningGuidelines(canvas, {
            color: 'rgba(255, 0, 0, 0.9)', // Custom color as per user example
            margin: 4,
        });

        return () => {
            console.log('Disposing AligningGuidelines');
            aligningGuidelines.dispose();
        };
    }, [canvas]);

    return null;
};

export default CanvasAligningGuidelines;
