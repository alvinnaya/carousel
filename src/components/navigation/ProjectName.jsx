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
                    className="bg-transparent border-b border-[var(--accent)] mus-text-primary font-bold text-sm outline-none px-1 py-0.5 min-w-[150px]"
                />
            ) : (
                <div className="flex items-center gap-2">
                    <div
                        onClick={() => setIsEditing(true)}
                        className="mus-text-primary font-bold text-base cursor-text hover:text-black transition-colors px-1 py-0.5 border-b border-transparent hover:border-[var(--border-light)]"
                    >
                        {projectName || 'Untitled Project'}
                    </div>
                    {isSaving && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest bg-[var(--accent-light)] px-2 py-0.5 rounded-full border border-[var(--accent-light)] animate-pulse">
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
