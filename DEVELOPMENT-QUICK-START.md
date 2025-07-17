# Quick Development Guide

> Get Viny running in under 30 seconds

## 🚀 Ultra-Fast Setup

### For Electron Development (Recommended)

```bash
git clone https://github.com/your-username/viny.git
cd viny
npm install
make dev-electron-fast
```

**Result**: Backend in Docker + Frontend local + Electron app (~5 seconds startup)

### For Web Development

```bash
make dev-fast
```

**Result**: Backend in Docker + Frontend local in browser (~5 seconds startup)

### For Quick UI Changes

```bash
make dev-electron-local  # Electron with localStorage only
# OR
make dev-local          # Web with localStorage only
```

**Result**: Frontend only with localStorage (~2 seconds startup)

### For New Contributors (Smart Detection)

```bash
npm run dev:smart         # Auto-detects best mode (prefers Electron if available)
npm run dev:smart --web   # Force web target
```

**Result**: Auto-detects best mode for your system

## 🎯 Command Cheat Sheet

### Electron Commands (Desktop App)

| Command                   | What it does                                       | Startup Time |
| ------------------------- | -------------------------------------------------- | ------------ |
| `make dev-electron-fast`  | Hybrid: Backend Docker + Frontend local + Electron | ~5s          |
| `make dev-electron-local` | Electron with localStorage only                    | ~2s          |
| `make dev-electron`       | Traditional Electron development                   | ~8s          |

### Web Commands (Browser)

| Command               | What it does                            | Startup Time |
| --------------------- | --------------------------------------- | ------------ |
| `make dev-fast`       | Hybrid: Backend Docker + Frontend local | ~5s          |
| `make dev-local`      | Frontend only (localStorage)            | ~2s          |
| `make dev-local-full` | Full local (no Docker)                  | ~3s          |
| `make dev`            | Traditional full Docker                 | ~30s         |
| `make dev-optimized`  | Optimized Docker setup                  | ~20s         |

### Smart Commands (Auto-detect)

| Command                        | What it does                             | Startup Time |
| ------------------------------ | ---------------------------------------- | ------------ |
| `npm run dev:smart`            | Auto-detect best mode (prefers Electron) | Variable     |
| `npm run dev:smart --electron` | Force Electron target                    | Variable     |
| `npm run dev:smart --web`      | Force web target                         | Variable     |

## 🔧 Troubleshooting

**Docker issues?**

```bash
make dev-local    # Skip Docker entirely
```

**Backend not starting?**

```bash
npm run check:backend
make backend-logs
```

**Want to reset everything?**

```bash
make clean
npm install
```

## 💡 Pro Tips

1. **Use hybrid mode** for daily development - best balance of speed and features
2. **Use local mode** for quick UI iterations - fastest possible
3. **Use Docker mode** when testing integrations or deployment
4. **Check the logs** with `make backend-logs` if something isn't working

## 📱 Access Points

Once running, access your app at:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health

---

**Need more details?** See the full [Development Guide](docs/DEVELOPMENT.md)
