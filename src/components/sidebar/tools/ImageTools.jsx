import React from 'react';
import TransformTools from './shared/TransformTools';
import OpacityTool from './shared/OpacityTool';
import CommonActionTools from './shared/CommonActionTools';
import StrokeTools from './shared/StrokeTools';
import CornerRadiusTool from './shared/CornerRadiusTool';
import ImageFilterTool from './shared/ImageFilterTool';
import ShadowTool from './shared/ShadowTool';

const ImageTools = ({ activeObject }) => {
    return (
        <div className="space-y-6">
            <TransformTools activeObject={activeObject} />

            <OpacityTool activeObject={activeObject} />

            <CornerRadiusTool activeObject={activeObject} />

            <ShadowTool activeObject={activeObject} />

            <ImageFilterTool activeObject={activeObject} />

            <CommonActionTools activeObject={activeObject} objectTypeLabel="Image" />
        </div>
    );
};

export default ImageTools;
