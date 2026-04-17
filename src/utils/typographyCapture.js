import * as fabric from 'fabric';

const TEXT_TYPES = new Set(['text', 'textbox', 'i-text']);
const SHAPE_TYPES = new Set(['rect', 'circle', 'triangle', 'ellipse', 'polygon', 'polyline', 'line', 'path']);

/**
 * Recursively collects all leaf-node types from a Fabric object tree.
 * A "leaf node" is any object that is NOT a group.
 * Groups are traversed deeper — their children are inspected, not the group itself.
 */
const collectLeafTypes = (obj, result = { hasText: false, hasShape: false, hasOther: false }) => {
    if (!obj) return result;

    if (obj.type === 'group' && typeof obj.getObjects === 'function') {
        // Recurse into group children
        for (const child of obj.getObjects()) {
            collectLeafTypes(child, result);
        }
    } else if (TEXT_TYPES.has(obj.type)) {
        result.hasText = true;
    } else if (SHAPE_TYPES.has(obj.type)) {
        result.hasShape = true;
    } else {
        // image, svg path-group fragment, or unknown type
        result.hasOther = true;
    }

    return result;
};

/**
 * Determines the preset category for a Fabric object by deeply
 * inspecting every leaf node in its tree. Supports both Groups and single Objects.
 *
 * Rules:
 *   - 100% text leaves → category "Text"
 *   - 100% shape leaves → category "Shape"
 *   - Mixed (text + shape), or contains images/other → category "Group"
 *
 * @param {fabric.Object} obj - The Fabric object (Group or any primitive).
 * @returns {{ category: 'Text'|'Shape'|'Group', type: 'JSON' } | null}
 */
export const getDeepPresetCategory = (obj) => {
    if (!obj) return null;

    const result = collectLeafTypes(obj);

    // If nothing was found at all (empty group), default to Group
    if (!result.hasText && !result.hasShape && !result.hasOther) {
        return { category: 'Group', type: 'JSON' };
    }

    // Pure text
    if (result.hasText && !result.hasShape && !result.hasOther) {
        return { category: 'Text', type: 'JSON' };
    }

    // Pure shape
    if (result.hasShape && !result.hasText && !result.hasOther) {
        return { category: 'Shape', type: 'JSON' };
    }

    // Mixed or has images/other
    return { category: 'Group', type: 'JSON' };
};

/**
 * Creates an HD File blob from a selected Fabric.js object (usually a Group)
 * and normalizes its JSON representation.
 */
export const captureObjectAsHDImage = async (obj) => {
    if (!obj) return null;

    // Normalizing coordinates
    // We clone the object to avoid mutating the actual canvas object
    const clonedObj = await obj.clone();
    
    // Reset left/top to 0 so the preview image hugs the object perfectly
    // without canvas background whitespace
    clonedObj.set({ left: 0, top: 0, originX: 'left', originY: 'top' });

    // Ensure it renders correctly
    clonedObj.setCoords();

    // Use toCanvasElement to ensure it renders correctly even when detached from DOM
    const tempCanvas = clonedObj.toCanvasElement({
        multiplier: 3.0, // HD Quality
    });

    const dataUrl = tempCanvas.toDataURL('image/webp', 1.0);

    // Create File from dataUrl
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], 'element_preview.webp', { type: 'image/webp' });

    // Get normalized JSON
    const clonedJson = clonedObj.toObject(['id', 'name']); // Include necessary custom properties if any

    return { file, dataUrl, json: clonedJson };
};
