import React from 'react';

interface PopupProps {
    x: number;
    y: number;
    onAddNode: () => void;
    onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ x, y, onAddNode, onClose }) => {
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
                Ajouter un nœud
            </div>
            <div 
                className='p-2 hover:bg-gray-100 cursor-pointer'
                onClick={onClose}
            >
                Fermer
            </div>
        </div>
    );
};

export default Popup;