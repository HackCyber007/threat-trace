
import { useState, useRef, useEffect } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { Terminal, Info, Map, Layers } from 'lucide-react';

export default function DeveloperView({ data }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const cyRef = useRef(null);

  if (!data || !data.elements) return null;

  // Cytoscape built-in force-directed layout
  const layout = {
    name: 'cose',
    idealEdgeLength: 100,
    nodeOverlap: 20,
    refresh: 20,
    fit: true,
    padding: 30,
    randomize: false,
    componentSpacing: 100,
  };

  // Map our cyber aesthetic colors to node types
  const typeColors = {
    IPAddress: '#38BDF8', // Cyan
    Domain: '#34D399',    // Emerald
    MalwareSample: '#F87171', // Crimson
    Campaign: '#818CF8',  // Indigo
    ThreatActor: '#FBBF24', // Amber
  };

  const cyStylesheet = [
    {
      selector: 'node',
      style: {
        'label': 'data(label)',
        'color': '#cbd5e1',
        'font-size': '11px',
        'font-family': 'system-ui, sans-serif',
        'text-valign': 'bottom',
        'text-margin-y': 6,
        'background-color': '#64748b',
        'border-width': 2,
        'border-color': 'rgba(255,255,255,0.1)'
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#334155',
        'target-arrow-color': '#334155',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'label': 'data(label)',
        'font-size': '9px',
        'color': '#94a3b8',
        'text-rotation': 'autorotate',
        'text-margin-y': -10
      }
    },
    // Dynamic node coloring based on type
    ...Object.entries(typeColors).map(([type, color]) => ({
      selector: `node[type = "${type}"]`,
      style: { 'background-color': color, 'border-color': color }
    })),
    // Highlight the originally searched node
    {
      selector: 'node[?isRoot]',
      style: {
        'border-width': 4,
        'border-color': '#ffffff',
        'width': 45,
        'height': 45,
        'box-shadow': '0 0 20px rgba(255,255,255,0.5)' // Note: Cy doesn't fully support CSS box-shadow, but we highlight via border
      }
    },
    // Selected state
    {
      selector: ':selected',
      style: {
        'border-width': 4,
        'border-color': '#f8fafc',
        'line-color': '#f8fafc',
        'target-arrow-color': '#f8fafc',
      }
    }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem', height: '650px' }}>
      
      {/* Graph Canvas Panel */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(3, 7, 18, 0.6)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Map size={16} color="#94a3b8" />
          <span style={{ color: '#f1f5f9', fontSize: '0.85rem', fontWeight: '600' }}>Interactive Canvas</span>
        </div>
        
        <CytoscapeComponent
          elements={CytoscapeComponent.normalizeElements(data.elements)}
          style={{ width: '100%', height: '100%' }}
          stylesheet={cyStylesheet}
          layout={layout}
          cy={(cy) => {
            cyRef.current = cy;
            // Handle node clicks to populate the details panel
            cy.on('tap', 'node', (evt) => {
              setSelectedNode(evt.target.data());
            });
            // Clear selection when clicking the background
            cy.on('tap', (evt) => {
              if (evt.target === cy) setSelectedNode(null);
            });
          }}
        />
      </div>

      {/* Right Sidebar: Details, Legend, & Cypher */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
        
        {/* Node Properties Panel */}
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '1.5rem', flex: 1 }}>
          <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: '#f8fafc' }}>
            <Info size={18} color="#38BDF8" />
            Entity Inspector
          </h3>
          
          {selectedNode ? (
            <div>
              <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', color: typeColors[selectedNode.type] || '#fff', marginBottom: '1rem' }}>
                {selectedNode.type}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(selectedNode.properties).map(([key, value]) => (
                  <div key={key} style={{ background: 'rgba(3, 7, 18, 0.4)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{key.replace('_', ' ')}</div>
                    <div style={{ fontSize: '0.9rem', color: '#f1f5f9', wordBreak: 'break-all' }}>{value.toString()}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>
              Select a node on the canvas to inspect its properties.
            </div>
          )}
        </div>

        {/* Legend */}
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: '#f8fafc' }}>
            <Layers size={18} color="#818CF8" />
            Graph Legend
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.entries(typeColors).map(([type, color]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color }}></div>
                {type}
              </div>
            ))}
          </div>
        </div>

        {/* Raw Query Output */}
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: '#f8fafc' }}>
            <Terminal size={18} color="#34D399" />
            Generated Cypher
          </h3>
          <pre style={{ margin: 0, padding: '1rem', background: '#030712', borderRadius: '8px', border: '1px solid #1f2937', color: '#38BDF8', fontSize: '0.75rem', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
            <code>{data.rawCypher}</code>
          </pre>
        </div>

      </div>
    </div>
  );
}