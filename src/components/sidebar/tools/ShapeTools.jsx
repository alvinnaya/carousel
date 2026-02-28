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

            <section className="mus-tool-section">
                <h3 className="mus-tool-label">Shape Style</h3>
                <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                        <span className="mus-tool-label !text-primary">Fill Color</span>
                        <div
                            className="mus-color-swatch w-6 h-6"
                            style={{ backgroundColor: fillColor }}
                        />
                    </div>
                    <ColorPaletteSelector color={fillColor} onChange={handleFillColor} />
                    <div className="flex items-center justify-between">
                        <span className="mus-tool-label !text-primary">Corner Radius</span>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            defaultValue={activeObject.rx}
                            onChange={(e) => {
                                updateObjectProperty(activeObject, 'rx', parseInt(e.target.value), canvas);
                                updateObjectProperty(activeObject, 'ry', parseInt(e.target.value), canvas);
                            }}
                            className="w-2/3 mus-tool-range"
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
