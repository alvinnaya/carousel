import React from 'react';
import TransformTools from './shared/TransformTools';
import TextStylingTools from './shared/TextStylingTools';
import OpacityTool from './shared/OpacityTool';
import CommonActionTools from './shared/CommonActionTools';

const TextTools = ({ activeObject }) => {
    if (!activeObject) return null;

    return (
        <div className="space-y-6">
            <TransformTools activeObject={activeObject} />

            <TextStylingTools activeObject={activeObject} />

            <OpacityTool activeObject={activeObject} />

            <CommonActionTools activeObject={activeObject} objectTypeLabel="Text" />
        </div>
    );
};

export default TextTools;
