import React, { useState } from 'react';
import SmartDropdown from '../shared/SmartDropdown';
import Modal from '../shared/Modal';

const AddCanvasSection = ({
    onAddDefault,
    onDuplicateActive,
    onAddNewNextToActive,
    onCreateCustom
}) => {
    const [addDropdownOpen, setAddDropdownOpen] = useState(false);
    const [isCustomCanvasModalOpen, setIsCustomCanvasModalOpen] = useState(false);
    const [newCanvasSize, setNewCanvasSize] = useState({ width: 1080, height: 1080 });

    const handleCreateCustomOpen = () => {
        setAddDropdownOpen(false);
        setIsCustomCanvasModalOpen(true);
    };

    const submitCustomCanvas = () => {
        onCreateCustom(parseInt(newCanvasSize.width) || 1080, parseInt(newCanvasSize.height) || 1080);
        setIsCustomCanvasModalOpen(false);
    };

    const handleSizeChange = (dimension, value) => {
        // Only allow numbers to be typed
        if (value === '' || /^\d+$/.test(value)) {
            setNewCanvasSize(prev => ({ ...prev, [dimension]: value }));
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex w-full border border-[#D4CBBA] rounded-xl overflow-hidden" style={{backgroundColor: 'var(--bg-main)'}}>
                <button
                    onClick={onAddDefault}
                    className="flex-1 py-2.5 flex items-center justify-center gap-2 text-sm font-semibold transition-all text-[#7A7062] hover:bg-[rgba(232,192,74,0.2)] hover:text-[#1A1A1A]"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="18" x2="12" y2="12" />
                        <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                    Add Canvas
                </button>

                <div className="w-px bg-[#D4CBBA]"></div>

                <SmartDropdown
                    isOpen={addDropdownOpen}
                    onClose={() => setAddDropdownOpen(false)}
                    triggerClassName="flex"
                    trigger={
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setAddDropdownOpen(!addDropdownOpen);
                            }}
                            className={`px-3 py-2.5 flex items-center justify-center transition-all text-[#7A7062] hover:bg-[rgba(232,192,74,0.2)] hover:text-[#1A1A1A] ${addDropdownOpen ? 'bg-[rgba(232,192,74,0.2)] text-[#1A1A1A]' : ''}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="1.5"></circle>
                                <circle cx="12" cy="5" r="1.5"></circle>
                                <circle cx="12" cy="19" r="1.5"></circle>
                            </svg>
                        </button>
                    }
                >
                    <div className="flex flex-col min-w-[180px]">
                        <button
                            className="mus-button-ghost text-left px-3 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer w-full"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDuplicateActive();
                                setAddDropdownOpen(false);
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            Duplicate Active
                        </button>
                        <button
                            className="mus-button-ghost text-left px-3 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer w-full"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddNewNextToActive();
                                setAddDropdownOpen(false);
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Add New Canvas
                        </button>
                        <hr className="border-[#D4CBBA] my-1 mx-2" />
                        <button
                            className="mus-button-ghost text-left px-3 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer w-full"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCreateCustomOpen();
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                            Custom Size...
                        </button>
                    </div>
                </SmartDropdown>
            </div>

            <Modal
                isOpen={isCustomCanvasModalOpen}
                onClose={() => setIsCustomCanvasModalOpen(false)}
                title="Create Custom Canvas"
            >
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5 focus-within:text-[#E8C04A] transition-colors">
                        <label className="text-sm font-bold transition-colors">Width (px)</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            className="mus-input text-base"
                            value={newCanvasSize.width}
                            onChange={(e) => handleSizeChange('width', e.target.value)}
                            placeholder="e.g. 1080"
                            maxLength={5}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5 focus-within:text-[#E8C04A] transition-colors">
                        <label className="text-sm font-bold transition-colors">Height (px)</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            className="mus-input text-base"
                            value={newCanvasSize.height}
                            onChange={(e) => handleSizeChange('height', e.target.value)}
                            placeholder="e.g. 1080"
                            maxLength={5}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-[#D4CBBA]">
                    <button
                        className="mus-button-ghost px-4 py-2 text-sm font-semibold rounded-lg cursor-pointer"
                        onClick={() => setIsCustomCanvasModalOpen(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className="mus-button disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        onClick={submitCustomCanvas}
                        disabled={!newCanvasSize.width || !newCanvasSize.height}
                    >
                        Create Canvas
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default AddCanvasSection;
