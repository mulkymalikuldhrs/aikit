/**
 * Draw.io → Mermaid Converter
 *
 * Converts Draw.io XML files to Mermaid format with error handling
 */

import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import { validateDrawioXML } from './diagram-utils.js';

/**
 * Parse Draw.io XML to extract graph structure
 * @param {string} drawioXML - Draw.io XML content
 * @returns {Object} Parsed graph structure
 */
function parseDrawioXML(drawioXML) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    textNodeName: '_text'
  });

  const xml = parser.parse(drawioXML);
  const diagram = xml.mxfile.diagram;
  const graphModel = diagram.mxGraphModel;
  const root = graphModel.root;

  const graph = { nodes: new Map(), edges: [] };

  if (Array.isArray(root.mxCell)) {
    root.mxCell.forEach(cell => {
      if (cell.id === '0' || cell.id === '1') return;

      if (cell.vertex === '1' || cell.vertex === true) {
        graph.nodes.set(cell.id, {
          id: cell.id,
          label: cell.value || cell.id,
          style: cell.style || ''
        });
      } else if (cell.edge === '1' || cell.edge === true) {
        graph.edges.push({
          id: cell.id,
          from: cell.source,
          to: cell.target,
          label: cell.value || ''
        });
      }
    });
  } else if (root.mxCell) {
    // Handle single cell case
    const cell = root.mxCell;
    if (cell.id !== '0' && cell.id !== '1') {
      if (cell.vertex === '1' || cell.vertex === true) {
        graph.nodes.set(cell.id, {
          id: cell.id,
          label: cell.value || cell.id,
          style: cell.style || ''
        });
      } else if (cell.edge === '1' || cell.edge === true) {
        graph.edges.push({
          id: cell.id,
          from: cell.source,
          to: cell.target,
          label: cell.value || ''
        });
      }
    }
  }

  return graph;
}

/**
 * Generate Mermaid code from graph structure
 * @param {Object} graph - Graph structure
 * @returns {string} Mermaid code
 */
function generateMermaidCode(graph) {
  const nodes = Array.from(graph.nodes.values());
  const edges = graph.edges;

  let mermaid = 'graph TD\n';

  edges.forEach((edge) => {
    const fromNode = graph.nodes.get(edge.from);
    const toNode = graph.nodes.get(edge.to);

    if (!fromNode || !toNode) return;

    const fromLabel = sanitizeNodeId(fromNode.label);
    const toLabel = sanitizeNodeId(toNode.label);
    const edgeLabel = edge.label ? `|"${edge.label}"|` : '';

    mermaid += `    ${fromLabel}[${fromNode.label}] --> ${edgeLabel} ${toLabel}[${toNode.label}]\n`;
  });

  nodes.forEach((node) => {
    const hasEdge = edges.some(e => e.from === node.id || e.to === node.id);
    if (!hasEdge) {
      const label = sanitizeNodeId(node.label);
      mermaid += `    ${label}[${node.label}]\n`;
    }
  });

  return mermaid;
}

/**
 * Sanitize node ID for Mermaid (remove special characters)
 * @param {string} label - Node label
 * @returns {string} Sanitized ID
 */
function sanitizeNodeId(label) {
  return label
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/^[0-9]/, '_$&'); // Prefix numbers with underscore
}

/**
 * Convert Draw.io file to Mermaid format
 * @param {string} drawioPath - Path to .drawio file
 * @returns {Object} { code, stats, errors }
 */
export function convertToMermaid(drawioPath) {
  const errors = [];
  const warnings = [];

  // 1. Check file exists
  if (!fs.existsSync(drawioPath)) {
    return {
      code: null,
      stats: null,
      errors: [`File not found: ${drawioPath}`],
      warnings: [],
    };
  }

  // 2. Read file
  let drawioXML;
  try {
    drawioXML = fs.readFileSync(drawioPath, 'utf-8');
  } catch (err) {
    return {
      code: null,
      stats: null,
      errors: [`Failed to read file: ${err.message}`],
      warnings: [],
    };
  }

  // 3. Validate XML structure
  const validation = validateDrawioXML(drawioXML);
  if (!validation.valid) {
    return {
      code: null,
      stats: null,
      errors: validation.errors.map(e => e.message),
      warnings: [],
    };
  }

  // 4. Parse and convert
  let graph;
  try {
    graph = parseDrawioXML(drawioXML);
  } catch (err) {
    return {
      code: null,
      stats: null,
      errors: [`Failed to parse Draw.io XML: ${err.message}`],
      warnings: [],
    };
  }

  // 5. Generate Mermaid code
  let mermaidCode;
  try {
    mermaidCode = generateMermaidCode(graph);
  } catch (err) {
    return {
      code: null,
      stats: null,
      errors: [`Failed to generate Mermaid code: ${err.message}`],
      warnings: [],
    };
  }

  // 6. Check for conversion issues
  if (graph.nodes.size === 0) {
    warnings.push('No nodes found in diagram');
  }

  // 7. Return result
  return {
    code: mermaidCode,
    stats: {
      nodes: graph.nodes.size,
      edges: graph.edges.length,
    },
    errors,
    warnings,
  };
}

/**
 * Convert Draw.io to Mermaid and save to file
 * @param {string} drawioPath - Path to .drawio file
 * @param {string} mermaidPath - Path to save .mmd file
 * @returns {Object} { success, errors, warnings }
 */
export function convertToMermaidFile(drawioPath, mermaidPath) {
  const result = convertToMermaid(drawioPath);

  if (result.errors.length > 0 || !result.code) {
    return {
      success: false,
      errors: result.errors,
      warnings: result.warnings,
    };
  }

  try {
    // Ensure directory exists
    const dir = path.dirname(mermaidPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write Mermaid file
    fs.writeFileSync(mermaidPath, result.code, 'utf-8');

    return {
      success: true,
      errors: [],
      warnings: result.warnings,
      stats: result.stats,
    };
  } catch (err) {
    return {
      success: false,
      errors: [`Failed to write Mermaid file: ${err.message}`],
      warnings: result.warnings,
    };
  }
}

export { parseDrawioXML, generateMermaidCode };
