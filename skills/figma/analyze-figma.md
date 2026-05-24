---
name: analyze-figma
description: Analyze Figma design and extract all design tokens automatically
useWhen: User wants to analyze a Figma design to extract design tokens (colors, typography, spacing, components, etc.)
category: figma
tags:
  - figma
  - design
  - analysis
  - tokens
---

# Analyze Figma Design Skill

Workflow to automatically analyze Figma design and extract all design tokens.

## ⚠️ CRITICAL FIRST STEP - READ THIS FIRST!

**BEFORE doing anything else, you MUST extract the Figma URL from the user's input message!**

The URL is ALWAYS in the user's message - it may be:
- On the same line as the command: `/analyze-figma https://www.figma.com/design/...`
- Split across multiple lines:
  ```
  /analyze-figma https://www.figma.com/design/lC34qpTSy2MYalTIOsj8S2/
  Online-Education-Website-Free-Template--Community-?t=7G5yzTiEtJlIZBtY-0
  ```

**DO NOT proceed without extracting the URL first!**
**DO NOT ask the user for the URL - it's always in their message!**

## Overview

This skill automatically analyzes Figma design and extracts all design tokens needed for implementation.

## Workflow

### Step 1: Extract Figma URL from User Input

**Action**: Extract Figma URL from user message

**CRITICAL**: The URL is ALWAYS in the user's input message! DO NOT ask for it - just extract it!

**How to Extract**:
1. **Read the ENTIRE user input message** - look at ALL lines, not just the first line
2. **Search for ANY text containing** `figma.com/design/` - this is the URL
3. **URL may appear in different formats**:
   - On same line: `/analyze-figma https://www.figma.com/design/...`
   - Split across lines:
     ```
     /analyze-figma https://www.figma.com/design/lC34qpTSy2MYalTIOsj8S2/
     Online-Education-Website-Free-Template--Community-?t=7G5yzTiEtJlIZBtY-0
     ```
   - Just the URL: `https://www.figma.com/design/...`
4. **Extract the COMPLETE URL**:
   - Start from `https://` or `http://`
   - Include everything until the end of the line or next whitespace
   - If URL is split, combine ALL parts:
     - Line 1: `https://www.figma.com/design/lC34qpTSy2MYalTIOsj8S2/`
     - Line 2: `Online-Education-Website-Free-Template--Community-?t=7G5yzTiEtJlIZBtY-0`
     - Combined: `https://www.figma.com/design/lC34qpTSy2MYalTIOsj8S2/Online-Education-Website-Free-Template--Community-?t=7G5yzTiEtJlIZBtY-0`
5. **Include ALL query parameters**: `?node-id=...`, `&t=...`, etc.

**REAL EXAMPLE from user input**:
```
User message:
/analyze-figma https://www.figma.com/design/lC34qpTSy2MYalTIOsj8S2/
Online-Education-Website-Free-Template--Community-?t=7G5yzTiEtJlIZBtY-0
```

**Extract as**:
```
https://www.figma.com/design/lC34qpTSy2MYalTIOsj8S2/Online-Education-Website-Free-Template--Community-?t=7G5yzTiEtJlIZBtY-0
```

**IMPORTANT RULES**:
- ✅ DO: Read the ENTIRE user message (all lines)
- ✅ DO: Look for `figma.com/design/` anywhere in the message
- ✅ DO: Combine split lines into one URL
- ❌ DO NOT: Ask user for URL - it's ALWAYS in the input
- ❌ DO NOT: Skip this step - URL extraction is MANDATORY
- ❌ DO NOT: Proceed without extracting URL first

**If you think URL is not found**:
1. Re-read the user's message line by line
2. Look for ANY mention of "figma.com"
3. Check if URL is split across multiple lines
4. The URL is definitely there - find it!

### Step 2: Check Tool Configuration

**Action**: Verify Figma tool is configured

**Check**: Before calling the tool, verify that `figma-analysis` tool is configured:
- If tool reports "needs config", guide user to run: `aikit skills figma-analysis config`
- Tool must have a valid Figma Personal Access Token

### Step 3: Call MCP Tool tool_read_figma_design

**Action**: Call MCP tool `tool_read_figma_design` with the extracted URL

**CRITICAL**: You MUST use the MCP tool, NOT web fetch! The tool is exposed via MCP as `tool_read_figma_design`.

**The tool name in MCP is**: `tool_read_figma_design` (NOT `read_figma_design` or `figma-analysis/read_figma_design`)

```
Use MCP tool: tool_read_figma_design
Arguments: { "url": "[extracted URL]" }
```

**DO NOT**:
- ❌ Try to fetch the URL via web browser
- ❌ Use `read_figma_design` (wrong name)
- ❌ Use `figma-analysis/read_figma_design` (wrong name)

**DO**:
- ✅ Use `tool_read_figma_design` (correct MCP tool name)
- ✅ The tool has the API key configured and will authenticate automatically

**Tool will automatically**:
- Use Figma API with configured API key
- Fetch design data from Figma
- Extract design tokens automatically
- Return formatted results

### Step 4: Process Extracted Tokens

**Action**: Review and process tokens from tool response

**Tool response will include**:

   - **All Screens/Pages**: List of all frames/screens with dimensions
   - **Complete Color Palette**: All hex color codes extracted
   - **Typography System**: Font families, sizes, weights, line heights
   - **Spacing System**: Base unit and spacing scale
   - **Component Structure**: All components found in design
   - **Layout Grid**: Container widths and grid structure
   - **Responsive Breakpoints**: All breakpoints detected

**If tool returns error**:
- Check error message
- If "needs config": Guide user to run `aikit skills figma-analysis config`
- If API error: Verify URL is correct and file is accessible

### Step 5: Format Extracted Tokens

**Action**: Format extracted tokens as structured markdown

**Format extracted data**:
- Organize by category
- Use markdown formatting
- Include all details
- Be specific with values (exact pixels, hex codes, etc.)

### Step 6: Save to Memory

**Action**: Save findings to `memory/research/figma-analysis.md`

**Use memory-update tool**:
```
Use tool: memory-update
Arguments: {
  "key": "research/figma-analysis",
  "content": "[formatted markdown with all extracted tokens]"
}
```

**Format for memory file**:
```markdown
# Figma Design Analysis

**Source**: [Figma URL]
**Analyzed**: [Date]

## Screens/Pages
- [List all screens]

## Color Palette
### Primary Colors
- Color Name: #hexcode

### Secondary Colors
- Color Name: #hexcode

[Continue for all colors]

## Typography
### Font Families
- Primary: Font Name
- Secondary: Font Name

### Font Sizes
- Heading 1: 48px
- Heading 2: 36px
[Continue for all sizes]

## Spacing System
- Base unit: 8px
- Values used: 4px, 8px, 16px, 24px, 32px, etc.

## Component Structure
- Header: [description]
- Hero: [description]
[Continue for all components]

## Layout Grid
- Container max-width: 1200px
- Columns: 12
- Gutter: 24px

## Responsive Breakpoints
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

## Assets Needed
### Images
- [List all images]

### Icons
- [List all icons]

### Fonts
- [List all fonts]
```

### Step 7: Report Results

**Action**: Report what was extracted

**Report format**:
```
✅ Figma Design Analysis Complete

**Extracted**:
- [X] screens/pages
- [Y] colors in palette
- [Z] typography styles
- [N] components identified
- [M] spacing values
- [K] breakpoints defined
- [L] assets needed

**Saved to**: memory/research/figma-analysis.md

**Next steps**:
- Review extracted tokens
- Use /plan to create implementation plan
- Start implementing with extracted design tokens
```

## If Tool Reports Errors

**If tool reports "needs config"**:
- Guide user to run: `aikit skills figma-analysis config`
- Follow OAuth flow to set up Figma Personal Access Token

**If API returns error**:
- Verify Figma URL is correct and accessible
- Check that Figma API token has proper permissions
- Ensure design file is shared with the account that owns the token
- Verify file key in URL is correct

## Checklist

- [ ] Figma URL extracted from user input
- [ ] Tool configuration verified (or user guided to configure)
- [ ] `tool_read_figma_design` MCP tool called with URL (NOT `read_figma_design` or `figma-analysis/read_figma_design`)
- [ ] Design tokens extracted from tool response
- [ ] Findings formatted as markdown
- [ ] Saved to memory/research/figma-analysis.md
- [ ] Results reported to user

## Output

- ✅ File `memory/research/figma-analysis.md` with all design tokens
- ✅ Report on what was extracted
- ✅ Ready to use for implementation


---

> **Contact:** Mulky Malikul Dhaher — [mulkymalikuldhaher@email.com](mailto:mulkymalikuldhaher@email.com)
>
> **Disclaimer:** This project is for Education Purpose only. Risiko apapun tidak kita tanggung. (We are not responsible for any risks or damages.)
