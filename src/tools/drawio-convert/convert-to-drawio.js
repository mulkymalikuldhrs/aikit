/**
 * Mermaid → Draw.io Converter
 *
 * Converts Mermaid files to Draw.io XML format with error handling
 */

import fs from 'fs';
import path from 'path';
import { validateMermaidSyntax } from './diagram-utils.js';

/**
 * Parse Mermaid flowchart to extract graph structure
 * @param {string} mermaidCode - Mermaid code
 * @returns {Object} Parsed graph structure
 */
function parseMermaidFlowchart(mermaidCode) {
  const lines = mermaidCode.split('\n').map(l => l.trim()).filter(l => l);
  const graph = { direction: 'TD', nodes: new Map(), edges: [] };

  // Parse direction
  const directionMatch = lines[0]?.match(/graph\s+(TD|LR|TB|RL|BT)/i);
  if (directionMatch) {
    graph.direction = directionMatch[1].toUpperCase();
  }

  // First pass: extract standalone nodes
  lines.forEach((line) => {
    if (!line || line.startsWith('%') || line.startsWith('//') || line.startsWith('graph') || line.startsWith('style')) {
      return;
    }

    // Square bracket nodes: NodeID[Label]
    const bracketMatch = line.match(/^(\w+)\[([^\]]+)\]/);
    if (bracketMatch && !line.includes('-->')) {
      const [, id, label] = bracketMatch;
      if (!graph.nodes.has(id)) {
        graph.nodes.set(id, { id, label });
      }
    }

    // Curly brace nodes: NodeID{Label}
    const curlyMatch = line.match(/^(\w+)\{([^\}]+)\}/);
    if (curlyMatch && !line.includes('-->')) {
      const [, id, label] = curlyMatch;
      if (!graph.nodes.has(id)) {
        graph.nodes.set(id, { id, label });
      }
    }
  });

  // Second pass: extract edges and connected nodes
  lines.forEach((line) => {
    if (!line || line.startsWith('%') || line.startsWith('//') || line.startsWith('graph') || line.startsWith('style')) {
      return;
    }

    // Edge with label: A -->|label| B
    const labeledEdgeMatch = line.match(/(\w+)\s*-->\s*\|([^\|]+)\|\s*(\w+)/);
    if (labeledEdgeMatch) {
      const [, fromId, edgeLabel, toId] = labeledEdgeMatch;
      if (!graph.nodes.has(fromId)) {
        graph.nodes.set(fromId, { id: fromId, label: fromId });
      }
      if (!graph.nodes.has(toId)) {
        graph.nodes.set(toId, { id: toId, label: toId });
      }
      graph.edges.push({ from: fromId, to: toId, label: edgeLabel });
      return;
    }

    // Simple edge: A --> B
    const simpleEdgeMatch = line.match(/(\w+)\s*-->\s*(\w+)/);
    if (simpleEdgeMatch) {
      const [, fromId, toId] = simpleEdgeMatch;
      if (!graph.nodes.has(fromId)) {
        graph.nodes.set(fromId, { id: fromId, label: fromId });
      }
      if (!graph.nodes.has(toId)) {
        graph.nodes.set(toId, { id: toId, label: toId });
      }
      const exists = graph.edges.some(e => e.from === fromId && e.to === toId);
      if (!exists) {
        graph.edges.push({ from: fromId, to: toId, label: '' });
      }
    }
  });

  return graph;
}

/**
 * Calculate node positions for layout
 * @param {Array} nodes - Array of node objects
 * @param {Array} edges - Array of edge objects
 * @param {string} direction - Graph direction (TD, LR, etc.)
 * @returns {Object} Node positions
 */
function calculateNodePositions(nodes, edges, direction) {
  const positions = {};
  const spacing = 200;

  nodes.forEach((node, index) => {
    if (direction === 'TD' || direction === 'TB') {
      const col = index % 3;
      const row = Math.floor(index / 3);
      positions[node.id] = { x: 40 + col * spacing, y: 40 + row * spacing };
    } else {
      // LR or RL
      const row = index % 3;
      const col = Math.floor(index / 3);
      positions[node.id] = { x: 40 + col * spacing, y: 40 + row * spacing };
    }
  });

  return positions;
}

/**
 * Generate Draw.io XML from graph structure
 * @param {Object} graph - Graph structure
 * @param {string} diagramName - Diagram name
 * @returns {string} Draw.io XML
 */
function generateDrawioXML(graph, diagramName = 'Diagram') {
  const nodes = Array.from(graph.nodes.values());
  const edges = graph.edges;
  const nodePositions = calculateNodePositions(nodes, edges, graph.direction);

  let mxCells = '';
  mxCells += `    <mxCell id="0" />\n`;
  mxCells += `    <mxCell id="1" parent="0" />\n`;

  nodes.forEach((node) => {
    const pos = nodePositions[node.id];
    const width = 120;
    const height = 60;
    const style = 'rounded=1;whiteSpace=wrap;html=1;align=center;';

    mxCells += `    <mxCell id="${node.id}" value="${node.label}" style="${style}" vertex="1" parent="1">\n`;
    mxCells += `      <mxGeometry x="${pos.x}" y="${pos.y}" width="${width}" height="${height}" as="geometry" />\n`;
    mxCells += `    </mxCell>\n`;
  });

  edges.forEach((edge) => {
    const edgeId = `edge-${edge.from}-${edge.to}`;
    const edgeStyle = 'edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;';

    mxCells += `    <mxCell id="${edgeId}" value="${edge.label}" style="${edgeStyle}" edge="1" parent="1" source="${edge.from}" target="${edge.to}">\n`;
    mxCells += `      <mxGeometry relative="1" as="geometry" />\n`;
    mxCells += `    </mxCell>\n`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="aikit" modified="${new Date().toISOString()}" agent="aikit-drawio-convert" version="1.0.0">
  <diagram name="${diagramName}" id="${diagramName}">
    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
      <root>
${mxCells}      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

  return xml;
}

/**
 * Convert Mermaid code to Draw.io format
 * @param {string} mermaidCode - Mermaid code
 * @param {string} diagramName - Diagram name
 * @returns {Object} { xml, stats, errors }
 */
export function convertToDrawio(mermaidCode, diagramName = 'Diagram') {
  const errors = [];
  const warnings = [];

  // 1. Validate Mermaid syntax
  const validation = validateMermaidSyntax(mermaidCode);
  if (!validation.valid) {
    return {
      xml: null,
      stats: null,
      errors: validation.errors.map(e => `Line ${e.line}: ${e.message}`),
      warnings: [],
    };
  }

  // 2. Parse Mermaid code
  let graph;
  try {
    graph = parseMermaidFlowchart(mermaidCode);
  } catch (err) {
    return {
      xml: null,
      stats: null,
      errors: [`Failed to parse Mermaid code: ${err.message}`],
      warnings: [],
    };
  }

  // 3. Check for conversion issues
  if (graph.nodes.size === 0) {
    warnings.push('No nodes found in diagram');
  }

  // 4. Generate Draw.io XML
  let drawioXML;
  try {
    drawioXML = generateDrawioXML(graph, diagramName);
  } catch (err) {
    return {
      xml: null,
      stats: null,
      errors: [`Failed to generate Draw.io XML: ${err.message}`],
      warnings: [],
    };
  }

  // 5. Return result
  return {
    xml: drawioXML,
    stats: {
      nodes: graph.nodes.size,
      edges: graph.edges.length,
      direction: graph.direction,
    },
    errors,
    warnings,
  };
}

/**
 * Convert Mermaid file to Draw.io and save
 * @param {string} mermaidPath - Path to .mmd file
 * @param {string} drawioPath - Path to save .drawio file
 * @param {string} diagramName - Diagram name
 * @returns {Object} { success, errors, warnings }
 */
export function convertToDrawioFile(mermaidPath, drawioPath, diagramName) {
  // 1. Check file exists
  if (!fs.existsSync(mermaidPath)) {
    return {
      success: false,
      errors: [`File not found: ${mermaidPath}`],
      warnings: [],
    };
  }

  // 2. Read file
  let mermaidCode;
  try {
    mermaidCode = fs.readFileSync(mermaidPath, 'utf-8');
  } catch (err) {
    return {
      success: false,
      errors: [`Failed to read file: ${err.message}`],
      warnings: [],
    };
  }

  // 3. Extract diagram name from path if not provided
  const finalDiagramName = diagramName || path.basename(mermaidPath, '.mmd');

  // 4. Convert
  const result = convertToDrawio(mermaidCode, finalDiagramName);

  if (result.errors.length > 0 || !result.xml) {
    return {
      success: false,
      errors: result.errors,
      warnings: result.warnings,
    };
  }

  // 5. Write file
  try {
    // Ensure directory exists
    const dir = path.dirname(drawioPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(drawioPath, result.xml, 'utf-8');

    return {
      success: true,
      errors: [],
      warnings: result.warnings,
      stats: result.stats,
    };
  } catch (err) {
    return {
      success: false,
      errors: [`Failed to write Draw.io file: ${err.message}`],
      warnings: result.warnings,
    };
  }
}

export { parseMermaidFlowchart, generateDrawioXML };
