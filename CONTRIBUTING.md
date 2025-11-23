# Contributing to astro-mermaid

Thank you for your interest in contributing to astro-mermaid! This document provides guidelines and information for contributors.

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/joesaby/astro-mermaid.git
   cd astro-mermaid
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Test the demos:**
   ```bash
   # Test starlight demo
   cd starlight-demo && npm install && npm run dev

   # Test astro demo (in another terminal)
   cd astro-demo && npm install && npm run dev
   ```

## Development Workflow

### 1. Choose an Issue
- Check the [GitHub Issues](https://github.com/joesaby/astro-mermaid/issues) for open tasks
- Comment on the issue to indicate you're working on it

### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number-description
```

### 3. Make Changes
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure TypeScript types are correct

### 4. Test Your Changes
```bash
# Run type checking
cd astro-demo && npx astro check
cd starlight-demo && npx astro check

# Test builds
cd astro-demo && npm run build
cd starlight-demo && npm run build

# Test development servers
cd astro-demo && npm run dev
cd starlight-demo && npm run dev
```

### 5. Commit Your Changes
```bash
git add .
git commit -m "feat: add your feature description"
```

Follow conventional commit format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `refactor:` for code refactoring
- `test:` for tests

### 6. Create a Pull Request
- Push your branch to GitHub
- Create a pull request with a clear description
- Reference any related issues
- Ensure CI checks pass

## Code Guidelines

### TypeScript
- Use strict TypeScript settings
- Provide type definitions for all exports
- Avoid `any` types when possible

### Code Style
- Use consistent naming conventions
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Use async/await over Promises when possible

### Testing
- Test both demo applications
- Verify diagrams render correctly
- Test theme switching functionality
- Ensure builds complete successfully

## Project Structure

```
astro-mermaid/
├── astro-mermaid-integration.js     # Main integration
├── astro-mermaid-integration.d.ts   # Type definitions
├── package.json                     # Package config
├── README.md                        # User documentation
├── CLAUDE.md                        # Internal context
├── astro-demo/                      # Standalone demo
└── starlight-demo/                  # Starlight integration demo
```

## Adding New Features

### Diagram Types
When adding support for new Mermaid diagram types:
1. Test the diagram in both demos
2. Ensure proper error handling
3. Update documentation examples
4. Add to the supported diagrams list

### Configuration Options
When adding new configuration options:
1. Update the TypeScript definitions
2. Add validation if needed
3. Update documentation
4. Provide sensible defaults

## Reporting Issues

When reporting bugs, please include:
- Astro version
- Mermaid version
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Code examples if applicable

## Questions?

Feel free to open a [GitHub Discussion](https://github.com/joesaby/astro-mermaid/discussions) for questions or general discussion.