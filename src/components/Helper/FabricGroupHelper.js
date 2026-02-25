import * as fabric from 'fabric';

/**
 * Cleanup Zombie Groups (0 members) and Dissolve Single-member Groups (1 member)
 * @param {fabric.Canvas} canvas 
 */
export const cleanupZombieGroups = (canvas) => {
    const allGroups = canvas.getObjects().filter(obj => obj.type === 'group');

    allGroups.forEach(g => {
        const remaining = g.getObjects();
        if (remaining.length === 0) {
            console.log("Cleaning up empty zombie group");
            canvas.remove(g);
        } else if (remaining.length === 1) {
            console.log("Dissolving single-member group");
            const lastObj = g.removeAll()[0];
            canvas.remove(g);
            canvas.add(lastObj);
        } else {
            canvas.fire('object:modified', { target: g });
        }
    });
};

/**
 * Safely delete selected objects and cleanup their parents
 * @param {fabric.Canvas} canvas 
 */
export const deleteSelectedObjects = (canvas) => {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    const isSelection = activeObject instanceof fabric.ActiveSelection;
    const toDelete = isSelection ? activeObject.removeAll() : [activeObject];

    const allGroups = canvas.getObjects().filter(obj => obj.type === 'group');

    toDelete.forEach(obj => {
        allGroups.forEach(g => {
            if (g.contains && g.contains(obj)) {
                g.remove(obj);
            }
        });
        canvas.remove(obj);
    });

    cleanupZombieGroups(canvas);

    if (isSelection) canvas.remove(activeObject);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
};

/**
 * Group selected objects with deep detach and zombie cleanup
 * @param {fabric.Canvas} canvas 
 */
export const groupSelectedObjects = (canvas) => {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || !(activeObject instanceof fabric.ActiveSelection)) return;

    console.log("Grouping in Fabric 7 - Helpered Clean Ownership");
    const objects = activeObject.removeAll();

    // Triple Detach:
    // 1. Remove from Canvas root (ActiveSelection.removeAll() adds them there)
    objects.forEach(obj => canvas.remove(obj));

    // 2. Remove from any other groups
    const allGroups = canvas.getObjects().filter(obj => obj.type === 'group');
    objects.forEach(obj => {
        allGroups.forEach(g => {
            if (g.contains && g.contains(obj)) g.remove(obj);
        });
    });

    // 3. Cleanup Zombie/Single groups left behind
    cleanupZombieGroups(canvas);

    // Remove the selection container
    canvas.remove(activeObject);

    // Create the new permanent Group
    const group = new fabric.Group(objects, {
        interactive: true,
        subTargetCheck: true
    });

    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.requestRenderAll();
};

/**
 * Ungroup selected group
 * @param {fabric.Canvas} canvas 
 */
export const ungroupSelectedObjects = (canvas) => {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'group') return;

    console.log("Ungrouping in Fabric 7 - Helpered");
    const objects = activeObject.removeAll();
    canvas.remove(activeObject);

    // Restore individual objects to canvas
    canvas.add(...objects);

    // Create a temporary ActiveSelection for UX consistency
    const activeSelection = new fabric.ActiveSelection(objects, { canvas });
    canvas.setActiveObject(activeSelection);
    canvas.requestRenderAll();
};
