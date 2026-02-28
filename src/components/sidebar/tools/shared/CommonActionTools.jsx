import React from 'react';
import { deleteObject } from '../../../Helper/FabricHelper';
import { useCanvasContext } from '../../../../context/CanvasContext';

const CommonActionTools = ({ activeObject, objectTypeLabel = "Object" }) => {
    const { canvas } = useCanvasContext();

    if (!activeObject) return null;

    return (
        <section className="pt-2">
            <button
                onClick={() => deleteObject(activeObject, canvas)}
                className="mus-tool-btn-danger"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
                <span>Delete {objectTypeLabel}</span>
            </button>
        </section>
    );
};

export default CommonActionTools;
