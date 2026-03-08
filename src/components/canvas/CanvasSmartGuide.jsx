import { useEffect } from 'react';
import * as fabric from 'fabric';
import { useCanvasContext } from '../../context/CanvasContext';

const CanvasSmartGuide = ({ snapThreshold = 15 }) => {
    const { canvas } = useCanvasContext();

    useEffect(() => {
        if (!canvas) return;

        let snapLines = [];

        function drawLine(points) {
            const line = new fabric.Line(points, {
                stroke: '#8e4ae2',
                strokeWidth: 1,
                selectable: false,
                evented: false,
                isSmartGuide: true
            });

            snapLines.push(line);
            canvas.add(line);
        }

        function clearLines() {
            snapLines.forEach(l => canvas.remove(l));
            snapLines = [];
        }

        function getTargets(obj) {
            const targetsX = [];
            const targetsY = [];
            const activeObjects = canvas.getActiveObjects();

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

                        targetsX.push(r.left);
                        targetsX.push(r.left + r.width / 2);
                        targetsX.push(r.left + r.width);

                        targetsY.push(r.top);
                        targetsY.push(r.top + r.height / 2);
                        targetsY.push(r.top + r.height);
                    }

                    // Traverse children if it's a group, but skip if it's the moving object itself or selected
                    if (typeof o.getObjects === 'function' && !isSelfOrSelected) {
                        collectTargets(o);
                    }
                });
            };

            collectTargets(canvas);

            targetsX.push(0);
            targetsX.push(canvas.getWidth() / 2);
            targetsX.push(canvas.getWidth());

            targetsY.push(0);
            targetsY.push(canvas.getHeight() / 2);
            targetsY.push(canvas.getHeight());

            return { targetsX, targetsY };
        }

        const handleMoving = (e) => {
            const obj = e.target;
            if (!obj) return;

            clearLines();

            const rect = obj.getBoundingRect();
            const center = obj.getCenterPoint();

            const left = center.x - rect.width / 2;
            const right = center.x + rect.width / 2;
            const top = center.y - rect.height / 2;
            const bottom = center.y + rect.height / 2;

            const { targetsX, targetsY } = getTargets(obj);

            let snappedX = false;
            let snappedY = false;

            const scaleX = obj.group ? obj.group.scaleX || 1 : 1;
            const scaleY = obj.group ? obj.group.scaleY || 1 : 1;

            targetsX.forEach(pos => {
                if (snappedX) return;

                // SNAP LEFT
                if (Math.abs(left - pos) < snapThreshold) {
                    obj.set({ left: obj.left + (pos - left) / scaleX });
                    drawLine([pos, 0, pos, canvas.height]);
                    snappedX = true;
                }
                // SNAP RIGHT
                else if (Math.abs(right - pos) < snapThreshold) {
                    obj.set({ left: obj.left + (pos - right) / scaleX });
                    drawLine([pos, 0, pos, canvas.height]);
                    snappedX = true;
                }
                // SNAP CENTER X
                else if (Math.abs(center.x - pos) < snapThreshold) {
                    obj.set({ left: obj.left + (pos - center.x) / scaleX });
                    drawLine([pos, 0, pos, canvas.height]);
                    snappedX = true;
                }
            });

            targetsY.forEach(pos => {
                if (snappedY) return;

                // SNAP TOP
                if (Math.abs(top - pos) < snapThreshold) {
                    obj.set({ top: obj.top + (pos - top) / scaleY });
                    drawLine([0, pos, canvas.width, pos]);
                    snappedY = true;
                }
                // SNAP BOTTOM
                else if (Math.abs(bottom - pos) < snapThreshold) {
                    obj.set({ top: obj.top + (pos - bottom) / scaleY });
                    drawLine([0, pos, canvas.width, pos]);
                    snappedY = true;
                }
                // SNAP CENTER Y
                else if (Math.abs(center.y - pos) < snapThreshold) {
                    obj.set({ top: obj.top + (pos - center.y) / scaleY });
                    drawLine([0, pos, canvas.width, pos]);
                    snappedY = true;
                }
            });

            obj.setCoords();
            canvas.renderAll();
        };

        const handleMouseUp = () => {
            clearLines();
            canvas.renderAll();
        };

        canvas.on("object:moving", handleMoving);
        canvas.on("mouse:up", handleMouseUp);

        return () => {
            canvas.off("object:moving", handleMoving);
            canvas.off("mouse:up", handleMouseUp);
            clearLines();
            canvas.renderAll();
        };
    }, [canvas, snapThreshold]);

    return null;
};

export default CanvasSmartGuide;