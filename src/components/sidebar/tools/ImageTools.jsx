import React from 'react';
import TransformTools from './shared/TransformTools';
import OpacityTool from './shared/OpacityTool';
import CommonActionTools from './shared/CommonActionTools';
import StrokeTools from './shared/StrokeTools';
import CornerRadiusTool from './shared/CornerRadiusTool';

const ImageTools = ({ activeObject }) => {
    return (
        <div className="space-y-6">
            <TransformTools activeObject={activeObject} />

            <OpacityTool activeObject={activeObject} />

            <CornerRadiusTool activeObject={activeObject} />



            <CommonActionTools activeObject={activeObject} objectTypeLabel="Image" />
        </div>
    );
};

export default ImageTools;
