# Changelog

All notable changes to astro-mermaid will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **Icon Pack Serialization**: Added `icons` property to `iconPacks` configuration to allow direct data passing, fixing serialization issues with external references ([#18](https://github.com/joesaby/astro-mermaid/issues/18))

## [1.1.0] - 2025-10-18

### Added
- **Universal Theme Detection**: Enhanced theme detection to work with both `html[data-theme]` and `body[data-theme]` attributes
- **Dual Plugin System**: Added remark plugin alongside existing rehype plugin for comprehensive markdown processing
- **Professional Standalone Demo**: Created complete astro-demo with modern UI and template-ready structure
- **Enhanced Documentation**: Reconciled documentation between demos with ELK layout examples
- **Type Safety**: Comprehensive TypeScript checking across all demos

### Changed
- **Dependency Optimization**: Cleaned up package dependencies for better maintainability
- **Build Process**: Improved build optimization and chunk splitting

### Fixed
- **Theme Switching**: Fixed mutation observers to watch both html and body elements
- **Documentation Consistency**: Synchronized examples between starlight-demo and astro-demo

## [1.0.4] - 2025-07-05

### Added
- **ELK Layout Support**: Optional advanced layout engine for complex diagrams
- **Icon Pack Integration**: Support for custom icons in architecture diagrams via Iconify
- **Enhanced Client-Side Logic**: Improved theme switching and diagram rendering

### Changed
- **Performance Optimization**: Better conditional loading and rendering optimization
- **Configuration**: More flexible icon pack configuration

### Fixed
- **Class Diagram Syntax**: Fixed multiplicity relationship notation
- **Theme Detection**: Improved compatibility across different Astro setups

## [1.0.3] - 2025-06-18

### Added
- **Icon Pack Support**: Initial implementation for custom icons in diagrams
- **Test Icons Page**: Demonstration of icon pack functionality

### Fixed
- **Multiplicity Syntax**: Corrected class diagram relationship notation

## [1.0.2] - 2025-06-15

### Added
- **Starlight Integration Demo**: Complete demo with Starlight documentation framework
- **Content Collections**: Support for Astro content collections
- **Comprehensive Examples**: All major Mermaid diagram types covered

### Changed
- **Documentation**: Enhanced with live demos and comprehensive examples

## [1.0.1] - 2025-06-10

### Fixed
- **Plugin Order**: Fixed integration order requirements for Starlight compatibility
- **Type Definitions**: Improved TypeScript support

## [1.0.0] - 2025-06-08

### Added
- **Initial Release**: Complete Astro integration for Mermaid diagrams
- **Theme Switching**: Automatic light/dark theme support
- **Client-Side Rendering**: Privacy-focused, offline-capable rendering
- **TypeScript Support**: Full type definitions included
- **Zero Configuration**: Works out of the box with sensible defaults

### Features
- All Mermaid diagram types supported
- Responsive design with proper CSS
- Performance optimized with Vite
- Universal compatibility with Astro projects