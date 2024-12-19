import React, { useState } from 'react';
import { Bold, Italic, Underline } from 'lucide-react';

interface NodeMenuProps {
    selectedNodeId: number | null;
    onColorChange: (nodeId: number, color: string) => void;
    onStyleChange?: (nodeId: number, styles: { bold?: boolean; italic?: boolean; underline?: boolean }) => void;
}

interface NodeStyles {
    bold: boolean;
    italic: boolean;
    underline: boolean;
}

const NodeMenu: React.FC<NodeMenuProps> = ({ selectedNodeId, onColorChange, onStyleChange }) => {
    const [customColor, setCustomColor] = useState('#FFFFFF');
    const [styles, setStyles] = useState<NodeStyles>({
        bold: false,
        italic: false,
        underline: false
    });

    if (!selectedNodeId && selectedNodeId !== 0) return null;

    const predefinedColors = [
        '#FFFFFF', // White
        '#FDE68A', // Light Yellow
        '#BBF7D0', // Light Green
        '#BFDBFE', // Light Blue
        '#DDD6FE', // Light Purple
        '#FECACA', // Light Red
        '#E5E7EB', // Light Gray
    ];

    const handleStyleChange = (e: React.MouseEvent, styleType: keyof NodeStyles) => {
        e.stopPropagation();
        const newStyles = {
            ...styles,
            [styleType]: !styles[styleType]
        };
        setStyles(newStyles);
        if (onStyleChange) {
            onStyleChange(selectedNodeId, newStyles);
        }
    };

    const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        const newColor = e.target.value;
        setCustomColor(newColor);
        onColorChange(selectedNodeId, newColor);
    };

    const handleColorClick = (e: React.MouseEvent, color: string) => {
        e.stopPropagation();
        onColorChange(selectedNodeId, color);
    };

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div 
            className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg z-50"
            onClick={handleMenuClick}
        >
            <h3 className="text-sm font-medium text-gray-700 mb-3">Node Customisation</h3>
            
            {/* Style Controls */}
            <div className="mb-4 flex gap-2 pb-3 border-b border-gray-200">
                <button
                    onClick={(e) => handleStyleChange(e, 'bold')}
                    className={`p-2 rounded hover:bg-gray-100 ${styles.bold ? 'bg-gray-200' : ''}`}
                    title="Bold"
                >
                    <Bold size={16} />
                </button>
                <button
                    onClick={(e) => handleStyleChange(e, 'italic')}
                    className={`p-2 rounded hover:bg-gray-100 ${styles.italic ? 'bg-gray-200' : ''}`}
                    title="Italic"
                >
                    <Italic size={16} />
                </button>
                <button
                    onClick={(e) => handleStyleChange(e, 'underline')}
                    className={`p-2 rounded hover:bg-gray-100 ${styles.underline ? 'bg-gray-200' : ''}`}
                    title="Underline"
                >
                    <Underline size={16} />
                </button>
            </div>

            {/* Color Controls */}
            <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                    {predefinedColors.map((color, index) => (
                        <button
                            key={index}
                            className="w-6 h-6 rounded-full border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            onClick={(e) => handleColorClick(e, color)}
                        />
                    ))}
                </div>
                
                {/* Custom Color Picker */}
                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={customColor}
                        onChange={handleCustomColorChange}
                        onClick={handleMenuClick}
                        className="w-8 h-8 rounded cursor-pointer"
                    />
                    <span className="text-xs text-gray-600">Custom color</span>
                </div>
            </div>
        </div>
    );
};

export default NodeMenu;