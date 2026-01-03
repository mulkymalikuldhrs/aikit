import { logger } from '../../utils/logger.js';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Check current source code status
 */
export async function checkCurrentCodeStatus(projectPath: string = process.cwd()): Promise<{
  hasHTML: boolean;
  htmlFile?: string;
  hasCSS: boolean;
  cssFiles: string[];
  hasAssets: boolean;
  assetCount: number;
  sections: string[];
}> {
  const status = {
    hasHTML: false,
    htmlFile: undefined as string | undefined,
    hasCSS: false,
    cssFiles: [] as string[],
    hasAssets: false,
    assetCount: 0,
    sections: [] as string[],
  };

  try {
    // Check for HTML files
    const htmlFiles = ['index.html', 'index.htm', 'main.html'].filter(file => 
      existsSync(join(projectPath, file))
    );
    if (htmlFiles.length > 0) {
      status.hasHTML = true;
      status.htmlFile = htmlFiles[0];
      
      // Try to read HTML to extract sections
      try {
        const htmlContent = await readFile(join(projectPath, htmlFiles[0]), 'utf-8');
        // Extract section IDs and classes
        const sectionMatches = htmlContent.match(/<(section|div|header|footer|main|article|aside)[^>]*(?:id|class)=["']([^"']+)["']/gi);
        if (sectionMatches) {
          status.sections = sectionMatches.map(match => {
            const idMatch = match.match(/id=["']([^"']+)["']/i);
            const classMatch = match.match(/class=["']([^"']+)["']/i);
            return idMatch ? idMatch[1] : (classMatch ? classMatch[1].split(' ')[0] : '');
          }).filter(Boolean);
        }
      } catch (e) {
        // Ignore read errors
      }
    }

    // Check for CSS files
    const stylesDir = join(projectPath, 'styles');
    if (existsSync(stylesDir)) {
      try {
        const files = await readdir(stylesDir);
        const cssFiles = files.filter(f => f.endsWith('.css'));
        if (cssFiles.length > 0) {
          status.hasCSS = true;
          status.cssFiles = cssFiles.map(f => join(stylesDir, f));
        }
      } catch (e) {
        // Ignore read errors
      }
    }

    // Check for assets
    const assetsDir = join(projectPath, 'assets', 'images');
    if (existsSync(assetsDir)) {
      try {
        const files = await readdir(assetsDir);
        const imageFiles = files.filter(f => /\.(png|jpg|jpeg|svg|webp)$/i.test(f));
        if (imageFiles.length > 0) {
          status.hasAssets = true;
          status.assetCount = imageFiles.length;
        }
      } catch (e) {
        // Ignore read errors
      }
    }
  } catch (error) {
    logger.warn(`Error checking code status: ${error instanceof Error ? error.message : String(error)}`);
  }

  return status;
}

/**
 * Compare current code with Figma design to identify what needs to be implemented
 */
export async function compareCodeWithFigma(
  figmaTokens: any,
  selectedScreenId: string,
  projectPath: string = process.cwd()
): Promise<{
  missingSections: string[];
  missingAssets: string[];
  needsUpdate: boolean;
  recommendations: string[];
}> {
  const codeStatus = await checkCurrentCodeStatus(projectPath);
  const result = {
    missingSections: [] as string[],
    missingAssets: [] as string[],
    needsUpdate: false,
    recommendations: [] as string[],
  };

  // Find selected screen
  const selectedScreen = figmaTokens.screens?.find((s: any) => s.id === selectedScreenId);
  if (!selectedScreen) {
    result.recommendations.push('Selected screen not found in Figma design');
    return result;
  }

  // Extract sections from Figma structure
  const figmaSections: string[] = [];
  if (figmaTokens.structure?.nodes) {
    const screenNode = figmaTokens.structure.nodes.find((n: any) => n.id === selectedScreenId);
    if (screenNode?.children) {
      // Extract main sections from children
      screenNode.children.forEach((childId: string) => {
        const childNode = figmaTokens.structure.nodes.find((n: any) => n.id === childId);
        if (childNode && (childNode.type === 'FRAME' || childNode.type === 'COMPONENT')) {
          const sectionName = childNode.name.toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-');
          figmaSections.push(sectionName);
        }
      });
    }
  }

  // Compare sections
  const existingSections = codeStatus.sections.map(s => s.toLowerCase());
  result.missingSections = figmaSections.filter(s => 
    !existingSections.some(existing => existing.includes(s) || s.includes(existing))
  );

  // Check assets
  if (codeStatus.assetCount === 0) {
    result.missingAssets.push('All assets need to be downloaded');
    result.needsUpdate = true;
  }

  // Generate recommendations
  if (!codeStatus.hasHTML) {
    result.recommendations.push('Create index.html with HTML5 structure');
  }
  if (!codeStatus.hasCSS) {
    result.recommendations.push('Create CSS files (variables.css, base.css, components.css)');
  }
  if (result.missingSections.length > 0) {
    result.recommendations.push(`Implement missing sections: ${result.missingSections.join(', ')}`);
  }
  if (result.missingAssets.length > 0) {
    result.recommendations.push('Download required assets from Figma');
  }

  return result;
}




