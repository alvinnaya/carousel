import { useState, useEffect, useCallback } from 'react';
import { useCanvasContext } from '../../context/CanvasContext';
import * as fabric from 'fabric';
import ContextMenu from '../shared/ContextMenu';
import {
    groupSelectedObjects,
    ungroupSelectedObjects
} from '../Helper/FabricGroupHelper';

const CanvasContextMenu = () => {
    const { canvas, isVisible, setIsVisible, position, setPosition, handleAction, activeObject, isSelection, isGroup, clipboard } = useCanvasActions();

    useEffect(() => {
        if (!canvas) return;

        const handleContextMenu = (opt) => {
            const { e } = opt;
            e.preventDefault();
            e.stopPropagation();
            setPosition({ x: e.clientX, y: e.clientY });
            setIsVisible(true);
        };

        const handleClick = () => {
            setIsVisible(false);
        };

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
    }, [canvas, setPosition, setIsVisible]);

    const handleActionWithClose = async (action) => {
        await handleAction(action);
        setIsVisible(false);
    };

    return (
        <ContextMenu
            x={position.x}
            y={position.y}
            isOpen={isVisible}
            onClose={() => setIsVisible(false)}
        >
            {activeObject ? (
                <>
                    <MenuSection>
                        <MenuButton label="Copy" icon="⌘C" onClick={() => handleActionWithClose('copy')} />
                        <MenuButton label="Duplicate" icon="⌘D" onClick={() => handleActionWithClose('duplicate')} />
                        {clipboard && <MenuButton label="Paste" icon="⌘V" onClick={() => handleActionWithClose('paste')} />}
                    </MenuSection>

                    <Divider />

                    <MenuSection>
                        <MenuButton label="Bring Forward" icon="]" onClick={() => handleActionWithClose('bringForward')} />
                        <MenuButton label="Bring to Front" icon="⇧]" onClick={() => handleActionWithClose('bringToFront')} />
                        <MenuButton label="Send Backward" icon="[" onClick={() => handleActionWithClose('sendBackward')} />
                        <MenuButton label="Send to Back" icon="⇧[" onClick={() => handleActionWithClose('sendToBack')} />
                    </MenuSection>

                    <Divider />

                    <MenuSection>
                        {isSelection && <MenuButton label="Group" icon="⌘G" onClick={() => handleActionWithClose('group')} />}
                        {isGroup && <MenuButton label="Ungroup" icon="⇧⌘G" onClick={() => handleActionWithClose('ungroup')} />}
                        <MenuButton label="Delete" icon="⌫" onClick={() => handleActionWithClose('delete')} variant="danger" />
                    </MenuSection>
                </>
            ) : (
                <MenuSection>
                    {clipboard ? (
                        <MenuButton label="Paste" icon="⌘V" onClick={() => handleActionWithClose('paste')} />
                    ) : (
                        <div className="px-4 py-2.5 mus-text-muted text-[11px] font-black uppercase tracking-widest italic">
                            Empty Canvas
                        </div>
                    )}
                </MenuSection>
            )}
        </ContextMenu>
    );
};

export const useCanvasActions = () => {
    const { canvas, clipboard, setClipboard } = useCanvasContext();
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

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
                    const toDelete = isSelection ? activeObject.removeAll() : [activeObject];
                    const allGroups = canvas.getObjects().filter(obj => obj.type === 'group');

                    toDelete.forEach(obj => {
                        allGroups.forEach(g => {
                            if (g.contains && g.contains(obj)) {
                                g.remove(obj);
                                canvas.fire('object:modified', { target: g });
                            }
                        });
                        canvas.remove(obj);
                    });

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
        return Promise.resolve();
    };

    return {
        canvas,
        isVisible,
        setIsVisible,
        position,
        setPosition,
        handleAction,
        activeObject,
        isSelection,
        isGroup,
        clipboard
    };
};

export const MenuSection = ({ children }) => (
    <div className="flex flex-col gap-0.5">
        {children}
    </div>
);

export const Divider = () => (
    <div className="h-px mus-border-light border-b my-1.5 mx-1" />
);

export const MenuButton = ({ label, onClick, icon, variant = 'default' }) => (
    <div
        onClick={(e) => {
            e.stopPropagation();
            onClick();
        }}
        className={`
            px-4 py-2 cursor-pointer text-[12px] font-bold flex items-center justify-between transition-all duration-200 rounded-lg
            ${variant === 'danger' ? 'text-[#C0392B]' : 'mus-text-primary'}
            hover:bg-[#E8C04A] hover:text-[#1A1A1A]
        `}
    >
        <span>{label}</span>
        {icon && <span className="text-[9px] opacity-40 ml-3 font-black">{icon}</span>}
    </div>
);

export default CanvasContextMenu;
