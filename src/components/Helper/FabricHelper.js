/**
 * Helper functions for manipulating Fabric.js objects on the canvas.
 */
import * as fabric from 'fabric';

/**
 * Updates a single property of a Fabric object and re-renders the canvas.
 * @param {fabric.Object} obj - The Fabric object to update.
 * @param {string} property - The property name (e.g., 'fill', 'left').
 * @param {any} value - The new value for the property.
 * @param {fabric.Canvas} canvas - The Fabric canvas instance.
 */
export const updateObjectProperty = (obj, property, value, canvas) => {
    if (!obj || !canvas) return;
    obj.set(property, value);
    obj.setCoords();
    canvas.fire('object:modified', { target: obj });
    canvas.requestRenderAll();
};

/**
 * Updates multiple properties of a Fabric object and re-renders the canvas.
 * @param {fabric.Object} obj - The Fabric object to update.
 * @param {Object} properties - Object containing properties to update.
 * @param {fabric.Canvas} canvas - The Fabric canvas instance.
 */
export const updateObjectProperties = (obj, properties, canvas) => {
    if (!obj || !canvas) return;
    obj.set(properties);
    obj.setCoords();
    canvas.fire('object:modified', { target: obj });
    canvas.requestRenderAll();
};

/**
 * Changes the fill color of a Fabric object.
 * @param {fabric.Object} obj - The Fabric object.
 * @param {string} color - The color string (hex, rgba, etc).
 * @param {fabric.Canvas} canvas - The Fabric canvas instance.
 */
export const changeColor = (obj, color, canvas) => {
    updateObjectProperty(obj, 'fill', color, canvas);
};

/**
 * Applies a gradient to a property of a Fabric object.
 * @param {fabric.Object} obj - The Fabric object.
 * @param {string} property - The property to apply gradient to (e.g., 'fill' or 'stroke').
 * @param {Object} gradientState - The custom gradient state object.
 * @param {fabric.Canvas} canvas - The Fabric canvas instance.
 */
export const applyGradient = (obj, property, gradientState, canvas) => {
    if (!obj || !canvas) return;

    if (!gradientState || !gradientState.stops) {
        updateObjectProperty(obj, property, '#000000', canvas);
        return;
    }

    // Native CSS angles: 0deg is bottom up, 90deg is left to right
    // Fabric angles in percentage mode act within a 0-1 unit box.
    const angleRad = (gradientState.angle - 90) * (Math.PI / 180);
    const x1 = Math.round(50 + Math.sin(angleRad + Math.PI) * 50) / 100;
    const y1 = Math.round(50 + Math.cos(angleRad + Math.PI) * 50) / 100;
    const x2 = Math.round(50 + Math.sin(angleRad) * 50) / 100;
    const y2 = Math.round(50 + Math.cos(angleRad) * 50) / 100;

    let coords;
    if (gradientState.type === 'radial') {
        coords = { x1: 0.5, y1: 0.5, r1: 0, x2: 0.5, y2: 0.5, r2: 0.5 };
    } else {
        coords = { x1, y1, x2, y2 };
    }

    const fabricGradient = new fabric.Gradient({
        type: gradientState.type || 'linear',
        gradientUnits: 'percentage',
        coords: coords,
        colorStops: gradientState.stops,
    });

    // Store custom raw state to the object for re-editing
    obj.set('gradientState', gradientState);

    updateObjectProperty(obj, property, fabricGradient, canvas);
};

/**
 * Changes the stroke color of a Fabric object.
 * @param {fabric.Object} obj - The Fabric object.
 * @param {string} color - The color string.
 * @param {fabric.Canvas} canvas - The Fabric canvas instance.
 */
export const changeStroke = (obj, color, canvas) => {
    if (!obj || !canvas) return;

    const isImage = obj.type === 'image' || obj.type === 'FabricImage' || (obj.constructor && obj.constructor.name === 'FabricImage');

    if (isImage) {
        if (!obj.clipPath || obj.clipPath.type !== 'rect') {
            obj.set('clipPath', new fabric.Rect({
                width: obj.width,
                height: obj.height,
                originX: 'center',
                originY: 'center',
                rx: obj.rx || 0,
                ry: obj.ry || 0
            }));
        }
        obj.clipPath.set({
            stroke: color,

            strokeLineJoin: 'miter',
            strokeUniform: true
        });
        obj.set({ stroke: null });
    } else {
        obj.set({
            stroke: color,
            strokeAlign: 'outside',
            strokeLineJoin: 'round',
            strokeUniform: true,
            paintFirst: 'stroke'
        });
    }

    obj.dirty = true;
    obj.setCoords();
    canvas.fire('object:modified', { target: obj });
    canvas.requestRenderAll();
};

/**
 * Changes the stroke width of a Fabric object.
 * @param {fabric.Object} obj - The Fabric object.
 * @param {number} width - The stroke width.
 * @param {fabric.Canvas} canvas - The Fabric canvas instance.
 */
export const changeStrokeWidth = (obj, width, canvas) => {
    if (!obj || !canvas) return;

    const isImage = obj.type === 'image' || obj.type === 'FabricImage' || (obj.constructor && obj.constructor.name === 'FabricImage');

    if (isImage) {
        if (!obj.clipPath || obj.clipPath.type !== 'rect') {
            obj.set('clipPath', new fabric.Rect({
                width: obj.width,
                height: obj.height,
                originX: 'center',
                originY: 'center',
                rx: obj.rx || 0,
                ry: obj.ry || 0
            }));
        }
        obj.clipPath.set({
            strokeWidth: width,

        });
        obj.set({ strokeWidth: 0 });
    } else {
        obj.set({
            strokeWidth: width,

        });
    }

    obj.dirty = true;
    obj.setCoords();
    canvas.fire('object:modified', { target: obj });
    canvas.requestRenderAll();
};

/**
 * Changes the stroke alignment of a Fabric object.
 * @param {fabric.Object} obj - The Fabric object.
 * @param {string} alignment - The stroke alignment ('center', 'inside', 'outside').
 * @param {fabric.Canvas} canvas - The Fabric canvas instance.
 */
export const changeStrokeAlign = (obj, alignment, canvas) => {
    if (!obj || !canvas) return;

    const isImage = obj.type === 'image' || obj.type === 'FabricImage' || (obj.constructor && obj.constructor.name === 'FabricImage');

    if (isImage && obj.clipPath) {
        obj.clipPath.set('strokeAlign', alignment);
    } else {
        obj.set('strokeAlign', alignment);
    }

    obj.dirty = true;
    obj.setCoords();
    canvas.fire('object:modified', { target: obj });
    canvas.requestRenderAll();
};

/**
 * Changes the position (left, top) of a Fabric object.
 * @param {fabric.Object} obj - The Fabric object.
 * @param {number} x - The left coordinate.
 * @param {number} y - The top coordinate.
 * @param {fabric.Canvas} canvas - The Fabric canvas instance.
 */
export const changePosition = (obj, x, y, canvas) => {
    updateObjectProperties(obj, { left: x, top: y }, canvas);
};

/**
 * Changes the rotation angle of a Fabric object.
 * @param {fabric.Object} obj - The Fabric object.
 * @param {number} angle - The rotation angle in degrees.
 * @param {fabric.Canvas} canvas - The Fabric canvas instance.
 */
export const changeRotation = (obj, angle, canvas) => {
    updateObjectProperty(obj, 'angle', angle, canvas);
};

/**
 * Changes the scale factors of a Fabric object.
 * @param {fabric.Object} obj - The Fabric object.
 * @param {number} scaleX - Horizontal scale factor.
 * @param {number} scaleY - Vertical scale factor.
 * @param {fabric.Canvas} canvas - The Fabric canvas instance.
 */
export const changeScale = (obj, scaleX, scaleY, canvas) => {
    updateObjectProperties(obj, { scaleX, scaleY }, canvas);
};

/**
 * Changes the opacity of a Fabric object.
 * @param {fabric.Object} obj - The Fabric object.
 * @param {number} opacity - Opacity value (0 to 1).
 * @param {fabric.Canvas} canvas - The Fabric canvas instance.
 */
export const changeOpacity = (obj, opacity, canvas) => {
    updateObjectProperty(obj, 'opacity', opacity, canvas);
};

/**
 * Brings the object to the front of the canvas.
 * @param {fabric.Object} obj - The Fabric object.
 * @param {fabric.Canvas} canvas - The Fabric canvas instance.
 */
export const bringToFront = (obj, canvas) => {
    if (!obj || !canvas) return;
    canvas.bringObjectToFront(obj);

    // Ensure artboard is STILL at the bottom in case it was accidentally brought front
    // (though 'bringToFront' shouldn't do this to artboard, it's good safety)
    const artboard = canvas.getObjects().find(o => o.isArtboard);
    if (artboard) canvas.sendObjectToBack(artboard);

    canvas.fire('object:modified', { target: obj });
    canvas.requestRenderAll();
};

/**
 * Sends the object to the back of the canvas.
 * @param {fabric.Object} obj - The Fabric object.
 * @param {fabric.Canvas} canvas - The Fabric canvas instance.
 */
export const sendToBack = (obj, canvas) => {
    if (!obj || !canvas) return;

    const artboard = canvas.getObjects().find(o => o.isArtboard);
    if (artboard) {
        // Find current index of artboard (should be 0)
        const artboardIndex = canvas.getObjects().indexOf(artboard);
        // Move object to just above the artboard
        canvas.moveObjectTo(obj, artboardIndex + 1);
    } else {
        canvas.sendObjectToBack(obj);
    }

    canvas.fire('object:modified', { target: obj });
    canvas.requestRenderAll();
};

/**
 * Removes an object from the canvas.
 * @param {fabric.Object} obj - The Fabric object.
 * @param {fabric.Canvas} canvas - The Fabric canvas instance.
 */
export const deleteObject = (obj, canvas) => {
    if (!obj || !canvas) return;
    canvas.remove(obj);
    canvas.fire('object:modified');
    canvas.requestRenderAll();

};

// ─── Alignment helpers ──────────────────────────────────────────────────────
const getArtboardBounds = (canvas) => {
    const artboard = canvas.getObjects().find(o => o.isArtboard);
    return artboard ? { width: artboard.width, height: artboard.height } : { width: canvas.width, height: canvas.height };
};

export const alignLeft = (obj, canvas) => {
    if (!obj || !canvas) return;
    const bound = obj.getBoundingRect();
    updateObjectProperty(obj, 'left', obj.left - bound.left, canvas);
};

export const alignCenterH = (obj, canvas) => {
    if (!obj || !canvas) return;
    const { width: artboardWidth } = getArtboardBounds(canvas);
    const bound = obj.getBoundingRect(true, true); // Get unscaled bounds from origin? No, getBoundingRect() is relative to view
    // Wait, getBoundingRect() might return zoomed bounds in v7? Let's check. Assuming it returns internal coords.
    // In Fabric v7, getBoundingRect(false, true) might be needed. Let's use obj.aCoords for absolute positioning.

    // Actually, earlier code was: `canvas.width / 2 - (bound.left + bound.width / 2)`.
    const boundWidth = bound.width / canvas.getZoom(); // neutralize zoom
    const boundLeft = bound.left / canvas.getZoom() - canvas.viewportTransform[4] / canvas.getZoom(); // Neutralize pan and zoom

    // Easier way: Use object's center point
    const center = obj.getCenterPoint();
    updateObjectProperty(obj, 'left', obj.left - center.x + (artboardWidth / 2), canvas);
};

export const alignRight = (obj, canvas) => {
    if (!obj || !canvas) return;
    const { width: artboardWidth } = getArtboardBounds(canvas);
    // Align right to artboard
    const center = obj.getCenterPoint();
    const halfWidth = obj.getBoundingRect().width / 2 / canvas.getZoom();
    updateObjectProperty(obj, 'left', obj.left - center.x + artboardWidth - halfWidth, canvas);
};

export const alignTop = (obj, canvas) => {
    if (!obj || !canvas) return;
    const bound = obj.getBoundingRect();
    updateObjectProperty(obj, 'top', obj.top - bound.top, canvas);
};

export const alignCenterV = (obj, canvas) => {
    if (!obj || !canvas) return;
    const { height: artboardHeight } = getArtboardBounds(canvas);
    const center = obj.getCenterPoint();
    updateObjectProperty(obj, 'top', obj.top - center.y + (artboardHeight / 2), canvas);
};

// ─── Corner Radius helper ──────────────────────────────────────────────────
/**
 * Changes the corner radius of a Fabric object.
 * For Images, it uses clipPath with a Rect.
 * @param {fabric.Object} obj - The Fabric object.
 * @param {number} radius - The corner radius.
 * @param {fabric.Canvas} canvas - The Fabric canvas instance.
 */
export const changeCornerRadius = (obj, radius, canvas) => {
    if (!obj || !canvas) return;

    if (obj.type === 'image' || obj.type === 'FabricImage' || (obj.constructor && obj.constructor.name === 'FabricImage')) {
        // For Images, use clipPath with a Rect
        if (!obj.clipPath || obj.clipPath.type !== 'rect') {
            obj.set('clipPath', new fabric.Rect({
                width: obj.width,
                height: obj.height,
                originX: 'center',
                originY: 'center',
                rx: radius,
                ry: radius
            }));
        } else {
            obj.clipPath.set({ rx: radius, ry: radius });
        }
    } else {
        // For Rect and other shapes that support rx/ry
        obj.set({ rx: radius, ry: radius });
    }

    obj.dirty = true;
    obj.setCoords();
    canvas.fire('object:modified', { target: obj });
    canvas.requestRenderAll();
};

export const alignBottom = (obj, canvas) => {
    if (!obj || !canvas) return;
    const { height: artboardHeight } = getArtboardBounds(canvas);
    const center = obj.getCenterPoint();
    const halfHeight = obj.getBoundingRect().height / 2 / canvas.getZoom();
    updateObjectProperty(obj, 'top', obj.top - center.y + artboardHeight - halfHeight, canvas);
};

// ─── Flip helpers ───────────────────────────────────────────────────────────
export const flipHorizontal = (obj, canvas) => {
    if (!obj || !canvas) return;
    updateObjectProperty(obj, 'flipX', !obj.flipX, canvas);
};

export const flipVertical = (obj, canvas) => {
    if (!obj || !canvas) return;
    updateObjectProperty(obj, 'flipY', !obj.flipY, canvas);
};

// ─── Dimension helpers (set rendered W/H via scale) ─────────────────────────
export const changeWidth = (obj, newWidth, canvas, lockRatio = false) => {
    if (!obj || !canvas || !obj.width) return;
    const newScaleX = newWidth / obj.width;
    if (lockRatio) {
        updateObjectProperties(obj, { scaleX: newScaleX, scaleY: newScaleX }, canvas);
    } else {
        updateObjectProperty(obj, 'scaleX', newScaleX, canvas);
    }
};

export const changeHeight = (obj, newHeight, canvas, lockRatio = false) => {
    if (!obj || !canvas || !obj.height) return;
    const newScaleY = newHeight / obj.height;
    if (lockRatio) {
        updateObjectProperties(obj, { scaleX: newScaleY, scaleY: newScaleY }, canvas);
    } else {
        updateObjectProperty(obj, 'scaleY', newScaleY, canvas);
    }
};

// ─── Rotate 90° ─────────────────────────────────────────────────────────────
export const rotate90 = (obj, canvas) => {
    if (!obj || !canvas) return;
    updateObjectProperty(obj, 'angle', (obj.angle + 90) % 360, canvas);
};

// ─── Text helpers ──────────────────────────────────────────────────────────
export const changeFontSize = (obj, size, canvas) => {
    if (!obj || !canvas) return;
    updateObjectProperty(obj, 'fontSize', size, canvas);
};

export const changeFontFamily = (obj, family, canvas) => {
    if (!obj || !canvas) return;

    // Preserve the fixed width for Textbox — do NOT call initDimensions() as it
    // resets the Textbox width back to auto, causing text overflow.
    const savedWidth = obj.width;

    obj.set('fontFamily', family);

    // The font is already loaded via CSS Font Loading API in TextStylingTools.jsx
    // so we can apply styles immediately without setTimeout delayed measurement
    obj.dirty = true;
    if (savedWidth) obj.set('width', savedWidth);

    obj.setCoords();
    // canvas.fire('object:modified', { target: obj });
    canvas.requestRenderAll();
};

export const changeFontWeight = (obj, weight, canvas) => {
    if (!obj || !canvas) return;
    updateObjectProperty(obj, 'fontWeight', weight, canvas);
};

/**
 * Returns the current text selection range of an IText/Textbox object.
 * @returns {{ start: number, end: number, hasSelection: boolean }}
 */
export const getTextSelection = (obj) => {
    if (!obj || !obj.isEditing) return { start: 0, end: 0, hasSelection: false };
    const start = obj.selectionStart ?? 0;
    const end = obj.selectionEnd ?? 0;
    return { start, end, hasSelection: start !== end };
};

/**
 * Applies a text style property to the selected character range only (when
 * text is in editing mode and has an active selection), otherwise applies it
 * to the entire object.
 *
 * @param {fabric.IText|fabric.Textbox} obj  - The active fabric text object.
 * @param {string} property                  - CSS-style property key (e.g. 'fontWeight', 'fill').
 * @param {*} value                          - The new property value.
 * @param {fabric.Canvas} canvas
 */
export const changeSelectedTextProperty = (obj, property, value, canvas) => {
    if (!obj || !canvas) return;

    const { start, end, hasSelection } = getTextSelection(obj);

    if (hasSelection) {
        // Apply style only to the selected range
        obj.setSelectionStyles({ [property]: value }, start, end);
        obj.dirty = true;
        canvas.fire('object:modified', { target: obj });
        canvas.requestRenderAll();
    } else {
        // Fall back to whole-object change
        updateObjectProperty(obj, property, value, canvas);
    }
};

// ─── Image Filter helper ─────────────────────────────────────────────────────
/**
 * Applies a named filter to a Fabric image object.
 * Stores the filter name as obj.customFilter for UI state.
 * @param {fabric.Image} obj - The Fabric image object.
 * @param {string} filterName - Filter name (e.g. 'Grayscale', 'Sepia', 'None').
 * @param {fabric.Canvas} canvas - The Fabric canvas instance.
 */
export const changeImageFilter = (obj, filterName, canvas) => {
    if (!obj || !canvas) return;

    let filters = [];

    switch (filterName) {
        case 'Grayscale':
            filters = [new fabric.filters.Grayscale()];
            break;
        case 'Sepia':
            filters = [new fabric.filters.Sepia()];
            break;
        case 'Invert':
            filters = [new fabric.filters.Invert()];
            break;
        case 'Blur':
            filters = [new fabric.filters.Blur({ blur: 0.1 })];
            break;
        case 'Brightness':
            filters = [new fabric.filters.Brightness({ brightness: 0.3 })];
            break;
        case 'Contrast':
            filters = [new fabric.filters.Contrast({ contrast: 0.4 })];
            break;
        case 'Saturate':
            filters = [new fabric.filters.Saturation({ saturation: 1 })];
            break;
        case 'Vintage':
            filters = [
                new fabric.filters.Sepia(),
                new fabric.filters.Contrast({ contrast: 0.15 }),
                new fabric.filters.Saturation({ saturation: -0.2 }),
            ];
            break;
        case 'None':
        default:
            filters = [];
            break;
    }

    obj.filters = filters;
    obj.customFilter = filterName === 'None' ? null : filterName;
    obj.customFilterValues = null; // clear custom values when preset is selected
    obj.applyFilters();
    obj.dirty = true;
    obj.setCoords();
    canvas.fire('object:modified', { target: obj });
    canvas.requestRenderAll();
};

/**
 * Applies individual custom filter adjustments to a Fabric image object.
 *
 * All values use Fabric's native units:
 *   brightness / contrast / saturation / vibrance  → -1..1
 *   hue                                            → degrees -180..180
 *   blur                                           → 0..0.5
 *   noise                                          → 0..1000
 *   pixelate                                       → 1..20 (blocksize)
 *   gammaR / gammaG / gammaB                       → 0.1..2.2 (default 1.0)
 *
 * @param {fabric.Image} obj
 * @param {object} values
 * @param {fabric.Canvas} canvas
 */
export const changeImageCustomFilter = (obj, values, canvas) => {
    if (!obj || !canvas) return;

    const {
        brightness = 0,
        contrast = 0,
        exposure = 0,
        saturation = 0,
        vibrance = 0,
        hue = 0,
        blur = 0,
        noise = 0,
        pixelate = 1,
        gammaR = 1,
        gammaG = 1,
        gammaB = 1,
    } = values;

    const filters = [];

    if (values.colorMatrix) {
        filters.push(new fabric.filters.ColorMatrix({ matrix: values.colorMatrix }));
    } else {
        if (brightness !== 0)
            filters.push(new fabric.filters.Brightness({ brightness }));

        if (exposure !== 0)
            filters.push(new fabric.filters.Brightness({ brightness: exposure }));

        if (contrast !== 0)
            filters.push(new fabric.filters.Contrast({ contrast }));

        if (saturation !== 0)
            filters.push(new fabric.filters.Saturation({ saturation }));

        if (vibrance !== 0)
            filters.push(new fabric.filters.Vibrance({ vibrance }));

        if (hue !== 0)
            filters.push(new fabric.filters.HueRotation({ rotation: (hue / 360) * Math.PI * 2 }));
    }

    if (blur > 0)
        filters.push(new fabric.filters.Blur({ blur }));

    if (noise > 0)
        filters.push(new fabric.filters.Noise({ noise }));

    if (pixelate > 1)
        filters.push(new fabric.filters.Pixelate({ blocksize: Math.round(pixelate) }));

    // Gamma: only add if any channel differs from 1.0
    if (gammaR !== 1 || gammaG !== 1 || gammaB !== 1)
        filters.push(new fabric.filters.Gamma({ gamma: [gammaR, gammaG, gammaB] }));

    obj.filters = filters;
    obj.customFilter = 'Custom';
    obj.customFilterValues = { brightness, contrast, exposure, saturation, vibrance, hue, blur, noise, pixelate, gammaR, gammaG, gammaB };
    obj.applyFilters();
    obj.dirty = true;
    obj.setCoords();
    canvas.fire('object:modified', { target: obj });
    canvas.requestRenderAll();
};

/**
 * Changes the shadow of a Fabric object.
 * @param {fabric.Object} obj - The Fabric object.
 * @param {Object} options - Shadow options (color, blur, offsetX, offsetY).
 * @param {fabric.Canvas} canvas - The Fabric canvas instance.
 */
export const changeShadow = (obj, options, canvas) => {
    if (!obj || !canvas) return;

    if (!options) {
        obj.set('shadow', null);
    } else {
        const shadow = new fabric.Shadow({
            color: options.color || 'rgba(0,0,0,0.3)',
            blur: options.blur ?? 10,
            offsetX: options.offsetX ?? 5,
            offsetY: options.offsetY ?? 5,
            affectStroke: false,
            nonScaling: true
        });
        obj.set('shadow', shadow);
    }

    obj.dirty = true;
    obj.setCoords();
    canvas.fire('object:modified', { target: obj });
    canvas.requestRenderAll();
};
