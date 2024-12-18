import React, { useRef, useState, useCallback, useEffect } from 'react';
import Toolbar from '../components/Utilities/Toolbar';
import Popup from '../components/ui/popup_RC';

interface Node {
    id: number;
    x: number;
    y: number;
    text: string;
    color: string;
}

interface Breakpoint {
    id: number
    x: number
    y: number
}

interface Link {
    source: number;
    target: number;
}



const Canvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [zoom, setZoom] = useState(1);

    const [nodes, setNodes] = useState<Node[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const [bp, setBP] = useState<Breakpoint[]>([]);

    const [isDragging, setIsDragging] = useState(false);
    const [draggingNodeId, setDraggingNodeId] = useState<number | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
    const [editingNodeId, setEditingNodeId] = useState<number | null>(null);   
    const [editingText, setEditingText] = useState<string>('');
    const [connectingNodeId, setConnectingNodeId] = useState<number | null>(null);

    const [draggingBPid, setDraggingBPid] = useState<number | null>(null);
    const [selectedBPid, setSelectedBPid] = useState<number | null>(null);
    const [connectingBPid, setConnectingBPid] = useState<number | null>(null);

    const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);


    const addNode = (node: Node) => {
        setNodes((prevNodes) => [...prevNodes, node]);
    };
    const addBP = (bp: Breakpoint) => {
        setBP((prevBP) => [...prevBP, bp])
    }

    const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const { clientX, clientY } = e;
        setPopupPosition({ x: clientX, y: clientY });
    };

    const handleClosePopup = () => {
        setPopupPosition(null);
    };

    const handleAddNode = () => {
        if (popupPosition) {
            const canvas = canvasRef.current;
            const canvasRect = canvas?.getBoundingClientRect();
            
            if (canvasRect) {
                const x = (popupPosition.x - canvasRect.left) / zoom;
                const y = (popupPosition.y - canvasRect.top) / zoom;
    
                const newNode = {
                    id: Date.now(),
                    x: x,
                    y: y,
                    text: 'New idea',
                    color: '#FFFFFF',
                };
                addNode(newNode);
                handleClosePopup();
            }
        }
    };
    const handleAddBP = () => {
        if (popupPosition) {
            const canvas = canvasRef.current;
            const canvasRect = canvas?.getBoundingClientRect();
            
            if (canvasRect) {
                const x = (popupPosition.x - canvasRect.left) / zoom;
                const y = (popupPosition.y - canvasRect.top) / zoom;
    
                const newBP = {
                    id: Date.now(),
                    x: x,
                    y: y,
                };
                addBP(newBP);
                handleClosePopup();
            }
        }
    };

    const deleteSelectedBP = useCallback(() => {
        if (selectedBPid === null) return;
    
        const connectedLinks = links.filter(
            (link) =>
                link.source === selectedBPid || link.target === selectedBPid
        );
    
        if (connectedLinks.length === 2) {
            const [link1, link2] = connectedLinks;
            const bpId1 =
                link1.source === selectedBPid ? link1.target : link1.source;
            const bpId2 =
                link2.source === selectedBPid ? link2.target : link2.source;
    
            if (bpId1 !== bpId2) {
                const newLink: Link = {
                    source: bpId1,
                    target: bpId2,
                };
                setLinks((prevLinks) => [
                    ...prevLinks.filter(
                        (link) =>
                            link.source !== selectedBPid &&
                            link.target !== selectedBPid
                    ),
                    newLink,
                ]);
            } else {
                setLinks((prevLinks) =>
                    prevLinks.filter(
                        (link) =>
                            link.source !== selectedBPid &&
                            link.target !== selectedBPid
                    )
                );
            }
        } else {
            setLinks((prevLinks) =>
                prevLinks.filter(
                    (link) =>
                        link.source !== selectedBPid &&
                        link.target !== selectedBPid
                )
            );
        }
    
        setBP((prevBP) =>
            prevBP.filter((bp) => bp.id !== selectedBPid)
        );
        setSelectedBPid(null);
    }, [selectedBPid, links]);

    const deleteSelectedNode = useCallback(() => {
        if (selectedNodeId === null) return;
    
        const connectedLinks = links.filter(
            (link) =>
                link.source === selectedNodeId || link.target === selectedNodeId
        );
    
        if (connectedLinks.length === 2) {
            const [link1, link2] = connectedLinks;
            const nodeId1 =
                link1.source === selectedNodeId ? link1.target : link1.source;
            const nodeId2 =
                link2.source === selectedNodeId ? link2.target : link2.source;
    
            if (nodeId1 !== nodeId2) {
                const newLink: Link = {
                    source: nodeId1,
                    target: nodeId2,
                };
                setLinks((prevLinks) => [
                    ...prevLinks.filter(
                        (link) =>
                            link.source !== selectedNodeId &&
                            link.target !== selectedNodeId
                    ),
                    newLink,
                ]);
            } else {
                setLinks((prevLinks) =>
                    prevLinks.filter(
                        (link) =>
                            link.source !== selectedNodeId &&
                            link.target !== selectedNodeId
                    )
                );
            }
        } else {
            setLinks((prevLinks) =>
                prevLinks.filter(
                    (link) =>
                        link.source !== selectedNodeId &&
                        link.target !== selectedNodeId
                )
            );
        }
    
        setNodes((prevNodes) =>
            prevNodes.filter((node) => node.id !== selectedNodeId)
        );
        setSelectedNodeId(null);
    }, [selectedNodeId, links]);

    const drawLinks = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(zoom, zoom);

        links.forEach((link) => {
            const sourceNode = nodes.find((node) => node.id === link.source);
            const targetNode = nodes.find((node) => node.id === link.target);

            const sourceBP = bp.find((bp) => bp.id === link.source);
            const targetBP = bp.find((bp) => bp.id === link.target);

            if (sourceNode && targetNode) {
                ctx.beginPath();
                ctx.moveTo(sourceNode.x, sourceNode.y);
                ctx.lineTo(targetNode.x, targetNode.y);
                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = 2 / zoom;
                ctx.stroke(); 
            } else {
                if (sourceBP && targetBP){
                    ctx.beginPath();
                    ctx.moveTo(sourceBP.x, sourceBP.y);
                    ctx.lineTo(targetBP.x, targetBP.y);
                    ctx.strokeStyle = '#64748b';
                    ctx.lineWidth = 2 / zoom;
                    ctx.stroke();
                } else {
                    if (sourceNode && targetBP) {
                        ctx.beginPath();
                        ctx.moveTo(sourceNode.x, sourceNode.y);
                        ctx.lineTo(targetBP.x, targetBP.y);
                        ctx.strokeStyle = '#64748b';
                        ctx.lineWidth = 2 / zoom;
                        ctx.stroke();
                    } else {
                        if (sourceBP && targetNode) {
                            ctx.beginPath();
                            ctx.moveTo(sourceBP.x, sourceBP.y);
                            ctx.lineTo(targetNode.x, targetNode.y);
                            ctx.strokeStyle = '#64748b';
                            ctx.lineWidth = 2 / zoom;
                            ctx.stroke(); 
                        }   
                    }
                }
            }
        });
        ctx.restore();
    }, [zoom, links, nodes, bp]);
    
    const handleConnectNode = useCallback(() => {
        if (selectedNodeId !== null) {
            setConnectingNodeId(selectedNodeId);
        }
    }, [selectedNodeId]);
    const handelConnectBP = useCallback(() => {
        if (selectedBPid !== null) {
            setConnectingBPid(selectedBPid);
        }
    }, [selectedBPid]);

    const changeNodeColor = (nodeId: number, newColor: string) => {
        setNodes(prevNodes => 
            prevNodes.map(node => 
                node.id === nodeId 
                    ? { ...node, color: newColor } 
                    : node
            )
        );
    };

    const handleZoomIn = () => {
        setZoom(prevZoom => Math.min(prevZoom + 0.1, 2));
    };

    const handleZoomOut = () => {
        setZoom(prevZoom => Math.max(prevZoom - 0.1, 0.5));
    };

    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Delete') {
            deleteSelectedNode();
            deleteSelectedBP();
        }
        if (event.key === 'l') {
            handleConnectNode();
            handelConnectBP();
        }
    }, [deleteSelectedNode, deleteSelectedBP, handleConnectNode, handelConnectBP]);

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (e.button === 2) return; 
    };

    const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('.node-box') || target.closest('.bp-box')) {
            return;
        }
        setSelectedNodeId(null);
        setSelectedBPid(null);
        setConnectingNodeId(null);
        setConnectingBPid(null);

        if (!target.closest('.popup')) {
            setPopupPosition(null);
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging || draggingNodeId || draggingBPid=== null) return;
        const { clientX, clientY } = e;
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        if (!canvasRect) return;
        const offsetX = (clientX - canvasRect.left) / zoom;
        const offsetY = (clientY - canvasRect.top) / zoom;
        setNodes((prevNodes) => prevNodes.map(node => 
            node.id === draggingNodeId ? { ...node, x: offsetX, y: offsetY } : node
        ));
        setBP((prevBP) => prevBP.map(bp =>
            bp.id === draggingBPid ? { ...bp, x:offsetX, y: offsetY } : bp
        ))
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDraggingNodeId(null);
        setDraggingBPid(null);
    };

    const handleNodeDoubleClick = (nodeId: number, text: string) => {
        setEditingNodeId(nodeId);
        setEditingText(text === 'New idea' ? '' : text);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditingText(e.target.value);
    };

    const handleInputBlur = () => {
        if (editingNodeId !== null) {
            if (editingText.trim() === '') {
                setNodes((prevNodes) => prevNodes.filter(node => node.id !== editingNodeId));
            } else {
                setNodes((prevNodes) => prevNodes.map(node => 
                    node.id === editingNodeId ? { ...node, text: editingText } : node
                ));
            }
            setEditingNodeId(null);
        }
    };

    const handleNodeMouseDown = (
        e: React.MouseEvent<HTMLDivElement>,
        nodeId: number,
    ) => {
        e.stopPropagation();
        if (connectingNodeId !== null) {
            if (connectingNodeId !== nodeId) {
                const newLink: Link = {
                    source: connectingNodeId,
                    target: nodeId,
                };
                setLinks((prevLinks) => [...prevLinks, newLink]);
            }
            setConnectingNodeId(null);
        } else {
            setDraggingNodeId(nodeId);
            setSelectedNodeId(nodeId);

            setIsDragging(true);

        }
    };

    const handleBPMouseDown = (
        e: React.MouseEvent<HTMLDivElement>,
        bpId: number
    ) => {
        e.stopPropagation();
        if (connectingBPid !== null) {
            if (connectingBPid !== bpId) {
                const newLink: Link = {
                    source: connectingBPid,
                    target: bpId,
                };
                setLinks((prevLinks) => [...prevLinks, newLink]);
            }
            setConnectingBPid(null);
        } else {
            setDraggingBPid(bpId);
            setSelectedBPid(bpId);

            setIsDragging(true);
        }
    };


    const handleExport = () => {
        const data = JSON.stringify({ nodes, links });
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mindmap.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if (typeof result === 'string') {
                    const parsed = JSON.parse(result);
                    setNodes(parsed.nodes || []);
                    setLinks(parsed.links || []);
                }
            };
            reader.readAsText(file);
        }
    };

    useEffect(() => {
        drawLinks();
        
        const handleWindowMouseUp = () => {
            setIsDragging(false);
            setDraggingNodeId(null);
            setDraggingBPid(null)
        };

        const handleWindowMouseMove = (e: MouseEvent) => {
            if (!isDragging || draggingNodeId === null) return;
            const { clientX, clientY } = e;
            const canvasRect = canvasRef.current?.getBoundingClientRect();
            if (!canvasRect) return;
            const offsetX = (clientX - canvasRect.left) / zoom;
            const offsetY = (clientY - canvasRect.top) / zoom;
            setNodes((prevNodes) => prevNodes.map(node => 
                node.id === draggingNodeId ? { ...node, x: offsetX, y: offsetY } : node
            ));
            setBP((prevBP) => prevBP.map(bp =>
                bp.id === draggingBPid ? { ...bp, x: offsetX, y: offsetY } : bp
            ))
        };

        const updateCanvasSize = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            drawLinks();
        };

        window.addEventListener('mouseup', handleWindowMouseUp);
        window.addEventListener('mousemove', handleWindowMouseMove);
        document.addEventListener('keydown', handleKeyPress);

        window.addEventListener('resize', updateCanvasSize);
        updateCanvasSize();

        return () => {
            window.removeEventListener('resize', updateCanvasSize);
            window.removeEventListener('mouseup', handleWindowMouseUp);
            window.removeEventListener('mousemove', handleWindowMouseMove);
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [isDragging, draggingNodeId, draggingBPid,  zoom, handleKeyPress, links, nodes, bp, drawLinks]);

    return (
        <div className="flex flex-col h-screen">
            <Toolbar 
                selectedNodeId={selectedNodeId}
                selectedBPid={selectedBPid}
                zoom={zoom}
                onDeleteNode={deleteSelectedNode}
                onConnectNode={handleConnectNode}

                onDeleteBP={deleteSelectedBP}
                onConnectBP={handelConnectBP}

                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onExport={handleExport}
                onImport={handleImport}
                canvasRef={canvasRef}
            />

            <div
                id="mindapp-container"
                className="relative flex-grow bg-gray-50"
                onContextMenu={(e) => e.preventDefault()}
                onClick={handleClickOutside}
            > 
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                    onMouseDown={handleMouseDown}
                    onContextMenu={handleContextMenu}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                />

                {nodes.map((node) => (
                    <div
                        key={node.id}
                        className={`node-box absolute px-4 py-2 rounded-lg shadow-md transition-shadow cursor-pointer ${
                            selectedNodeId === node.id
                                ? 'border-dashed border-2 border-emerald-600'
                                : ''
                        }`}
                        style={{
                            left: `${node.x * zoom}px`,
                            top: `${node.y * zoom}px`,
                            transform: `translate(-50%, -50%) scale(${zoom})`,
                            backgroundColor: node.color || '#fff',
                        }}
                        onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                        onDoubleClick={() => handleNodeDoubleClick(node.id, node.text)}
                    >
                        {editingNodeId === node.id ? (
                            <input
                                type="text"
                                value={editingText}
                                onChange={handleInputChange}
                                onBlur={handleInputBlur}
                                autoFocus
                                className="border border-gray-300 rounded px-2 py-1 w-full"
                            />
                        ) : (
                            <span>{node.text}</span>
                        )}

                        {selectedNodeId === node.id && (
                            <input
                                type="color"
                                value={node.color || '#ffffff'}  
                                onChange={(e) => {
                                    e.stopPropagation(); 
                                    changeNodeColor(node.id, e.target.value);
                                }}
                                className="absolute top-full left-0 mt-1 ml-2"
                            />
                        )}
                    </div>
                ))}

                {bp.map((bp) => (
                    <div
                        key={bp.id}
                        className={`bp-box absolute px-4 py-2 rounded-lg shadow-md transition-shadow cursor-pointer ${
                            selectedBPid === bp.id
                                ? 'border-dashed border-2 border-emerald-600'
                                : ''
                        }`}
                        style={{
                            left: `${bp.x * zoom}px`,
                            top: `${bp.y * zoom}px`,
                            transform: `translate(-50%, -50%) scale(${zoom})`,
                            backgroundColor: '#BBCA',
                        }}
                        onMouseDown={(e) => (handleBPMouseDown(e, bp.id), console.log(e, bp.id, selectedBPid))}
                    >
                    </div>
                ))}

                {popupPosition && (
                    <Popup
                        x={popupPosition.x}
                        y={popupPosition.y}
                        onAddNode={handleAddNode}
                        onAddBP={handleAddBP}
                        onClose={handleClosePopup}
                    />
                )}
            </div>
        </div>
    );
};

export default Canvas;