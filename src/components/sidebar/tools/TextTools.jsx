import TransformTools from './shared/TransformTools';
import TextStylingTools from './shared/TextStylingTools';
import OpacityTool from './shared/OpacityTool';
import CommonActionTools from './shared/CommonActionTools';
import ColorPaletteSelector from './shared/ColorPaletteSelector';
import { changeSelectedTextProperty, getTextSelection } from '../../Helper/FabricHelper';
import { useCanvasContext } from '../../../context/CanvasContext';
import { useState, useEffect } from 'react';

const TextTools = ({ activeObject }) => {

    const { canvas, canvases } = useCanvasContext();

    const selection = activeObject ? getTextSelection(activeObject) : { hasSelection: false };
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
            <TransformTools activeObject={activeObject} />

            <TextStylingTools activeObject={activeObject} />

            <OpacityTool activeObject={activeObject} />

            <CommonActionTools activeObject={activeObject} objectTypeLabel="Text" />

            <div className="mus-tool-divider space-y-4">
                <div className="flex items-center justify-between">
                    <span className="mus-tool-label">Solid Fill</span>
                    <div
                        className="w-5 h-5 rounded-full border border-zinc-200 shadow-sm"
                        style={{ backgroundColor: fill }}
                    />
                </div>
                <ColorPaletteSelector
                    color={fill}
                    onChange={applyFill}
                />
            </div>
        </div>
    );
};

export default TextTools;
