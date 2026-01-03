import { DefaultCommand } from './types';

/**
 * Design & Planning Commands
 */
export const DESIGN_COMMANDS: DefaultCommand[] = [
  {
    name: 'design',
    description: 'Design a feature or system',
    category: 'design',
    usage: '/design <feature>',
    examples: ['/design notification system', '/design API gateway'],
    content: `Design a feature with thorough planning.

## Workflow

Feature to design: $ARGUMENTS

1. Requirements gathering (Socratic questioning)
2. Research existing solutions
3. Design options with trade-offs
4. Choose approach
5. Document design in memory/

## Output
- Design document
- Architecture diagrams (described)
- API contracts
- Data models`,
  },
  {
    name: 'brainstorm',
    description: 'Brainstorm ideas for a problem',
    category: 'design',
    usage: '/brainstorm <problem>',
    examples: ['/brainstorm user retention', '/brainstorm performance optimization'],
    content: `Collaborative brainstorming session.

## Workflow

Problem to brainstorm: $ARGUMENTS

1. Define problem clearly
2. Generate diverse ideas (no judgement)
3. Group related ideas
4. Evaluate feasibility
5. Select top candidates`,
  },
  {
    name: 'analyze-figma',
    description: 'Analyze Figma design and extract design tokens using Figma API',
    category: 'design',
    usage: '/analyze-figma <figma-url>',
    examples: [
      '/analyze-figma https://www.figma.com/design/...',
      '/analyze-figma [figma-url]',
    ],
    content: `Analyze a Figma design and extract all design tokens automatically using Figma API.

## Workflow

**Step 1: Extract URL from User Input**

The Figma URL is provided in the SAME message as the command. Extract it:
- Check the full user input message
- Look for URL pattern: \`https://www.figma.com/design/...\` or \`http://www.figma.com/design/...\`
- Extract the ENTIRE URL including all query parameters
- If URL not found in current message, check previous messages

**Step 2: Check Tool Configuration**

Before calling the tool, verify that Figma tool is configured:
- If not configured, inform user to run: \`aikit skills figma-analysis config\`
- The tool requires a Figma Personal Access Token

**Step 3: Call MCP Tool**

**CRITICAL**: You MUST use the MCP tool \`tool_read_figma_design\`, NOT web fetch!

**The correct tool name is**: \`tool_read_figma_design\` (exposed via MCP)

**DO NOT use**:
- ❌ \`read_figma_design\` (wrong - missing "tool_" prefix)
- ❌ \`figma-analysis/read_figma_design\` (wrong format)
- ❌ Web fetch (file requires authentication)

**DO use**:
- ✅ \`tool_read_figma_design\` (correct MCP tool name)

Use the MCP tool:
\`\`\`
Use MCP tool: tool_read_figma_design
Arguments: { "url": "[extracted URL]" }
\`\`\`

The tool has the Figma API token configured and will authenticate automatically.

This tool will:
1. Validate the Figma URL format
2. Check if Figma tool is configured
3. Call Figma API to fetch design data
4. Extract design tokens:
   - Colors (from fills and strokes)
   - Typography (font families, sizes, weights, line heights)
   - Spacing system (8px grid detection)
   - Components (from Figma components)
   - Screens/Frames (dimensions and names)
   - Breakpoints (common responsive breakpoints)
5. Return formatted markdown with all extracted tokens

**Step 4: Format and Save**

Format extracted tokens as structured markdown:
\`\`\`markdown
# Figma Design Analysis

**Source**: [Figma URL]
**Analyzed**: [Date]

## Screens/Pages
- [List all screens]

## Color Palette
### Primary Colors
- Color Name: #hexcode
[Continue for all colors]

## Typography
### Font Families
- Primary: Font Name
[Continue]

### Font Sizes
- Heading 1: 48px
[Continue for all sizes]

## Spacing System
- Base unit: 8px
- Values used: [list]

## Component Structure
- Header: [description]
[Continue for all components]

## Layout Grid
- Container max-width: [value]
- Columns: [value]

## Responsive Breakpoints
- Mobile: [range]
- Tablet: [range]
- Desktop: [range]

## Assets Needed
### Images
- [List]

### Icons
- [List]

### Fonts
- [List]
\`\`\`

Save to memory using memory-update tool:
\`\`\`
Use tool: memory-update
Arguments: {
  "key": "research/figma-analysis",
  "content": "[formatted markdown]"
}
\`\`\`

**Step 5: Report Results**

Summarize what was extracted:
- Number of colors found
- Number of typography styles
- Number of components
- Number of screens/frames
- Confirm save location: \`memory/research/figma-analysis.md\`

## Important Notes

- **DO NOT** ask user to provide URL again - extract it from input
- **DO NOT** wait - start immediately after extracting URL
- The URL is in the SAME message as the command
- The tool uses Figma API, so the file must be accessible with your API token
- If the tool returns an error about configuration, guide user to run: \`aikit skills figma-analysis config\`
- If the tool returns an error about access, verify the file is accessible with your token

The analysis will be saved automatically for later reference.`,
  },
];
