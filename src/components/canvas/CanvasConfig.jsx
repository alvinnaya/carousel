import React, { useEffect } from 'react'
import { useCanvasContext } from '../../context/CanvasContext';
import * as fabric from 'fabric';

/**
 * Returns true if any descendant within the given objects list is currently
 * in text-editing mode. Recurses into nested groups.
 */
const hasEditingDescendant = (objects) => {
    if (!objects) return false;
    return objects.some(obj =>
        obj.isEditing ||
        (obj._objects && hasEditingDescendant(obj._objects))
    );
};

/**
 * Patch fabric.Group.prototype.renderCache to fix text selection highlight
 * smearing / ghosting when text inside a group is in editing mode.
 *
 * ROOT CAUSE:
 * Fabric's renderCache() calls drawObject() WITHOUT clearing the cache canvas
 * first. Normally this is fine because isCacheDirty() returns false most of
 * the time (re-renders only happen when dirty=true is set explicitly).
 * However, during text editing the text object sets dirty=true every frame
 * while the user drags to select. After each render, dirty is reset to false
 * and the now-stale cache (no selection) is reused — so the highlight
 * disappears on mouseup and on any re-render triggered from outside
 * (e.g. CanvasSmartGuide's mouse:up handler).
 *
 * FIX:
 * Before calling the original renderCache, we:
 *   1. Clear the group's cache canvas (prevents smearing on repeated draws)
 *   2. Set dirty=true  (forces the original to call drawObject() this frame)
 * This ensures every requestRenderAll() while text is being edited
 * re-renders the group cache with the current selection state.
 */
if (fabric.Group && !fabric.Group.__editingCachePatchApplied) {
    const _originalRenderCache = fabric.Group.prototype.renderCache;

    fabric.Group.prototype.renderCache = function (options) {
        if (hasEditingDescendant(this._objects)) {
            // Clear the cache so old pixels don't bleed into the new render
            if (this._cacheCanvas && this._cacheContext) {
                this._cacheContext.clearRect(
                    0, 0,
                    this._cacheCanvas.width,
                    this._cacheCanvas.height
                );
            }
            // Mark dirty so the original renderCache calls drawObject()
            this.dirty = true;
        }
        _originalRenderCache.call(this, options);
    };

    // Guard against hot-reload stacking multiple patches
    fabric.Group.__editingCachePatchApplied = true;
}

export default function CanvasConfig() {
    const { scale, canvas } = useCanvasContext();

    console.log("canvasconfig");

    const EXTRA_PROPS = [
        'assetId',      // ID from CanvasAsset table (new canvas-scoped asset system)
        'imageKey',     // Legacy: object key from Image gallery (kept for backward compat)
        'imageId',      // Legacy: ID from Image gallery (kept for backward compat)
        'isArtboard',
        'cropX',
        'cropY',
        'cropLeft',
        'cropRight',
        'cropTop',
        'cropBottom'
    ];

    const originalToObject = fabric.FabricObject.prototype.toObject;
    fabric.FabricObject.prototype.toObject = function (additionalProperties) {
        return originalToObject.call(this, [...EXTRA_PROPS, 'isTransient', ...(additionalProperties || [])]);
    };

    // Serialization Guard: Override canvas's toJSON to exclude transient objects.
    // This ensures blob: URLs NEVER reach the backend database, even during Autosave.
    if (canvas && !canvas.__transientGuardPatched) {
        const originalToJSON = canvas.toJSON.bind(canvas);
        canvas.toJSON = function (additionalProps) {
            const json = originalToJSON(additionalProps);
            json.objects = (json.objects || []).filter(obj => !obj.isTransient);
            return json;
        };
        canvas.__transientGuardPatched = true;
    }

    fabric.FabricObject.prototype.originX = 'center';
    fabric.FabricObject.prototype.originY = 'center';
    fabric.Textbox.prototype.splitByGrapheme = true;

    return null;
}
