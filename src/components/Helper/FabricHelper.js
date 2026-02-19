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
