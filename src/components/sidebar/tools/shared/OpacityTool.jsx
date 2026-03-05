import React from 'react';
import { changeOpacity } from '../../../Helper/FabricHelper';
import { useCanvasContext } from '../../../../context/CanvasContext';
import DelayedInput from './DelayedInput';

const OpacityTool = ({ activeObject }) => {
    const { canvas } = useCanvasContext();

    if (!activeObject) return null;

    const opacityVal = Math.round((activeObject.opacity || 0) * 100);

    const handleInputOpacity = (val) => {
        let num = parseInt(val);
        if (isNaN(num)) num = 0;
        num = Math.max(0, Math.min(100, num));
        changeOpacity(activeObject, num / 100, canvas);
    };

    return (
        <section className="mus-tool-section">
            <h3 className="mus-tool-label">Opacity</h3>
            <div className="flex items-center gap-3">
                <div className="mus-tool-badge w-12 h-7 flex items-center justify-center gap-0.5 flex-shrink-0 px-2">
                    <DelayedInput
                        value={opacityVal}
                        isNumeric={true}
                        min="0"
                        max="100"
                        onChange={handleInputOpacity}
                        className="mus-tool-input-pure !text-[10px] !text-right w-full"
                    />
                    <span className="text-[9px] font-extrabold text-[#7A7062] select-none">%</span>
                </div>
                <div className="flex-1 flex items-center">
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={activeObject.opacity ?? 1}
                        onChange={(e) => changeOpacity(activeObject, parseFloat(e.target.value), canvas)}
                        className="mus-tool-range w-full"
                    />
                </div>
            </div>
        </section>
    );
};

export default OpacityTool;
