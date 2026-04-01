import React from 'react'
import * as fabric from 'fabric';
import { useCanvasContext } from '../../context/CanvasContext';

/**
 * Centralized configuration for the canvas object controls (anchors) and selection boxes.
 * Modify these to globally change all object selection and control appearances.
 */
const CONTROL_CONFIG = {
    borderColor: '#000000',
    cornerColor: '#FFFFFF',
    cornerStrokeColor: '#000000',
    cornerSize: 10,
    borderScaleFactor: 1.5,
    padding: 4,
    // Mid handles (pills)
    midWidth: 6,
    midHeight: 24,
    midRadius: 4,
    // Stroke and visual
    strokeWidth: 1.5,
    rotationOffset: -30,
    // Text specific cursor and selection settings
    selectionColor: 'hsla(0, 0%, 0%, 0.1)',
    cursorColor: '#000000',
    cursorWidth: 2,
    editingBorderColor: '#000000'
};

/**
 * Component that manages the styling of Fabric.js object controls (handles).
 */
export default function CanvasControllerStyling() {
    const { canvas, scale, scaleRef } = useCanvasContext();

    React.useEffect(() => {
        if (!canvas) return;
        console.log("canvasControllerStyle initial setup")
        const baseColor = 'white';
        const hoverColor = 'white';

        // Helpers use scaleRef.current for dynamic sizing during render
        const createControlSet = () => ({
            tl: makeHoverControl('tl', 'scale', -0.5, -0.5, fabric.controlsUtils.scalingEqually, scaleRef),
            tr: makeHoverControl('tr', 'scale', 0.5, -0.5, fabric.controlsUtils.scalingEqually, scaleRef),
            bl: makeHoverControl('bl', 'scale', -0.5, 0.5, fabric.controlsUtils.scalingEqually, scaleRef),
            br: makeHoverControl('br', 'scale', 0.5, 0.5, fabric.controlsUtils.scalingEqually, scaleRef),
            mtr: makeHoverControl('mtr', 'rotate', 0, -0.5, fabric.controlsUtils.rotationWithSnapping, scaleRef),
            ml: makeHoverControlMiddle('ml', 'scaleX', -0.5, 0, fabric.controlsUtils.scalingX, scaleRef),
            mr: makeHoverControlMiddle('mr', 'scaleX', 0.5, 0, fabric.controlsUtils.scalingX, scaleRef),
            mt: makeHoverControlMiddle('mt', 'scaleY', 0, -0.5, fabric.controlsUtils.scalingY, scaleRef),
            mb: makeHoverControlMiddle('mb', 'scaleY', 0, 0.5, fabric.controlsUtils.scalingY, scaleRef),
        });

        const createTextControlSet = () => {
            const controls = createControlSet();
            controls.ml = makeHoverControlMiddleText('ml', 'scaleX', -0.5, 0, fabric.controlsUtils.changeWidth, scaleRef);
            controls.mr = makeHoverControlMiddleText('mr', 'scaleX', 0.5, 0, fabric.controlsUtils.changeWidth, scaleRef);
            controls.mtr.offsetY = CONTROL_CONFIG.rotationOffset;
            return controls;
        };

        const applyInstanceStyle = (obj) => {
            if (!obj) return;

            // Direct property assignment for styling
            obj.borderScaleFactor = CONTROL_CONFIG.borderScaleFactor;
            obj.cornerSize = CONTROL_CONFIG.cornerSize;
            obj.borderColor = CONTROL_CONFIG.borderColor;
            obj.cornerColor = CONTROL_CONFIG.cornerColor;
            obj.cornerStrokeColor = CONTROL_CONFIG.cornerStrokeColor;
            obj.transparentCorners = false;
            obj.cornerStyle = obj.cornerStyle || 'circle';
            obj.padding = CONTROL_CONFIG.padding;

            // Custom Controls assignment
            if (obj.type === 'textbox' || obj.type === 'itext') {
                obj.controls = createTextControlSet();
                obj.setControlsVisibility({
                    mt: false, mb: false, ml: true, mr: true,
                    tl: true, tr: true, bl: true, br: true, mtr: true
                });

                // Styling for text editing mode (Fabric 7++)
                obj.selectionColor = CONTROL_CONFIG.selectionColor;
                obj.cursorColor = CONTROL_CONFIG.cursorColor;
                obj.cursorWidth = CONTROL_CONFIG.cursorWidth;
                obj.editingBorderColor = CONTROL_CONFIG.editingBorderColor;
                obj.padding = 0; // Padding 0 inside textbox for precise alignment

            } else if (obj.type === 'activeselection') {
                obj.setControlsVisibility({
                    mt: false, mb: false, ml: false, mr: false,
                    tl: true, tr: true, bl: true, br: true, mtr: true
                });
            } else {
                obj.controls = createControlSet();
                obj.controls.mtr.offsetY = CONTROL_CONFIG.rotationOffset;
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
            if (!canvas) return;
            const ctx = opt.ctx;
            const currentZoom = canvas.getZoom();

            // getBoundingRect returns World coordinates relative to the canvas.
            // We must apply the viewportTransform to the context so drawing World coords
            // maps correctly onto the screen (respecting pan and zoom).
            ctx.save();
            const retina = canvas.getRetinaScaling();
            const vpt = canvas.viewportTransform;

            // Reset to identity, then apply retina, then apply viewport transform
            ctx.setTransform(retina, 0, 0, retina, 0, 0);
            ctx.transform(vpt[0], vpt[1], vpt[2], vpt[3], vpt[4], vpt[5]);

            canvas.getObjects().forEach(obj => {
                if (obj.isHovered && obj !== canvas.getActiveObject()) {
                    const bound = obj.getBoundingRect(true, true);
                    ctx.strokeStyle = 'hsl(0, 0%, 0%)';
                    // Because ctx is zoomed, we inversely scale strokes so they stay visually 2px
                    ctx.lineWidth = 2 / currentZoom;

                    // Use dashed line for groups/selections, solid for regular objects
                    if (obj.type === 'group' || obj.type === 'activeselection' || (obj._objects && obj._objects.length > 0)) {
                        ctx.setLineDash([5 / currentZoom, 5 / currentZoom]);
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
                }
            });
            ctx.restore();
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
        const syncAllProperties = () => {
            if (!canvas) return;
            // 1. All objects
            canvas.getObjects().forEach(obj => {
                obj.set({
                    borderScaleFactor: CONTROL_CONFIG.borderScaleFactor,
                    cornerSize: CONTROL_CONFIG.cornerSize,
                    borderColor: CONTROL_CONFIG.borderColor,
                    cornerColor: CONTROL_CONFIG.cornerColor,
                    cornerStrokeColor: CONTROL_CONFIG.cornerStrokeColor,
                    padding: obj.type === 'textbox' || obj.type === 'itext' ? 0 : CONTROL_CONFIG.padding
                });
                if (obj.controls && obj.controls.mtr) {
                    obj.controls.mtr.offsetY = CONTROL_CONFIG.rotationOffset;
                }
                if (obj.setCoords) obj.setCoords();
            });
            // 2. Active Object / Selection
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                activeObject.set({
                    borderScaleFactor: CONTROL_CONFIG.borderScaleFactor,
                    cornerSize: CONTROL_CONFIG.cornerSize,
                    borderColor: CONTROL_CONFIG.borderColor,
                    cornerColor: CONTROL_CONFIG.cornerColor,
                    cornerStrokeColor: CONTROL_CONFIG.cornerStrokeColor,
                    padding: activeObject.type === 'textbox' || activeObject.type === 'itext' ? 0 : CONTROL_CONFIG.padding
                });
                if (activeObject.controls && activeObject.controls.mtr) {
                    activeObject.controls.mtr.offsetY = CONTROL_CONFIG.rotationOffset;
                }
                if (activeObject.setCoords) activeObject.setCoords();
            }
            canvas.renderAll();
        };

        // Fast-path for zero-latency handle sizing during high-frequency interaction
        const handleFastScale = (e) => {
            // Unused now since native zoom handles it automatically
        };

        // Immediate sync on effect run
        syncAllProperties();

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

    // Set Base Prototype Defaults from Central Config
    Object.assign(fabricInstance.FabricObject.ownDefaults, {
        borderColor: CONTROL_CONFIG.borderColor,
        cornerColor: CONTROL_CONFIG.cornerColor,
        cornerStrokeColor: CONTROL_CONFIG.cornerStrokeColor,
        cornerSize: CONTROL_CONFIG.cornerSize,
        cornerStyle: 'circle',
        transparentCorners: false,
        padding: CONTROL_CONFIG.padding,
        borderScaleFactor: CONTROL_CONFIG.borderScaleFactor,
        // Text editing defaults
        selectionColor: CONTROL_CONFIG.selectionColor,
        cursorColor: CONTROL_CONFIG.cursorColor,
        editingBorderColor: CONTROL_CONFIG.editingBorderColor,
    });
}

/**
 * HELPER FUNCTIONS (ORIGINAL NAMES)
 */
function makeHoverControl(cornerName, actionName, x, y, handler, scaleRef) {
    return new fabric.Control({
        x, y,
        actionName,
        withConnection: cornerName === 'mtr',
        cursorStyle: cornerName === 'mtr' ? 'crosshair' : 'pointer',
        actionHandler: handler,
        sizeX: CONTROL_CONFIG.cornerSize + 4, // Hit area padding
        sizeY: CONTROL_CONFIG.cornerSize + 4,
        render: function (ctx, left, top, styleOverride, fabricObject) {
            ctx.save();
            ctx.fillStyle = CONTROL_CONFIG.cornerColor;
            ctx.beginPath();
            ctx.arc(left, top, CONTROL_CONFIG.cornerSize / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = CONTROL_CONFIG.strokeWidth;
            ctx.strokeStyle = CONTROL_CONFIG.cornerStrokeColor;
            ctx.stroke();
            ctx.restore();
        }
    });
}


function makeHoverControlMiddle(cornerName, actionName, x, y, handler, scaleRef) {
    const isVertical = cornerName === 'ml' || cornerName === 'mr';
    return new fabric.Control({
        x, y,
        actionName,
        cursorStyle: isVertical ? 'ew-resize' : 'ns-resize',
        actionHandler: handler,
        render: function (ctx, left, top, styleOverride, fabricObject) {
            const angle = fabricObject.angle + (fabricObject.group ? fabricObject.group.angle : 0);
            let barW, barH;

            if (isVertical) {
                barW = CONTROL_CONFIG.midWidth;
                barH = CONTROL_CONFIG.midHeight;
            } else {
                barW = CONTROL_CONFIG.midHeight;
                barH = CONTROL_CONFIG.midWidth;
            }

            ctx.save();
            ctx.translate(left, top);
            ctx.rotate(fabric.util.degreesToRadians(angle));
            ctx.fillStyle = CONTROL_CONFIG.cornerColor;
            ctx.beginPath();
            const rx = CONTROL_CONFIG.midRadius;
            if (ctx.roundRect) ctx.roundRect(-barW / 2, -barH / 2, barW, barH, [rx]);
            else ctx.rect(-barW / 2, -barH / 2, barW, barH);
            ctx.fill();
            ctx.lineWidth = CONTROL_CONFIG.strokeWidth;
            ctx.strokeStyle = CONTROL_CONFIG.cornerStrokeColor;
            ctx.stroke();
            ctx.restore();
        }
    });
}


function makeHoverControlMiddleText(cornerName, actionName, x, y, handler, scaleRef) {
    const isVertical = cornerName === 'ml' || cornerName === 'mr';
    return new fabric.Control({
        x, y,
        actionName,
        cursorStyle: isVertical ? 'ew-resize' : 'ns-resize',
        actionHandler: handler,
        render: function (ctx, left, top, styleOverride, fabricObject) {
            const angle = fabricObject.angle + (fabricObject.group ? fabricObject.group.angle : 0);
            let barW, barH;

            if (isVertical) {
                barW = CONTROL_CONFIG.midWidth;
                barH = CONTROL_CONFIG.midHeight;
            } else {
                barW = CONTROL_CONFIG.midHeight;
                barH = CONTROL_CONFIG.midWidth;
            }

            ctx.save();
            ctx.translate(left, top);
            ctx.rotate(fabric.util.degreesToRadians(angle));
            ctx.fillStyle = CONTROL_CONFIG.cornerColor;
            ctx.beginPath();
            const rx = CONTROL_CONFIG.midRadius;
            if (ctx.roundRect) ctx.roundRect(-barW / 2, -barH / 2, barW, barH, [rx]);
            else ctx.rect(-barW / 2, -barH / 2, barW, barH);
            ctx.fill();
            ctx.lineWidth = CONTROL_CONFIG.strokeWidth;
            ctx.strokeStyle = CONTROL_CONFIG.cornerStrokeColor;
            ctx.stroke();
            ctx.restore();
        }
    });
}