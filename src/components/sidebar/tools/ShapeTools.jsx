import React, { useEffect, useState } from 'react';
import { changeColor } from '../../Helper/FabricHelper';
import { useCanvasContext } from '../../../context/CanvasContext';
import TransformTools from './shared/TransformTools';
import OpacityTool from './shared/OpacityTool';
import CommonActionTools from './shared/CommonActionTools';
import ColorPaletteSelector from './shared/ColorPaletteSelector';
import StrokeTools from './shared/StrokeTools';
import CornerRadiusTool from './shared/CornerRadiusTool';
import ShadowTool from './shared/ShadowTool';

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


                </div>
            </section>

            <CornerRadiusTool activeObject={activeObject} />

            <ShadowTool activeObject={activeObject} />

            <StrokeTools activeObject={activeObject} />

            <OpacityTool activeObject={activeObject} />

            <CommonActionTools activeObject={activeObject} objectTypeLabel="Shape" />
        </div>
    );
};

export default ShapeTools;
