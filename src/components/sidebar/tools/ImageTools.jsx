import React from 'react';
import TransformTools from './shared/TransformTools';
import OpacityTool from './shared/OpacityTool';
import CornerRadiusTool from './shared/CornerRadiusTool';
import ImageFilterTool from './shared/ImageFilterTool/ImageFilterTool';
import ShadowTool from './shared/ShadowTool';

const ImageTools = ({ activeObject }) => {
    return (
        <div className="space-y-6">


            <OpacityTool activeObject={activeObject} />

            <CornerRadiusTool activeObject={activeObject} />

            <ShadowTool activeObject={activeObject} />

            <ImageFilterTool activeObject={activeObject} />



            <TransformTools activeObject={activeObject} />
        </div>
    );
};

export default ImageTools;
