import React, { useState } from 'react';
import Modal from '../shared/Modal';

const TemplateSaveModal = ({ isOpen, onClose, onSave, isLoading, previewUrl, apiError, detectedCategory }) => {
    const [templateName, setTemplateName] = useState('');
    const [error, setError] = useState('');

    const handleSave = () => {
        if (!templateName.trim()) {
            setError('Template name is required');
            return;
        }
        setError('');
        onSave(templateName.trim());
    };

    // Reset state when opened
    React.useEffect(() => {
        if (isOpen) {
            setTemplateName('');
            setError('');
        }
    }, [isOpen]);

    // Show apiError if present
    React.useEffect(() => {
        if (apiError) {
            setError(apiError);
        }
    }, [apiError]);

    const categoryLabels = {
        Text: 'Text Style',
        Shape: 'Shape Preset',
        Group: 'Component Group',
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={isLoading ? () => {} : onClose}
            title="Save as Element Preset"
        >
            <div className="flex flex-col gap-4">
                {previewUrl && (
                    <div className="flex justify-center">
                        <div className="w-32 h-32 rounded-xl overflow-hidden mus-border-soft mus-bg-surface flex items-center justify-center">
                            <img src={previewUrl} alt="Template Preview" className="max-w-full max-h-full object-contain" />
                        </div>
                    </div>
                )}

                {detectedCategory && (
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest mus-text-muted">Category:</span>
                        <span className="mus-tool-badge">{categoryLabels[detectedCategory] || detectedCategory}</span>
                    </div>
                )}
                
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold mus-text-primary">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        autoFocus
                        placeholder="e.g. Elegant Title Layout"
                        value={templateName}
                        onChange={(e) => {
                            setTemplateName(e.target.value);
                            if (error) setError('');
                        }}
                        disabled={isLoading}
                        className={`mus-input w-full ${error ? 'border-red-500 hover:border-red-600 focus:border-red-500' : ''}`}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave();
                        }}
                    />
                    {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 mus-border-t-soft">
                <button
                    className="mus-btn-ghost"
                    onClick={onClose}
                    disabled={isLoading}
                >
                    Cancel
                </button>
                <button
                    className="mus-btn-primary flex items-center gap-2"
                    onClick={handleSave}
                    disabled={isLoading || !templateName.trim()}
                >
                    {isLoading && (
                        <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    {isLoading ? 'Saving...' : 'Save as Element Preset'}
                </button>
            </div>
        </Modal>
    );
};

export default TemplateSaveModal;
