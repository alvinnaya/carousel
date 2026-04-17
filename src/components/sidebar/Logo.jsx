import React from 'react';
import LogoIcon from './LogoIcon';

/**
 * Logo - The sidebar-specific branding module.
 * Reuses LogoIcon for the branding element but adds the correct vertical padding
 * as required by the dashboard and editor sidebars.
 */
const Logo = () => {
    return (
        <div className="flex items-center justify-center w-full py-6 pb-4">
            <div className="w-10 h-10 flex items-center justify-center">
                <LogoIcon />
            </div>
        </div>
    );
};

export default Logo;
