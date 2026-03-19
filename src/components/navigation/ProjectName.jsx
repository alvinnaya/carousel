import React, { useState } from 'react';

/**
 * ProjectName - Editable project title component for TopNavigation.
 */
const ProjectName = () => {
    const [projectName, setProjectName] = useState('Untitled Project');
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="flex items-center gap-2 group min-w-[150px]">
            {isEditing ? (
                <input
                    autoFocus
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    onBlur={() => setIsEditing(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                    className="bg-transparent border-b-2 border-[#E8C04A] mus-text-primary font-bold text-sm outline-none px-1 py-0.5 min-w-[120px]"
                />
            ) : (
                <div
                    onClick={() => setIsEditing(true)}
                    className="mus-text-primary font-bold text-sm cursor-text hover:text-black transition-colors px-1 py-0.5 border-b-2 border-transparent hover:border-[#D4CBBA]"
                >
                    {projectName || 'Untitled Project'}
                </div>
            )}
        </div>
    );
};

export default ProjectName;
