import { useEffect } from 'react';
import * as fabric from 'fabric';
import { useCanvasContext } from '../../context/CanvasContext';

const CanvasSmartGuideScale = ({ snapThreshold = 15 }) => {
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

        const handleScaling = (e) => {
            const obj = e.target;
            const transform = e.transform;
            if (!obj || !transform) return;

            clearLines();

            const rect = obj.getBoundingRect();
            const corner = transform.corner;
            const center = obj.getCenterPoint();
            const anchor = obj.oCoords[corner];
            if (!anchor) return;

            // Spatially detect side based on anchor position relative to center
            // This works even if the object is rotated
            const isLeft = anchor.x < center.x;
            const isRight = anchor.x > center.x;
            const isTop = anchor.y < center.y;
            const isBottom = anchor.y > center.y;

            const { targetsX, targetsY } = getTargets(obj);

            let snappedX = false;
            let snappedY = false;
            let offsetX = 0;
            let offsetY = 0;

            // Target edges for snapping based on which side is being dragged
            const dragX = isRight ? rect.left + rect.width : (isLeft ? rect.left : null);
            const dragY = isBottom ? rect.top + rect.height : (isTop ? rect.top : null);

            // ==================== TOP LEFT ====================
            if (isLeft && isTop) {
                // Snap horizontal untuk kiri
                // obj.set('originX', 'right');
                // obj.set('originY', 'bottom');


                if (dragX !== null) {
                    targetsX.forEach(pos => {
                        if (snappedX) return;
                        if (Math.abs(dragX - pos) < snapThreshold) {
                            let newWidth = (rect.left + rect.width) - pos;
                            const currentWidth = obj.width * obj.scaleX;
                            const ratio = newWidth / currentWidth;

                            obj.set('scaleX', obj.scaleX * ratio);
                            drawLine([pos, 0, pos, canvas.height]);
                            snappedX = true;
                        }
                    });
                }

                // Snap vertical untuk atas
                if (dragY !== null) {
                    targetsY.forEach(pos => {
                        if (snappedY) return;
                        if (Math.abs(dragY - pos) < snapThreshold) {
                            let newHeight = (rect.top + rect.height) - pos;
                            const currentHeight = obj.height * obj.scaleY;
                            const ratio = newHeight / currentHeight;

                            // obj.set('scaleY', obj.scaleY * ratio);
                            drawLine([0, pos, canvas.width, pos]);
                            snappedY = true;
                        }
                    });
                }
            }

            // ==================== TOP RIGHT ====================
            else if (isTop && isRight) {
                if (dragX !== null) {
                    targetsX.forEach(pos => {
                        if (snappedX) return;
                        if (Math.abs(dragX - pos) < snapThreshold) {
                            let newWidth = pos - rect.left;
                            const currentWidth = obj.width * obj.scaleX;
                            const ratio = newWidth / currentWidth;

                            // obj.set('scaleX', obj.scaleX * ratio);
                            drawLine([pos, 0, pos, canvas.height]);
                            snappedX = true;
                        }
                    });
                }

                if (dragY !== null) {
                    targetsY.forEach(pos => {
                        if (snappedY) return;
                        if (Math.abs(dragY - pos) < snapThreshold) {
                            let newHeight = (rect.top + rect.height) - pos;
                            const currentHeight = obj.height * obj.scaleY;
                            const ratio = newHeight / currentHeight;

                            // obj.set('scaleY', obj.scaleY * ratio);
                            drawLine([0, pos, canvas.width, pos]);
                            snappedY = true;
                        }
                    });
                }
            }

            // ==================== BOTTOM LEFT ====================
            else if (isBottom && isLeft) {
                if (dragX !== null) {
                    targetsX.forEach(pos => {
                        if (snappedX) return;
                        if (Math.abs(dragX - pos) < snapThreshold) {
                            let newWidth = (rect.left + rect.width) - pos;
                            const currentWidth = obj.width * obj.scaleX;
                            const ratio = newWidth / currentWidth;

                            // obj.set('scaleX', obj.scaleX * ratio);
                            drawLine([pos, 0, pos, canvas.height]);
                            snappedX = true;
                        }
                    });
                }

                if (dragY !== null) {
                    targetsY.forEach(pos => {
                        if (snappedY) return;
                        if (Math.abs(dragY - pos) < snapThreshold) {
                            let newHeight = pos - rect.top;
                            const currentHeight = obj.height * obj.scaleY;
                            const ratio = newHeight / currentHeight;

                            // obj.set('scaleY', obj.scaleY * ratio);
                            drawLine([0, pos, canvas.width, pos]);
                            snappedY = true;
                        }
                    });
                }
            }

            // ==================== BOTTOM RIGHT ====================
            else if (isBottom && isRight) {
                if (dragX !== null) {
                    targetsX.forEach(pos => {
                        if (snappedX) return;
                        if (Math.abs(dragX - pos) < snapThreshold) {
                            let newWidth = pos - rect.left;
                            const currentWidth = obj.width * obj.scaleX;
                            const ratio = newWidth / currentWidth;

                            // obj.set('scaleX', obj.scaleX * ratio);
                            drawLine([pos, 0, pos, canvas.height]);
                            snappedX = true;
                        }
                    });
                }

                if (dragY !== null) {
                    targetsY.forEach(pos => {
                        if (snappedY) return;
                        if (Math.abs(dragY - pos) < snapThreshold) {
                            let newHeight = pos - rect.top;
                            const currentHeight = obj.height * obj.scaleY;
                            const ratio = newHeight / currentHeight;

                            // obj.set('scaleY', obj.scaleY * ratio);
                            drawLine([0, pos, canvas.width, pos]);
                            snappedY = true;
                        }
                    });
                }
            }
            obj.setCoords();
            canvas.renderAll();
        };

        const handleMouseUp = (e) => {
            clearLines();

            const obj = e.target;
            // obj.set('originX', 'center');
            // obj.set('originY', 'center');
            // obj.setCoords();


            canvas.renderAll();
        };

        canvas.on("object:scaling", handleScaling);
        canvas.on("mouse:up", handleMouseUp);

        return () => {
            canvas.off("object:scaling", handleScaling);
            canvas.off("mouse:up", handleMouseUp);
            clearLines();
            canvas.renderAll();
        };
    }, [canvas, snapThreshold]);

    return null;
};

export default CanvasSmartGuideScale;
