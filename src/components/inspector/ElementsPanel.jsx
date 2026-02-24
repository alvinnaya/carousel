import React, { useState } from 'react';
import { useCanvasContext } from '../../context/CanvasContext';

const ensureStableId = (obj) => {
    if (!obj.__elementsPanelId) {
        obj.__elementsPanelId = `el-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }
    return obj.__elementsPanelId;
};

const buildElementNode = (obj, parentRef = null) => {
    let preview = '';
    try {
        const padding = 10;
        const size = 64;
        const scale = (size - padding * 2) / Math.max(obj.width * obj.scaleX, obj.height * obj.scaleY, 1);
        const tempCanvas = obj.toCanvasElement({
            multiplier: scale,
        });
        preview = tempCanvas.toDataURL();
    } catch (e) {
        console.warn('Could not generate preview for object:', obj.type, e);
    }

    const children = obj.type === 'group' && typeof obj.getObjects === 'function'
        ? [...obj.getObjects()]
            .reverse()
            .map((child) => buildElementNode(child, obj))
        : [];

    return {
        id: ensureStableId(obj),
        type: obj.type,
        preview,
        ref: obj,
        parentRef,
        children,
    };
};

/**
 * ElementsPanel - Lists and manages individual objects on the current canvas.
 */
const ElementsPanel = () => {
    const { canvas } = useCanvasContext();
    const [draggedItem, setDraggedItem] = useState(null);
    const [dropTargetId, setDropTargetId] = useState(null);

    const elements = canvas
        ? [...canvas.getObjects()].reverse().map((obj) => buildElementNode(obj, null))
        : [];

    const handleDrop = (targetItem) => {
        if (!canvas || !draggedItem || draggedItem.ref === targetItem.ref) return;

        const sourceParent = draggedItem.parentRef || canvas;
        const targetParent = targetItem.parentRef || canvas;

        // Keep behavior predictable: reordering is only allowed inside same parent container.
        if (sourceParent !== targetParent) return;

        const siblings = sourceParent.getObjects();
        const targetIndex = siblings.indexOf(targetItem.ref);
        if (targetIndex < 0) return;

        sourceParent.moveObjectTo(draggedItem.ref, targetIndex);
        canvas.fire('object:modified', { target: draggedItem.ref });
        canvas.requestRenderAll();
    };

    const renderElementItem = (el, depth = 0) => (
        <React.Fragment key={el.id}>
            <div
                draggable
                className={`flex items-center p-2 rounded-lg border hover:border-zinc-300 hover:bg-white cursor-pointer transition-all group shadow-sm ${dropTargetId === el.id ? 'bg-zinc-100 border-zinc-400' : 'bg-zinc-50 border-zinc-100'
                    }`}
                style={{ marginLeft: `${depth * 16}px` }}
                onClick={() => {
                    const selectableTarget = el.parentRef ? el.parentRef : el.ref;
                    canvas.setActiveObject(selectableTarget);
                    canvas.requestRenderAll();
                }}
                onDragStart={(event) => {
                    event.dataTransfer.setData('text/plain', el.id);
                    event.dataTransfer.effectAllowed = 'move';
                    setDraggedItem(el);
                }}
                onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                    setDropTargetId(el.id);
                }}
                onDragLeave={() => {
                    setDropTargetId((current) => (current === el.id ? null : current));
                }}
                onDrop={(event) => {
                    event.preventDefault();
                    setDropTargetId(null);
                    handleDrop(el);
                }}
                onDragEnd={() => {
                    setDropTargetId(null);
                    setDraggedItem(null);
                }}
            >
                <div className="w-10 h-10 rounded-md bg-white border border-zinc-100 flex items-center justify-center mr-3 overflow-hidden shadow-inner">
                    {el.preview ? (
                        <img src={el.preview} alt={el.type} className="max-w-full max-h-full object-contain" />
                    ) : (
                        <div className="text-[10px] text-zinc-400 font-bold uppercase">{el.type.charAt(0)}</div>
                    )}
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{el.type}</span>
                    <span className="text-xs font-semibold text-zinc-800">
                        {el.type === 'group' ? `Group (${el.children.length})` : 'Element'}
                    </span>
                </div>
            </div>

            {el.children.map((child) => renderElementItem(child, depth + 1))}
        </React.Fragment>
    );

    return (
        <div className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
            {elements.map((el) => renderElementItem(el))}

            {elements.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2 opacity-30">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p className="text-[10px] font-bold">No elements found</p>
                </div>
            )}
        </div>
    );
};

export default ElementsPanel;
