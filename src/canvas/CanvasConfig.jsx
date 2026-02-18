import React, { useEffect } from 'react'
import { useCanvasContext } from '../context/CanvasContext';
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


    useEffect(() => {
        fabric.Textbox.prototype._calcTextareaPosition = function () {
            const canvas = this.canvas;
            if (!canvas || !canvas.upperCanvasEl) return { left: '0px', top: '0px' };

            const boundingRect = this.getBoundingRect();
            const canvasRect = canvas.upperCanvasEl.getBoundingClientRect();

            // scale diambil dari context React melalui closure effect ini
            const scaleFactor = scale;

            const left = canvasRect.left + boundingRect.left * scaleFactor;
            const top = canvasRect.top + boundingRect.top * scaleFactor;
            const fontSize = (this.fontSize ?? 16) * scaleFactor;

            return {
                left: `${left}px`,
                top: `${top}px`,
                fontSize: `${fontSize}px`,
                charHeight: fontSize * (this.lineHeight ?? 1.2),
            };
        };
    }, [scale]);

    return null;
}