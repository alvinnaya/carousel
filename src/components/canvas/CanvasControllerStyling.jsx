import React, { useEffect } from 'react'
import * as fabric from 'fabric';
import { useCanvasContext } from '../../context/CanvasContext';

/**
 * Component that manages the styling of Fabric.js object controls (handles).
 */
export default function CanvasControllerStyling() {
    const { canvas, scale } = useCanvasContext();

    console.log("canvasControllerStyle")

    useEffect(() => {
        if (!canvas) return;
        console.log("canvasControllerStyle inside useEffect")
        const baseColor = 'white';
        const hoverColor = 'white';

        // Helpers inside useEffect to closure over 'scale'
        const createControlSet = () => ({
            tl: makeHoverControl('tl', -0.5, -0.5, baseColor, hoverColor, fabric.controlsUtils.scalingEqually, scale),
            tr: makeHoverControl('tr', 0.5, -0.5, baseColor, hoverColor, fabric.controlsUtils.scalingEqually, scale),
            bl: makeHoverControl('bl', -0.5, 0.5, baseColor, hoverColor, fabric.controlsUtils.scalingEqually, scale),
            br: makeHoverControl('br', 0.5, 0.5, baseColor, hoverColor, fabric.controlsUtils.scalingEqually, scale),
            mtr: makeHoverControl('mtr', 0, -0.5, baseColor, hoverColor, fabric.controlsUtils.rotationWithSnapping, scale),
            ml: makeHoverControlMiddle('ml', -0.5, 0, baseColor, hoverColor, fabric.controlsUtils.scalingX, scale),
            mr: makeHoverControlMiddle('mr', 0.5, 0, baseColor, hoverColor, fabric.controlsUtils.scalingX, scale),
            mt: makeHoverControlMiddle('mt', 0, -0.5, baseColor, hoverColor, fabric.controlsUtils.scalingY, scale),
            mb: makeHoverControlMiddle('mb', 0, 0.5, baseColor, hoverColor, fabric.controlsUtils.scalingY, scale),
        });

        const createTextControlSet = () => {
            const controls = createControlSet();
            controls.ml = makeHoverControlMiddleText('ml', -0.5, 0, baseColor, hoverColor, fabric.controlsUtils.changeWidth, scale);
            controls.mr = makeHoverControlMiddleText('mr', 0.5, 0, baseColor, hoverColor, fabric.controlsUtils.changeWidth, scale);
            controls.mtr.offsetY = -40 / scale;
            return controls;
        };

        const applyInstanceStyle = (obj) => {
            if (!obj) return;

            // Direct property assignment for styling
            obj.borderScaleFactor = 3 / scale;
            obj.cornerSize = 12 / scale;
            obj.borderColor = 'hsl(19, 87%, 65%)';
            obj.cornerColor = 'white';
            obj.cornerStrokeColor = 'hsl(19, 87%, 65%)';
            obj.transparentCorners = false;
            obj.cornerStyle = 'circle';

            // Custom Controls assignment
            if (obj.type === 'textbox' || obj.type === 'itext') {
                obj.controls = createTextControlSet();
                obj.setControlsVisibility({
                    mt: false, mb: false, ml: true, mr: true,
                    tl: true, tr: true, bl: true, br: true, mtr: true
                });

                // Styling for text editing mode (Fabric 7++)
                obj.selectionColor = 'rgba(235, 126, 75, 0.3)';
                obj.cursorColor = 'hsl(19, 87%, 65%)';
                obj.cursorWidth = 2 / scale;
                obj.editingBorderColor = 'hsl(19, 87%, 65%)';
                obj.padding = 0
            } else if (obj.type === 'activeselection') {
                obj.setControlsVisibility({
                    mt: false, mb: false, ml: false, mr: false,
                    tl: true, tr: true, bl: true, br: true, mtr: true
                });
            } else {
                obj.controls = createControlSet();
                obj.controls.mtr.offsetY = -40 / scale;
            }

            // Recursive styling for group members
            if (obj.getObjects) {
                obj.getObjects().forEach(applyInstanceStyle);
            }

            if (obj.setCoords) obj.setCoords();
        };

        const hObjectAdded = (e) => {
            applyInstanceStyle(e.target);
        };

        const hMouseOver = (e) => {
            const target = e.target;
            if (target && target !== canvas.getActiveObject()) {
                target.set('isHovered', true);
                canvas.requestRenderAll();
            }
        };

        const hMouseOut = (e) => {
            const target = e.target;
            if (target) {
                target.set('isHovered', false);
                canvas.requestRenderAll();
            }
        };

        const hAfterRender = (opt) => {
            const ctx = opt.ctx;
            canvas.getObjects().forEach(obj => {
                if (obj.isHovered && obj !== canvas.getActiveObject()) {
                    ctx.save();
                    const bound = obj.getBoundingRect(true, true);
                    ctx.strokeStyle = 'hsl(19, 87%, 65%)';
                    ctx.lineWidth = 2 / scale;
                    
                    // Use dashed line for groups/selections, solid for regular objects
                    if (obj.type === 'group' || obj.type === 'activeselection' || (obj._objects && obj._objects.length > 0)) {
                        ctx.setLineDash([5 / scale, 5 / scale]);
                    } else {
                        ctx.setLineDash([]);
                    }
                    ctx.lineDashOffset = 0;
                    
                    ctx.strokeRect(
                        bound.left,
                        bound.top,
                        bound.width,
                        bound.height
                    );
                    ctx.restore();
                }
            });
        };


        // 1. Update all existing objects
        canvas.getObjects().forEach(applyInstanceStyle);

        // 2. Handle ActiveSelection (Multiselect Box)
        const activeObject = canvas.getActiveObject();
        console.log("active", activeObject);
        if (activeObject && activeObject.type === 'activeselection') {
            applyInstanceStyle(activeObject);
            console.log("active", activeObject);

        }

        canvas.requestRenderAll();

        // Listeners for selection to apply style
        const hSelectionCreated = (e) => {
            const targets = e.selected || [e.target];
            targets.forEach(obj => {
                applyInstanceStyle(obj);
                // Also ensure the parent group is styled if we're sub-selecting
                if (obj.group) applyInstanceStyle(obj.group);
                // Clear hover state on selection
                obj.set('isHovered', false);
            });
        };
        const hSelectionUpdated = hSelectionCreated;

        canvas.on('selection:created', hSelectionCreated);
        canvas.on('selection:updated', hSelectionUpdated);
        canvas.on('object:added', hObjectAdded);
        canvas.on('mouse:over', hMouseOver);
        canvas.on('mouse:out', hMouseOut);
        canvas.on('after:render', hAfterRender);

        return () => {
            canvas.off('selection:created', hSelectionCreated);
            canvas.off('selection:updated', hSelectionUpdated);
            canvas.off('object:added', hObjectAdded);
            canvas.off('mouse:over', hMouseOver);
            canvas.off('mouse:out', hMouseOut);
            canvas.off('after:render', hAfterRender);
        };
    }, [canvas, scale]);

    return null;
}

/**
 * Sets the initial default styling for Fabric.js objects on prototypes.
 */
export function CanvasDefaultControllerStyling(fabricInstance) {
    if (!fabricInstance.FabricObject) return;

    // Set Base Prototype Defaults
    Object.assign(fabricInstance.FabricObject.ownDefaults, {
        borderColor: 'hsl(19, 87%, 65%)',
        cornerColor: 'white',
        cornerStrokeColor: 'hsl(19, 87%, 65%)',
        cornerSize: 12,
        cornerStyle: 'circle',
        transparentCorners: false,
        padding: 0,
        borderScaleFactor: 3,
        // Text editing defaults
        selectionColor: 'rgba(235, 126, 75, 0.3)',
        cursorColor: 'hsl(19, 87%, 65%)',
        editingBorderColor: 'hsl(19, 87%, 65%)',
    });
}

/**
 * HELPER FUNCTIONS (ORIGINAL NAMES)
 */
function makeHoverControl(cornerName, x, y, baseColor, hoverColor, handler, scale) {
    return new fabric.Control({
        x, y,
        cursorStyle: 'pointer',
        actionHandler: handler,
        sizeX: 14 / scale,
        sizeY: 14 / scale,
        render: function (ctx, left, top, styleOverride, fabricObject) {
            ctx.save();
            ctx.fillStyle = baseColor;
            ctx.beginPath();
            ctx.arc(left, top, 6 / scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 2 / scale;
            ctx.strokeStyle = 'hsl(19, 87%, 65%)';
            ctx.stroke();
            ctx.restore();
        }
    });
}

function makeHoverControlMiddle(cornerName, x, y, baseColor, hoverColor, handler, scale) {
    const isVertical = cornerName === 'ml' || cornerName === 'mr';
    return new fabric.Control({
        x, y,
        cursorStyle: isVertical ? 'ew-resize' : 'ns-resize',
        actionHandler: handler,
        sizeX: 12 / scale,
        sizeY: 12 / scale,
        render: function (ctx, left, top, styleOverride, fabricObject) {
            const angle = fabricObject.angle + (fabricObject.group ? fabricObject.group.angle : 0);
            let barW, barH;
            if (isVertical) {
                barW = 8 / scale;
                const canvasHeight = fabricObject.height * fabricObject.scaleY;
                barH = Math.min(80 / scale, canvasHeight * 0.5);
            } else {
                const canvasWidth = fabricObject.width * fabricObject.scaleX;
                barW = Math.min(80 / scale, canvasWidth * 0.5);
                barH = 8 / scale;
            }
            this.sizeX = isVertical ? 16 / scale : barW;
            this.sizeY = isVertical ? barH : 16 / scale;
            ctx.save();
            ctx.translate(left, top);
            ctx.rotate(fabric.util.degreesToRadians(angle));
            ctx.fillStyle = baseColor;
            ctx.beginPath();
            const rx = 12 / scale;
            if (ctx.roundRect) ctx.roundRect(-barW / 2, -barH / 2, barW, barH, [rx]);
            else ctx.rect(-barW / 2, -barH / 2, barW, barH);
            ctx.fill();
            ctx.lineWidth = 2 / scale;
            ctx.strokeStyle = 'hsl(19, 87%, 65%)';
            ctx.stroke();
            ctx.restore();
        }
    });
}

function makeHoverControlMiddleText(cornerName, x, y, baseColor, hoverColor, handler, scale) {
    const isVertical = cornerName === 'ml' || cornerName === 'mr';
    return new fabric.Control({
        x, y,
        cursorStyle: isVertical ? 'ew-resize' : 'ns-resize',
        actionHandler: handler,
        sizeX: 12 / scale,
        sizeY: 12 / scale,
        render: function (ctx, left, top, styleOverride, fabricObject) {
            const angle = fabricObject.angle + (fabricObject.group ? fabricObject.group.angle : 0);
            let barW, barH;
            if (isVertical) {
                barW = 8 / scale;
                const canvasHeight = fabricObject.height * fabricObject.scaleY;
                barH = Math.min(60 / scale, canvasHeight * 0.5);
            } else {
                const canvasWidth = fabricObject.width * fabricObject.scaleX;
                barW = Math.min(canvasWidth * 0.3, canvasWidth * 0.5);
                barH = 8 / scale;
            }
            this.sizeX = isVertical ? 16 / scale : barW;
            this.sizeY = isVertical ? barH : 16 / scale;
            ctx.save();
            ctx.translate(left, top);
            ctx.rotate(fabric.util.degreesToRadians(angle));
            ctx.fillStyle = baseColor;
            ctx.beginPath();
            const rx = 12 / scale;
            if (ctx.roundRect) ctx.roundRect(-barW / 2, -barH / 2, barW, barH, [rx]);
            else ctx.rect(-barW / 2, -barH / 2, barW, barH);
            ctx.fill();
            ctx.lineWidth = 3 / scale;
            ctx.strokeStyle = 'hsl(19, 87%, 65%)';
            ctx.stroke();
            ctx.restore();
        }
    });
}