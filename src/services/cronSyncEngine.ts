import { GPlusSyncService } from './gplusSyncService';

type TickListener = (remainingSeconds: number, isSyncing: boolean) => void;
type SyncCompleteListener = (result: any) => void;

class CronSyncEngine {
  private intervalSeconds: number = 900; // default: 900 seconds (15 minutes)
  private remainingSeconds: number = 900;
  private nextSyncTimestamp: number = 0;
  private isSyncing: boolean = false;
  private isAutoSyncEnabled: boolean = true;
  private timerId: any = null;
  private tickListeners: Set<TickListener> = new Set();
  private syncCompleteListeners: Set<SyncCompleteListener> = new Set();

  constructor() {
    // 1. Read persisted interval
    const savedInterval = localStorage.getItem('vrtkl_sync_interval_seconds');
    if (savedInterval) {
      const parsed = parseInt(savedInterval, 10);
      if (!isNaN(parsed) && parsed >= 10) {
        this.intervalSeconds = parsed;
      }
    }

    // 2. Read persisted auto-sync flag (default true if not set)
    const savedAuto = localStorage.getItem('vrtkl_auto_sync_enabled');
    if (savedAuto !== null) {
      this.isAutoSyncEnabled = savedAuto === 'true';
    } else {
      this.isAutoSyncEnabled = true;
      localStorage.setItem('vrtkl_auto_sync_enabled', 'true');
    }

    // 3. Read persisted next sync timestamp
    const savedNext = localStorage.getItem('vrtkl_next_sync_timestamp');
    const now = Date.now();
    if (savedNext) {
      const parsedNext = parseInt(savedNext, 10);
      if (!isNaN(parsedNext) && parsedNext > 0) {
        this.nextSyncTimestamp = parsedNext;
        const diffSec = Math.floor((parsedNext - now) / 1000);
        this.remainingSeconds = Math.max(0, diffSec);
      } else {
        this.scheduleNextSync();
      }
    } else {
      this.scheduleNextSync();
    }
  }

  public init() {
    this.startTimer();
    // If auto sync is on and remaining seconds is 0 (or was scheduled in the past), trigger catchup
    if (this.isAutoSyncEnabled && this.remainingSeconds <= 0 && !this.isSyncing) {
      setTimeout(() => {
        this.runSync();
      }, 500);
    }
  }

  public setInterval(seconds: number) {
    if (seconds < 10) seconds = 10;
    this.intervalSeconds = seconds;
    localStorage.setItem('vrtkl_sync_interval_seconds', seconds.toString());
    this.scheduleNextSync();
    this.notifyTick();
  }

  public getInterval(): number {
    return this.intervalSeconds;
  }

  public getRemainingSeconds(): number {
    return this.remainingSeconds;
  }

  public getNextSyncDate(): Date {
    return new Date(this.nextSyncTimestamp || Date.now() + this.remainingSeconds * 1000);
  }

  public setAutoSyncEnabled(enabled: boolean) {
    this.isAutoSyncEnabled = enabled;
    localStorage.setItem('vrtkl_auto_sync_enabled', enabled ? 'true' : 'false');
    if (enabled) {
      if (this.remainingSeconds <= 0) {
        this.scheduleNextSync();
      }
      if (!this.timerId) {
        this.startTimer();
      }
    }
    this.notifyTick();
  }

  public getAutoSyncEnabled(): boolean {
    return this.isAutoSyncEnabled;
  }

  public getIsSyncing(): boolean {
    return this.isSyncing;
  }

  public subscribe(onTick: TickListener, onSyncComplete?: SyncCompleteListener) {
    this.tickListeners.add(onTick);
    if (onSyncComplete) {
      this.syncCompleteListeners.add(onSyncComplete);
    }
    // Immediate callback with current state
    onTick(this.remainingSeconds, this.isSyncing);

    return () => {
      this.tickListeners.delete(onTick);
      if (onSyncComplete) {
        this.syncCompleteListeners.delete(onSyncComplete);
      }
    };
  }

  private scheduleNextSync() {
    this.nextSyncTimestamp = Date.now() + this.intervalSeconds * 1000;
    this.remainingSeconds = this.intervalSeconds;
    localStorage.setItem('vrtkl_next_sync_timestamp', this.nextSyncTimestamp.toString());
  }

  private startTimer() {
    if (this.timerId) clearInterval(this.timerId);

    this.timerId = setInterval(() => {
      if (!this.isAutoSyncEnabled) return;

      const now = Date.now();
      const diffSec = Math.floor((this.nextSyncTimestamp - now) / 1000);

      if (diffSec > 0) {
        this.remainingSeconds = diffSec;
        this.notifyTick();
      } else {
        this.remainingSeconds = 0;
        this.notifyTick();
        if (!this.isSyncing) {
          this.runSync();
        }
      }
    }, 1000);
  }

  public async triggerManualSync(): Promise<any> {
    return this.runSync();
  }

  private async runSync() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.notifyTick();

    try {
      const result = await GPlusSyncService.syncAll();
      this.syncCompleteListeners.forEach(listener => {
        try {
          listener(result);
        } catch (e) {
          console.error('Error in syncComplete listener:', e);
        }
      });
      return result;
    } catch (err) {
      console.error('CronSyncEngine execution error:', err);
    } finally {
      this.isSyncing = false;
      this.scheduleNextSync();
      this.notifyTick();
    }
  }

  private notifyTick() {
    this.tickListeners.forEach(listener => {
      try {
        listener(this.remainingSeconds, this.isSyncing);
      } catch (e) {
        console.error('Error in tickListener:', e);
      }
    });
  }

  public formatCountdown(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
}

export const cronSyncEngine = new CronSyncEngine();
cronSyncEngine.init();
