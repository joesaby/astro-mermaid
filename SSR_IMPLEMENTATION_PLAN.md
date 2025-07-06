# SSR Implementation Plan for Astro-Mermaid

## Current Implementation Analysis

### Architecture Overview
The current client-side implementation uses a dual plugin system:
- **Remark Plugin**: Processes `````mermaid` code blocks in markdown/MDX files
- **Rehype Plugin**: Processes HTML content (mostly redundant due to timing conflicts)
- **Client-side Script**: Dynamically loads mermaid.js and renders diagrams

### Key Findings from Baseline Testing

#### 1. Plugin Processing Analysis
- **Remark Plugin**: Successfully processes 83+ mermaid blocks across both demos
- **Rehype Plugin**: Rarely finds content due to Astro's markdown processing pipeline
- **Pipeline Order**: Markdown → Remark → Astro Shiki → HTML → Rehype
- **Timing Conflict**: Syntax highlighting runs between remark and rehype, causing coordination issues

#### 2. Current Output Structure
After remark plugin processing, mermaid blocks become:
```html
<pre class="mermaid">graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Success]
    B -->|No| D[Retry]
</pre>
```

#### 3. Client-side Rendering Features
- **Skeleton Loading**: Shimmer animation during rendering
- **Theme Switching**: Automatic light/dark mode detection
- **Error Handling**: Graceful fallback with error messages
- **Performance**: Lazy loading with conditional script injection
- **Responsive Design**: Proper CSS for all screen sizes

## SSR Implementation Strategy

### Phase 1: Foundation + Factory Pattern (Week 1)
**Goal**: Create modular architecture with comprehensive testing to ensure zero disruption

#### 1.1 Test Infrastructure Setup
- [ ] Create `tests/` directory structure
- [ ] Setup Vitest for unit testing
- [ ] Create test fixtures for all diagram types
- [ ] Mock Astro's markdown processing pipeline
- [ ] Test current implementation thoroughly (baseline)

#### 1.2 Modular Unit Tests
```javascript
// tests/client-side.test.js
describe('Client-side Plugin', () => {
  test('should transform mermaid code blocks to pre.mermaid', () => {
    // Test existing client-side logic (unchanged)
  });
  
  test('should preserve diagram content correctly', () => {
    // Test existing behavior preservation
  });
  
  test('should handle all existing use cases', () => {
    // Comprehensive regression tests
  });
});

// tests/ssr.test.js
describe('SSR Plugin', () => {
  test('should render mermaid diagrams server-side', () => {
    // Test SSR rendering functionality
  });
  
  test('should fall back to client-side on SSR failure', () => {
    // Test graceful degradation
  });
  
  test('should generate dual-theme output', () => {
    // Test theme-specific SSR output
  });
  
  test('should handle timeout scenarios', () => {
    // Test SSR timeout handling
  });
});

// tests/factory.test.js
describe('Factory Plugin', () => {
  test('should select client-side plugin by default', () => {
    // Test default behavior
  });
  
  test('should select SSR plugin when ssr: true', () => {
    // Test SSR selection
  });
  
  test('should pass options correctly to selected plugin', () => {
    // Test option forwarding
  });
});
```

#### 1.3 Integration Tests
- [ ] Test both astro-demo and starlight-demo builds with `ssr: false` (baseline)
- [ ] Test both demos with `ssr: true` (new functionality)
- [ ] Verify theme switching functionality in both modes
- [ ] Test icon pack integration with SSR fallback
- [ ] Verify responsive behavior across both rendering modes
- [ ] Test hybrid scenarios (some diagrams SSR, some client-side)

#### 1.4 Modular Refactoring
- [ ] Extract existing logic to `src/client-side.js` (unchanged)
- [ ] Create `src/factory.js` with plugin selection logic
- [ ] Update main integration to use factory pattern
- [ ] Verify demos work identically after refactoring

#### 1.5 Performance Benchmarks
- [ ] Measure current client-side rendering times (baseline)
- [ ] Document bundle size impact after refactoring
- [ ] Establish performance baselines for future comparison
- [ ] Test build time impact with large numbers of diagrams

### Phase 2: SSR Architecture Design (Week 2)
**Goal**: Design factory pattern architecture with zero disruption to existing code

#### 2.1 Modular Design Strategy
Create separate modules without touching existing implementation:
- **Extract existing logic** to `src/client-side.js` (unchanged)
- **Create new SSR logic** in `src/ssr.js` (following astro-plantuml pattern)
- **Factory pattern** in `src/factory.js` selects appropriate plugin
- **Minimal changes** to main integration file

#### 2.2 SSR Renderer Enhancement
```javascript
// Enhanced SSR renderer with theme support
class SSRRenderer {
  async renderDiagram(content, theme = 'default') {
    // Parse mermaid syntax
    // Generate SVG with theme-specific styling
    // Return both light and dark theme versions
  }
}
```

#### 2.3 Hybrid Rendering Strategy
- **Server-side**: Simple diagrams (flowcharts, sequence, basic charts)
- **Client-side**: Complex diagrams (architecture-beta, custom icons)
- **Fallback**: All diagrams can fall back to client-side if SSR fails

### Phase 3: Core SSR Implementation (Week 3)
**Goal**: Implement server-side rendering with zero disruption to existing code

#### 3.1 Modular Architecture with Factory Pattern
```javascript
// src/client-side.js (extract existing logic - unchanged)
export function remarkMermaidPlugin(options = {}) {
  return async function transformer(tree, file) {
    // Current implementation moved here (completely unchanged)
    // ... existing client-side logic
  };
}

// src/ssr.js (new SSR implementation)
export function remarkMermaidPluginSSR(options = {}) {
  return async function transformer(tree, file) {
    const { visit } = await import('unist-util-visit');
    let mermaidCount = 0;
    
    visit(tree, 'code', async (node, index, parent) => {
      if (node.lang !== 'mermaid') return;
      mermaidCount++;
      
      try {
        // SSR render mermaid diagram
        const svg = await renderMermaidSSR(node.value, options);
        
        // Replace AST node with SSR output
        parent.children[index] = {
          type: 'html',
          value: createSSRMermaidHTML(svg, node.value)
        };
      } catch (error) {
        // Fallback to existing client-side approach
        parent.children[index] = {
          type: 'html',
          value: `<pre class="mermaid">${node.value}</pre>`
        };
      }
      
      if (options.logger) {
        options.logger.info(`SSR transformed mermaid block #${mermaidCount} in ${file.path || 'unknown file'}`);
      }
    });
  };
}

// src/factory.js (plugin selector)
import { remarkMermaidPlugin } from './client-side.js';
import { remarkMermaidPluginSSR } from './ssr.js';

export function createMermaidPlugin(options = {}) {
  if (options.ssr) {
    return remarkMermaidPluginSSR(options);
  }
  return remarkMermaidPlugin(options);
}
```

#### 3.2 SSR Output Structure
```html
<!-- SSR Success -->
<div class="mermaid-ssr" data-diagram="...">
  <div class="mermaid-theme" data-theme="light">
    <svg>...</svg>
  </div>
  <div class="mermaid-theme" data-theme="dark" style="display: none;">
    <svg>...</svg>
  </div>
</div>

<!-- SSR Fallback -->
<div class="mermaid-fallback">
  <pre class="mermaid">graph TD...</pre>
</div>
```

#### 3.3 Integration Layer Updates
```javascript
// astro-mermaid-integration.js (minimal changes to main file)
import { createMermaidPlugin } from './src/factory.js';

export default function astroMermaid(options = {}) {
  return {
    name: 'astro-mermaid',
    hooks: {
      'astro:config:setup': async ({ config, updateConfig, logger }) => {
        // Factory automatically selects the right plugin
        updateConfig({
          markdown: {
            remarkPlugins: [
              ...(config.markdown?.remarkPlugins || []),
              [createMermaidPlugin, { ...options, logger }]
            ],
            // Keep existing rehype plugin for edge cases
            rehypePlugins: [
              ...(config.markdown?.rehypePlugins || []),
              [rehypeMermaidPlugin, { logger }]
            ]
          }
        });
        
        // Existing client-side script injection (unchanged)
        // ... rest of existing implementation
      }
    }
  };
}
```

#### 3.4 File Structure Organization
```
astro-mermaid-integration.js    # Main integration (minimal changes)
src/
├── client-side.js             # Existing logic (extracted, unchanged)
├── ssr.js                     # New SSR implementation
├── factory.js                 # Plugin selector
└── utils.js                   # Shared utilities
```

#### 3.5 Zero-Disruption Benefits
- **Existing code**: Completely unchanged when `ssr: false` (default)
- **New SSR code**: Isolated in separate modules
- **Factory pattern**: Clean separation of concerns
- **Fallback safety**: SSR failures automatically use existing client-side path
- **Testing**: Each module can be tested independently

### Phase 4: Starlight Compatibility (Week 4)
**Goal**: Ensure seamless integration with Starlight's Expressive Code

#### 4.1 Starlight Integration Testing
- [ ] Test with Starlight's syntax highlighting
- [ ] Verify code block processing order
- [ ] Test with Starlight themes
- [ ] Ensure proper CSS integration

#### 4.2 Configuration Compatibility
```javascript
// Ensure integration works with Starlight config
export default defineConfig({
  integrations: [
    mermaid({
      ssr: true,
      theme: 'forest',
      autoTheme: true,
      starlight: true // Optional Starlight-specific optimizations
    }),
    starlight({ /* config */ })
  ]
});
```

### Phase 5: Performance Optimization (Week 5)
**Goal**: Optimize bundle size and rendering performance

#### 5.1 Bundle Size Optimization
- [ ] Conditional loading of SSR dependencies
- [ ] Tree-shaking for unused diagram types
- [ ] Lazy loading of client-side components

#### 5.2 Build Performance
- [ ] Parallel SSR rendering
- [ ] Caching for repeated diagrams
- [ ] Optimization for large documentation sites

### Phase 6: Documentation & Testing (Week 6)
**Goal**: Complete documentation and comprehensive testing

#### 6.1 Updated Documentation
- [ ] SSR configuration guide
- [ ] Performance comparison
- [ ] Migration guide from client-side only
- [ ] Troubleshooting guide

#### 6.2 Final Testing
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness
- [ ] Accessibility compliance
- [ ] Performance validation

## Implementation Requirements

### Technical Constraints
1. **Backward Compatibility**: Must not break existing client-side implementations
2. **Progressive Enhancement**: SSR should be opt-in via configuration
3. **Graceful Degradation**: Client-side fallback for all scenarios
4. **Performance**: SSR should not significantly impact build times
5. **Proven Architecture**: Follow astro-plantuml's successful remark plugin pattern

### Configuration Options
```javascript
mermaid({
  ssr: true,                    // Enable server-side rendering
  ssrOnly: false,               // Disable client-side fallback
  ssrDiagrams: ['flowchart', 'sequence'], // Limit SSR to specific types
  timeout: 10000,               // SSR rendering timeout (ms)
  theme: 'forest',
  autoTheme: true,
  mermaidConfig: { /* ... */ }
});
```

### Testing Strategy
1. **Modular Unit Tests**: Each module (client-side, SSR, factory) tested independently
2. **Regression Tests**: Existing functionality must never break
3. **Integration Tests**: Both demos must build and function correctly in both modes
4. **Performance Tests**: Bundle size and render time must not regress
5. **Compatibility Tests**: Must work with Astro 4.x, 5.x and Starlight
6. **Factory Tests**: Plugin selection logic must be bulletproof

### Success Criteria
- [ ] Zero regression in client-side functionality
- [ ] Significant reduction in client-side rendering flickering
- [ ] Improved First Contentful Paint (FCP) times
- [ ] Maintained theme switching capabilities
- [ ] Full Starlight compatibility
- [ ] Comprehensive documentation

## Risk Mitigation
1. **Feature Flags**: All SSR features behind configuration flags
2. **Fallback Strategy**: Robust client-side fallback for all scenarios
3. **Incremental Rollout**: Phase-based implementation with testing gates
4. **Version Control**: Maintain separate branches for each phase

## Timeline Summary
- **Week 1**: Unit testing framework
- **Week 2**: Architecture design
- **Week 3**: Core SSR implementation
- **Week 4**: Starlight compatibility
- **Week 5**: Performance optimization
- **Week 6**: Documentation and final testing

This plan ensures that client-side rendering remains stable throughout the implementation process while systematically adding SSR capabilities.