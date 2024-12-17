import React, { MouseEvent } from 'react';

interface PopupProps {
    x: number;
    y: number;
    onAddNode: (e: MouseEvent<HTMLDivElement>) => void;
    onAddBP: (e: MouseEvent<HTMLDivElement>) => void;
    onClose: (e: MouseEvent<HTMLDivElement>) => void;
}

const Popup: React.FC<PopupProps> = ({ x, y, onAddNode, onAddBP, onClose }) => {
    return (
        <div 
            className='fixed z-50 w-[10em] bg-white border border-gray-300 rounded-md shadow-lg'
            style={{ 
                left: `${x}px`, 
                top: `${y}px` 
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div 
                className='p-2 hover:bg-gray-100 cursor-pointer border-b'
                onClick={onAddNode}
            >
                Add Node
            </div>
            <div 
                className='p-2 hover:bg-gray-100 cursor-pointer border-b'
                onClick={onAddBP}
            >
                Add Breakpoint
            </div>
            <div 
                className='p-2 hover:bg-gray-100 cursor-pointer-b'
                onClick={onClose}
            >
                Close
            </div>
        </div>
    );
};

export default Popup;