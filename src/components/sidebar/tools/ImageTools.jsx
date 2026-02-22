import React from 'react';
import TransformTools from './shared/TransformTools';
import OpacityTool from './shared/OpacityTool';
import ArrangementTools from './shared/ArrangementTools';
import CommonActionTools from './shared/CommonActionTools';

const ImageTools = ({ canvas, activeObject }) => {
    return (
        <div className="space-y-6">
            <TransformTools canvas={canvas} activeObject={activeObject} />

            <OpacityTool canvas={canvas} activeObject={activeObject} />

            <ArrangementTools canvas={canvas} activeObject={activeObject} />

            <CommonActionTools canvas={canvas} activeObject={activeObject} objectTypeLabel="Image" />
        </div>
    );
};

export default ImageTools;
