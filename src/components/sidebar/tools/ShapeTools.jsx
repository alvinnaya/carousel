import React, { useEffect, useState } from 'react';
import { changeColor, updateObjectProperty } from '../../Helper/FabricHelper';
import { useCanvasContext } from '../../../context/CanvasContext';
import TransformTools from './shared/TransformTools';
import OpacityTool from './shared/OpacityTool';
import CommonActionTools from './shared/CommonActionTools';
import ColorPaletteSelector from './shared/ColorPaletteSelector';

const ShapeTools = ({ activeObject }) => {
    const { canvas } = useCanvasContext();
    const [fillColor, setFillColor] = useState('#000000');

    useEffect(() => {
        if (!activeObject) return;
        setFillColor(activeObject.fill || '#000000');
    }, [activeObject]);

    const handleFillColor = (color) => {
        setFillColor(color);
        changeColor(activeObject, color, canvas);
    };

    return (
        <div className="space-y-6">
            <TransformTools activeObject={activeObject} />

            <section>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Shape Style</h3>
                <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium text-zinc-500">Fill Color</span>
                        <div
                            className="w-6 h-6 rounded-full border border-zinc-200 shadow-sm"
                            style={{ backgroundColor: fillColor }}
                        />
                    </div>
                    <ColorPaletteSelector color={fillColor} onChange={handleFillColor} />
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium text-zinc-500">Corner Radius</span>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            defaultValue={activeObject.rx}
                            onChange={(e) => {
                                updateObjectProperty(activeObject, 'rx', parseInt(e.target.value), canvas);
                                updateObjectProperty(activeObject, 'ry', parseInt(e.target.value), canvas);
                            }}
                            className="w-2/3 h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                        />
                    </div>
                </div>
            </section>

            <OpacityTool activeObject={activeObject} />

            <CommonActionTools activeObject={activeObject} objectTypeLabel="Shape" />
        </div>
    );
};

export default ShapeTools;
