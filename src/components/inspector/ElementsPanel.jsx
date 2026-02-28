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
    const [dropPosition, setDropPosition] = useState(null); // 'top' or 'bottom'
    const [expandedIds, setExpandedIds] = useState(new Set());

    const elements = canvas
        ? [...canvas.getObjects()].reverse().map((obj) => buildElementNode(obj, null))
        : [];

    const toggleExpand = (id) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleDrop = (targetItem) => {
        if (!canvas || !draggedItem || draggedItem.ref === targetItem.ref) return;

        const sourceParent = draggedItem.parentRef || canvas;
        const targetParent = targetItem.parentRef || canvas;

        // Reordering only allowed inside same parent container.
        if (sourceParent !== targetParent) return;

        const siblings = sourceParent.getObjects();
        const currentIndex = siblings.indexOf(draggedItem.ref);
        const targetIndex = siblings.indexOf(targetItem.ref);

        if (targetIndex < 0) return;

        let finalTargetIndex = targetIndex;
        if (currentIndex < targetIndex) {
            finalTargetIndex = dropPosition === 'top' ? targetIndex : targetIndex - 1;
        } else {
            finalTargetIndex = dropPosition === 'top' ? targetIndex + 1 : targetIndex;
        }

        sourceParent.moveObjectTo(draggedItem.ref, finalTargetIndex);
        canvas.fire('object:modified', { target: draggedItem.ref });
        canvas.requestRenderAll();

        setDraggedItem(null);
        setDropTargetId(null);
        setDropPosition(null);
    };

    const renderElementItem = (el, depth = 0) => {
        const isDragged = draggedItem?.id === el.id;
        const isDropTarget = dropTargetId === el.id;
        const hasChildren = el.children && el.children.length > 0;
        const isExpanded = expandedIds.has(el.id);

        return (
            <React.Fragment key={el.id}>
                <div
                    draggable
                    className={`relative flex items-center p-2 rounded-xl border cursor-pointer transition-all duration-200 group
                        ${isDragged ? 'opacity-40 grayscale scale-95 border-dashed border-[#E8C04A]' : 'mus-surface hover:border-[#1A1A1A] hover:bg-white'}
                    `}
                    style={{ marginLeft: `${depth * 16}px` }}
                    onClick={() => {
                        // In Fabric 7 with interactive groups, we can select the member directly
                        canvas.setActiveObject(el.ref);
                        canvas.requestRenderAll();
                    }}
                    onDragStart={(event) => {
                        event.dataTransfer.setData('text/plain', el.id);
                        event.dataTransfer.effectAllowed = 'move';
                        setDraggedItem(el);

                        // Set drag image
                        const ghost = event.currentTarget.cloneNode(true);
                        ghost.style.opacity = '0.5';
                        ghost.style.position = 'absolute';
                        ghost.style.top = '-1000px';
                        document.body.appendChild(ghost);

                        // Calculate offset based on click position relative to the element
                        const rect = event.currentTarget.getBoundingClientRect();
                        const xOffset = event.clientX - rect.left;
                        const yOffset = event.clientY - rect.top;

                        event.dataTransfer.setDragImage(ghost, xOffset, yOffset);
                        setTimeout(() => document.body.removeChild(ghost), 0);
                    }}
                    onDragOver={(event) => {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = 'move';

                        const rect = event.currentTarget.getBoundingClientRect();
                        const y = event.clientY - rect.top;
                        const position = y < rect.height / 2 ? 'top' : 'bottom';

                        if (dropTargetId !== el.id || dropPosition !== position) {
                            setDropTargetId(el.id);
                            setDropPosition(position);
                        }
                    }}
                    onDragLeave={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        if (
                            event.clientX < rect.left ||
                            event.clientX >= rect.right ||
                            event.clientY < rect.top ||
                            event.clientY >= rect.bottom
                        ) {
                            setDropTargetId(null);
                            setDropPosition(null);
                        }
                    }}
                    onDrop={(event) => {
                        event.preventDefault();
                        handleDrop(el);
                    }}
                    onDragEnd={() => {
                        setDropTargetId(null);
                        setDropPosition(null);
                        setDraggedItem(null);
                    }}
                >
                    {/* Drop Indicator Line */}
                    {isDropTarget && draggedItem?.id !== el.id && (
                        <div
                            className={`absolute left-0 right-0 h-0.5 bg-[#E8C04A] z-50 rounded-full transition-all duration-200 shadow-[0_0_8px_rgba(232,192,74,0.5)]
                                ${dropPosition === 'top' ? '-top-1' : '-bottom-1'}
                            `}
                        />
                    )}

                    {/* Toggle Button for Groups */}
                    <div
                        className="w-4 flex items-center justify-center mr-1"
                        onClick={(e) => {
                            if (hasChildren) {
                                e.stopPropagation();
                                toggleExpand(el.id);
                            }
                        }}
                    >
                        {hasChildren && (
                            <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </div>
                        )}
                    </div>

                    <div className="w-10 h-10 rounded-lg bg-white border mus-border-light flex items-center justify-center mr-3 overflow-hidden shadow-inner flex-shrink-0">
                        {el.preview ? (
                            <img src={el.preview} alt={el.type} className="max-w-full max-h-full object-contain" />
                        ) : (
                            <div className="text-[10px] mus-text-muted font-black uppercase">{el.type.charAt(0)}</div>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-black mus-text-muted uppercase tracking-widest">{el.type}</span>
                        <span className="text-xs font-semibold text-zinc-800 truncate">
                            {el.type === 'group' ? `Group (${el.children.length})` :
                                el.ref.text ? (el.ref.text.length > 15 ? el.ref.text.substring(0, 15) + '...' : el.ref.text) : 'Element'}
                        </span>
                    </div>
                </div>

                {isExpanded && el.children.map((child) => renderElementItem(child, depth + 1))}
            </React.Fragment>
        );
    };

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
