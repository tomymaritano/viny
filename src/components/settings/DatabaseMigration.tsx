/**
 * Database Migration Component
 *
 * Allows users to migrate from PouchDB to Dexie with visual progress
 */

import React, { useState, useEffect } from 'react'
import {
  getMigrationInstance,
  type MigrationProgress,
} from '../../lib/repositories/migration/PouchDBToDexieMigration'
import { ProgressRadix } from '../ui/ProgressRadix'
import { ButtonRadix } from '../ui/ButtonRadix'
import { AlertDialog } from '../ui/AlertDialog'
import { Icons } from '../Icons'
import { repositoryFactory } from '../../lib/repositories/RepositoryFactory'
import { useToast } from '../../hooks/useToast'
import { storageService, StorageService } from '../../services/StorageService'
import { storageLogger } from '../../utils/logger'

export const DatabaseMigration: React.FC = () => {
  const [isChecking, setIsChecking] = useState(true)
  const [needsMigration, setNeedsMigration] = useState(false)
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress>(
    {
      status: 'idle',
      totalNotes: 0,
      migratedNotes: 0,
      totalNotebooks: 0,
      migratedNotebooks: 0,
    }
  )
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [isDexieEnabled, setIsDexieEnabled] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    checkMigrationStatus()
    checkDexieStatus()
  }, [])

  const checkDexieStatus = () => {
    const enabled =
      storageService.getItem(StorageService.KEYS.USE_DEXIE) === 'true'
    setIsDexieEnabled(enabled)
  }

  const checkMigrationStatus = async () => {
    setIsChecking(true)
    try {
      const migration = getMigrationInstance()
      const needed = await migration.isMigrationNeeded()
      setNeedsMigration(needed)

      if (needed) {
        const migrationStats = await migration.getStats()
        setStats(migrationStats)
      }
    } catch (error) {
      storageLogger.error('Failed to check migration status:', error)
      showToast({
        title: 'Error',
        description: 'Failed to check migration status',
        variant: 'destructive',
      })
    } finally {
      setIsChecking(false)
    }
  }

  const handleMigration = async () => {
    setShowConfirmDialog(false)

    const migration = getMigrationInstance(progress => {
      setMigrationProgress(progress)
    })

    try {
      await migration.migrate()
      showToast({
        title: 'Migration Completed',
        description: 'Successfully migrated to Dexie database',
        variant: 'success',
      })
      setNeedsMigration(false)
      setIsDexieEnabled(true)
      // Reload the app to use new database
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      storageLogger.error('Migration failed:', error)
      showToast({
        title: 'Migration Failed',
        description:
          error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      })
    }
  }

  const toggleDexie = () => {
    const newValue = !isDexieEnabled
    repositoryFactory.setUseDexie(newValue)
    setIsDexieEnabled(newValue)
    showToast({
      title: newValue ? 'Dexie Enabled' : 'Dexie Disabled',
      description: 'Page will reload to apply changes',
      variant: 'default',
    })
    setTimeout(() => {
      window.location.reload()
    }, 1500)
  }

  if (isChecking) {
    return (
      <div className="space-y-4 p-4 border rounded-lg border-theme-border">
        <div className="flex items-center gap-2">
          <Icons.loader className="w-4 h-4 animate-spin" />
          <span className="text-sm text-theme-text-secondary">
            Checking database status...
          </span>
        </div>
      </div>
    )
  }

  const totalProgress =
    migrationProgress.totalNotes + migrationProgress.totalNotebooks
  const currentProgress =
    migrationProgress.migratedNotes + migrationProgress.migratedNotebooks
  const progressPercentage =
    totalProgress > 0 ? (currentProgress / totalProgress) * 100 : 0

  return (
    <>
      <div className="space-y-4 p-4 border rounded-lg border-theme-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-theme-text-primary">
            Database Engine
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-theme-text-secondary">
              Current: {isDexieEnabled ? 'Dexie (Fast)' : 'PouchDB (Legacy)'}
            </span>
            <ButtonRadix
              size="sm"
              variant="ghost"
              onClick={toggleDexie}
              disabled={migrationProgress.status === 'running'}
            >
              <Icons.refresh className="w-4 h-4" />
              Switch
            </ButtonRadix>
          </div>
        </div>

        {needsMigration && (
          <div className="space-y-3 p-3 bg-theme-warning/10 rounded-md border border-theme-warning/20">
            <div className="flex items-start gap-2">
              <Icons.alertTriangle className="w-5 h-5 text-theme-warning mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-theme-text-primary">
                  Database Migration Available
                </p>
                <p className="text-xs text-theme-text-secondary mt-1">
                  Migrate to Dexie for 4-20x faster performance and better AI
                  features support.
                </p>
              </div>
            </div>

            {stats && (
              <div className="text-xs text-theme-text-secondary space-y-1">
                <div>• {stats.pouchDB.notes} notes to migrate</div>
                <div>• {stats.pouchDB.notebooks} notebooks to migrate</div>
              </div>
            )}

            {migrationProgress.status === 'idle' && (
              <ButtonRadix
                onClick={() => setShowConfirmDialog(true)}
                variant="primary"
                size="sm"
                className="w-full"
              >
                <Icons.database className="w-4 h-4 mr-2" />
                Start Migration
              </ButtonRadix>
            )}

            {migrationProgress.status === 'running' && (
              <div className="space-y-2">
                <ProgressRadix value={progressPercentage} />
                <div className="text-xs text-theme-text-secondary">
                  Migrating: {currentProgress} / {totalProgress} items
                </div>
              </div>
            )}

            {migrationProgress.status === 'completed' && (
              <div className="flex items-center gap-2 text-sm text-theme-success">
                <Icons.checkCircle className="w-4 h-4" />
                Migration completed successfully! Reloading...
              </div>
            )}

            {migrationProgress.status === 'failed' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-theme-error">
                  <Icons.x className="w-4 h-4" />
                  Migration failed
                </div>
                {migrationProgress.error && (
                  <p className="text-xs text-theme-text-secondary">
                    {migrationProgress.error}
                  </p>
                )}
                <ButtonRadix
                  onClick={() =>
                    setMigrationProgress({
                      ...migrationProgress,
                      status: 'idle',
                    })
                  }
                  variant="ghost"
                  size="sm"
                >
                  Try Again
                </ButtonRadix>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-theme-text-secondary space-y-1">
          <p>
            • Dexie provides faster queries and native vector support for AI
            features
          </p>
          <p>• Migration is safe and can be reverted if needed</p>
          <p>• Your data will remain intact during migration</p>
        </div>
      </div>

      <AlertDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Confirm Database Migration"
        description={`This will migrate ${stats?.pouchDB.notes || 0} notes and ${stats?.pouchDB.notebooks || 0} notebooks from PouchDB to Dexie. The process is safe but may take a few moments.`}
        confirmText="Start Migration"
        cancelText="Cancel"
        onConfirm={handleMigration}
        variant="default"
      />
    </>
  )
}
