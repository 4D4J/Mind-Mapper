import React from 'react';

interface ExportProps {
    onClose: () => void;
    onExport_JSON: () => void;
    onExport_PNG: () => void;
}

const Export: React.FC<ExportProps> = ({ onClose, onExport_JSON, onExport_PNG }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded-lg shadow-lg">
                <button onClick={onClose} className="absolute top-2 right-2 font-bold">
                    &#10005;
                </button>
                <h2 className="text-xl font-bold mb-4">Export Options</h2>
                <button onClick={onExport_JSON} className="bg-purple-600 text-white rounded-lg p-2 mb-2 hover:bg-purple-800 transition-colors">
                    Export in JSON
                </button>
                <button onClick={onExport_PNG} className="bg-purple-600 text-white rounded-lg p-2 hover:bg-purple-800 transition-colors">
                    Export in PNG
                </button>
            </div>
        </div>
    );
};

export default Export;