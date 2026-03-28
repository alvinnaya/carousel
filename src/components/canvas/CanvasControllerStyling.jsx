import React, { useEffect, useRef } from 'react'
import * as fabric from 'fabric';
import { useCanvasContext } from '../../context/CanvasContext';

/**
 * Component that manages the styling of Fabric.js object controls (handles).
 */
export default function CanvasControllerStyling() {
    const { canvas, scale, scaleRef } = useCanvasContext();

    useEffect(() => {
        if (!canvas) return;
        console.log("canvasControllerStyle initial setup")
        const baseColor = 'white';
        const hoverColor = 'white';

        // Helpers use scaleRef.current for dynamic sizing during render
        const createControlSet = () => ({
            tl: makeHoverControl('tl', 'scale', -0.5, -0.5, baseColor, hoverColor, fabric.controlsUtils.scalingEqually, scaleRef),
            tr: makeHoverControl('tr', 'scale', 0.5, -0.5, baseColor, hoverColor, fabric.controlsUtils.scalingEqually, scaleRef),
            bl: makeHoverControl('bl', 'scale', -0.5, 0.5, baseColor, hoverColor, fabric.controlsUtils.scalingEqually, scaleRef),
            br: makeHoverControl('br', 'scale', 0.5, 0.5, baseColor, hoverColor, fabric.controlsUtils.scalingEqually, scaleRef),
            mtr: makeHoverControl('mtr', 'rotate', 0, -0.5, baseColor, hoverColor, fabric.controlsUtils.rotationWithSnapping, scaleRef),
            ml: makeHoverControlMiddle('ml', 'scaleX', -0.5, 0, baseColor, hoverColor, fabric.controlsUtils.scalingX, scaleRef),
            mr: makeHoverControlMiddle('mr', 'scaleX', 0.5, 0, baseColor, hoverColor, fabric.controlsUtils.scalingX, scaleRef),
            mt: makeHoverControlMiddle('mt', 'scaleY', 0, -0.5, baseColor, hoverColor, fabric.controlsUtils.scalingY, scaleRef),
            mb: makeHoverControlMiddle('mb', 'scaleY', 0, 0.5, baseColor, hoverColor, fabric.controlsUtils.scalingY, scaleRef),
        });

        const createTextControlSet = () => {
            const controls = createControlSet();
            controls.ml = makeHoverControlMiddleText('ml', 'scaleX', -0.5, 0, baseColor, hoverColor, fabric.controlsUtils.changeWidth, scaleRef);
            controls.mr = makeHoverControlMiddleText('mr', 'scaleX', 0.5, 0, baseColor, hoverColor, fabric.controlsUtils.changeWidth, scaleRef);
            controls.mtr.offsetY = -40 / scaleRef.current;
            return controls;
        };

        const applyInstanceStyle = (obj) => {
            if (!obj) return;

            const currentScale = scaleRef.current;
            // Direct property assignment for styling
            obj.borderScaleFactor = 3 / currentScale;
            obj.cornerSize = 12 / currentScale;
            obj.borderColor = 'hsl(0, 0%, 0%)';
            obj.cornerColor = 'white';
            obj.cornerStrokeColor = 'hsl(0, 0%, 0%)';
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
                obj.selectionColor = 'hsla(0, 0%, 0%, 0.1)';
                obj.cursorColor = 'hsl(0, 0%, 0%)';
                obj.cursorWidth = 2 / currentScale;
                obj.editingBorderColor = 'hsl(0, 0%, 0%)';
                obj.padding = 0
            } else if (obj.type === 'activeselection') {
                obj.setControlsVisibility({
                    mt: false, mb: false, ml: false, mr: false,
                    tl: true, tr: true, bl: true, br: true, mtr: true
                });
            } else {
                obj.controls = createControlSet();
                obj.controls.mtr.offsetY = -40 / currentScale;
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
            const currentScale = scaleRef.current;
            canvas.getObjects().forEach(obj => {
                if (obj.isHovered && obj !== canvas.getActiveObject()) {
                    ctx.save();
                    const bound = obj.getBoundingRect(true, true);
                    ctx.strokeStyle = 'hsl(0, 0%, 0%)';
                    ctx.lineWidth = 2 / currentScale;

                    // Use dashed line for groups/selections, solid for regular objects
                    if (obj.type === 'group' || obj.type === 'activeselection' || (obj._objects && obj._objects.length > 0)) {
                        ctx.setLineDash([5 / currentScale, 5 / currentScale]);
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


        // 1. Update all existing objects (Once)
        canvas.getObjects().forEach(applyInstanceStyle);

        // 2. Handle ActiveSelection (Multiselect Box)
        const activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === 'activeselection') {
            applyInstanceStyle(activeObject);
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

        // Final sync for debounced state changes (covers initial load, buttons, and interaction end)
        const syncAllProperties = (s) => {
            if (!canvas) return;
            // 1. All objects
            canvas.getObjects().forEach(obj => {
                obj.set({
                    borderScaleFactor: 3 / s,
                    cornerSize: 12 / s
                });
                if (obj.controls && obj.controls.mtr) {
                    obj.controls.mtr.offsetY = -40 / s;
                }
                if (obj.setCoords) obj.setCoords();
            });
            // 2. Active Object / Selection
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                activeObject.set({
                    borderScaleFactor: 3 / s,
                    cornerSize: 12 / s
                });
                if (activeObject.controls && activeObject.controls.mtr) {
                    activeObject.controls.mtr.offsetY = -40 / s;
                }
                if (activeObject.setCoords) activeObject.setCoords();
            }
            canvas.renderAll();
        };

        // Fast-path for zero-latency handle sizing during high-frequency interaction
        const handleFastScale = (e) => {
            syncAllProperties(e.detail);
        };

        // Immediate sync on effect run
        syncAllProperties(scale);

        window.addEventListener('canvas:scale:fast', handleFastScale);
        canvas.on('selection:created', hSelectionCreated);
        canvas.on('selection:updated', hSelectionUpdated);
        canvas.on('object:added', hObjectAdded);
        canvas.on('mouse:over', hMouseOver);
        canvas.on('mouse:out', hMouseOut);
        canvas.on('after:render', hAfterRender);

        return () => {
            window.removeEventListener('canvas:scale:fast', handleFastScale);
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
        borderColor: 'hsl(0, 0%, 0%)',
        cornerColor: 'white',
        cornerStrokeColor: 'hsl(0, 0%, 0%)',
        cornerSize: 12,
        cornerStyle: 'circle',
        transparentCorners: false,
        padding: 0,
        borderScaleFactor: 3,
        // Text editing defaults
        selectionColor: 'hsla(0, 0%, 0%, 0.1)',
        cursorColor: 'hsl(0, 0%, 0%)',
        editingBorderColor: 'hsl(0, 0%, 0%)',
    });
}

/**
 * HELPER FUNCTIONS (ORIGINAL NAMES)
 */
function makeHoverControl(cornerName, actionName, x, y, baseColor, hoverColor, handler, scaleRef) {
    return new fabric.Control({
        x, y,
        actionName,
        withConnection: cornerName === 'mtr',
        cursorStyle: cornerName === 'mtr' ? 'crosshair' : 'pointer',
        actionHandler: handler,
        sizeX: 14, // Internal fabric size, we handle scale in render
        sizeY: 14,
        render: function (ctx, left, top, styleOverride, fabricObject) {
            const scale = scaleRef.current;
            ctx.save();
            ctx.fillStyle = baseColor;
            ctx.beginPath();
            ctx.arc(left, top, 6 / scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 2 / scale;
            ctx.strokeStyle = 'hsl(0, 0%, 0%)';
            ctx.stroke();
            ctx.restore();
        }
    });
}


function makeHoverControlMiddle(cornerName, actionName, x, y, baseColor, hoverColor, handler, scaleRef) {
    const isVertical = cornerName === 'ml' || cornerName === 'mr';
    return new fabric.Control({
        x, y,
        actionName,
        cursorStyle: isVertical ? 'ew-resize' : 'ns-resize',
        actionHandler: handler,
        render: function (ctx, left, top, styleOverride, fabricObject) {
            const scale = scaleRef.current;
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
            // Update control size for correct interaction box
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
            ctx.strokeStyle = 'hsl(0, 0%, 0%)';
            ctx.stroke();
            ctx.restore();
        }
    });
}


function makeHoverControlMiddleText(cornerName, actionName, x, y, baseColor, hoverColor, handler, scaleRef) {
    const isVertical = cornerName === 'ml' || cornerName === 'mr';
    return new fabric.Control({
        x, y,
        actionName,
        cursorStyle: isVertical ? 'ew-resize' : 'ns-resize',
        actionHandler: handler,
        render: function (ctx, left, top, styleOverride, fabricObject) {
            const scale = scaleRef.current;
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
            ctx.strokeStyle = 'hsl(0, 0%, 0%)';
            ctx.stroke();
            ctx.restore();
        }
    });
}