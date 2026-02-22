import React from 'react';
import TransformTools from './shared/TransformTools';
import TextStylingTools from './shared/TextStylingTools';
import OpacityTool from './shared/OpacityTool';
import CommonActionTools from './shared/CommonActionTools';

const TextTools = ({ canvas, activeObject }) => {
    if (!activeObject) return null;

    return (
        <div className="space-y-6">
            <TransformTools canvas={canvas} activeObject={activeObject} />

            <TextStylingTools canvas={canvas} activeObject={activeObject} />

            <OpacityTool canvas={canvas} activeObject={activeObject} />

            <CommonActionTools canvas={canvas} activeObject={activeObject} objectTypeLabel="Text" />
        </div>
    );
};

export default TextTools;
