import React, { useEffect } from 'react'
import { useCanvasContext } from '../../context/CanvasContext';
import * as fabric from 'fabric';

export default function CanvasConfig() {
    const { scale, canvas } = useCanvasContext();

    console.log("canvasconfig");

    if (fabric.FabricImage) {
        fabric.FabricImage.customProperties = [
            'url',
            'originWidth',
            'originHeight',
            'cropX',
            'cropY',
            'opacity',
            'cropLeft',
            'cropRight',
            'cropTop',
            'cropBottom',
        ];
    }

    fabric.FabricObject.prototype.originX = 'center';
    fabric.FabricObject.prototype.originY = 'center';
    fabric.Textbox.prototype.splitByGrapheme = true;

    return null;
}