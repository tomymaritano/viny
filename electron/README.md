# Electron Architecture

This directory contains all Electron-specific code organized by process type and responsibility.

## Directory Structure

```
electron/
├── main/           # Main process code
│   ├── windows/    # Window management
│   ├── menu/       # Application menus
│   ├── storage/    # File system storage
│   ├── ipc/        # IPC handlers
│   ├── utils/      # Main process utilities
│   └── types/      # Main process types
│
├── preload/        # Preload scripts
│   ├── ipc/        # IPC bridges
│   ├── utils/      # Preload utilities
│   └── types/      # Preload types
│
├── renderer/       # Renderer-specific code
│   ├── ipc/        # IPC client code
│   ├── utils/      # Renderer utilities
│   └── types/      # Renderer types
│
└── shared/         # Shared between processes
    ├── types/      # Shared type definitions
    ├── utils/      # Shared utilities
    └── constants/  # Shared constants
```

## Architecture Principles

1. **Process Isolation**: Each process type has its own directory
2. **Clear Boundaries**: No direct imports between main and renderer
3. **Type Safety**: Shared types ensure consistency
4. **Security First**: Minimal preload API surface
5. **Single Responsibility**: Each module has a clear purpose

## Main Process (`main/`)

The main process handles:

- Window creation and management
- Application menus
- File system operations
- IPC communication
- Native OS integration

## Preload Scripts (`preload/`)

The preload script:

- Exposes minimal, secure APIs to renderer
- Validates all IPC communication
- Acts as a security bridge

## Renderer Process (`renderer/`)

The renderer process:

- Handles all UI logic
- Communicates via exposed APIs only
- Has no direct file system access

## Shared Code (`shared/`)

Shared between all processes:

- Type definitions
- Constants
- Pure utility functions
