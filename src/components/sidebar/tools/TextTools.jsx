import TransformTools from './shared/TransformTools';
import TextStylingTools from './shared/TextStylingTools';
import OpacityTool from './shared/OpacityTool';
import ColorPaletteSelector from './shared/ColorPaletteSelector';
import HighlightColorTool from './shared/HighlightColorTool';
import { changeSelectedTextProperty, getTextSelection } from '../../Helper/FabricHelper';
import { useCanvasContext } from '../../../context/CanvasContext';
import { useState, useEffect } from 'react';
import StrokeTools from './shared/StrokeTools';
import ShadowTool from './shared/ShadowTool';
import CollapsibleToolSection from './shared/CollapsibleToolSection';

const TextTools = ({ activeObject }) => {

    const { canvas, canvases } = useCanvasContext();

    const getDisplayProp = (prop, fallback) => {
        if (!activeObject) return fallback;
        const selection = getTextSelection(activeObject);
        if (selection.hasSelection) {
            const styles = activeObject.getSelectionStyles(selection.start, selection.start + 1);
            if (styles && styles.length > 0 && styles[0][prop] !== undefined) {
                return styles[0][prop];
            }
        }
        return activeObject[prop] ?? fallback;
    };


    if (!activeObject) return null;

    const [fill, setFill] = useState('#000000');

    useEffect(() => {
        if (!activeObject) return;

        const fill = getDisplayProp('fill', '#000000');

        setFill(fill);
    }, [canvas, activeObject, canvases])

    const applyFill = (color) => {
        if (!activeObject) return;

        changeSelectedTextProperty(activeObject, 'fill', color, canvas);
    };

    return (
        <div className="space-y-6">


            <TextStylingTools activeObject={activeObject} />

            <CollapsibleToolSection
                title="Fill Color"
                actionButton={
                    <div
                        className="mus-color-swatch w-6 h-6"
                        style={{ backgroundColor: fill }}
                    />
                }
            >
                <ColorPaletteSelector
                    color={fill}
                    onChange={applyFill}
                />
            </CollapsibleToolSection>

            <HighlightColorTool activeObject={activeObject} />

            <ShadowTool activeObject={activeObject} />

            <StrokeTools activeObject={activeObject} />

            <OpacityTool activeObject={activeObject} />

            <TransformTools activeObject={activeObject} />


        </div>
    );
};

export default TextTools;
