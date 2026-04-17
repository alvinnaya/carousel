import React, { useState, useEffect } from 'react';
import { useCanvasContext } from '../../../context/CanvasContext';
import ContextMenu from '../../shared/ContextMenu';
import { useCanvasActions, MenuSection, Divider, MenuButton } from '../../canvas/CanvasContextMenu';
import TemplateSaveModal from '../../modals/TemplateSaveModal';
import Toast from '../../shared/Toast';
import textTemplateService from '../../../api/textTemplateService';
import { captureObjectAsHDImage, getDeepPresetCategory } from '../../../utils/typographyCapture';

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
    const [activeObject, setActiveObject] = useState(null);
    const {
        isVisible,
        setIsVisible,
        position,
        setPosition,
        handleAction,
        isSelection,
        isGroup,
        clipboard
    } = useCanvasActions();

    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [templateApiError, setTemplateApiError] = useState('');
    const [toastState, setToastState] = useState({ message: '', type: 'success' });
    const [currentPreviewUrl, setCurrentPreviewUrl] = useState(null);
    const [captureData, setCaptureData] = useState(null);
    const [detectedCategory, setDetectedCategory] = useState(null);

    const handleSaveAsTemplateClick = async () => {
        try {
            // Deep recursive category detection
            const preset = getDeepPresetCategory(activeObject);
            if (!preset) {
                setToastState({ message: 'Could not determine element category.', type: 'error' });
                return;
            }

            setDetectedCategory(preset.category);

            const data = await captureObjectAsHDImage(activeObject);
            if (data) {
                setCaptureData(data);
                setCurrentPreviewUrl(data.dataUrl);
                setIsTemplateModalOpen(true);
            }
        } catch (error) {
            console.error('Failed to capture high quality preview:', error);
            setToastState({ message: 'Failed to generate preview for template.', type: 'error' });
        }
    };

    const handleSaveTemplate = async (templateName) => {
        if (!captureData) return;

        setIsSavingTemplate(true);
        setTemplateApiError('');
        try {
            const formData = new FormData();
            formData.append('name', templateName);
            formData.append('canvasJson', JSON.stringify(captureData.json));
            formData.append('previewImage', captureData.file);
            formData.append('category', detectedCategory || 'Group');
            formData.append('type', 'JSON');

            const response = await textTemplateService.createTextTemplate(formData);

            if (response && response.success !== false) {
                setIsTemplateModalOpen(false);
                setCaptureData(null);
                setCurrentPreviewUrl(null);
                setDetectedCategory(null);
                setToastState({ message: 'Style saved successfully!', type: 'success' });
            } else {
                const errorMsg = response?.message || 'Failed to save template.';
                console.error(errorMsg);
                setTemplateApiError(errorMsg);
            }
        } catch (error) {
            console.error('Error saving template:', error);
            const errorMsg = error.response?.data?.message || error.message || 'An unexpected error occurred.';
            setTemplateApiError(errorMsg);
        } finally {
            setIsSavingTemplate(false);
        }
    };

    useEffect(() => {
        if (!canvas) return;

        const updateActive = () => {
            setActiveObject(canvas.getActiveObject());
        };

        const clearActive = () => {
            setActiveObject(null);
        };

        const handleRemoved = (e) => {
            if (e.target === activeObject) {
                setActiveObject(null);
            }
        };

        canvas.on({
            'selection:created': updateActive,
            'selection:updated': updateActive,
            'selection:cleared': clearActive,
            'object:removed': handleRemoved
        });

        // Initialize active object
        setActiveObject(canvas.getActiveObject());

        return () => {
            canvas.off({
                'selection:created': updateActive,
                'selection:updated': updateActive,
                'selection:cleared': clearActive,
                'object:removed': handleRemoved
            });
        };
    }, [canvas]);

    const elements = canvas
        ? [...canvas.getObjects()]
            .filter((obj) => !obj.isArtboard)
            .reverse()
            .map((obj) => buildElementNode(obj, null))
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
        const isActive = activeObject === el.ref;

        return (
            <React.Fragment key={el.id}>
                <div
                    draggable
                    className={`mus-layer-card group
                        ${isDragged ? 'mus-element-dragged' : ''}
                        ${isActive ? 'mus-layer-card-active z-10' : ''}
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
                    onContextMenu={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        // Select the object first
                        canvas.setActiveObject(el.ref);
                        canvas.requestRenderAll();

                        setPosition({ x: event.clientX, y: event.clientY });
                        setIsVisible(true);
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
                            className={`mus-element-drop-indicator transition-all duration-200
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

                    <div className="mus-layer-card-preview">
                        {el.preview ? (
                            <img src={el.preview} alt={el.type} className="max-w-full max-h-full object-contain" />
                        ) : (
                            <div className="text-[10px] mus-text-muted font-black uppercase text-center">{el.type.charAt(0)}</div>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="mus-tool-label !text-[9px] mb-0.5">{el.type}</span>
                        <span className="text-[11px] font-bold mus-text-primary truncate">
                            {el.type === 'group' ? `Group (${el.children.length})` :
                                el.ref.text ? (el.ref.text.length > 20 ? el.ref.text.substring(0, 20) + '...' : el.ref.text) : 'Element'}
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
                    <p className="mus-tool-label">No elements found</p>
                </div>
            )}

            {/* Context Menu */}
            <ContextMenu
                x={position.x}
                y={position.y}
                isOpen={isVisible}
                onClose={() => setIsVisible(false)}
            >
                {activeObject ? (
                    <>
                        <MenuSection>
                            <MenuButton label="Copy" icon="⌘C" onClick={() => { handleAction('copy'); setIsVisible(false); }} />
                            <MenuButton label="Duplicate" icon="⌘D" onClick={() => { handleAction('duplicate'); setIsVisible(false); }} />
                            {clipboard && <MenuButton label="Paste" icon="⌘V" onClick={() => { handleAction('paste'); setIsVisible(false); }} />}
                        </MenuSection>

                        <Divider />

                        <MenuSection>
                            <MenuButton label="Bring Forward" icon="]" onClick={() => { handleAction('bringForward'); setIsVisible(false); }} />
                            <MenuButton label="Bring to Front" icon="⇧]" onClick={() => { handleAction('bringToFront'); setIsVisible(false); }} />
                            <MenuButton label="Send Backward" icon="[" onClick={() => { handleAction('sendBackward'); setIsVisible(false); }} />
                            <MenuButton label="Send to Back" icon="⇧[" onClick={() => { handleAction('sendToBack'); setIsVisible(false); }} />
                        </MenuSection>

                        <Divider />

                        <MenuSection>
                            {isSelection && <MenuButton label="Group" icon="⌘G" onClick={() => { handleAction('group'); setIsVisible(false); }} />}
                            {isGroup && <MenuButton label="Ungroup" icon="⇧⌘G" onClick={() => { handleAction('ungroup'); setIsVisible(false); }} />}
                            <MenuButton label="Save as Element Preset" onClick={() => { setIsVisible(false); handleSaveAsTemplateClick(); }} />
                            <MenuButton label="Delete" icon="⌫" onClick={() => { handleAction('delete'); setIsVisible(false); }} variant="danger" />
                        </MenuSection>
                    </>
                ) : (
                    <MenuSection>
                        {clipboard ? (
                            <MenuButton label="Paste" icon="⌘V" onClick={() => { handleAction('paste'); setIsVisible(false); }} />
                        ) : (
                            <div className="px-4 py-2.5 mus-text-muted text-[10px] font-bold uppercase tracking-widest italic opacity-50">
                                No Element Selected
                            </div>
                        )}
                    </MenuSection>
                )}
            </ContextMenu>
            
            <TemplateSaveModal
                isOpen={isTemplateModalOpen}
                onClose={() => {
                    if (!isSavingTemplate) {
                        setIsTemplateModalOpen(false);
                        setCaptureData(null);
                        setCurrentPreviewUrl(null);
                        setTemplateApiError('');
                    }
                }}
                onSave={handleSaveTemplate}
                isLoading={isSavingTemplate}
                previewUrl={currentPreviewUrl}
                apiError={templateApiError}
                detectedCategory={detectedCategory}
            />

            {toastState.message && (
                <Toast
                    message={toastState.message}
                    type={toastState.type}
                    onClose={() => setToastState({ message: '', type: 'success' })}
                />
            )}
        </div>
    );
};

export default ElementsPanel;
