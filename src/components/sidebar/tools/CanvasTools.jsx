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
            <section className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm space-y-4">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Canvas Settings</h3>
                <div className="space-y-4 p-3 rounded-lg bg-zinc-50 border border-zinc-100/50">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-700">Background Color</span>
                            <span className="text-[9px] text-zinc-400 font-medium">Click to change</span>
                        </div>
                        <div
                            className="w-6 h-6 rounded-full border border-zinc-200 shadow-sm"
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
