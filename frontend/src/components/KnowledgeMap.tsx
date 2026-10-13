'use client';

import React, { useState, useMemo } from 'react';
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
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { KnowledgeGraphData } from '@/types';
import { getMasteryColor } from '@/lib/utils';
import { AlertTriangle, Filter } from 'lucide-react';

// Custom Concept Node Component
function ConceptNode({ data }: NodeProps) {
  const mastery = (data?.mastery as number) ?? 50;
  const color = getMasteryColor(mastery);
  const isKey = !!data?.isKeyConcept;
  const miscCount = (data?.misconceptionsCount as number) || 0;

  return (
    <div
      className={`px-4 py-3 rounded-xl bg-[#141619] border-2 shadow-md hover:shadow-xl transition-all cursor-pointer min-w-[170px] ${
        color.border
      } ${isKey ? 'ring-2 ring-[#E06D3B]/40' : ''}`}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-[#E06D3B]" />
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-[#E06D3B]" />

      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[10px] uppercase font-bold text-[#7E8078] tracking-wider truncate">
          {(data?.topic as string) || 'Concept'}
        </span>
        {miscCount > 0 && (
          <span title={`${miscCount} detected misconception`} className="text-rose-500">
            <AlertTriangle className="w-3.5 h-3.5" />
          </span>
        )}
      </div>

      <div className="text-xs font-bold text-[#F6F5EE] truncate">
        {(data?.label as string) || 'Node'}
      </div>

      <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-[#1D2024] text-[11px]">
        <span className="text-[#7E8078]">Mastery</span>
        <span className={`font-mono font-bold ${color.text}`}>{mastery}%</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-[#E06D3B]" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-[#E06D3B]" />
    </div>
  );
}

const nodeTypes = {
  concept: ConceptNode,
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
  selectedConceptId: _selectedConceptId,
}: KnowledgeMapProps) {
  const [filter, setFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  const formattedNodes = useMemo(() => {
    return graphData.nodes.map((n) => ({
      ...n,
      type: 'concept',
      style: {
        opacity:
          filter === 'all'
            ? 1
            : filter === 'low' && n.data.mastery < 50
            ? 1
            : filter === 'medium' && n.data.mastery >= 50 && n.data.mastery < 75
            ? 1
            : filter === 'high' && n.data.mastery >= 75
            ? 1
            : 0.25,
      },
    }));
  }, [graphData.nodes, filter]);

  const [nodes, , onNodesChange] = useNodesState(formattedNodes);
  const [edges, , onEdgesChange] = useEdgesState(
    graphData.edges.map((e) => ({
      ...e,
      style: {
        stroke: e.data?.relation === 'confusable' ? '#f59e0b' : '#E06D3B',
        strokeWidth: 2,
        strokeDasharray: e.data?.relation === 'confusable' ? '5,5' : undefined,
      },
    }))
  );

  return (
    <div className="w-full h-[650px] bg-[#0C0D0E] rounded-2xl border border-[#1D2024] relative overflow-hidden shadow-xs">
      {/* Top Filter & Legend Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between flex-wrap gap-2 pointer-events-none">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#141619]/90 backdrop-blur-md rounded-xl border border-[#1D2024] shadow-sm pointer-events-auto text-xs">
          <span className="px-2 font-semibold text-[#7E8078] flex items-center gap-1 text-[11px]">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {(['all', 'low', 'medium', 'high'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                filter === key
                  ? 'bg-[#E06D3B] text-white font-mono font-bold shadow-2xs'
                  : 'text-[#C8C6B9] hover:bg-[#1A1D21] hover:text-[#F6F5EE]'
              }`}
            >
              {key === 'all' ? 'All Concepts' : `${key} Mastery`}
            </button>
          ))}
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
