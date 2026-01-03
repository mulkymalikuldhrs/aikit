import { ToolConfigManager } from '../tool-config.js';
import { logger } from '../../utils/logger.js';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Figma API response types
 */
export interface FigmaFile {
  document: FigmaNode;
  components: Record<string, FigmaComponent>;
  styles: Record<string, FigmaStyle>;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  fills?: FigmaFill[];
  strokes?: FigmaFill[];
  effects?: FigmaEffect[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  style?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    lineHeightPx?: number;
    letterSpacing?: number;
  };
  characters?: string;
  layoutMode?: 'HORIZONTAL' | 'VERTICAL';
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
}

export interface FigmaFill {
  type: string;
  color?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  imageRef?: string;
}

export interface FigmaEffect {
  type: string;
  visible: boolean;
  radius?: number;
  color?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
}

export interface FigmaComponent {
  key: string;
  name: string;
  description: string;
}

export interface FigmaStyle {
  key: string;
  name: string;
  styleType: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID';
}

/**
 * Extracted design tokens
 */
export interface DesignTokens {
  colors: Array<{
    name: string;
    hex: string;
    rgba: string;
  }>;
  typography: Array<{
    name: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    lineHeight: number;
    letterSpacing?: number;
  }>;
  spacing: {
    unit: number;
    scale: number[];
  };
  components: Array<{
    name: string;
    type: string;
    description?: string;
  }>;
  screens: Array<{
    id: string;
    name: string;
    width: number;
    height: number;
    type: string;
    description?: string;
    childrenCount?: number;
  }>;
  breakpoints: number[];
  structure?: {
    nodes: Array<{
      id: string;
      name: string;
      type: string;
      content?: string;
      position?: { x: number; y: number; width: number; height: number };
      styles?: {
        backgroundColor?: string;
        fontSize?: number;
        fontFamily?: string;
        fontWeight?: number;
        color?: string;
        padding?: { top: number; right: number; bottom: number; left: number };
        margin?: { top: number; right: number; bottom: number; left: number };
        layout?: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
        gap?: number;
      };
      children?: string[]; // IDs of child nodes
    }>;
    hierarchy: string; // Tree structure representation
  };
  assets?: Array<{
    nodeId: string;
    nodeName: string;
    nodeType: string;
    format: 'png' | 'svg' | 'jpg';
    path: string;
    url: string;
    width?: number;
    height?: number;
  }>;
}

/**
 * Figma MCP Client
 * 
 * Wrapper for figma-developer-mcp to extract design data
 */
export class FigmaMcpClient {
  private apiKey: string;

  constructor(apiKey: string, _configManager: ToolConfigManager) {
    this.apiKey = apiKey;
  }

  /**
   * Fetch helper with simple retry/backoff for 429/5xx
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    label: string,
    retries: number = 3,
    backoffMs: number = 1500
  ): Promise<Response> {
    let attempt = 0;
    let lastError: any;

    while (attempt <= retries) {
      try {
        const res = await fetch(url, options);
        if (res.ok) return res;

        // Retry on throttling or server errors
        if (res.status === 429 || res.status >= 500) {
          const retryAfter = Number(res.headers.get('retry-after')) || 0;
          const delay = retryAfter > 0 ? retryAfter * 1000 : backoffMs * (attempt + 1);
          logger.warn(`${label} failed (status ${res.status}), retrying in ${Math.round(delay / 1000)}s...`);
          await new Promise((r) => setTimeout(r, delay));
          attempt += 1;
          continue;
        }

        const text = await res.text();
        throw new Error(`${label} error: ${res.status} ${res.statusText}\n${text}`);
      } catch (err) {
        lastError = err;
        // Retry network errors
        logger.warn(`${label} network error, attempt ${attempt + 1}/${retries + 1}: ${err instanceof Error ? err.message : String(err)}`);
        if (attempt >= retries) break;
        await new Promise((r) => setTimeout(r, backoffMs * (attempt + 1)));
        attempt += 1;
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error(`${label} failed after retries`);
  }

  /**
   * Extract file key from Figma URL
   */
  private extractFileKey(url: string): string | null {
    // URL format: https://www.figma.com/design/{fileKey}/...
    const match = url.match(/figma\.com\/design\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }

  /**
   * Extract node ID from Figma URL
   */
  private extractNodeId(url: string): string | null {
    // URL format: ...?node-id={nodeId} or ...&node-id={nodeId}
    // Node ID can be in format: 0-1, 1-2, etc. (page-frame format)
    const match = url.match(/[?&]node-id=([^&]+)/);
    if (!match) return null;
    
    // Decode and handle different formats
    let nodeId = decodeURIComponent(match[1]);
    
    // If it's in format "0-1", convert to "0:1" for API
    // Figma API uses colon separator, not dash
    if (nodeId.includes('-') && !nodeId.includes(':')) {
      nodeId = nodeId.replace(/-/g, ':');
    }
    
    return nodeId;
  }

  /**
   * Get Figma file data using API
   */
  async getFileData(url: string): Promise<FigmaFile> {
    const fileKey = this.extractFileKey(url);
    if (!fileKey) {
      throw new Error(`Invalid Figma URL: ${url}`);
    }

    const nodeId = this.extractNodeId(url);
    const apiUrl = nodeId
      ? `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`
      : `https://api.figma.com/v1/files/${fileKey}`;

    const response = await this.fetchWithRetry(apiUrl, {
      headers: {
        'X-Figma-Token': this.apiKey,
      },
    }, 'Figma file fetch');

    const data = await response.json() as { nodes?: Record<string, { document: FigmaNode }> };

    if (nodeId) {
      // Return specific node data
      const nodes = data.nodes as Record<string, { document: FigmaNode }>;
      const nodeData = Object.values(nodes)[0];
      if (!nodeData) {
        throw new Error(`Node not found: ${nodeId}`);
      }
      return {
        document: nodeData.document,
        components: {},
        styles: {},
      };
    }

    return data as FigmaFile;
  }

  /**
   * Extract design tokens from Figma file
   */
  async extractDesignTokens(url: string, downloadAssets: boolean = true, assetsDir?: string): Promise<DesignTokens> {
    const fileData = await this.getFileData(url);
    const fileKey = this.extractFileKey(url);
    if (!fileKey) {
      throw new Error(`Invalid Figma URL: ${url}`);
    }

    const tokens: DesignTokens = {
      colors: [],
      typography: [],
      spacing: {
        unit: 8, // Default 8px grid
        scale: [],
      },
      components: [],
      screens: [],
      breakpoints: [375, 768, 1024, 1280, 1920], // Common breakpoints
    };

    // Extract colors
    const colorMap = new Map<string, string>();
    this.extractColors(fileData.document, colorMap);
    tokens.colors = Array.from(colorMap.entries()).map(([name, hex]) => ({
      name,
      hex,
      rgba: hex, // Simplified
    }));

    // Extract typography
    const typographyMap = new Map<string, any>();
    this.extractTypography(fileData.document, typographyMap);
    tokens.typography = Array.from(typographyMap.values());

    // Extract components
    Object.values(fileData.components).forEach(component => {
      tokens.components.push({
        name: component.name,
        type: 'component',
        description: component.description,
      });
    });

    // Extract screens/frames
    this.extractScreens(fileData.document, tokens.screens);

    // Extract structure and content
    tokens.structure = this.extractStructure(fileData.document);

    // Download assets if requested
    if (downloadAssets && tokens.structure) {
      try {
        tokens.assets = await this.downloadAssets(
          fileKey,
          fileData.document,
          assetsDir || './assets/images'
        );
      } catch (error) {
        logger.warn(`Failed to download assets: ${error instanceof Error ? error.message : String(error)}`);
        // Continue without assets
      }
    }

    return tokens;
  }

  /**
   * Recursively extract colors from nodes
   */
  private extractColors(node: FigmaNode, colorMap: Map<string, string>): void {
    // Extract fills
    if (node.fills && Array.isArray(node.fills)) {
      node.fills.forEach(fill => {
        if (fill.type === 'SOLID' && fill.color) {
          const { r, g, b, a } = fill.color;
          const hex = this.rgbaToHex(r, g, b, a);
          if (!colorMap.has(hex)) {
            colorMap.set(hex, hex);
          }
        }
      });
    }

    // Extract strokes
    if (node.strokes && Array.isArray(node.strokes)) {
      node.strokes.forEach(stroke => {
        if (stroke.type === 'SOLID' && stroke.color) {
          const { r, g, b, a } = stroke.color;
          const hex = this.rgbaToHex(r, g, b, a);
          if (!colorMap.has(hex)) {
            colorMap.set(hex, hex);
          }
        }
      });
    }

    // Recurse children
    if (node.children) {
      node.children.forEach(child => this.extractColors(child, colorMap));
    }
  }

  /**
   * Recursively extract typography from nodes
   */
  private extractTypography(node: FigmaNode, typographyMap: Map<string, any>): void {
    if (node.type === 'TEXT' && node.style) {
      const key = `${node.style.fontFamily}-${node.style.fontSize}-${node.style.fontWeight}`;
      if (!typographyMap.has(key)) {
        typographyMap.set(key, {
          name: `${node.style.fontSize}px ${node.style.fontFamily}`,
          fontFamily: node.style.fontFamily || 'Inter',
          fontSize: node.style.fontSize || 16,
          fontWeight: node.style.fontWeight || 400,
          lineHeight: node.style.lineHeightPx || node.style.fontSize || 16,
          letterSpacing: node.style.letterSpacing,
        });
      }
    }

    if (node.children) {
      node.children.forEach(child => this.extractTypography(child, typographyMap));
    }
  }

  /**
   * Extract screens/frames with detailed information
   */
  private extractScreens(
    node: FigmaNode, 
    screens: Array<{
      id: string;
      name: string;
      width: number;
      height: number;
      type: string;
      description?: string;
      childrenCount?: number;
    }>
  ): void {
    if (node.type === 'FRAME' || node.type === 'COMPONENT') {
      if (node.absoluteBoundingBox) {
        // Only include main screens (skip nested frames that are too small or decorative)
        const isMainScreen = node.absoluteBoundingBox.width >= 800 && 
                            node.absoluteBoundingBox.height >= 400;
        
        if (isMainScreen) {
        screens.push({
            id: node.id,
          name: node.name,
          width: node.absoluteBoundingBox.width,
          height: node.absoluteBoundingBox.height,
            type: node.type,
            childrenCount: node.children?.length || 0,
        });
        }
      }
    }

    if (node.children) {
      node.children.forEach(child => this.extractScreens(child, screens));
    }
  }

  /**
   * Extract structure, content, and layout from nodes
   */
  private extractStructure(node: FigmaNode, depth: number = 0): {
    nodes: Array<{
      id: string;
      name: string;
      type: string;
      content?: string;
      position?: { x: number; y: number; width: number; height: number };
      styles?: {
        backgroundColor?: string;
        fontSize?: number;
        fontFamily?: string;
        fontWeight?: number;
        color?: string;
        padding?: { top: number; right: number; bottom: number; left: number };
        margin?: { top: number; right: number; bottom: number; left: number };
        layout?: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
        gap?: number;
      };
      children?: string[];
    }>;
    hierarchy: string;
  } {
    const nodes: Array<{
      id: string;
      name: string;
      type: string;
      content?: string;
      position?: { x: number; y: number; width: number; height: number };
      styles?: any;
      children?: string[];
    }> = [];
    const hierarchyLines: string[] = [];

    const processNode = (n: FigmaNode, level: number = 0): string[] => {
      const indent = '  '.repeat(level);
      const childIds: string[] = [];

      // Extract node data
      const nodeData: any = {
        id: n.id,
        name: n.name || 'Unnamed',
        type: n.type,
      };

      // Extract position
      if (n.absoluteBoundingBox) {
        nodeData.position = {
          x: n.absoluteBoundingBox.x,
          y: n.absoluteBoundingBox.y,
          width: n.absoluteBoundingBox.width,
          height: n.absoluteBoundingBox.height,
        };
      }

      // Extract text content
      if (n.type === 'TEXT' && n.characters) {
        nodeData.content = n.characters;
      }

      // Extract styles
      const styles: any = {};
      
      // Background color
      if (n.fills && Array.isArray(n.fills)) {
        const solidFill = n.fills.find(f => f.type === 'SOLID' && f.color);
        if (solidFill && solidFill.color) {
          const { r, g, b, a } = solidFill.color;
          styles.backgroundColor = this.rgbaToHex(r, g, b, a);
        }
      }

      // Text styles
      if (n.style) {
        if (n.style.fontFamily) styles.fontFamily = n.style.fontFamily;
        if (n.style.fontSize) styles.fontSize = n.style.fontSize;
        if (n.style.fontWeight) styles.fontWeight = n.style.fontWeight;
        if (n.style.lineHeightPx) styles.lineHeight = n.style.lineHeightPx;
        
        // Text color from fills
        if (n.fills && Array.isArray(n.fills)) {
          const textFill = n.fills.find(f => f.type === 'SOLID' && f.color);
          if (textFill && textFill.color) {
            const { r, g, b, a } = textFill.color;
            styles.color = this.rgbaToHex(r, g, b, a);
          }
        }
      }

      // Layout properties
      if (n.layoutMode) {
        styles.layout = n.layoutMode;
      }
      if (n.itemSpacing !== undefined) {
        styles.gap = n.itemSpacing;
      }

      // Padding
      if (n.paddingLeft || n.paddingRight || n.paddingTop || n.paddingBottom) {
        styles.padding = {
          top: n.paddingTop || 0,
          right: n.paddingRight || 0,
          bottom: n.paddingBottom || 0,
          left: n.paddingLeft || 0,
        };
      }

      if (Object.keys(styles).length > 0) {
        nodeData.styles = styles;
      }

      // Process children
      if (n.children && n.children.length > 0) {
        n.children.forEach(child => {
          const childNodeIds = processNode(child, level + 1);
          childIds.push(child.id);
          childIds.push(...childNodeIds);
        });
        nodeData.children = n.children.map(c => c.id);
      }

      nodes.push(nodeData);

      // Build hierarchy string
      const typeLabel = n.type.toLowerCase();
      const nameLabel = n.name || 'Unnamed';
      const contentPreview = n.type === 'TEXT' && n.characters 
        ? `: "${n.characters.substring(0, 50)}${n.characters.length > 50 ? '...' : ''}"`
        : '';
      const sizeLabel = n.absoluteBoundingBox
        ? ` [${Math.round(n.absoluteBoundingBox.width)}×${Math.round(n.absoluteBoundingBox.height)}]`
        : '';
      
      hierarchyLines.push(`${indent}${typeLabel} "${nameLabel}"${contentPreview}${sizeLabel}`);

      return [n.id, ...childIds];
    };

    processNode(node, depth);

    return {
      nodes,
      hierarchy: hierarchyLines.join('\n'),
    };
  }

  /**
   * Find all nodes that can be exported as images (optionally filtered by screen)
   */
  private findImageNodes(
    node: FigmaNode, 
    imageNodes: Array<{ id: string; name: string; type: string; width?: number; height?: number }> = [],
    screenId?: string,
    isWithinScreen: boolean = false
  ): void {
    // Check if we're within the target screen
    const currentIsScreen = node.id === screenId;
    const nowWithinScreen = isWithinScreen || currentIsScreen;
    
    // If screenId is specified and we're not within that screen, skip
    if (screenId && !nowWithinScreen && node.type !== 'PAGE') {
      // Continue searching children
      if (node.children) {
        node.children.forEach(child => this.findImageNodes(child, imageNodes, screenId, false));
      }
      return;
    }
    // Exportable node types
    const exportableTypes = ['VECTOR', 'COMPONENT', 'INSTANCE', 'FRAME', 'GROUP', 'RECTANGLE', 'ELLIPSE'];
    
    // Check if node has image fills or is exportable
    const hasImageFill = node.fills?.some(fill => fill.type === 'IMAGE' || fill.imageRef);
    const isExportable = exportableTypes.includes(node.type) || hasImageFill;

    if (isExportable && node.absoluteBoundingBox) {
      // Skip very small nodes (likely decorative)
      const minSize = 16;
      if (node.absoluteBoundingBox.width >= minSize && node.absoluteBoundingBox.height >= minSize) {
        imageNodes.push({
          id: node.id,
          name: node.name || 'Unnamed',
          type: node.type,
          width: node.absoluteBoundingBox.width,
          height: node.absoluteBoundingBox.height,
        });
      }
    }

    // Recurse children
    if (node.children) {
      node.children.forEach(child => this.findImageNodes(child, imageNodes, screenId, nowWithinScreen));
    }
  }

  /**
   * Download images/assets from Figma (optionally filtered by screen)
   */
  async downloadAssets(
    fileKey: string,
    rootNode: FigmaNode,
    assetsDir: string,
    screenId?: string // Optional: only download assets for specific screen
  ): Promise<Array<{
    nodeId: string;
    nodeName: string;
    nodeType: string;
    format: 'png' | 'svg' | 'jpg';
    path: string;
    url: string;
    width?: number;
    height?: number;
  }>> {
    // Find all image nodes (optionally filtered by screen)
    const imageNodes: Array<{ id: string; name: string; type: string; width?: number; height?: number }> = [];
    this.findImageNodes(rootNode, imageNodes, screenId);

    if (imageNodes.length === 0) {
      logger.info('No image nodes found to download');
      return [];
    }

    logger.info(`Found ${imageNodes.length} image nodes to download`);

    // Limit to first 50 nodes to avoid API limits
    const nodesToDownload = imageNodes.slice(0, 50);
    const nodeIds = nodesToDownload.map(n => n.id).join(',');

    // Request image URLs from Figma API
    // Use PNG format by default, SVG for vectors
    const imageUrl = `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(nodeIds)}&format=png&scale=2`;
    
    const response = await this.fetchWithRetry(imageUrl, {
      headers: {
        'X-Figma-Token': this.apiKey,
      },
    }, 'Figma images listing');

    const imageData = await response.json() as { images?: Record<string, string> };
    const images = imageData.images as Record<string, string>;

    // Ensure assets directory exists
    const fullAssetsDir = assetsDir.startsWith('/') ? assetsDir : join(process.cwd(), assetsDir);
    if (!existsSync(fullAssetsDir)) {
      await mkdir(fullAssetsDir, { recursive: true });
    }

    // Download each image
    const downloadedAssets: Array<{
      nodeId: string;
      nodeName: string;
      nodeType: string;
      format: 'png' | 'svg' | 'jpg';
      path: string;
      url: string;
      width?: number;
      height?: number;
    }> = [];

    for (const node of nodesToDownload) {
      const imageUrl = images[node.id];
      if (!imageUrl) {
        logger.warn(`No image URL returned for node ${node.id} (${node.name})`);
        continue;
      }

      try {
        // Download image
        const imageResponse = await this.fetchWithRetry(
          imageUrl,
          {},
          `Download image ${node.id}`
        );

        const imageBuffer = await imageResponse.arrayBuffer();
        
        // Generate safe filename
        const safeName = node.name
          .replace(/[^a-z0-9]/gi, '_')
          .toLowerCase()
          .substring(0, 50);
        const extension = 'png'; // PNG format
        const filename = `${safeName}_${node.id.substring(0, 8)}.${extension}`;
        const filePath = join(fullAssetsDir, filename);

        // Write file
        await writeFile(filePath, Buffer.from(imageBuffer));

        downloadedAssets.push({
          nodeId: node.id,
          nodeName: node.name,
          nodeType: node.type,
          format: extension as 'png',
          path: filePath,
          url: imageUrl,
          width: node.width,
          height: node.height,
        });

        logger.info(`Downloaded: ${filename} (${node.name})`);
      } catch (error) {
        logger.warn(`Error downloading image for node ${node.id}: ${error instanceof Error ? error.message : String(error)}`);
        // Continue with other images
      }
    }

    logger.info(`Downloaded ${downloadedAssets.length} assets to ${fullAssetsDir}`);
    return downloadedAssets;
  }

  /**
   * Convert RGBA to hex
   */
  private rgbaToHex(r: number, g: number, b: number, a: number = 1): string {
    const toHex = (n: number) => {
      const hex = Math.round(n * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${a < 1 ? toHex(a) : ''}`;
  }
}

