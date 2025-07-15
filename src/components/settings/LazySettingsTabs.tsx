/**
 * Lazy loaded settings tabs for better performance
 */
import { lazy } from 'react'

// Lazy load all settings tabs
export const GeneralSettings = lazy(() => import('./tabs/GeneralSettings'))
export const ThemesSettings = lazy(() => import('./tabs/ThemesSettings'))
export const EditingSettings = lazy(() => import('./tabs/EditingSettings'))
export const PreviewSettings = lazy(() => import('./tabs/PreviewSettings'))
export const KeybindingsSettings = lazy(() => import('./tabs/KeybindingsSettings'))
export const PluginsSettings = lazy(() => import('./tabs/PluginsSettings'))
export const InstallSettings = lazy(() => import('./tabs/InstallSettings'))
export const UpdatesSettings = lazy(() => import('./tabs/UpdatesSettings'))
export const SyncSettings = lazy(() => import('./tabs/SyncSettings'))
export const BackupSettings = lazy(() => import('./tabs/BackupSettings'))
export const PrivacySettings = lazy(() => import('./tabs/PrivacySettings'))
export const TagsSettingsSimple = lazy(() => import('./tabs/TagsSettingsSimple'))
export const AboutSettings = lazy(() => import('./tabs/AboutSettings'))

// Legacy tabs - also lazy loaded
export const EditorSettings = lazy(() => import('./tabs/EditorSettings'))
export const StorageSettings = lazy(() => import('./tabs/StorageSettings'))
export const KeyboardSettings = lazy(() => import('./tabs/KeyboardSettings'))