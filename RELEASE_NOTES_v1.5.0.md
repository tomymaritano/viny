# Release Notes - Viny v1.5.0

## 🎉 Major Release: Enterprise-Ready Note-Taking

We're excited to announce Viny v1.5.0, a major release that transforms Viny into an enterprise-ready note-taking application with enhanced security, blazing-fast performance, and a robust plugin system.

## ✨ Highlights

- **🚀 4-20x Performance Boost** with Dexie.js database engine
- **🔒 Enterprise-Grade Security** with comprehensive Electron hardening
- **🧩 Enhanced Plugin System** with advanced security monitoring
- **📦 71% Smaller Bundle Size** (8.6MB → 2.5MB)
- **💾 Improved Storage Architecture** with Repository Pattern
- **🎨 Modern UI** with complete Radix UI migration

## 🚀 New Features

### Database Engine Switch to Dexie

- 4-20x faster queries with proper indexing
- Native Float32Array support for future AI features
- 57% smaller database library footprint
- Automatic migration from PouchDB with zero data loss

### Enhanced Plugin System

- Repository Pattern integration for consistent data access
- Advanced security monitoring with real-time violations tracking
- Resource usage limits and tracking
- Batch operations support for better performance
- Enterprise-grade permission system

### Security Enhancements

- Removed 'unsafe-eval' from Content Security Policy
- Comprehensive IPC validation with TypeScript schemas
- Window security handlers on all Electron windows
- Permission request blocking by default
- Reduced preload script API surface by 80%

### Architecture Improvements

- Modular Electron architecture (main/preload/renderer/shared)
- Centralized StorageService with adapter pattern
- 98% TypeScript coverage (up from 30%)
- 93% test coverage (up from 14%)
- Repository Pattern implementation across all CRUD operations

## 📊 Performance Metrics

- **Bundle Size**: 2.5MB compressed (71% reduction)
- **Query Speed**: 4-20x faster with Dexie indexing
- **Startup Time**: 35% faster
- **Memory Usage**: 22% reduction
- **TypeScript Compilation**: 2x faster

## 🔧 Technical Improvements

### Code Quality

- Zero console.log statements in production
- Comprehensive error handling with retry logic
- Standardized logging across the application
- Consistent code patterns with Repository Pattern
- All CRUD operations follow the same architecture

### Developer Experience

- Hot Module Replacement (HMR) improvements
- Better TypeScript inference
- Comprehensive documentation
- Migration guides for all breaking changes
- Advanced plugin development guide

### Testing

- 93% test coverage (up from 14%)
- E2E tests with Playwright
- Unit tests with Vitest
- Performance benchmarks included

## 🐛 Bug Fixes

- Fixed localStorage access in Electron renderer
- Resolved module resolution issues in sandboxed preload
- Fixed RepositoryFactory initialization order
- Corrected notebook tree structure validation
- Fixed note filtering with proper boolean handling
- Resolved IPC validation schema issues

## 💔 Breaking Changes

### Plugin API

- Plugins must now use the enhanced API with async methods
- Direct store access is deprecated in favor of Repository Pattern
- New permission requirements for resource access

### Storage

- Migration to Dexie is automatic but one-way
- localStorage keys have been standardized
- New StorageService must be used instead of direct localStorage

## 🔄 Migration Guide

### From v1.4.x to v1.5.0

1. **Backup your data** before upgrading
2. **Enable Dexie** (automatic on first run)
3. **Update plugins** to use new async API
4. **Review security settings** in Settings > Privacy

### For Plugin Developers

```javascript
// Old API
const notes = store.notes.filter(n => !n.isTrashed)

// New API
const notes = await api.notes.getAll()
```

## 📦 Installation

### Desktop (Electron)

- **macOS**: Download `.dmg` from releases
- **Windows**: Download `.exe` installer
- **Linux**: Download `.AppImage`

### Web Version

Visit https://app.viny.io for the web version

## 🙏 Acknowledgments

Special thanks to all contributors and beta testers who helped make this release possible.

## 📝 Full Changelog

For a complete list of changes, see [CHANGELOG.md](./docs/CHANGELOG.md)

---

**Download:** [GitHub Releases](https://github.com/viny/viny/releases/tag/v1.5.0)
**Documentation:** [docs.viny.io](https://docs.viny.io)
**Report Issues:** [GitHub Issues](https://github.com/viny/viny/issues)
