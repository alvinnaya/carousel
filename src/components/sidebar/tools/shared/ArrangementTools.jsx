import React from 'react';
import { bringToFront, sendToBack } from '../../../Helper/FabricHelper';
import { useCanvasContext } from '../../../../context/CanvasContext';

const ArrangementTools = ({ activeObject }) => {
    const { canvas } = useCanvasContext();

    if (!activeObject) return null;

    const btnClass = "mus-tool-btn mus-tool-btn-surface flex-1";

    return (
        <section className="mus-tool-section">
            <h3 className="mus-tool-label">Arrangement</h3>
            <div className="flex space-x-2 pt-1">
                <button
                    onClick={() => bringToFront(activeObject, canvas)}
                    className={btnClass}
                    title="Bring to Front"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12l7-7 7 7" />
                    </svg>
                    <span>To Front</span>
                </button>
                <button
                    onClick={() => sendToBack(activeObject, canvas)}
                    className={btnClass}
                    title="Send to Back"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 19V5M5 12l7 7 7-7" />
                    </svg>
                    <span>To Back</span>
                </button>
            </div>
        </section>
    );
};

export default ArrangementTools;
