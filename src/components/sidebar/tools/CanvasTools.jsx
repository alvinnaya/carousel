import React, { useEffect, useState } from 'react';
import { useCanvasContext } from '../../../context/CanvasContext';
import ColorPaletteSelector from './shared/ColorPaletteSelector';

const CanvasTools = () => {
    const { canvas } = useCanvasContext();
    const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');

    useEffect(() => {
        if (!canvas) return;
        setBackgroundColor(canvas.backgroundColor || '#FFFFFF');
    }, [canvas]);

    const handleBackgroundColor = (color) => {
        if (!canvas) return;
        setBackgroundColor(color);
        canvas.set('backgroundColor', color);
        canvas.requestRenderAll();
    };

    return (
        <div className="space-y-6">
            <section className="mus-tool-section">
                <h3 className="mus-tool-label">Canvas Settings</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="mus-tool-label !text-primary">Background</span>
                            <span className="text-[9px] mus-text-muted font-bold">Select shade</span>
                        </div>
                        <div
                            className="mus-color-swatch w-6 h-6"
                            style={{ backgroundColor }}
                        />
                    </div>
                    <ColorPaletteSelector
                        color={backgroundColor}
                        onChange={handleBackgroundColor}
                    />
                </div>
            </section>
        </div>
    );
};

export default CanvasTools;
