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
            {prefix && <span className="mus-tool-input-prefix">{prefix}</span>}
            <input
                {...props}
                type={type}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={handleCommit}
                onKeyDown={handleKeyDown}
                className={className}
            />
            {suffix && <span className="mus-tool-input-suffix">{suffix}</span>}
        </div>
    );
};

export default DelayedInput;
