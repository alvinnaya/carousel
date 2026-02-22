import React, { useState, useEffect } from 'react';

const DelayedInput = ({ value, onChange, className, type = "number", prefix, suffix, ...props }) => {
    const [localValue, setLocalValue] = useState(value);

    // Sync with external value changes (e.g. from canvas events)
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleCommit = () => {
        if (localValue !== value) {
            onChange(localValue);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleCommit();
            e.target.blur();
        } else if (e.key === 'Escape') {
            setLocalValue(value);
            e.target.blur();
        }
    };

    return (
        <div className="relative w-full">
            {prefix && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400 select-none">{prefix}</span>}
            <input
                {...props}
                type={type}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={handleCommit}
                onKeyDown={handleKeyDown}
                className={className}
            />
            {suffix && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400 select-none">{suffix}</span>}
        </div>
    );
};

export default DelayedInput;
