import React from 'react';
import { bringToFront, sendToBack } from '../../../Helper/FabricHelper';

const ArrangementTools = ({ canvas, activeObject }) => {
    if (!activeObject) return null;

    const btnClass = "flex-1 py-2.5 rounded-lg bg-zinc-50 border border-zinc-100 text-[10px] font-bold text-zinc-600 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm";

    return (
        <section className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm space-y-4">
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Arrangement</h3>
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
