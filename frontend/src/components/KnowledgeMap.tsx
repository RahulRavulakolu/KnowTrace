'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  NodeProps,
  MarkerType,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { KnowledgeGraphData } from '@/types';
import { getMasteryColor } from '@/lib/utils';
import { AlertTriangle, Filter, Sparkles } from 'lucide-react';

// Custom Concept Node Component
function ConceptNode({ data, selected }: NodeProps) {
  const mastery = (data?.mastery as number) ?? 50;
  const color = getMasteryColor(mastery);
  const isKey = !!data?.isKeyConcept;
  const miscCount = (data?.misconceptionsCount as number) || 0;
  const isDimmed = !!data?.isDimmed;
  const isHighlighted = !!data?.isHighlighted;

  return (
    <div
      className={`px-4 py-3 rounded-xl bg-[#141619] border-2 shadow-md transition-all duration-200 cursor-pointer min-w-[180px] relative ${
        color.border
      } ${
        isHighlighted
          ? 'ring-4 ring-[#E06D3B]/70 shadow-xl scale-[1.03]'
          : selected
          ? 'ring-2 ring-[#E06D3B] shadow-lg'
          : isKey
          ? 'ring-2 ring-[#E06D3B]/30'
          : ''
      } ${
        isDimmed
          ? 'opacity-25 grayscale-[40%] hover:opacity-90 hover:grayscale-0'
          : 'opacity-100'
      }`}
    >
      {/* Target Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="target-left"
        className="w-2.5 h-2.5 !bg-[#E06D3B] border-2 border-[#141619]"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="target-top"
        className="w-2.5 h-2.5 !bg-[#E06D3B] border-2 border-[#141619]"
      />

      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[10px] uppercase font-bold text-[#7E8078] tracking-wider truncate">
          {(data?.topic as string) || 'Concept'}
        </span>
        <div className="flex items-center gap-1">
          {isHighlighted && (
            <span title="Matches current mastery filter" className="text-[#E06D3B] animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          )}
          {miscCount > 0 && (
            <span title={`${miscCount} detected misconception`} className="text-rose-500">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>

      <div className="text-xs font-bold text-[#F6F5EE] truncate">
        {(data?.label as string) || 'Node'}
      </div>

      <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-[#1D2024] text-[11px]">
        <span className="text-[#7E8078] font-medium">Mastery</span>
        <span className={`font-mono font-bold ${color.text}`}>{mastery}%</span>
      </div>

      {/* Source Handles */}
      <Handle
        type="source"
        position={Position.Right}
        id="source-right"
        className="w-2.5 h-2.5 !bg-[#E06D3B] border-2 border-[#141619]"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-bottom"
        className="w-2.5 h-2.5 !bg-[#E06D3B] border-2 border-[#141619]"
      />
    </div>
  );
}

const nodeTypes = {
  concept: ConceptNode,
  conceptNode: ConceptNode,
  default: ConceptNode,
};

interface KnowledgeMapProps {
  graphData: KnowledgeGraphData;
  onSelectConcept: (conceptId: string) => void;
  selectedConceptId?: string | null;
}

export function KnowledgeMap({
  graphData,
  onSelectConcept,
  selectedConceptId,
}: KnowledgeMapProps) {
  const [filter, setFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  // Compute mastery counts for interactive filter badges
  const filterCounts = useMemo(() => {
    let low = 0;
    let medium = 0;
    let high = 0;
    for (const n of graphData.nodes) {
      const m = (n.data?.mastery as number) ?? 50;
      if (m < 50) low++;
      else if (m < 75) medium++;
      else high++;
    }
    return {
      all: graphData.nodes.length,
      low,
      medium,
      high,
    };
  }, [graphData.nodes]);

  // Formatted Nodes with active filter and dimming states
  const formattedNodes = useMemo(() => {
    return graphData.nodes.map((n) => {
      const mastery = (n.data?.mastery as number) ?? 50;
      const isMatch =
        filter === 'all'
          ? true
          : filter === 'low'
          ? mastery < 50
          : filter === 'medium'
          ? mastery >= 50 && mastery < 75
          : mastery >= 75;

      const isDimmed = filter !== 'all' && !isMatch;
      const isHighlighted = filter !== 'all' && isMatch;

      return {
        ...n,
        type: 'concept',
        selected: selectedConceptId === n.id,
        data: {
          ...n.data,
          isDimmed,
          isHighlighted,
        },
      };
    });
  }, [graphData.nodes, filter, selectedConceptId]);

  // Formatted Edges with distinct relation styles and arrow markers
  const formattedEdges = useMemo(() => {
    const matchingNodeIds = new Set(
      formattedNodes.filter((n) => !n.data.isDimmed).map((n) => n.id)
    );

    return graphData.edges.map((e) => {
      const isConfusable = e.data?.relation === 'confusable';
      const isContains = e.data?.relation === 'contains';
      const isEdgeActive =
        filter === 'all' ||
        (matchingNodeIds.has(e.source) && matchingNodeIds.has(e.target));

      const strokeColor = isConfusable
        ? '#f59e0b'
        : isContains
        ? '#10b981'
        : '#E06D3B';

      return {
        ...e,
        animated: isEdgeActive && !isConfusable,
        style: {
          stroke: strokeColor,
          strokeWidth: isEdgeActive ? 2.5 : 1,
          strokeDasharray: isConfusable ? '5,5' : undefined,
          opacity: isEdgeActive ? 1 : 0.2,
          transition: 'all 0.2s ease',
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
          color: strokeColor,
        },
      };
    });
  }, [graphData.edges, formattedNodes, filter]);

  const [nodes, setNodes, onNodesChange] = useNodesState(formattedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(formattedEdges);

  // Synchronize state when formattedNodes changes (filter change or course switch)
  useEffect(() => {
    setNodes(formattedNodes);
  }, [formattedNodes, setNodes]);

  // Synchronize state when formattedEdges changes
  useEffect(() => {
    setEdges(formattedEdges);
  }, [formattedEdges, setEdges]);

  return (
    <div className="w-full h-[650px] lg:h-[calc(100vh-13rem)] min-h-[620px] bg-[#0C0D0E] rounded-2xl border border-[#1D2024] relative overflow-hidden shadow-xs">
      {/* Top Filter & Legend Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between flex-wrap gap-2 pointer-events-none">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#141619]/90 backdrop-blur-md rounded-xl border border-[#1D2024] shadow-sm pointer-events-auto text-xs">
          <span className="px-2 font-semibold text-[#7E8078] flex items-center gap-1 text-[11px]">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {(['all', 'low', 'medium', 'high'] as const).map((key) => {
            const count = filterCounts[key];
            const isSelected = filter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#E06D3B] text-white shadow-2xs font-bold'
                    : 'text-[#C8C6B9] hover:bg-[#1A1D21] hover:text-[#F6F5EE]'
                }`}
              >
                <span>{key === 'all' ? 'All Concepts' : `${key} Mastery`}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-black/30 text-[#7E8078]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="hidden lg:flex items-center gap-4 px-3.5 py-2 bg-[#141619]/90 backdrop-blur-md rounded-xl border border-[#1D2024] shadow-sm pointer-events-auto text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-[#7E8078]">Low (&lt;50%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-[#7E8078]">Medium (50-75%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[#7E8078]">High (&gt;75%)</span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-[#1D2024] pl-3">
            <span className="w-4 h-0.5 border-t border-dashed border-amber-500" />
            <span className="text-[#7E8078] text-[11px]">Confusable</span>
          </div>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_: React.MouseEvent, node: Node) => onSelectConcept(node.id)}
        fitView
      >
        <Background gap={16} size={1} />
        <Controls className="!bg-[#141619] !border-[#1D2024] !text-[#F6F5EE] !shadow-sm !rounded-xl" />
        <MiniMap
          nodeColor={(n: Node) => {
            const m = (n.data?.mastery as number) ?? 50;
            return m >= 75 ? '#10b981' : m >= 50 ? '#f59e0b' : '#f43f5e';
          }}
          className="!bg-[#141619] !border-[#1D2024] !rounded-xl shadow-xs"
        />
      </ReactFlow>
    </div>
  );
}
