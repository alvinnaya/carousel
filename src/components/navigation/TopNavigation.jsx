import React, { useState } from 'react';
import ProjectName from './ProjectName';
import TopLeftNav from './TopLeftNav';
import ZoomControls from './ZoomControls';
import ExportModal from './ExportModal';
import { useCanvasContext } from '../../context/CanvasContext';
import { useNavigate } from 'react-router-dom';
import templateService from '../../api/templateService';
import { generateHighQualityPreview } from '../../utils/canvasUtils';
import DiscardModal from '../modals/DiscardModal';

// Manual Loader SVG
const Loader = ({ className }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="2" x2="12" y2="6"></line>
        <line x1="12" y1="18" x2="12" y2="22"></line>
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
        <line x1="2" y1="12" x2="6" y2="12"></line>
        <line x1="18" y1="12" x2="22" y2="12"></line>
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
    </svg>
);

/**
 * TopNavigation - Floating top bar layout container.
 * Orchestrates modular sections like ProjectName and ZoomControls.
 */

const TopNavigation = ({ title, isTemplateMode, templateId }) => {
    const { isSaving, hasUnsavedChanges, setHasUnsavedChanges, canvases, triggerPreviewUpload } = useCanvasContext();
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
    const [isDiscarding, setIsDiscarding] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const navigate = useNavigate();

    // Prevent closing browser tab ALWAYS in template mode
    React.useEffect(() => {
        if (isTemplateMode) {
            const handleBeforeUnload = (e) => {
                e.preventDefault();
                e.returnValue = ''; // Required for Chrome to show the alert
            };
            window.addEventListener('beforeunload', handleBeforeUnload);
            
            // Intercept native browser back button
            window.history.pushState(null, '', window.location.href);
            const handlePopState = () => {
                // Instantly push state forward again to trap the user
                window.history.pushState(null, '', window.location.href);
                // The TopLeftNav handles its own discard modal now
                // But we still block native back here
            };
            window.addEventListener('popstate', handlePopState);

            return () => {
                window.removeEventListener('beforeunload', handleBeforeUnload);
                window.removeEventListener('popstate', handlePopState);
            };
        }
    }, [isTemplateMode]);

    const handleBackClick = async () => {
        if (isTemplateMode) {
            setIsDiscardModalOpen(true);
        } else {
            setIsRedirecting(true);
            try {
                // Trigger preview upload manually before navigating to ensure it completes
                if (triggerPreviewUpload.current) {
                    await triggerPreviewUpload.current();
                }
            } catch (err) {
                console.error('Failed to upload preview before navigation', err);
            }
            navigate('/dashboard/design');
        }
    };

    const handleDiscard = async () => {
        setIsDiscarding(true);
        try {
            await templateService.discardChanges(templateId);
            setHasUnsavedChanges(false);
            navigate('/dashboard/template');
        } catch (err) {
            console.error('Failed to discard changes', err);
        } finally {
            setIsDiscarding(false);
            setIsDiscardModalOpen(false);
        }
    };

    // Save template logic moved to backend snapshots since template is immutable

    return (
        <>
            <TopLeftNav 
                title={title} 
                isTemplateMode={isTemplateMode} 
                templateId={templateId} 
            />
            <nav className="mus-top-nav items-center">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleBackClick}
                        disabled={isRedirecting}
                        className="mus-button-ghost group"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        {isRedirecting ? (
                            <>
                                <Loader className="animate-spin" style={{ color: 'var(--accent)' }} />
                                <span className="text-[10px] font-black uppercase tracking-wider">Saving...</span>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                                <span className="text-[10px] font-black uppercase tracking-wider">Back</span>
                            </>
                        )}
                    </button>
                    <div className="mus-nav-divider"></div>
                </div>

                <ZoomControls />

                <div className="flex items-center gap-3">
                    {!isTemplateMode && (
                        <>
                            <button
                                onClick={() => setIsExportModalOpen(true)}
                                className="mus-button-amber"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2-2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Export
                            </button>
                        </>
                    )}
                </div>
            </nav>

            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
            />

            <DiscardModal
                isOpen={isDiscardModalOpen}
                onClose={() => setIsDiscardModalOpen(false)}
                onDiscard={handleDiscard}
                isDiscarding={isDiscarding}
            />
        </>
    );
};

export default TopNavigation;
