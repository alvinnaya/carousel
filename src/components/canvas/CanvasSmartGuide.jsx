import { useEffect } from 'react';
import * as fabric from 'fabric';
import { useCanvasContext } from '../../context/CanvasContext';

const CanvasSmartGuide = ({ snapThreshold = 15, edgePadding = 80 }) => {
    const { canvas, scaleRef } = useCanvasContext();

    useEffect(() => {
        if (!canvas) return;

        let guides = [];

        function drawLine(points, isPadding = false) {
            guides.push({ type: 'line', points, isPadding });
        }

        function drawGap(dir, fixedCoord, var1, var2, line1, line2, gapVal) {
            guides.push({ type: 'gap', dir, fixedCoord, var1, var2, line1, line2, gapVal });
        }

        function clearLines() {
            guides = [];
        }

        const drawArrowLine = (ctx, x1, y1, x2, y2, headlen = 10) => {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            const angle = Math.atan2(y2 - y1, x2 - x1);

            ctx.beginPath();
            ctx.moveTo(x1 + headlen * Math.cos(angle - Math.PI / 6), y1 + headlen * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(x1, y1);
            ctx.lineTo(x1 + headlen * Math.cos(angle + Math.PI / 6), y1 + headlen * Math.sin(angle + Math.PI / 6));
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(x2, y2);
            ctx.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));
            ctx.stroke();
        };

        const handleAfterRender = (opt) => {
            if (guides.length === 0) return;

            const ctx = opt.ctx;
            ctx.save();

            const v = canvas.viewportTransform;
            const retina = canvas.getRetinaScaling();
            ctx.setTransform(retina, 0, 0, retina, 0, 0);

            // Compute font size based on current zoom scale inversely
            // so text stays readable on screen when zoomed out
            const currentScale = scaleRef?.current || 1;
            const invScale = 1 / currentScale;
            const fontSize = Math.round(10 * invScale);

            guides.forEach((guide) => {
                if (guide.type === 'line') {
                    if (guide.isPadding) {
                        ctx.strokeStyle = '#e74c3c';
                        ctx.lineWidth = 1 * invScale;
                        ctx.setLineDash([5 * invScale, 5 * invScale]);
                    } else {
                        ctx.strokeStyle = '#8e4ae2';
                        ctx.lineWidth = 1 * invScale;
                        ctx.setLineDash([]);
                    }

                    ctx.beginPath();
                    ctx.moveTo(guide.points[0], guide.points[1]);
                    ctx.lineTo(guide.points[2], guide.points[3]);
                    ctx.stroke();
                } else if (guide.type === 'gap') {
                    const color = '#db4cb2'; // Pink/Purple like the user's reference
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 1.5 * invScale;
                    ctx.setLineDash([]);

                    const headLenScaled = 6 * invScale;
                    const { dir, fixedCoord, var1, var2, line1, line2, gapVal } = guide;

                    if (dir === 'x') {
                        // var1 and var2 are x coordinates, fixedCoord is y
                        // Draw horizontal boundary lines
                        ctx.beginPath();
                        ctx.moveTo(var1, line1); ctx.lineTo(var1, line2);
                        ctx.moveTo(var2, line1); ctx.lineTo(var2, line2);
                        ctx.stroke();
                        // Draw arrow
                        drawArrowLine(ctx, var1, fixedCoord, var2, fixedCoord, headLenScaled);

                        // Draw Gap Text
                        const textStr = gapVal.toString();
                        ctx.font = `bold ${fontSize}px sans-serif`;
                        const textWidth = ctx.measureText(textStr).width + (8 * invScale);
                        const boxHeight = (fontSize + 8 * invScale);
                        const midX = (var1 + var2) / 2;
                        const midY = fixedCoord;

                        ctx.fillStyle = color;
                        ctx.fillRect(midX - textWidth / 2, midY - boxHeight / 2, textWidth, boxHeight);
                        ctx.fillStyle = '#ffffff';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(textStr, midX, midY + (1 * invScale));
                    } else {
                        // var1 and var2 are y coordinates, fixedCoord is x
                        // Draw vertical boundary lines
                        ctx.beginPath();
                        ctx.moveTo(line1, var1); ctx.lineTo(line2, var1);
                        ctx.moveTo(line1, var2); ctx.lineTo(line2, var2);
                        ctx.stroke();
                        // Draw arrow
                        drawArrowLine(ctx, fixedCoord, var1, fixedCoord, var2, headLenScaled);

                        // Draw Gap Text
                        const textStr = gapVal.toString();
                        ctx.font = `bold ${fontSize}px sans-serif`;
                        const textWidth = ctx.measureText(textStr).width + (8 * invScale);
                        const boxHeight = (fontSize + 8 * invScale);
                        const midX = fixedCoord;
                        const midY = (var1 + var2) / 2;

                        ctx.fillStyle = color;
                        ctx.fillRect(midX - textWidth / 2, midY - boxHeight / 2, textWidth, boxHeight);
                        ctx.fillStyle = '#ffffff';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(textStr, midX, midY + (1 * invScale));
                    }
                }
            });

            ctx.restore();
        };

        function getTargets(obj) {
            const targetsX = [];
            const targetsY = [];
            const activeObjects = canvas.getActiveObjects();
            const uiGaps = [24, 48, 72, 96];

            const isAncestor = (child, potentialAncestor) => {
                let parent = child.group;
                while (parent) {
                    if (parent === potentialAncestor) return true;
                    parent = parent.group;
                }
                return false;
            };

            const collectTargets = (container) => {
                if (!container.getObjects) return;

                container.getObjects().forEach(o => {
                    if (o.isSmartGuide || !o.visible) return;

                    const isSelfOrSelected = o === obj || activeObjects.includes(o);
                    const isParent = isAncestor(obj, o);

                    if (!isSelfOrSelected && !isParent) {
                        const r = o.getBoundingRect();

                        targetsX.push({ pos: r.left, isPadding: false });
                        targetsX.push({ pos: r.left + r.width / 2, isPadding: false });
                        targetsX.push({ pos: r.left + r.width, isPadding: false });

                        targetsY.push({ pos: r.top, isPadding: false });
                        targetsY.push({ pos: r.top + r.height / 2, isPadding: false });
                        targetsY.push({ pos: r.top + r.height, isPadding: false });

                        uiGaps.forEach(gap => {
                            // X gaps
                            targetsX.push({ pos: r.left - gap, isPadding: false, isGap: true, edges: ['right'], sourceRect: r, gap });
                            targetsX.push({ pos: r.left + r.width + gap, isPadding: false, isGap: true, edges: ['left'], sourceRect: r, gap });

                            // Y gaps
                            targetsY.push({ pos: r.top - gap, isPadding: false, isGap: true, edges: ['bottom'], sourceRect: r, gap });
                            targetsY.push({ pos: r.top + r.height + gap, isPadding: false, isGap: true, edges: ['top'], sourceRect: r, gap });
                        });
                    }

                    if (typeof o.getObjects === 'function' && !isSelfOrSelected) {
                        collectTargets(o);
                    }
                });
            };

            collectTargets(canvas);

            targetsX.push({ pos: 0, isPadding: false });
            targetsX.push({ pos: canvas.getWidth() / 2, isPadding: false });
            targetsX.push({ pos: canvas.getWidth(), isPadding: false });

            targetsY.push({ pos: 0, isPadding: false });
            targetsY.push({ pos: canvas.getHeight() / 2, isPadding: false });
            targetsY.push({ pos: canvas.getHeight(), isPadding: false });

            targetsX.push({ pos: edgePadding, isPadding: true, edges: ['left'] });
            targetsX.push({ pos: canvas.getWidth() - edgePadding, isPadding: true, edges: ['right'] });

            targetsY.push({ pos: edgePadding, isPadding: true, edges: ['top'] });
            targetsY.push({ pos: canvas.getHeight() - edgePadding, isPadding: true, edges: ['bottom'] });

            return { targetsX, targetsY };
        }

        let cachedTargets = null;

        const handleDragStart = (e) => {
            const obj = e.target;
            if (!obj) return;
            cachedTargets = getTargets(obj);
        };

        const handleMoving = (e) => {
            const obj = e.target;
            if (!obj || !cachedTargets) return;

            clearLines();

            const rect = obj.getBoundingRect();
            let center = obj.getCenterPoint();

            let left = center.x - rect.width / 2;
            let right = center.x + rect.width / 2;
            let top = center.y - rect.height / 2;
            let bottom = center.y + rect.height / 2;

            const { targetsX, targetsY } = cachedTargets;

            let snappedX = false;
            let snappedY = false;

            const scaleX = obj.group ? obj.group.scaleX || 1 : 1;
            const scaleY = obj.group ? obj.group.scaleY || 1 : 1;

            targetsX.forEach(({ pos, isPadding, isGap, edges, sourceRect, gap }) => {
                if (snappedX) return;

                const allowedEdges = edges || ['left', 'right', 'center'];

                if (allowedEdges.includes('left') && Math.abs(left - pos) < snapThreshold) {
                    obj.set({ left: obj.left + (pos - left) / scaleX });
                    if (isGap) {
                        const y = Math.min(Math.max(center.y, sourceRect.top), sourceRect.top + sourceRect.height);
                        drawGap('x', y, pos, sourceRect.left + sourceRect.width, Math.min(top, sourceRect.top), Math.max(bottom, sourceRect.top + sourceRect.height), gap);
                    } else {
                        drawLine([pos, 0, pos, canvas.height], isPadding);
                    }
                    snappedX = true;
                }
                else if (allowedEdges.includes('right') && Math.abs(right - pos) < snapThreshold) {
                    obj.set({ left: obj.left + (pos - right) / scaleX });
                    if (isGap) {
                        const y = Math.min(Math.max(center.y, sourceRect.top), sourceRect.top + sourceRect.height);
                        drawGap('x', y, sourceRect.left, pos, Math.min(top, sourceRect.top), Math.max(bottom, sourceRect.top + sourceRect.height), gap);
                    } else {
                        drawLine([pos, 0, pos, canvas.height], isPadding);
                    }
                    snappedX = true;
                }
                else if (allowedEdges.includes('center') && Math.abs(center.x - pos) < snapThreshold) {
                    obj.set({ left: obj.left + (pos - center.x) / scaleX });
                    drawLine([pos, 0, pos, canvas.height], isPadding);
                    snappedX = true;
                }
            });

            // Update bounds if X snapped so Y arrows use correct X
            if (snappedX) {
                obj.setCoords();
                const newRect = obj.getBoundingRect();
                center = obj.getCenterPoint();
                left = center.x - newRect.width / 2;
                right = center.x + newRect.width / 2;
            }

            targetsY.forEach(({ pos, isPadding, isGap, edges, sourceRect, gap }) => {
                if (snappedY) return;

                const allowedEdges = edges || ['top', 'bottom', 'center'];

                if (allowedEdges.includes('top') && Math.abs(top - pos) < snapThreshold) {
                    obj.set({ top: obj.top + (pos - top) / scaleY });
                    if (isGap) {
                        const x = Math.min(Math.max(center.x, sourceRect.left), sourceRect.left + sourceRect.width);
                        drawGap('y', x, pos, sourceRect.top + sourceRect.height, Math.min(left, sourceRect.left), Math.max(right, sourceRect.left + sourceRect.width), gap);
                    } else {
                        drawLine([0, pos, canvas.width, pos], isPadding);
                    }
                    snappedY = true;
                }
                else if (allowedEdges.includes('bottom') && Math.abs(bottom - pos) < snapThreshold) {
                    obj.set({ top: obj.top + (pos - bottom) / scaleY });
                    if (isGap) {
                        const x = Math.min(Math.max(center.x, sourceRect.left), sourceRect.left + sourceRect.width);
                        drawGap('y', x, sourceRect.top, pos, Math.min(left, sourceRect.left), Math.max(right, sourceRect.left + sourceRect.width), gap);
                    } else {
                        drawLine([0, pos, canvas.width, pos], isPadding);
                    }
                    snappedY = true;
                }
                else if (allowedEdges.includes('center') && Math.abs(center.y - pos) < snapThreshold) {
                    obj.set({ top: obj.top + (pos - center.y) / scaleY });
                    drawLine([0, pos, canvas.width, pos], isPadding);
                    snappedY = true;
                }
            });

            obj.setCoords();
            canvas.requestRenderAll();
        };

        const handleMouseUp = () => {
            clearLines();
            cachedTargets = null;
            canvas.requestRenderAll();
        };

        canvas.on("mouse:down", handleDragStart);
        canvas.on("object:moving", handleMoving);
        canvas.on("mouse:up", handleMouseUp);
        canvas.on("after:render", handleAfterRender);

        return () => {
            canvas.off("mouse:down", handleDragStart);
            canvas.off("object:moving", handleMoving);
            canvas.off("mouse:up", handleMouseUp);
            canvas.off("after:render", handleAfterRender);
            clearLines();
            canvas.requestRenderAll();
        };
    }, [canvas, snapThreshold, edgePadding]);

    return null;
};

export default CanvasSmartGuide;