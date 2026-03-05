/**
 * Helper functions for manipulating Fabric.js objects on the canvas.
 */

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
 * Changes the stroke color of a Fabric object.
 * @param {fabric.Object} obj - The Fabric object.
 * @param {string} color - The color string.
 * @param {fabric.Canvas} canvas - The Fabric canvas instance.
 */
export const changeStroke = (obj, color, canvas) => {
    updateObjectProperty(obj, 'stroke', color, canvas);
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
    canvas.sendObjectToBack(obj);
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
    canvas.requestRenderAll();
};

// ─── Alignment helpers ──────────────────────────────────────────────────────
export const alignLeft = (obj, canvas) => {
    if (!obj || !canvas) return;
    const bound = obj.getBoundingRect();
    updateObjectProperty(obj, 'left', obj.left - bound.left, canvas);
};

export const alignCenterH = (obj, canvas) => {
    if (!obj || !canvas) return;
    const bound = obj.getBoundingRect();
    const newLeft = obj.left + (canvas.width / 2 - (bound.left + bound.width / 2));
    updateObjectProperty(obj, 'left', newLeft, canvas);
};

export const alignRight = (obj, canvas) => {
    if (!obj || !canvas) return;
    const bound = obj.getBoundingRect();
    const newLeft = obj.left + (canvas.width - (bound.left + bound.width));
    updateObjectProperty(obj, 'left', newLeft, canvas);
};

export const alignTop = (obj, canvas) => {
    if (!obj || !canvas) return;
    const bound = obj.getBoundingRect();
    updateObjectProperty(obj, 'top', obj.top - bound.top, canvas);
};

export const alignCenterV = (obj, canvas) => {
    if (!obj || !canvas) return;
    const bound = obj.getBoundingRect();
    const newTop = obj.top + (canvas.height / 2 - (bound.top + bound.height / 2));
    updateObjectProperty(obj, 'top', newTop, canvas);
};

export const alignBottom = (obj, canvas) => {
    if (!obj || !canvas) return;
    const bound = obj.getBoundingRect();
    const newTop = obj.top + (canvas.height - (bound.top + bound.height));
    updateObjectProperty(obj, 'top', newTop, canvas);
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
    canvas.fire('object:modified', { target: obj });
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
        canvas.requestRenderAll();
    } else {
        // Fall back to whole-object change
        updateObjectProperty(obj, property, value, canvas);
    }
};
