import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import designService from '../../api/designService';
import { Loader2 } from 'lucide-react';

const ProjectName = ({ title, isSaving }) => {
    const { id } = useParams();
    const [projectName, setProjectName] = useState(title || 'Untitled Project');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (title) setProjectName(title);
    }, [title]);

    const handleSave = async () => {
        setIsEditing(false);
        if (projectName !== title) {
            try {
                await designService.update(id, { title: projectName });
            } catch (err) {
                console.error('Failed to update title', err);
            }
        }
    };

    return (
        <div className="flex items-center gap-3 group min-w-[200px]">
            {isEditing ? (
                <input
                    autoFocus
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    className="mus-project-input"
                />
            ) : (
                <div className="flex items-center gap-2">
                    <div
                        onClick={() => setIsEditing(true)}
                        className="mus-project-title"
                    >
                        {projectName || 'Untitled Project'}
                    </div>
                    {isSaving && (
                        <div className="mus-status-badge">
                            <Loader2 size={10} className="animate-spin" />
                            Saving
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProjectName;
