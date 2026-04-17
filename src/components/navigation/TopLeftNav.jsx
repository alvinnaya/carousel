import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoIcon from '../sidebar/LogoIcon';
import ProjectName from './ProjectName';
import { useCanvasContext } from '../../context/CanvasContext';

/**
 * TopLeftNav - Floating top-left navigation with Logo and ProjectName.
 * Logo acts as the "Back" button.
 */
const TopLeftNav = ({ title }) => {
    const { isSaving, triggerPreviewUpload } = useCanvasContext();
    const [isRedirecting, setIsRedirecting] = useState(false);
    const navigate = useNavigate();

    const handleBackClick = async () => {
        setIsRedirecting(true);
        try {
            if (triggerPreviewUpload.current) {
                await triggerPreviewUpload.current();
            }
        } catch (err) {
            console.error('Failed to upload preview before navigation', err);
        }
        navigate('/dashboard/design');
    };



    return (
        <div className="mus-top-left-container pointer-events-none">
            {/* 1. Logo Circle (Acts as Back Button) */}
            <div 
                onClick={handleBackClick}
                className={`mus-sidebar-circle-outer pointer-events-auto group ${isRedirecting ? 'opacity-70 pointer-events-none' : ''}`}
                style={{ backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' }}
            >
                <LogoIcon />
            </div>

            {/* 2. Project Name Pill */}
            <div className="mus-top-left-pill pointer-events-auto">
                <ProjectName title={title} isSaving={isSaving} />
            </div>
        </div>
    );
};

export default TopLeftNav;
