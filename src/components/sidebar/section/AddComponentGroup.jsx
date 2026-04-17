import React from 'react';
import ElementGallery from '../shared/ElementGallery';

const AddComponentGroup = () => {
    return (
        <div className="space-y-6">
            <section>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Saved Groups</h3>
                <ElementGallery category="Group" emptyMessage="No component groups saved" />
            </section>
        </div>
    );
};

export default AddComponentGroup;
