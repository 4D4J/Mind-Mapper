import React, { useState } from 'react';
import AuthSystem from '../auth';

interface ToolbarProps {
    selectedNodeId: number | null;
    zoom: number;
    onDeleteNode: () => void;
    onConnectNode: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onExport: () => void;
    onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
    selectedNodeId,
    zoom,
    onDeleteNode,
    onConnectNode,
    onZoomIn,
    onZoomOut,
    onExport,
    onImport
}) => {
    const [showAuth, setShowAuth] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);

    const handleAccountClick = () => {
        setShowAuth(true);
    };

    const handleHideInstructions = () => {
        setShowInstructions(false);
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
                    onClick={onDeleteNode}
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
                    onClick={onConnectNode}
                    disabled={selectedNodeId === null}
                    className={` flex flex-row justify-center items-center px-4 py-2 rounded-lg ${
                        selectedNodeId === null
                            ? 'bg-gray-200 cursor-not-allowed'
                            : 'bg-teal-600 hover:bg-teal-800 text-white'
                    } transition-colors`}
                >
                    <img src="../img/icon/connect_icon.svg" alt="Connect Node" />
                    Connect node
                </button>
                <button
                    onClick={onExport}
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
                    Zoom: {Math.round(zoom * 100)}%
                </span>
            </div>

            {/* Instructions */}
            {showInstructions && (
                <div className="bg-gray-100 p-4 relative">
                    <button
                        onClick={handleHideInstructions}
                        className="absolute top-2 right-2 text-neutral-950 focus:outline-none  font-bold"
                        aria-label="Close instruction"
                    >
                        &#10005;
                    </button>
                    <h1 className="text-xl font-bold">Instructions</h1>
                    <ul className="list-disc list-inside mt-2">
                        <li>Right Click to add a Node</li>
                        <li>Drag and drop a Node to move it</li>
                        <li>Double-click on a Node to edit the default text</li>
                        <li>Delete a Node by selecting it and clicking on the "Delete Node" or using the key `suppr`</li>
                        <li>Connect Nodes by selecting the start Node, clicking on "Connect Node" or clicking on `L` and then selecting the end Node</li>
                        <li>Change the color of a Node by selecting it and then clicking on the color picker</li>
                        <li>Use the button "Zoom +" and "Zoom -" to zoom in and out</li>
                        <li>Export your MindApp by clicking on "Export MindApp"</li>
                        <li>Import a MindApp by clicking on "Import MindApp"</li>
                    </ul>
                </div>
            )}
        </>
    );
};

export default Toolbar;