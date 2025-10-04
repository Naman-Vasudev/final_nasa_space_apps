import React from 'react';

// This safe, simple parser converts **bold** text and newlines into
// proper HTML elements without using dangerouslySetInnerHTML.
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
    // Split by bold tags, keeping the delimiters
    const parts = text.split(/(\*\*.*?\*\*)/g);

    const elements = parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        
        // Handle newlines within normal text parts
        const lines = part.split('\n');
        return lines.map((line, lineIndex) => (
            <React.Fragment key={`${index}-${lineIndex}`}>
                {line}
                {lineIndex < lines.length - 1 && <br />}
            </React.Fragment>
        ));
    });

    return <>{elements}</>;
};

export default FormattedText;
