import React, { useRef, useState, useCallback, useEffect } from 'react';
import Toolbar from '../components/Utilities/Toolbar';
import NodeMenu from '../components/Utilities/NodeMenu';


interface Node {
    id: number;
    x: number;
    y: number;
    text: string;
    color: string;
}

interface Link {
    source: number;
    target: number;
}



const Canvas = () => {

    // variable qui doivent-être déclarées 
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [zoom, setZoom] = useState(1);

    const [nodes, setNodes] = useState<Node[]>([]);
    const [links, setLinks] = useState<Link[]>([]);

    const [nodeStyles, setNodeStyles] = useState<Record<number, { bold: boolean; italic: boolean; underline: boolean }>>({});
    const [isDragging, setIsDragging] = useState(false);
    const [draggingNodeId, setDraggingNodeId] = useState<number | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
    const [editingNodeId, setEditingNodeId] = useState<number | null>(null);   
    const [editingText, setEditingText] = useState<string>('');
    const [connectingNodeId, setConnectingNodeId] = useState<number | null>(null);

    const hasInitialNodeBeenAdded = useRef(false);



    // logique Node et Link
    const addNode = (node: Node) => {
        setNodes((prevNodes) => [...prevNodes, node]);
    };
    const handleAddNode = (position: string) => {
        if (selectedNodeId === null) return;
    
        const selectedNode = nodes.find(node => node.id === selectedNodeId);
        if (!selectedNode) return;
    
        const newNodeId = Date.now();
        let newX = selectedNode.x;
        let newY = selectedNode.y;
    

        switch (position) {
            case 'top':
                newY += 100;  
                break;
            case 'bottom':
                newY -= 100;  
                break;
            case 'left':
                newX -= 200;  
                break;
            case 'right':
                newX += 200;  
                break;
        }
    
        const newNode = {
            id: newNodeId,
            x: newX,
            y: newY,
            text: 'New idea',
            color: '#FFFFFF',
        };
    
        setNodes((prevNodes) => [...prevNodes, newNode]);
    
        const newLink: Link = {
            source: selectedNodeId,
            target: newNodeId,
        };

        setLinks((prevLinks) => [...prevLinks, newLink]);

        setSelectedNodeId(newNodeId);
    };
    const deleteSelectedNode = useCallback(() => {
        if (selectedNodeId === null) return;
        if (selectedNodeId === 0) return;
        
        const connectedLinks = links.filter(
            (link) => link.source === selectedNodeId || link.target === selectedNodeId
        );
    
        if (connectedLinks.length !== 2) {return};

        const node1Id = connectedLinks[0].source === selectedNodeId 
            ? connectedLinks[0].target 
            : connectedLinks[0].source;
        
        const node2Id = connectedLinks[1].source === selectedNodeId 
            ? connectedLinks[1].target 
            : connectedLinks[1].source;
    
        const newLinks = node1Id !== node2Id 
            ? [
                ...links.filter(
                    (link) => 
                        link.source !== selectedNodeId && 
                        link.target !== selectedNodeId
                ),
                { source: node1Id, target: node2Id }
            ]
            : links.filter(
                (link) => 
                    link.source !== selectedNodeId && 
                    link.target !== selectedNodeId
            );

        const updatedNodes = nodes.filter((node) => node.id !== selectedNodeId);

        setNodes(updatedNodes);
        setLinks(newLinks);

        setSelectedNodeId(null);
    }, [selectedNodeId, links, nodes]);
    const handleConnectNode = useCallback(() => {
        if (selectedNodeId !== null) {
            setConnectingNodeId(selectedNodeId);
        }
    }, [selectedNodeId]);
    const drawLinks = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(zoom, zoom);

        try {
            links.forEach((link) => {

                let sourceX, sourceY, targetX, targetY;

                // Trouver les coordonnées de la source
                const sourceNode = nodes.find((node) => node.id === link.source);

                
                if (sourceNode) {
                    sourceX = sourceNode.x;
                    sourceY = sourceNode.y;
                }

                // Trouver les coordonnées de la cible
                const targetNode = nodes.find((node) => node.id === link.target);
                
                if (targetNode) {
                    targetX = targetNode.x;
                    targetY = targetNode.y;
                } 
                // Dessiner le lien si les coordonnées sont valides
                if (sourceX !== undefined && sourceY !== undefined && 
                    targetX !== undefined && targetY !== undefined) {
                    ctx.beginPath();
                    ctx.moveTo(sourceX, sourceY);
                    ctx.lineTo(targetX, targetY);
                    ctx.strokeStyle = '#64748b';
                    ctx.lineWidth = 2 / zoom;
                    ctx.stroke();
                }
            });
        
        } catch (error) {
            console.error('Erreur lors du dessin des liens :', error);
        }
    
        ctx.restore();
    }, [zoom, links, nodes]);
    
    // logique click de la souris et touche pressée
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (e.button === 2) return; 
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
    const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('.node-box') || target.closest('.bp-box')) {
            return;
        }
        setSelectedNodeId(null);
        setConnectingNodeId(null);

    };
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging || draggingNodeId === null) return;
        const { clientX, clientY } = e;
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        if (!canvasRect) return;
        const offsetX = (clientX - canvasRect.left) / zoom;
        const offsetY = (clientY - canvasRect.top) / zoom;
        setNodes((prevNodes) => prevNodes.map(node => 
            node.id === draggingNodeId ? { ...node, x: offsetX, y: offsetY } : node
        ));
        

    };
    const handleMouseUp = () => {
    setIsDragging(false);
    setDraggingNodeId(null);
    };
    const handleNodeDoubleClick = (nodeId: number, text: string) => {
        setEditingNodeId(nodeId);
        setEditingText(text === 'New idea' ? '' : text);
    };
    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Delete') {
            deleteSelectedNode();
        }
    }, [deleteSelectedNode]);

    // logique bouton fonctionnalitée
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
    const handleZoomIn = () => {
        setZoom(prevZoom => Math.min(prevZoom + 0.1, 2));
    };
    const handleZoomOut = () => {
        setZoom(prevZoom => Math.max(prevZoom - 0.1, 0.5));
    };
    const handleStyleChange = (nodeId: number, styles: { bold?: boolean; italic?: boolean; underline?: boolean }) => {
        setNodeStyles(prev => ({
            ...prev,
            [nodeId]: { ...(prev[nodeId] || { bold: false, italic: false, underline: false }), ...styles }
        }));
    };
    const changeNodeColor = (nodeId: number, newColor: string) => {
        setNodes(prevNodes => 
            prevNodes.map(node => 
                node.id === nodeId 
                    ? { ...node, color: newColor } 
                    : node
            )
        );
    };

    // logique ???
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


    useEffect(() => {
        drawLinks();
        
        const handleWindowMouseUp = () => {
            setIsDragging(false);
            setDraggingNodeId(null);
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
    }, [isDragging, draggingNodeId,  zoom, handleKeyPress, links, nodes, drawLinks]);


    return (
    
        useEffect(() => {
            if (!hasInitialNodeBeenAdded.current && nodes.length === 0) {
                const defaultNode = {
                    id: 0,
                    x: 750,  
                    y: 350,  
                    text: 'Start Here',
                    color: '#FFFFFF',
                    deleteable: false,
                };
                addNode(defaultNode);
                hasInitialNodeBeenAdded.current = true;
            }
        }, [nodes.length]),

        <div className="flex flex-col h-screen">
            <Toolbar 
                selectedNodeId={selectedNodeId}
                zoom={zoom}
                onDeleteNode={deleteSelectedNode}
                onConnectNode={handleConnectNode}

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
                <NodeMenu
                    selectedNodeId={selectedNodeId}
                    onColorChange={changeNodeColor}
                    onStyleChange={handleStyleChange}
                />
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                    style={{ 
                        width: '100%',
                        height: '100%',
                        display: 'block'
                    }}
                    onMouseDown={handleMouseDown}
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
                            userSelect: 'none',
                            backgroundColor: node.color || '#fff',
                            fontWeight: nodeStyles[node.id]?.bold ? 'bold' : 'normal',
                            fontStyle: nodeStyles[node.id]?.italic ? 'italic' : 'normal',
                            textDecoration: nodeStyles[node.id]?.underline ? 'underline' : 'none',
                            
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
                            <div className='absolute inset-0 flex items-center justify-center'>
                                {/* Top button */}
                                <button 
                                    onClick={() => handleAddNode('bottom')}
                                    className='absolute top-0 left-1/2 -translate-y-8 -translate-x-1/2 w-6 h-6 bg-violet-500 text-white rounded-full hover:bg-emerald-700'
                                >
                                    +
                                </button>
                                
                                {/* Bottom button */}
                                <button 
                                    onClick={() => handleAddNode('top')}
                                    className='absolute bottom-0 left-1/2 translate-y-8 -translate-x-1/2 w-6 h-6 bg-violet-500 text-white rounded-full hover:bg-emerald-700'
                                >
                                    +
                                </button>
                                
                                {/* Left button */}
                                <button 
                                    onClick={() => handleAddNode('left')}
                                    className='absolute left-0 top-1/2 -translate-x-8 -translate-y-1/2 w-6 h-6 bg-violet-500 text-white rounded-full hover:bg-emerald-700 items-center justify-center'
                                >
                                    +
                                </button>
                                
                                {/* Right button */}
                                <button 
                                    onClick={() => handleAddNode('right')}
                                    className='absolute right-0 top-1/2 translate-x-8 -translate-y-1/2 w-6 h-6 bg-violet-500 text-white rounded-full hover:bg-emerald-700'
                                >
                                    +
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Canvas;

<<<<<<< HEAD
// Work in progress
=======
// Work in progress
>>>>>>> dd9d8e52746452cdcc0d601ec6fcc041e7abd6a6
