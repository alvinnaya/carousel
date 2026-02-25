import { useState, useEffect, useCallback } from 'react';
import { useCanvasContext } from '../../context/CanvasContext';
import * as fabric from 'fabric';
import {
    groupSelectedObjects,
    ungroupSelectedObjects,
    deleteSelectedObjects
} from '../Helper/FabricGroupHelper';

const CanvasContextMenu = () => {
    const { canvas, clipboard, setClipboard } = useCanvasContext();
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleContextMenu = useCallback((opt) => {
        const { e } = opt;
        if (!canvas) return;

        e.preventDefault();
        e.stopPropagation();

        const target = opt.target;

        // Use client coordinates for the floating menu position
        setPosition({ x: e.clientX, y: e.clientY });
        setIsVisible(true);

        console.log("Context menu triggered on canvas. Target:", target ? target.type : "none");
    }, [canvas]);

    const handleClick = useCallback(() => {
        setIsVisible(false);
    }, []);

    useEffect(() => {
        if (!canvas) return;

        canvas.fireRightClick = true;
        canvas.stopContextMenu = true;
        canvas.subTargetCheck = true;

        canvas.on('contextmenu', handleContextMenu);
        canvas.on('mouse:down', handleClick);

        window.addEventListener('click', handleClick);

        const handleGlobalContextMenu = (e) => {
            const isCanvasClick = canvas.upperCanvasEl?.contains(e.target) ||
                canvas.lowerCanvasEl?.contains(e.target);
            if (!isCanvasClick) {
                setIsVisible(false);
            }
        };
        window.addEventListener('contextmenu', handleGlobalContextMenu);

        return () => {
            canvas.off('contextmenu', handleContextMenu);
            canvas.off('mouse:down', handleClick);
            window.removeEventListener('click', handleClick);
            window.removeEventListener('contextmenu', handleGlobalContextMenu);
        };
    }, [canvas, handleContextMenu, handleClick]);

    if (!isVisible) return null;

    const activeObject = canvas?.getActiveObject();
    const isSelection = activeObject instanceof fabric.ActiveSelection;
    const isGroup = activeObject?.type === 'group';

    const handleAction = async (action) => {
        if (!canvas) return;

        switch (action) {
            case 'copy':
                if (activeObject) {
                    const cloned = await activeObject.clone();
                    setClipboard(cloned);
                }
                break;
            case 'paste':
                if (clipboard) {
                    const clonedObj = await clipboard.clone();
                    canvas.discardActiveObject();
                    clonedObj.set({
                        left: clonedObj.left + 20,
                        top: clonedObj.top + 20,
                        evented: true,
                    });
                    if (clonedObj instanceof fabric.ActiveSelection) {
                        clonedObj.canvas = canvas;
                        clonedObj.forEachObject((obj) => canvas.add(obj));
                        clonedObj.setCoords();
                    } else {
                        canvas.add(clonedObj);
                    }
                    // Update clipboard position
                    const nextClipboard = await clipboard.clone();
                    nextClipboard.set({ left: nextClipboard.left + 20, top: nextClipboard.top + 20 });
                    setClipboard(nextClipboard);

                    canvas.setActiveObject(clonedObj);
                }
                break;
            case 'duplicate':
                if (activeObject) {
                    const cloned = await activeObject.clone();
                    canvas.discardActiveObject();
                    cloned.set({
                        left: cloned.left + 20,
                        top: cloned.top + 20,
                        evented: true,
                    });
                    if (cloned instanceof fabric.ActiveSelection) {
                        cloned.canvas = canvas;
                        cloned.forEachObject((obj) => {
                            canvas.add(obj);
                        });
                        cloned.setCoords();
                    } else {
                        canvas.add(cloned);
                    }
                    canvas.setActiveObject(cloned);
                }
                break;
            case 'delete':
                if (activeObject) {
                    // removeAll() restores coordinates AND adds objects to canvas 
                    // if selection has a canvas. We need to catch that.
                    const toDelete = isSelection ? activeObject.removeAll() : [activeObject];

                    // 1. Collect all groups for cleanup
                    const allGroups = canvas.getObjects().filter(obj => obj.type === 'group');

                    // 2. Remove objects from groups and canvas
                    toDelete.forEach(obj => {
                        // Remove from any group it might be in
                        allGroups.forEach(g => {
                            if (g.contains && g.contains(obj)) {
                                g.remove(obj);
                                canvas.fire('object:modified', { target: g });
                            }
                        });
                        // IMPORTANT: remove from canvas as well
                        canvas.remove(obj);
                    });

                    // Remove the selection container if it's still there
                    if (isSelection) canvas.remove(activeObject);
                    canvas.discardActiveObject();
                }
                break;
            case 'group':
                groupSelectedObjects(canvas);
                break;
            case 'ungroup':
                ungroupSelectedObjects(canvas);
                break;
            case 'bringToFront':
                if (activeObject) canvas.bringObjectToFront(activeObject);
                break;
            case 'sendToBack':
                if (activeObject) canvas.sendObjectToBack(activeObject);
                break;
            case 'bringForward':
                if (activeObject) canvas.bringObjectForward(activeObject);
                break;
            case 'sendBackward':
                if (activeObject) canvas.sendObjectBackwards(activeObject);
                break;
            default:
                break;
        }
        canvas.requestRenderAll();
        setIsVisible(false);
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: position.y,
                left: position.x,
                zIndex: 999999,
                background: '#1c1c1e',
                border: '1px solid #3a3a3c',
                borderRadius: '12px',
                padding: '6px 0',
                minWidth: '200px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
                backdropFilter: 'blur(20px)',
                userSelect: 'none'
            }}
        >
            {activeObject ? (
                <>
                    <MenuSection>
                        <MenuButton label="Copy" icon="⌘C" onClick={() => handleAction('copy')} />
                        <MenuButton label="Duplicate" icon="⌘D" onClick={() => handleAction('duplicate')} />
                        {clipboard && <MenuButton label="Paste" icon="⌘V" onClick={() => handleAction('paste')} />}
                    </MenuSection>

                    <Divider />

                    <MenuSection>
                        <MenuButton label="Bring Forward" icon="]" onClick={() => handleAction('bringForward')} />
                        <MenuButton label="Bring to Front" icon="⇧]" onClick={() => handleAction('bringToFront')} />
                        <MenuButton label="Send Backward" icon="[" onClick={() => handleAction('sendBackward')} />
                        <MenuButton label="Send to Back" icon="⇧[" onClick={() => handleAction('sendToBack')} />
                    </MenuSection>

                    <Divider />

                    <MenuSection>
                        {isSelection && <MenuButton label="Group" icon="⌘G" onClick={() => handleAction('group')} />}
                        {isGroup && <MenuButton label="Ungroup" icon="⇧⌘G" onClick={() => handleAction('ungroup')} />}
                        <MenuButton label="Delete" icon="⌫" onClick={() => handleAction('delete')} variant="danger" />
                    </MenuSection>
                </>
            ) : (
                <MenuSection>
                    {clipboard ? (
                        <MenuButton label="Paste" icon="⌘V" onClick={() => handleAction('paste')} />
                    ) : (
                        <div style={{ padding: '10px 16px', color: '#8e8e93', fontSize: '13px', fontStyle: 'italic' }}>
                            Empty Canvas
                        </div>
                    )}
                </MenuSection>
            )}
        </div>
    );
};

const MenuSection = ({ children }) => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
        {children}
    </div>
);

const Divider = () => (
    <div style={{ height: '1px', background: '#3a3a3c', margin: '4px 0' }} />
);

const MenuButton = ({ label, onClick, icon, variant = 'default' }) => (
    <div
        onClick={(e) => {
            e.stopPropagation();
            onClick();
        }}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        style={{
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: variant === 'danger' ? '#ff453a' : '#ffffff',
            transition: 'background 0.15s ease',
        }}
    >
        <span>{label}</span>
        {icon && <span style={{ fontSize: '10px', opacity: 0.4, marginLeft: '12px', fontWeight: '500' }}>{icon}</span>}
    </div>
);

export default CanvasContextMenu;
