import React, { useState } from 'react';
import AuthSystem from './auth';
import Export from '../Utilities/Export';
import html2canvas from 'html2canvas';

interface ToolbarProps {
    selectedNodeId: number | null;

    zoom: number;
    onDeleteNode: () => void;
    onConnectNode: () => void;


    onZoomIn: () => void;
    onZoomOut: () => void;
    onExport: () => void;
    onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
    canvasRef: React.RefObject<HTMLCanvasElement>; 
}

const Toolbar: React.FC<ToolbarProps> = ({
    selectedNodeId,

    zoom,
    onDeleteNode,


    onZoomIn,
    onZoomOut,
    onExport,
    onImport,

}) => {
    const [showAuth, setShowAuth] = useState(false);
    const [showExport, setShowExport] = useState(false);

    const handleAccountClick = () => {
        setShowAuth(true);
    };

    const handleExportClick = () => {
        setShowExport(true);
    };

    const handleCloseExport = () => {
        setShowExport(false);
    };

    const handleExport_JSON = () => {
        onExport();
        setShowExport(false);
    };

    const handleExport_PICTURE = () => {
        const element = document.getElementById('mindapp-container');
        if (element) {
            html2canvas(element).then((canvas) => {
                const dataURL = canvas.toDataURL('image/png');
                const link = document.createElement('a');   
                link.href = dataURL;
                link.download = 'mindapp.png';
                link.click();
            });
        }
        setShowExport(false);
    };
    

    return (
        <>
            {/* Toolbar */}
            <div className="bg-white shadow-md p-4 flex gap-4 justify-center">
                <>
                    <button
                        onClick={handleAccountClick}
                        className="flex flex-row justify-center items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-800 transition-colors"
                    >
                        <img src="../img/icon/account_icon.svg" alt="Account" />
                        Account
                    </button>

                    {showAuth && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="relative">
                                <button 
                                    onClick={() => setShowAuth(false)} 
                                    className="text-neutral-950 absolute top-2 right-2 font-bold"
                                >
                                    &#10005;
                                </button>
                                <AuthSystem/>
                            </div>
                        </div>
                    )}
                </>
                <button
                    onClick={onDeleteNode }
                    disabled={selectedNodeId === null}
                    className={` flex flex-row justify-center items-center px-4 py-2 rounded-lg ${
                        selectedNodeId === null 
                            ? 'bg-gray-200 cursor-not-allowed'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                    } transition-colors`}
                >
                    <img src="../img/icon/remove_icon.svg" alt="Delete Node" />
                    Delete Node
                </button>
                <button
                    onClick={handleExportClick}
                    className=" flex flex-row justify-center items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-800 transition-colors"
                >
                    <img src="../img/icon/save_icon.svg" alt="Export MindApp" />
                    Export MindApp
                </button>
                <label className=" flex flex-row justify-center items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-800 transition-colors cursor-pointer">
                    <img src="../img/icon/import_icon.svg" alt="Import MindApp" />
                    Import MindApp
                    <input
                        type="file"
                        accept="application/json"
                        className="hidden"
                        onChange={onImport}
                    />
                </label>
                <button
                    onClick={onZoomIn}
                    className=" flex flex-row justify-center items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-800 transition-colors"
                >
                    <img src="../img/icon/zoom-out_icon.svg" alt="Zoom In" />
                    Zoom +
                </button>
                <button
                    onClick={onZoomOut}
                    className=" flex flex-row justify-center items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-800 transition-colors"
                >
                    <img src="../img/icon/zoom-out_icon.svg" alt="Zoom Out" />
                    Zoom -
                </button>
                <span className="self-center">
                    Zoom: {Math.round(zoom * 100)}
                </span>
            </div>

            
            {/* Export Modal */}
            {showExport && (
                <Export
                    onClose={handleCloseExport}
                    onExport_JSON={handleExport_JSON}
                    onExport_PNG={handleExport_PICTURE}
                />
            )}
        </>
    );
};

export default Toolbar;