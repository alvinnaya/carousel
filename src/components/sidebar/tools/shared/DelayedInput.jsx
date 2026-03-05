import React, { useState, useEffect } from 'react';

const DelayedInput = ({ value, onChange, className, type = "text", isNumeric = false, prefix, suffix, ...props }) => {
    const [localValue, setLocalValue] = useState(value);

    // Sync with external value changes (e.g. from canvas events)
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleCommit = () => {
        let finalValue = localValue;

        if (isNumeric && localValue !== '') {
            let num = parseFloat(localValue);
            if (!isNaN(num)) {
                if (props.min !== undefined) num = Math.max(parseFloat(props.min), num);
                if (props.max !== undefined) num = Math.min(parseFloat(props.max), num);
                finalValue = num.toString();
            }
        } else if (isNumeric && localValue === '') {
            finalValue = (props.min !== undefined ? props.min : '0').toString();
        }

        setLocalValue(finalValue);
        if (finalValue !== value.toString()) {
            onChange(finalValue);
        }
    };

    const handleChange = (e) => {
        let val = e.target.value;
        if (isNumeric) {
            // Allow digits, one decimal point, and one leading minus sign
            // This regex allows intermediate states like "-" or "1."
            const regex = /^-?\d*\.?\d*$/;
            if (val === '' || regex.test(val)) {
                setLocalValue(val);
            }
        } else {
            setLocalValue(val);
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
                onChange={handleChange}
                onBlur={handleCommit}
                onKeyDown={handleKeyDown}
                className={className}
            />
            {suffix && <span className="mus-tool-input-suffix">{suffix}</span>}
        </div>
    );
};

export default DelayedInput;
