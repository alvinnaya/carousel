import React, { useState } from 'react';
import DelayedInput from './DelayedInput';
import { useCanvasContext } from '../../../../context/CanvasContext';
import {
    updateObjectProperty,
    alignLeft, alignCenterH, alignRight,
    alignTop, alignCenterV, alignBottom,
    flipHorizontal, flipVertical,
    changeWidth, changeHeight,
    changeRotation, rotate90,
} from '../../../Helper/FabricHelper';

const TransformTools = ({ activeObject }) => {
    const { canvas } = useCanvasContext();
    const [lockRatio, setLockRatio] = useState(false);

    if (!activeObject) return null;

    // Computed rendered dimensions
    const renderedW = Math.round((activeObject.width || 0) * (activeObject.scaleX || 1));
    const renderedH = Math.round((activeObject.height || 0) * (activeObject.scaleY || 1));
    const posX = Math.round(activeObject.left || 0);
    const posY = Math.round(activeObject.top || 0);
    const angle = Math.round(activeObject.angle || 0);

    // ─── Shared styles ──────────────────────────────────────────────────────
    const sectionLabel = "mus-tool-label";
    const inputClass = "mus-tool-input";
    const alignBtnClass = "mus-tool-align-btn";

    return (
        <section className="mus-tool-section">
            <div className="flex items-center justify-between">
                <h3 className="mus-tool-label">Transform</h3>
            </div>

            {/* ── ALIGNMENT ────────────────────────────────────────────── */}
            <div className="space-y-3">
                <label className={sectionLabel}>Align</label>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <button onClick={() => alignTop(activeObject, canvas)} className={alignBtnClass}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="4" y1="4" x2="20" y2="4" />
                            <rect x="7" y="8" width="3" height="10" rx="1" fill="currentColor" />
                            <rect x="14" y="8" width="3" height="6" rx="1" fill="currentColor" />
                        </svg>
                        <span>Top</span>
                    </button>
                    <button onClick={() => alignLeft(activeObject, canvas)} className={alignBtnClass}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="4" y1="4" x2="4" y2="20" />
                            <rect x="8" y="7" width="10" height="3" rx="1" fill="currentColor" />
                            <rect x="8" y="14" width="6" height="3" rx="1" fill="currentColor" />
                        </svg>
                        <span>Left</span>
                    </button>
                    <button onClick={() => alignCenterV(activeObject, canvas)} className={alignBtnClass}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <rect x="7" y="5" width="3" height="14" rx="1" fill="currentColor" />
                            <rect x="14" y="7" width="3" height="10" rx="1" fill="currentColor" />
                        </svg>
                        <span>Middle</span>
                    </button>
                    <button onClick={() => alignCenterH(activeObject, canvas)} className={alignBtnClass}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="2" x2="12" y2="22" />
                            <rect x="5" y="7" width="14" height="3" rx="1" fill="currentColor" />
                            <rect x="7" y="14" width="10" height="3" rx="1" fill="currentColor" />
                        </svg>
                        <span>Center</span>
                    </button>
                    <button onClick={() => alignBottom(activeObject, canvas)} className={alignBtnClass}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="4" y1="20" x2="20" y2="20" />
                            <rect x="7" y="4" width="3" height="12" rx="1" fill="currentColor" />
                            <rect x="14" y="8" width="3" height="8" rx="1" fill="currentColor" />
                        </svg>
                        <span>Bottom</span>
                    </button>
                    <button onClick={() => alignRight(activeObject, canvas)} className={alignBtnClass}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="20" y1="4" x2="20" y2="20" />
                            <rect x="4" y="7" width="10" height="3" rx="1" fill="currentColor" />
                            <rect x="10" y="14" width="6" height="3" rx="1" fill="currentColor" />
                        </svg>
                        <span>Right</span>
                    </button>
                </div>

                <div className="mus-tool-divider my-2 pt-2">
                    <div className="grid grid-cols-2 gap-x-4">
                        <button onClick={() => flipHorizontal(activeObject, canvas)} className={alignBtnClass}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="3" x2="12" y2="21" strokeDasharray="2 2" />
                                <path d="M16 7l4 5-4 5V7z" fill="currentColor" />
                                <path d="M8 7L4 12l4 5V7z" />
                            </svg>
                            <span>Flip H</span>
                        </button>
                        <button onClick={() => flipVertical(activeObject, canvas)} className={alignBtnClass}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12" strokeDasharray="2 2" />
                                <path d="M7 16l5 4 5-4H7z" fill="currentColor" />
                                <path d="M7 8l5-4 5 4H7z" />
                            </svg>
                            <span>Flip V</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── POSITION ─────────────────────────────────────────────── */}
            <div className="space-y-2">
                <label className={sectionLabel}>Position</label>
                <div className="grid grid-cols-2 gap-3">
                    <DelayedInput
                        prefix="X"
                        value={posX}
                        isNumeric={true}
                        onChange={(val) => updateObjectProperty(activeObject, 'left', parseInt(val) || 0, canvas)}
                        className={inputClass}
                    />
                    <DelayedInput
                        prefix="Y"
                        value={posY}
                        isNumeric={true}
                        onChange={(val) => updateObjectProperty(activeObject, 'top', parseInt(val) || 0, canvas)}
                        className={inputClass}
                    />
                </div>
            </div>

            {/* ── DIMENSIONS ───────────────────────────────────────────── */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className={sectionLabel}>Dimensions</label>
                    <button
                        onClick={() => setLockRatio(!lockRatio)}
                        className={`p-1 rounded transition-all ${lockRatio ? 'text-indigo-500' : 'text-zinc-300 hover:text-zinc-500'}`}
                        title={lockRatio ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {lockRatio ? (
                                <>
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                </>
                            ) : (
                                <>
                                    <path d="M18.84 12.25l1.72-1.71a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                    <path d="M5.16 11.75l-1.72 1.71a5 5 0 0 0 7.07 7.07l1.72-1.71" />
                                    <line x1="8" y1="2" x2="8" y2="5" />
                                    <line x1="2" y1="8" x2="5" y2="8" />
                                    <line x1="16" y1="19" x2="16" y2="22" />
                                    <line x1="19" y1="16" x2="22" y2="16" />
                                </>
                            )}
                        </svg>
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <DelayedInput
                        prefix="W"
                        value={renderedW}
                        isNumeric={true}
                        onChange={(val) => changeWidth(activeObject, parseInt(val) || 1, canvas, lockRatio)}
                        className={inputClass}
                    />
                    <DelayedInput
                        prefix="H"
                        value={renderedH}
                        isNumeric={true}
                        onChange={(val) => changeHeight(activeObject, parseInt(val) || 1, canvas, lockRatio)}
                        className={inputClass}
                    />
                </div>
            </div>

            {/* ── ROTATION ─────────────────────────────────────────────── */}
            <div className="space-y-2">
                <label className={sectionLabel}>Rotation</label>
                <div className="flex items-center gap-2">
                    <DelayedInput
                        prefix="△"
                        suffix="°"
                        value={angle}
                        isNumeric={true}
                        min="0"
                        max="360"
                        onChange={(val) => changeRotation(activeObject, parseInt(val) || 0, canvas)}
                        className={inputClass + " pr-6"}
                    />
                    <button
                        onClick={() => rotate90(activeObject, canvas)}
                        className="p-2.5 bg-zinc-50 border border-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-all"
                        title="Rotate 90°"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                            <path d="M21 3v5h-5" />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default TransformTools;
