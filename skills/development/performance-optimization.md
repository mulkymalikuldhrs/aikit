---
name: performance-optimization
description: Use when optimizing application performance, reducing load times, or improving responsiveness
useWhen: The user asks to optimize performance, reduce bundle size, or improve page speed
category: development
tags:
  - performance
  - optimization
  - speed
  - bundle-size
---

# Performance Optimization

## Overview
Systematic approach to identifying and fixing performance bottlenecks in web applications.

## Workflow

### Step 1: Measure and Profile
1. Identify performance metrics
2. Use profiling tools
3. Measure baseline performance
4. Identify bottlenecks

**Metrics to Track:**
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)
- Bundle size
- Network requests

**Tools:**
- Chrome DevTools Performance tab
- Lighthouse
- WebPageTest
- Bundle analyzers (webpack-bundle-analyzer)

### Step 2: Optimize Bundle Size
1. Analyze bundle composition
2. Remove unused code
3. Code splitting
4. Tree shaking
5. Minification

**Strategies:**
- Dynamic imports for routes
- Lazy load components
- Remove unused dependencies
- Use smaller alternatives
- Optimize images

**Checklist:**
- [ ] Bundle size analyzed
- [ ] Unused code removed
- [ ] Code splitting implemented
- [ ] Tree shaking working
- [ ] Minification enabled

### Step 3: Optimize Images
1. Use appropriate formats (WebP, AVIF)
2. Compress images
3. Lazy load images
4. Use responsive images
5. Provide image dimensions

**Strategies:**
- Convert to WebP/AVIF
- Use `loading="lazy"`
- Use `srcset` for responsive
- Provide width/height to prevent CLS
- Use CDN for images

### Step 4: Optimize Rendering
1. Reduce re-renders
2. Use React.memo / useMemo / useCallback
3. Virtualize long lists
4. Optimize CSS
5. Reduce layout shifts

**React Optimizations:**
- Memoize expensive computations
- Memoize callbacks
- Memoize components
- Virtualize lists (react-window)
- Code split routes

### Step 5: Optimize Network
1. Enable compression (gzip/brotli)
2. Use HTTP/2
3. Implement caching
4. Reduce requests
5. Use CDN

**Strategies:**
- Enable gzip/brotli compression
- Set cache headers
- Use service workers
- Combine requests
- Use CDN for static assets

### Step 6: Optimize JavaScript
1. Defer non-critical JS
2. Remove unused code
3. Minimize main thread work
4. Use web workers for heavy tasks
5. Optimize loops and algorithms

**Checklist:**
- [ ] Critical JS loaded first
- [ ] Non-critical JS deferred
- [ ] Heavy work in web workers
- [ ] Algorithms optimized
- [ ] No blocking operations

## Performance Budget
Set targets:
- Bundle size: < 200KB (gzipped)
- LCP: < 2.5s
- FCP: < 1.8s
- TTI: < 3.8s
- CLS: < 0.1

## Anti-Patterns
- Loading everything upfront
- Not using code splitting
- Large bundle sizes
- Unoptimized images
- Blocking main thread
- No caching strategy

## Verification
- [ ] Lighthouse score > 90
- [ ] Bundle size within budget
- [ ] Images optimized
- [ ] No performance regressions
- [ ] Metrics meet targets






