import React from 'react';
import { changeOpacity } from '../../../Helper/FabricHelper';
import { useCanvasContext } from '../../../../context/CanvasContext';

const OpacityTool = ({ activeObject }) => {
    const { canvas } = useCanvasContext();

    if (!activeObject) return null;

    const opacityVal = Math.round((activeObject.opacity || 0) * 100);

    return (
        <section className="mus-tool-section">
            <div className="flex items-center justify-between">
                <h3 className="mus-tool-label">Opacity</h3>
                <span className="mus-tool-badge">
                    {opacityVal}%
                </span>
            </div>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={activeObject.opacity ?? 1}
                onChange={(e) => changeOpacity(activeObject, parseFloat(e.target.value), canvas)}
                className="mus-tool-range"
            />
        </section>
    );
};

export default OpacityTool;
