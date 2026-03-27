import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { AlertCircle, X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

/**
 * Base Modal – handles backdrop, Escape key, and entry animation.
 */
export const Modal = ({ isOpen, onClose, children }) => {
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
        >
            <div
                className="relative mus-modal-container max-w-sm w-full animate-[fadeInScale_0.18s_ease-out]"
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>

            <style>{`
                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.95); }
                    to   { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

/**
 * ConfirmModal – styled Yes / No dialog using the mus-* design system.
 *
 * Props:
 *  - isOpen        : boolean
 *  - onClose       : () => void
 *  - onConfirm     : () => void
 *  - title         : string
 *  - message       : string | ReactNode
 *  - confirmLabel  : string   (default "Ya, lanjutkan")
 *  - cancelLabel   : string   (default "Batal")
 *  - isDanger      : boolean  (default false – makes confirm button use danger color)
 */
export const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Konfirmasi',
    message,
    confirmLabel = 'Ya, lanjutkan',
    cancelLabel = 'Batal',
    isDanger = false,
}) => {
    const confirmRef = useRef(null);

    useEffect(() => {
        if (isOpen) setTimeout(() => confirmRef.current?.focus(), 50);
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            {/* Header */}
            <div className="mus-modal-header">
                <div className="flex items-center gap-2">
                    {isDanger && (
                        <AlertCircle size={18} style={{ color: 'var(--danger)' }} />
                    )}
                    <h3 className="mus-modal-title" style={{ fontSize: '0.9rem' }}>{title}</h3>
                </div>
                <button className="mus-modal-close-btn" onClick={onClose}>
                    <X size={16} />
                </button>
            </div>

            {/* Body */}
            {message && (
                <div className="mus-modal-body">
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                        {message}
                    </p>
                </div>
            )}

            {/* Footer */}
            <div className="mus-modal-footer">
                <button
                    onClick={onClose}
                    className="mus-tool-btn mus-tool-btn-surface"
                >
                    {cancelLabel}
                </button>
                <button
                    ref={confirmRef}
                    onClick={() => { onConfirm?.(); onClose?.(); }}
                    className={isDanger ? 'mus-tool-btn mus-tool-btn-surface' : 'mus-tool-btn mus-button-amber'}
                    style={isDanger ? {
                        backgroundColor: 'var(--danger)',
                        color: 'white',
                        border: '1px solid var(--danger)',
                    } : {}}
                >
                    {confirmLabel}
                </button>
            </div>
        </Modal>
    );
};

/**
 * AlertModal – simple dismissible notification using the mus-* design system.
 *
 * Props:
 *  - isOpen    : boolean
 *  - onClose   : () => void
 *  - title     : string
 *  - message   : string | ReactNode
 *  - okLabel   : string   (default "OK")
 *  - isDanger  : boolean  (default false)
 */
export const AlertModal = ({
    isOpen,
    onClose,
    title = 'Pemberitahuan',
    message,
    okLabel = 'OK',
    isDanger = false,
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            {/* Header */}
            <div className="mus-modal-header">
                <div className="flex items-center gap-2">
                    {isDanger && (
                        <AlertCircle size={18} style={{ color: 'var(--danger)' }} />
                    )}
                    <h3 className="mus-modal-title" style={{ fontSize: '0.9rem' }}>{title}</h3>
                </div>
                <button className="mus-modal-close-btn" onClick={onClose}>
                    <X size={16} />
                </button>
            </div>

            {/* Body */}
            {message && (
                <div className="mus-modal-body">
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                        {message}
                    </p>
                </div>
            )}

            {/* Footer */}
            <div className="mus-modal-footer">
                <button
                    onClick={onClose}
                    className="mus-tool-btn mus-button-amber"
                >
                    {okLabel}
                </button>
            </div>
        </Modal>
    );
};

export const PromptModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    defaultValue = '',
    placeholder = 'Masukkan nama baru...',
    confirmLabel = 'Simpan',
    cancelLabel = 'Batal'
}) => {
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        if (isOpen) {
            setValue(defaultValue);
        }
    }, [isOpen, defaultValue]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(value);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            {/* Header */}
            <div className="mus-modal-header">
                <div className="flex items-center gap-2">
                    <h3 className="mus-modal-title" style={{ fontSize: '0.9rem' }}>{title}</h3>
                </div>
                <button className="mus-modal-close-btn" onClick={onClose}>
                    <X size={16} />
                </button>
            </div>

            {/* Body */}
            <div className="mus-modal-body">
                {message && (
                    <p className="mb-4" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                        {message}
                    </p>
                )}
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-500 text-sm font-medium"
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConfirm();
                        if (e.key === 'Escape') onClose();
                    }}
                />
            </div>

            {/* Footer */}
            <div className="mus-modal-footer">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-800 transition-colors"
                >
                    {cancelLabel}
                </button>
                <button
                    onClick={handleConfirm}
                    className="mus-tool-btn mus-button-amber px-6"
                    style={{ fontSize: '0.75rem' }}
                >
                    {confirmLabel}
                </button>
            </div>
        </Modal>
    );
};

export default Modal;
