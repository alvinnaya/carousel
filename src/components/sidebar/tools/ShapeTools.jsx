import React, { useEffect, useState } from 'react';
import { changeColor, applyGradient } from '../../Helper/FabricHelper';
import { useCanvasContext } from '../../../context/CanvasContext';
import TransformTools from './shared/TransformTools';
import OpacityTool from './shared/OpacityTool';
import CommonActionTools from './shared/CommonActionTools';
import ColorPaletteSelector from './shared/ColorPaletteSelector';
import GradientPaletteSelector from './shared/GradientPaletteSelector';
import StrokeTools from './shared/StrokeTools';
import CornerRadiusTool from './shared/CornerRadiusTool';
import ShadowTool from './shared/ShadowTool';
import CollapsibleToolSection from './shared/CollapsibleToolSection';

const ShapeTools = ({ activeObject }) => {
    const { canvas } = useCanvasContext();
    const [fillColor, setFillColor] = useState('#000000');
    const [fillGradient, setFillGradient] = useState(null);

    useEffect(() => {
        if (!activeObject) return;
        // Check if fill is string (color) or object (gradient)
        if (typeof activeObject.fill === 'string') {
            setFillColor(activeObject.fill || '#000000');
            setFillGradient(null);
        } else if (activeObject.fill && activeObject.fill.type) {
            // It's a fabric gradient
            // Ideally we read activeObject.gradientState
            setFillGradient(activeObject.gradientState || null);
            setFillColor('transparent');
        }
    }, [activeObject]);

    const handleFillColor = (color) => {
        setFillColor(color);
        setFillGradient(null);
        changeColor(activeObject, color, canvas);
    };

    const handleFillGradient = (gradientState) => {
        setFillGradient(gradientState);
        setFillColor('transparent');
        applyGradient(activeObject, 'fill', gradientState, canvas);
    };

    return (
        <div className="space-y-6">


            <CollapsibleToolSection
                title="Shape Style"
                actionButton={
                    <div
                        className="mus-color-swatch w-6 h-6 border"
                        style={{ backgroundColor: fillColor === 'transparent' ? '#fff' : fillColor }}
                    />
                }
            >
                <div className="space-y-6 pt-2">

                    {/* Fill Color */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="mus-tool-label !p-0 !text-primary">Fill Color</span>
                        </div>
                        <ColorPaletteSelector color={fillColor} onChange={handleFillColor} />
                    </div>

                    <div className="border-t mus-border-light" />

                    {/* Fill Gradient */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="mus-tool-label !p-0 !text-primary">Fill Gradient</span>
                            {fillGradient && (
                                <span className="text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-500 font-bold border border-zinc-200">
                                    Active
                                </span>
                            )}
                        </div>
                        <GradientPaletteSelector
                            activeGradient={fillGradient}
                            onChange={handleFillGradient}
                        />
                    </div>

                </div>
            </CollapsibleToolSection>

            <CornerRadiusTool activeObject={activeObject} />

            <ShadowTool activeObject={activeObject} />

            <StrokeTools activeObject={activeObject} />

            <OpacityTool activeObject={activeObject} />

            <CommonActionTools activeObject={activeObject} objectTypeLabel="Shape" />

            <TransformTools activeObject={activeObject} />

        </div>
    );
};

export default ShapeTools;
