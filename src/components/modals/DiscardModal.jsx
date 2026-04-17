import React from 'react';
import Modal from '../shared/Modal';
import { AlertTriangle, Loader2 } from 'lucide-react';

const DiscardModal = ({ isOpen, onClose, onDiscard, isDiscarding }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={isDiscarding ? () => {} : onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-red-100 text-[var(--danger)]">
                        <AlertTriangle size={20} strokeWidth={3} />
                    </div>
                    <span className="font-black text-xl text-[var(--text-primary)] tracking-tight">Discard Changes?</span>
                </div>
            }
        >
            <div className="py-2">
                <p className="text-[15px] font-medium text-[var(--text-muted)] leading-relaxed">
                    You are about to leave the <strong className="text-[var(--text-primary)]">Template Editor</strong>. Any unsaved edits you've made to this template will be lost. This action cannot be undone.
                </p>
                
                <div className="flex gap-3 pt-8 w-full">
                    <button
                        onClick={onClose}
                        disabled={isDiscarding}
                        className="flex-1 py-2.5 px-4 font-bold text-sm bg-[var(--bg-main)] border-2 border-[var(--border-light)] text-[var(--text-primary)] rounded-[var(--radius-lg)] hover:bg-[var(--border-light)] transform hover:-translate-y-0.5 transition-all outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    >
                        Keep Editing
                    </button>
                    <button
                        onClick={onDiscard}
                        disabled={isDiscarding}
                        className="flex-1 flex justify-center items-center gap-2 py-2.5 px-4 font-bold text-sm bg-[var(--danger)] border-2 border-[var(--danger)] text-white rounded-[var(--radius-lg)] hover:bg-red-700 hover:border-red-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                        {isDiscarding ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Discarding...</span>
                            </>
                        ) : 'Yes, Discard'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default DiscardModal;
