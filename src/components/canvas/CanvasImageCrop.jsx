import React from 'react';
import * as fabric from 'fabric';
import { useCanvasContext } from '../../context/CanvasContext';

/**
 * Centralized styling configuration for the Crop Controls.
 * Matches the premium appearance in CanvasControllerStyling.jsx.
 */
const CROP_CONFIG = {
    cornerColor: '#FFFFFF',
    cornerStrokeColor: '#000000',
    midWidth: 6,
    midHeight: 24,
    midRadius: 4,
    strokeWidth: 1.5,
    hitAreaPadding: 10 // Extra clickable area around the visible handle
};

const MIN_SRC = 10;

function getNatural(img) {
    const el = img.getElement?.();
    return {
        nW: el?.naturalWidth || el?.width || img.width,
        nH: el?.naturalHeight || el?.height || img.height,
    };
}

// Set object position so its calculated 'point' (left/right/top/bottom center) matches absolute 'canvasPt'
function pin(img, canvasPt, originX, originY) {
    img.setPositionByOrigin(canvasPt, originX, originY);
}

// Snapshot state
function snap(tf) {
    if (!tf._cs) {
        const img = tf.target;
        tf._cs = {
            scaleX: img.scaleX,
            scaleY: img.scaleY,
            width: img.width,
            height: img.height,
            cropX: img.cropX || 0,
            cropY: img.cropY || 0,
            angle: img.angle,
            // Pins points:
            ml: img.getPointByOrigin('left', 'center'),    // used for mr (drag right -> left stays)
            mr: img.getPointByOrigin('right', 'center'),   // used for ml (drag left -> right stays)
            tc: img.getPointByOrigin('center', 'top'),     // used for mb (drag bot -> top stays)
            bc: img.getPointByOrigin('center', 'bottom'),  // used for mt (drag top -> bot stays)
        };
    }
    return tf._cs;
}

function commit(img) {
    img.dirty = true;
    img.setCoords();
    img.canvas?.renderAll();
}

/**
 * Returns dx, dy from pointer in the canvas system, but rotated into the image's local axis.
 * Positive x = moving "right" relative to the image's top edge
 * Positive y = moving "down" relative to the image's left edge
 */
function getLocalDelta(img, x, y, tf) {
    const dx = x - tf.ex;
    const dy = y - tf.ey;
    const angleRad = fabric.util.degreesToRadians(-img.angle);
    return {
        x: dx * Math.cos(angleRad) - dy * Math.sin(angleRad),
        y: dx * Math.sin(angleRad) + dy * Math.cos(angleRad)
    };
}

// ── mr: right edge follows pointer, middle-left is pinned ─────────────────────
function cropRight(ev, tf, x, y) {
    const img = tf.target;
    if (img.clipPath) img.clipPath = undefined;
    const s = snap(tf);
    const local = getLocalDelta(img, x, y, tf); 
    const newCanvasW = s.width * s.scaleX + local.x; // dragging right = +local.x
    
    executeCropRight(img, s, newCanvasW);
    pin(img, s.ml, 'left', 'center');
    
    img.canvas?.fire('object:resizing', { target: img, e: ev, transform: tf, pointer: { x, y } });
    
    commit(img);
    return true;
}

export function executeCropRight(img, s, newCanvasW) {
    const { nW, nH } = getNatural(img);
    const maxFullW = nW - s.cropX;
    let nextW = newCanvasW / s.scaleX;
    
    if (nextW < MIN_SRC) nextW = MIN_SRC;
    
    if (nextW <= maxFullW) {
        // Phase 1 - Crop Right: Width expands/shrinks, no scale change
        img.set({ scaleX: s.scaleX, scaleY: s.scaleY, width: nextW, height: s.height, cropX: s.cropX, cropY: s.cropY });
    } else {
        // Phase 2 - Scale Right: Hit max uncrop, scale up proportionally
        const ratio = newCanvasW / (maxFullW * s.scaleX);
        const nSX = s.scaleX * ratio;
        const nSY = s.scaleY * ratio;
        
        // We want the visual canvas height to remain exactly what it was (s.height * s.scaleY)
        // newHeight * nSY = s.height * s.scaleY
        const requiredVisHCanvas = s.height * s.scaleY;
        const newH = Math.max(MIN_SRC, requiredVisHCanvas / nSY);
        
        // Vertically center the crop: if height changed, adjust cropY by half the difference
        const diffH = s.height - newH;
        let newCropY = s.cropY + (diffH / 2);
        
        // Clamp cropY
        if (newCropY < 0) newCropY = 0;
        else if (newCropY + newH > nH) newCropY = nH - newH;
        
        img.set({ scaleX: nSX, scaleY: nSY, width: maxFullW, height: newH, cropX: s.cropX, cropY: newCropY });
    }
}


// ── ml: left edge follows pointer, middle-right is pinned ────────────────────
function cropLeft(ev, tf, x, y) {
    const img = tf.target;
    if (img.clipPath) img.clipPath = undefined;
    const s = snap(tf);
    const local = getLocalDelta(img, x, y, tf);
    // Dragging left (negative local.x) means widening the box
    const newCanvasW = s.width * s.scaleX - local.x; 
    
    executeCropLeft(img, s, newCanvasW);
    pin(img, s.mr, 'right', 'center');
    
    img.canvas?.fire('object:resizing', { target: img, e: ev, transform: tf, pointer: { x, y } });
    
    commit(img);
    return true;
}

export function executeCropLeft(img, s, newCanvasW) {
    const { nW, nH } = getNatural(img);
    const maxFullW = s.cropX + s.width; 
    let nextW = newCanvasW / s.scaleX;
    
    if (nextW < MIN_SRC) nextW = MIN_SRC;
    
    if (nextW <= maxFullW) {
        // Phase 1 - Crop Left
        const diffW = nextW - s.width;
        let newCropX = s.cropX - diffW;
        if (newCropX < 0) newCropX = 0;
        
        img.set({ scaleX: s.scaleX, scaleY: s.scaleY, width: nextW, height: s.height, cropX: newCropX, cropY: s.cropY });
    } else {
        // Phase 2 - Scale Left
        const ratio = newCanvasW / (maxFullW * s.scaleX);
        const nSX = s.scaleX * ratio;
        const nSY = s.scaleY * ratio;
        
        const requiredVisHCanvas = s.height * s.scaleY;
        const newH = Math.max(MIN_SRC, requiredVisHCanvas / nSY);
        
        const diffH = s.height - newH;
        let newCropY = s.cropY + (diffH / 2);
        
        if (newCropY < 0) newCropY = 0;
        else if (newCropY + newH > nH) newCropY = nH - newH;
        
        img.set({ scaleX: nSX, scaleY: nSY, width: maxFullW, height: newH, cropX: 0, cropY: newCropY });
    }
}


// ── mt: top edge follows pointer, bottom-center is pinned ────────────────────
function cropTop(ev, tf, x, y) {
    const img = tf.target;
    if (img.clipPath) img.clipPath = undefined;
    const s = snap(tf);
    const local = getLocalDelta(img, x, y, tf);
    // Dragging up (negative local.y) means increasing height
    const newCanvasH = s.height * s.scaleY - local.y;
    
    executeCropTop(img, s, newCanvasH);
    pin(img, s.bc, 'center', 'bottom');
    
    img.canvas?.fire('object:resizing', { target: img, e: ev, transform: tf, pointer: { x, y } });

    commit(img);
    return true;
}

export function executeCropTop(img, s, newCanvasH) {
    const { nW, nH } = getNatural(img);
    const maxFullH = s.cropY + s.height;
    let nextH = newCanvasH / s.scaleY;
    
    if (nextH < MIN_SRC) nextH = MIN_SRC;
    
    if (nextH <= maxFullH) {
        // Phase 1 - Crop Top
        const diffH = nextH - s.height;
        let newCropY = s.cropY - diffH;
        if (newCropY < 0) newCropY = 0;
        
        img.set({ scaleX: s.scaleX, scaleY: s.scaleY, width: s.width, height: nextH, cropX: s.cropX, cropY: newCropY });
    } else {
        // Phase 2 - Scale Top
        const ratio = newCanvasH / (maxFullH * s.scaleY);
        const nSX = s.scaleX * ratio;
        const nSY = s.scaleY * ratio;
        
        const requiredVisWCanvas = s.width * s.scaleX;
        const newW = Math.max(MIN_SRC, requiredVisWCanvas / nSX);
        
        const diffW = s.width - newW;
        let newCropX = s.cropX + (diffW / 2);
        
        if (newCropX < 0) newCropX = 0;
        else if (newCropX + newW > nW) newCropX = nW - newW;
        
        img.set({ scaleX: nSX, scaleY: nSY, width: newW, height: maxFullH, cropX: newCropX, cropY: 0 });
    }
}


// ── mb: bottom edge follows pointer, top-center is pinned ────────────────────
function cropBottom(ev, tf, x, y) {
    const img = tf.target;
    if (img.clipPath) img.clipPath = undefined;
    const s = snap(tf);
    const local = getLocalDelta(img, x, y, tf);
    // Dragging down (positive local.y) means increasing height
    const newCanvasH = s.height * s.scaleY + local.y;
    
    executeCropBottom(img, s, newCanvasH);
    pin(img, s.tc, 'center', 'top');
    
    img.canvas?.fire('object:resizing', { target: img, e: ev, transform: tf, pointer: { x, y } });

    commit(img);
    return true;
}

export function executeCropBottom(img, s, newCanvasH) {
    const { nW, nH } = getNatural(img);
    const maxFullH = nH - s.cropY;
    let nextH = newCanvasH / s.scaleY;
    
    if (nextH < MIN_SRC) nextH = MIN_SRC;
    
    if (nextH <= maxFullH) {
        // Phase 1 - Crop Bottom
        img.set({ scaleX: s.scaleX, scaleY: s.scaleY, width: s.width, height: nextH, cropX: s.cropX, cropY: s.cropY });
    } else {
        // Phase 2 - Scale Bottom
        const ratio = newCanvasH / (maxFullH * s.scaleY);
        const nSX = s.scaleX * ratio;
        const nSY = s.scaleY * ratio;
        
        const requiredVisWCanvas = s.width * s.scaleX;
        const newW = Math.max(MIN_SRC, requiredVisWCanvas / nSX);
        
        const diffW = s.width - newW;
        let newCropX = s.cropX + (diffW / 2);
        
        if (newCropX < 0) newCropX = 0;
        else if (newCropX + newW > nW) newCropX = nW - newW;
        
        img.set({ scaleX: nSX, scaleY: nSY, width: newW, height: maxFullH, cropX: newCropX, cropY: s.cropY });
    }
}


// ── Render ────────────────────────────────────────────────────────────────────
function makeCropRender(isVertical) {
    return function (ctx, left, top, _so, fabricObject) {
        const angle = fabricObject.angle + (fabricObject.group ? fabricObject.group.angle : 0);
        let barW, barH;
        
        if (isVertical) {
            barW = CROP_CONFIG.midWidth;
            barH = CROP_CONFIG.midHeight;
        } else {
            barW = CROP_CONFIG.midHeight;
            barH = CROP_CONFIG.midWidth;
        }
        
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(fabric.util.degreesToRadians(angle));
        
        ctx.fillStyle = CROP_CONFIG.cornerColor;
        ctx.beginPath();
        const rx = CROP_CONFIG.midRadius;
        if (ctx.roundRect) ctx.roundRect(-barW / 2, -barH / 2, barW, barH, [rx]);
        else ctx.rect(-barW / 2, -barH / 2, barW, barH);
        ctx.fill();
        
        ctx.lineWidth = CROP_CONFIG.strokeWidth;
        ctx.strokeStyle = CROP_CONFIG.cornerStrokeColor;
        ctx.stroke();
        
        ctx.restore();
    };
}

function injectCropControls(img) {
    if (img.type !== 'image') return;
    const hitW = CROP_CONFIG.midHeight + CROP_CONFIG.hitAreaPadding;
    const hitH = CROP_CONFIG.midWidth + CROP_CONFIG.hitAreaPadding;

    img.controls = {
        ...img.controls,
        ml: new fabric.Control({ actionName: 'resizing', x: -0.5, y: 0,  cursorStyle: 'ew-resize', actionHandler: cropLeft,   sizeX: hitH, sizeY: hitW, render: makeCropRender(true) }),
        mr: new fabric.Control({ actionName: 'resizing', x:  0.5, y: 0,  cursorStyle: 'ew-resize', actionHandler: cropRight,  sizeX: hitH, sizeY: hitW, render: makeCropRender(true) }),
        mt: new fabric.Control({ actionName: 'resizing', x: 0,  y: -0.5, cursorStyle: 'ns-resize', actionHandler: cropTop,    sizeX: hitW, sizeY: hitH, render: makeCropRender(false) }),
        mb: new fabric.Control({ actionName: 'resizing', x: 0,  y:  0.5, cursorStyle: 'ns-resize', actionHandler: cropBottom, sizeX: hitW, sizeY: hitH, render: makeCropRender(false) }),
    };

    img.__applyCropSnap = function(corner, multiplier) {
        const tf = this.canvas._currentTransform;
        if (!tf) return;
        
        const s = snap(tf);
        if (img.clipPath) img.clipPath = undefined;

        if (corner === 'mr' || corner === 'ml') {
            const currentVisW = this.width * this.scaleX;
            const targetVisW = currentVisW * multiplier;
            
            if (corner === 'mr') {
                executeCropRight(this, s, targetVisW);
                pin(this, s.ml, 'left', 'center');
            } else {
                executeCropLeft(this, s, targetVisW);
                pin(this, s.mr, 'right', 'center');
            }
        } else if (corner === 'mt' || corner === 'mb') {
            const currentVisH = this.height * this.scaleY;
            const targetVisH = currentVisH * multiplier;
            
            if (corner === 'mt') {
                executeCropTop(this, s, targetVisH);
                pin(this, s.bc, 'center', 'bottom');
            } else {
                executeCropBottom(this, s, targetVisH);
                pin(this, s.tc, 'center', 'top');
            }
        }
        
        commit(this);
    };

    img.setCoords();
}

export default function CanvasImageCrop() {
    const { canvas, scale } = useCanvasContext();

    React.useEffect(() => {
        if (!canvas) return;

        const apply = (e) => {
            const targets = e.selected || (e.target ? [e.target] : []);
            targets.forEach(obj => { if (obj.type === 'image') injectCropControls(obj); });
            canvas.requestRenderAll();
        };

        const onMouseUp = (e) => {
            if (e.transform) {
                delete e.transform._cs;
            }
        };

        const active = canvas.getActiveObject();
        if (active?.type === 'image') { injectCropControls(active); canvas.requestRenderAll(); }

        canvas.on('selection:created', apply);
        canvas.on('selection:updated', apply);
        canvas.on('mouse:up', onMouseUp);
        return () => {
            canvas.off('selection:created', apply);
            canvas.off('selection:updated', apply);
            canvas.off('mouse:up', onMouseUp);
        };
    }, [canvas, scale]);

    return null;
}
