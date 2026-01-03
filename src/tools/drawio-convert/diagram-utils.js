/**
 * Diagram Utilities
 *
 * Shared utilities for drawio-convert modules
 */

import fs from 'fs';
import path from 'path';

/**
 * Resolve diagram path from user input
 * @param {string} input - Diagram name or file path
 * @param {'drawio' | 'mermaid'} type - Target file type
 * @param {string} projectRoot - Project root directory
 * @returns {string} Absolute path to diagram file
 */
export function resolveDiagramPath(input, type, projectRoot) {
  // 1. Absolute path - use as-is
  if (path.isAbsolute(input)) {
    return input;
  }

  // 2. Relative path or contains directory separators
  if (input.includes('/') || input.includes('\\')) {
    return path.resolve(projectRoot, input);
  }

  // 3. Just a name - use standard location
  if (type === 'drawio') {
    return path.join(projectRoot, '.aikit/assets/drawio', `${input}.drawio`);
  } else {
    return path.join(projectRoot, 'mermaid', `${input}.mmd`);
  }
}

/**
 * Find paired diagram file (drawio ↔ mermaid)
 * @param {string} filePath - Path to current file
 * @param {string} projectRoot - Project root directory
 * @returns {string|null} Path to paired file or null
 */
export function findPairedDiagram(filePath, projectRoot) {
  const ext = path.extname(filePath);
  const basename = path.basename(filePath, ext);

  if (ext === '.drawio') {
    // Look for corresponding .mmd file
    const possiblePaths = [
      path.join(projectRoot, 'mermaid', `${basename}.mmd`),
      path.join(path.dirname(filePath), `${basename}.mmd`),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
  } else if (ext === '.mmd') {
    // Look for corresponding .drawio file
    const possiblePaths = [
      path.join(projectRoot, '.aikit/assets/drawio', `${basename}.drawio`),
      path.join(path.dirname(filePath), `${basename}.drawio`),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
  }

  return null;
}

/**
 * Validate Mermaid syntax (basic validation)
 * @param {string} code - Mermaid code
 * @returns {Object} { valid, errors }
 */
export function validateMermaidSyntax(code) {
  const errors = [];
  const lines = code.split('\n');

  // Check for graph declaration
  if (!lines[0]?.match(/graph\s+(TD|LR|TB|RL|BT)/i)) {
    errors.push({
      line: 1,
      message: 'Missing or invalid graph declaration. Should start with "graph TD" or "graph LR"',
    });
  }

  // Check for common syntax errors
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('%') || trimmed.startsWith('//') || trimmed.startsWith('style')) {
      return;
    }

    // Check for malformed edge labels (missing closing |)
    if (trimmed.includes('|') && !trimmed.match(/\|[^|]*\|/)) {
      const match = trimmed.match(/\|[^|]*/);
      if (match) {
        errors.push({
          line: lineNum,
          message: `Unclosed edge label. Use |text| syntax. Found: "${match[0]}"`,
        });
      }
    }

    // Check for malformed edge syntax (--> with extra characters)
    if (trimmed.match(/--[^>\s]/)) {
      errors.push({
        line: lineNum,
        message: 'Invalid edge syntax. Use --> for edges, not -- > or other variations',
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Draw.io XML (basic validation)
 * @param {string} xml - Draw.io XML content
 * @returns {Object} { valid, errors }
 */
export function validateDrawioXML(xml) {
  const errors = [];

  // Check for required XML tags
  if (!xml.includes('<mxfile')) {
    errors.push({
      message: 'Missing <mxfile> tag. Not a valid Draw.io file',
    });
  }

  if (!xml.includes('<mxGraphModel')) {
    errors.push({
      message: 'Missing <mxGraphModel> tag. Not a valid Draw.io file',
    });
  }

  if (!xml.includes('<root>')) {
    errors.push({
      message: 'Missing <root> tag. Not a valid Draw.io file',
    });
  }

  // Check for XML declaration
  if (!xml.startsWith('<?xml')) {
    errors.push({
      message: 'Missing XML declaration. File should start with <?xml version="1.0"',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get list of all diagrams in the project
 * @param {string} projectRoot - Project root directory
 * @returns {Array} List of diagram objects
 */
export function getDiagramList(projectRoot) {
  const diagrams = [];
  const mermaidDir = path.join(projectRoot, 'mermaid');
  const drawioDir = path.join(projectRoot, '.aikit/assets/drawio');

  // Scan mermaid directory
  if (fs.existsSync(mermaidDir)) {
    const mmdFiles = fs.readdirSync(mermaidDir)
      .filter(f => f.endsWith('.mmd'))
      .map(f => {
        const name = path.basename(f, '.mmd');
        const mmdPath = path.join(mermaidDir, f);
        const drawioPath = path.join(drawioDir, `${name}.drawio`);

        return {
          name,
          mermaid: mmdPath,
          drawio: fs.existsSync(drawioPath) ? drawioPath : null,
          hasMermaid: true,
          hasDrawio: fs.existsSync(drawioPath),
        };
      });

    diagrams.push(...mmdFiles);
  }

  // Scan drawio directory for files without mermaid counterpart
  if (fs.existsSync(drawioDir)) {
    const drawioFiles = fs.readdirSync(drawioDir)
      .filter(f => f.endsWith('.drawio'))
      .map(f => {
        const name = path.basename(f, '.drawio');
        const drawioPath = path.join(drawioDir, f);
        const mmdPath = path.join(mermaidDir, `${name}.mmd`);

        // Skip if already in list
        if (diagrams.some(d => d.name === name)) {
          return null;
        }

        return {
          name,
          mermaid: fs.existsSync(mmdPath) ? mmdPath : null,
          drawio: drawioPath,
          hasMermaid: fs.existsSync(mmdPath),
          hasDrawio: true,
        };
      })
      .filter(d => d !== null);

    diagrams.push(...drawioFiles);
  }

  return diagrams;
}

/**
 * Format conversion stats for display
 * @param {Object} stats - Conversion stats
 * @returns {string} Formatted stats string
 */
export function formatConversionStats(stats) {
  const parts = [];

  if (stats.nodes !== undefined) {
    parts.push(`${stats.nodes} node${stats.nodes !== 1 ? 's' : ''}`);
  }

  if (stats.edges !== undefined) {
    parts.push(`${stats.edges} edge${stats.edges !== 1 ? 's' : ''}`);
  }

  if (stats.direction) {
    parts.push(`direction: ${stats.direction}`);
  }

  return parts.join(', ');
}

/**
 * Ensure required directories exist
 * @param {string} projectRoot - Project root directory
 */
export function ensureDiagramDirectories(projectRoot) {
  const dirs = [
    path.join(projectRoot, 'mermaid'),
    path.join(projectRoot, '.aikit/assets/drawio'),
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}
