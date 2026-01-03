import { DefaultCommand } from './types';

/**
 * Draw.io Diagram Commands
 */
export const DRAWIO_COMMANDS: DefaultCommand[] = [
  {
    name: 'drawio-interact',
    description: 'Create and edit diagrams with Draw.io (manual sync)',
    category: 'design',
    usage: '/drawio-interact <create|open|sync-to-mmd|sync-to-drawio|list> [diagram-name]',
    examples: [
      '/drawio-interact create login-flow',
      '/drawio-interact open login-flow',
      '/drawio-interact sync-to-mmd login-flow',
      '/drawio-interact sync-to-drawio login-flow',
      '/drawio-interact list',
    ],
    content: `Interactive diagram workflow with AI + Draw.io + manual sync.

**User provided**: $ARGUMENTS

## File Locations

**Standard locations**:
- **Mermaid files**: \`mermaid/[name].mmd\` (version control)
- **Draw.io files**: \`.aikit/assets/drawio/[name].drawio\` (visual editing)

**Custom paths**: You can also specify full paths to sync any diagram files.

## Workflow

### Step 1: Parse User Intent

Check if user wants to:
- **create** - Generate new diagram and open in Draw.io
- **open** - Open existing diagram in Draw.io
- **sync-to-mmd** - Convert Draw.io → Mermaid
- **sync-to-drawio** - Convert Mermaid → Draw.io
- **list** - Show all existing diagrams

### Step 2: Create Diagram (if "create")

**Action**: Generate diagram from description, create files, open in Draw.io

1. **Extract diagram name** from arguments
   - "create login-flow" → name = "login-flow"
   - If no name provided, ask user

2. **Ensure directories exist**:
\`\`\`javascript
import { ensureDiagramDirectories } from '@tdsoft-tech/aikit/tools/drawio-convert/diagram-utils.js';
ensureDiagramDirectories(projectRoot);
\`\`\`

3. **Generate Mermaid code** based on description:
   - Login/auth → Flowchart with authentication
   - Order/purchase → Flowchart with payment
   - API/request → Sequence diagram
   - Generic → Basic flowchart

4. **Convert to Draw.io**:
\`\`\`javascript
import { convertToDrawioFile } from '@tdsoft-tech/aikit/tools/drawio-convert/convert-to-drawio.js';

const mermaidPath = join(projectRoot, 'mermaid', \`\${name}.mmd\`);
const drawioPath = join(projectRoot, '.aikit/assets/drawio', \`\${name}.drawio\`);

// Write Mermaid file first
fs.writeFileSync(mermaidPath, mermaidCode, 'utf-8');

// Convert to Draw.io
const result = convertToDrawioFile(mermaidPath, drawioPath, name);
\`\`\`

5. **Open in Draw.io**:
\`\`\`javascript
import { openDiagram } from '@tdsoft-tech/aikit/tools/drawio-convert/open-diagram.js';
const openResult = openDiagram(drawioPath);
\`\`\`

6. **Report success**:
   - Show generated Mermaid code
   - Confirm file locations
   - Confirm Draw.io opened
   - Inform user: "After editing, run /drawio-interact sync-to-mmd [name]"

### Step 3: Open Diagram (if "open")

**Action**: Open existing diagram in Draw.io

1. **Resolve diagram path**:
\`\`\`javascript
import { resolveDiagramPath } from '@tdsoft-tech/aikit/tools/drawio-convert/diagram-utils.js';

const drawioPath = resolveDiagramPath(name, 'drawio', projectRoot);
\`\`\`

2. **Check file exists** - If not, ask to create first

3. **Open in Draw.io**:
\`\`\`javascript
import { openDiagram } from '@tdsoft-tech/aikit/tools/drawio-convert/open-diagram.js';
const result = openDiagram(drawioPath);
\`\`\`

4. **Tip**: "After editing, run /drawio-interact sync-to-mmd [name] to update Mermaid"

### Step 4: Sync to Mermaid (if "sync-to-mmd")

**Action**: Convert Draw.io file → Mermaid format (update source code)

1. **Resolve diagram path**:
\`\`\`javascript
import { resolveDiagramPath } from '@tdsoft-tech/aikit/tools/drawio-convert/diagram-utils.js';

// Can be name or full path
const drawioPath = resolveDiagramPath(input, 'drawio', projectRoot);
\`\`\`

2. **Validate file exists**

3. **Convert Draw.io → Mermaid**:
\`\`\`javascript
import { convertToMermaidFile } from '@tdsoft-tech/aikit/tools/drawio-convert/convert-to-mermaid.js';
import { findPairedDiagram } from '@tdsoft-tech/aikit/tools/drawio-convert/diagram-utils.js';

// Find paired Mermaid file
const mermaidPath = findPairedDiagram(drawioPath, projectRoot);

// If not found, ask user where to save
if (!mermaidPath) {
  const name = path.basename(drawioPath, '.drawio');
  mermaidPath = join(projectRoot, 'mermaid', \`\${name}.mmd\`);
}

// Convert
const result = convertToMermaidFile(drawioPath, mermaidPath);
\`\`\`

4. **Handle errors**:
   - If errors: Show exact error with suggestions
   - If warnings: Show warnings but continue

5. **Report success**:
   - Show conversion stats (nodes, edges)
   - Show preview of updated Mermaid (10 lines)
   - Confirm file updated: "✅ Synced: [name].drawio → [name].mmd"

### Step 5: Sync to Draw.io (if "sync-to-drawio")

**Action**: Convert Mermaid → Draw.io format (update visual diagram)

1. **Resolve diagram path**:
\`\`\`javascript
import { resolveDiagramPath } from '@tdsoft-tech/aikit/tools/drawio-convert/diagram-utils.js';

const mermaidPath = resolveDiagramPath(input, 'mermaid', projectRoot);
\`\`\`

2. **Validate file exists**

3. **Convert Mermaid → Draw.io**:
\`\`\`javascript
import { convertToDrawioFile } from '@tdsoft-tech/aikit/tools/drawio-convert/convert-to-drawio.js';
import { findPairedDiagram } from '@tdsoft-tech/aikit/tools/drawio-convert/diagram-utils.js';

// Find paired Draw.io file
const drawioPath = findPairedDiagram(mermaidPath, projectRoot);

// If not found, ask user where to save
if (!drawioPath) {
  const name = path.basename(mermaidPath, '.mmd');
  drawioPath = join(projectRoot, '.aikit/assets/drawio', \`\${name}.drawio\`);
}

// Convert
const result = convertToDrawioFile(mermaidPath, drawioPath, name);
\`\`\`

4. **Handle errors**:
   - If Mermaid syntax errors: Show line number and fix suggestions
   - If conversion warnings: Show but continue

5. **Report success**:
   - Show conversion stats
   - Confirm file updated
   - **Prompt**: "Open in Draw.io? (y/n)"
     - If yes: invoke openDiagram()

### Step 6: List Diagrams (if "list")

**Action**: Show all diagrams

\`\`\`javascript
import { getDiagramList } from '@tdsoft-tech/aikit/tools/drawio-convert/diagram-utils.js';

const diagrams = getDiagramList(projectRoot);

diagrams.forEach((d, i) => {
  console.log(\`\${i + 1}. \${d.name}\`);
  console.log(\`   Mermaid: \${d.mermaid || '[missing]'}\`);
  console.log(\`   Drawio: \${d.drawio || '[missing]'}\`);
  console.log();
});
\`\`\`

## Error Handling

### File Not Found
\`\`\`
❌ File not found: mermaid/login-flow.mmd

Did you mean:
- mermaid/auth-flow.mmd
- mermaid/login.mmd

Or run: /drawio-interact create login-flow
\`\`\`

### Invalid Mermaid Syntax
\`\`\`
❌ Invalid Mermaid syntax at line 5:

4:   A --> B
5:   B -- > C    ← Missing space before >
6:   C --> D

Common issues:
- Use --> for edges (not -- >)
- Labels use |text| syntax
- Nodes use [name] or {name}

Validate at: https://mermaid.live
\`\`\`

### Invalid Draw.io XML
\`\`\`
❌ Invalid Draw.io file: login-flow.drawio

Issues:
- Missing mxGraphModel tag
- Corrupted XML at line 15

Try:
1. Open in Draw.io desktop app
2. Save as new file
3. Run sync again
\`\`\`

### Conversion Warnings
\`\`\`
⚠️  Sync completed with warnings:

- 3 nodes could not be converted (complex shapes)
- 2 edges lost styling (curved lines)

Review mermaid/login-flow.mmd to verify
\`\`\`

## Example Session

### Create New Diagram
\`\`\`
User: /drawio-interact create user-auth

AI: Creating diagram: user-auth

📄 Generated Mermaid code:
graph TD
    User[User] -->|Login| Login[Login Page]
    Login -->|Success| Dashboard[Dashboard]

✅ Files created:
   - mermaid/user-auth.mmd
   - .aikit/assets/drawio/user-auth.drawio

🎨 Opening in Draw.io...

💡 After editing, run: /drawio-interact sync-to-mmd user-auth
\`\`\`

### Edit & Sync (Draw.io → Mermaid)
\`\`\`
[User edits in Draw.io, adds "Password Reset" node, saves]

User: /drawio-interact sync-to-mmd user-auth

AI: Syncing Draw.io → Mermaid...

📊 Reading: .aikit/assets/drawio/user-auth.drawio
🔄 Converting...
✅ Updated: mermaid/user-auth.mmd

Changes:
• 4 nodes
• 3 edges

Preview:
graph TD
    User[User] -->|Login| Login[Login Page]
    Login -->|Success| Dashboard[Dashboard]
    Login -->|Forgot Password| Recovery[Password Reset]
\`\`\`

### Edit & Sync (Mermaid → Draw.io)
\`\`\`
[User edits mermaid/user-auth.mmd directly]

User: /drawio-interact sync-to-drawio user-auth

AI: Syncing Mermaid → Draw.io...

📝 Reading: mermaid/user-auth.mmd
🔄 Converting...
✅ Updated: .aikit/assets/drawio/user-auth.drawio

Changes:
• 4 nodes
• 3 edges

Open in Draw.io? (y/n): y
🎨 Opening...
\`\`\`

### List Diagrams
\`\`\`
User: /drawio-interact list

AI: Diagrams in this project:

1. user-auth
   Mermaid: mermaid/user-auth.mmd ✓
   Drawio: .aikit/assets/drawio/user-auth.drawio ✓

2. order-flow
   Mermaid: mermaid/order-flow.mmd ✓
   Drawio: [missing]
   Run: /drawio-interact sync-to-drawio order-flow
\`\`\`

## Key Differences from Auto-Sync Version

**Removed:**
- ❌ Auto-sync background service
- ❌ Lifecycle manager
- ❌ File watchers
- ❌ Automatic start/stop
- ❌ .aikit/tools/drawio-sync directory

**Added:**
- ✅ Manual sync commands (sync-to-mmd, sync-to-drawio)
- ✅ Explicit user control
- ✅ Deterministic conversions
- ✅ Clear error messages
- ✅ Custom path support

**Benefits:**
- Predictable behavior every time
- No background processes
- Clear visibility into what changed
- Easier debugging
- Works on all platforms consistently`,
  },
];
