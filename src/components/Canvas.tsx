import React, { useRef, useState, useCallback, useEffect } from 'react';
import Toolbar from '../components/Utilities/Toolbar';

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
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const [draggingNodeId, setDraggingNodeId] = useState<number | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
    const [editingNodeId, setEditingNodeId] = useState<number | null>(null);   
    const [editingText, setEditingText] = useState<string>('');
    const [zoom, setZoom] = useState(1);
    const [connectingNodeId, setConnectingNodeId] = useState<number | null>(null);

    const addNode = (node: Node) => {
        setNodes((prevNodes) => [...prevNodes, node]);
    };

    const deleteSelectedNode = () => {
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
    };

    const drawLinks = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(zoom, zoom);

        links.forEach((link) => {
            const sourceNode = nodes.find((node) => node.id === link.source);
            const targetNode = nodes.find((node) => node.id === link.target);

            if (sourceNode && targetNode) {
                ctx.beginPath();
                ctx.moveTo(sourceNode.x, sourceNode.y);
                ctx.lineTo(targetNode.x, targetNode.y);
                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = 2 / zoom;
                ctx.stroke(); 
            }
        });

        ctx.restore();
    };
    
    const handleConnectNode = () => {
        if (selectedNodeId !== null) {
            setConnectingNodeId(selectedNodeId);
        }
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

    const handleZoomIn = () => {
        setZoom(prevZoom => Math.min(prevZoom + 0.1, 2));
    };

    const handleZoomOut = () => {
        setZoom(prevZoom => Math.max(prevZoom - 0.1, 0.5));
    };

    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Delete') {
            deleteSelectedNode();
        }
        if (event.key === 'l') {
            handleConnectNode();
        }
        console.log(event.key);
    }, [deleteSelectedNode, handleConnectNode]);

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (e.button === 2) {
            const { offsetX, offsetY } = e.nativeEvent;
            const newNode = {
                id: Date.now(),
                x: offsetX / zoom,
                y: offsetY / zoom,
                text: 'New idea',
                color: '#FFFFFF',
            };
            addNode(newNode);
        }
    };

    const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('.node-box')) {
            return;
        }
        setSelectedNodeId(null);
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
        nodeId: number
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
            setIsDragging(true);
            setSelectedNodeId(nodeId);
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
    }, [isDragging, draggingNodeId, zoom, handleKeyPress, links, nodes]);

    return (
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
            />

            <div
                className="relative flex-grow bg-gray-50"
                onContextMenu={(e) => e.preventDefault()}
                onClick={handleClickOutside}
            >
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
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
            </div>
        </div>
    );
};

export default Canvas;