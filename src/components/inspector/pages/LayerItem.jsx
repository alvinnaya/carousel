import React, { useState } from 'react';
import LayerThumbnail from './LayerThumbnail';
import SmartDropdown from '../../shared/SmartDropdown';
import ContextMenu from '../../shared/ContextMenu';

const LayerItem = ({
    index,
    canvasJSON,
    previewUrl,
    aspectRatio,
    isActive,
    isDragged,
    isDropTarget,
    dropPosition,
    draggedIndex,
    isDropdownOpen,
    onSetActive,
    setDraggedIndex,
    setDropTargetIndex,
    setDropPosition,
    handleDrop,
    toggleDropdown,
    closeDropdown,
    onDuplicate,
    onInsert,
    onDelete,
    canDelete,
    onSaveAsTemplate
}) => {
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

    const itemAspectRatio = (canvasJSON.width && canvasJSON.height)
        ? canvasJSON.width / canvasJSON.height
        : aspectRatio;

    return (
        <div
            draggable
            className={`relative group transition-all duration-300 flex justify-center w-full mx-auto ${isDragged ? 'z-0' : 'z-10'}`}
            onContextMenu={(e) => {
                e.preventDefault();
                setMenuPosition({ x: e.clientX, y: e.clientY });
                setIsMenuVisible(true);
            }}
            onClick={onSetActive}
            onDragStart={(event) => {
                event.dataTransfer.setData('text/plain', `${index}`);
                event.dataTransfer.effectAllowed = 'move';
                setDraggedIndex(index);
            }}
            onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';

                const rect = event.currentTarget.getBoundingClientRect();
                const y = event.clientY - rect.top;
                const position = y < rect.height / 2 ? 'top' : 'bottom';

                if (!isDropTarget || dropPosition !== position) {
                    setDropTargetIndex(index);
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
                    setDropTargetIndex(null);
                    setDropPosition(null);
                }
            }}
            onDrop={(event) => {
                event.preventDefault();
                handleDrop();
            }}
            onDragEnd={() => {
                setDraggedIndex(null);
                setDropTargetIndex(null);
                setDropPosition(null);
            }}
        >
            {/* Drop Indicator Line */}
            {isDropTarget && draggedIndex !== index && (
                <div
                    className={`mus-element-drop-indicator transition-all duration-200
                        ${dropPosition === 'top' ? '-top-3' : '-bottom-3'}
                    `}
                />
            )}

            <div
                className={`
                    relative rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-200
                    ${isActive ? 'mus-element-item-active' : 'mus-element-item'}
                    ${isDragged ? 'mus-element-dragged' : ''}
                `}
                style={{
                    width: '100%',
                    aspectRatio: '1 / 1'
                }}
            >
                <div className="absolute top-2 left-2 z-10 text-[10px] font-bold text-[var(--text-muted)] mus-bg-surface mus-border-soft px-1.5 rounded-md">
                    {index + 1}
                </div>

                <div className="absolute bottom-2 right-2 z-20">
                    <SmartDropdown
                        isOpen={isDropdownOpen}
                        onClose={closeDropdown}
                        trigger={
                            <button
                                className="p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all mus-button-ghost"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleDropdown();
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="1"></circle>
                                    <circle cx="19" cy="12" r="1"></circle>
                                    <circle cx="5" cy="12" r="1"></circle>
                                </svg>
                            </button>
                        }
                    >
                        <div className="mus-menu-container min-w-[140px]">
                            <button
                                className="mus-menu-item"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDuplicate();
                                }}
                            >
                                Duplicate
                            </button>
                            <button
                                className="mus-menu-item"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onInsert();
                                }}
                            >
                                Add New
                            </button>
                            <button
                                className="mus-menu-item"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSaveAsTemplate();
                                    closeDropdown();
                                }}
                            >
                                Save as Template
                            </button>
                            <button
                                className="mus-menu-item mus-menu-item-danger"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (canDelete) onDelete();
                                }}
                                disabled={!canDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </SmartDropdown>
                </div>

                <div className="w-full h-full p-2">
                    <LayerThumbnail previewUrl={previewUrl} />
                </div>
            </div>

            <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            </div>

            <ContextMenu
                x={menuPosition.x}
                y={menuPosition.y}
                isOpen={isMenuVisible}
                onClose={() => setIsMenuVisible(false)}
            >
                <div className="mus-menu-container">
                    <button
                        className="mus-menu-item"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDuplicate();
                            setIsMenuVisible(false);
                        }}
                    >
                        <span>Duplicate</span>
                        <span className="text-[9px] opacity-40 ml-3 font-black">⌘D</span>
                    </button>
                    <button
                        className="mus-menu-item"
                        onClick={(e) => {
                            e.stopPropagation();
                            onInsert();
                            setIsMenuVisible(false);
                        }}
                    >
                        <span>Add New</span>
                        <span className="text-[9px] opacity-40 ml-3 font-black">⌘N</span>
                    </button>
                    <button
                        className="mus-menu-item"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSaveAsTemplate();
                            setIsMenuVisible(false);
                        }}
                    >
                        <span>Save as Template</span>
                    </button>
                    <button
                        className="mus-menu-item mus-menu-item-danger"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (canDelete) {
                                onDelete();
                                setIsMenuVisible(false);
                            }
                        }}
                        disabled={!canDelete}
                    >
                        <span>Delete</span>
                        <span className="text-[9px] opacity-40 ml-3 font-black">DEL</span>
                    </button>
                </div>
            </ContextMenu>
        </div>
    );
};

export default LayerItem;
