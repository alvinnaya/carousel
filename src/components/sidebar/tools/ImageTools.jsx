import React from 'react';
import TransformTools from './shared/TransformTools';
import OpacityTool from './shared/OpacityTool';
import ArrangementTools from './shared/ArrangementTools';
import CommonActionTools from './shared/CommonActionTools';

const ImageTools = ({ activeObject }) => {
    return (
        <div className="space-y-6">
            <TransformTools activeObject={activeObject} />

            <OpacityTool activeObject={activeObject} />

            <ArrangementTools activeObject={activeObject} />

            <CommonActionTools activeObject={activeObject} objectTypeLabel="Image" />
        </div>
    );
};

export default ImageTools;
