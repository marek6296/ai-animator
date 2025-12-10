// Progress tracker pre sledovanie generovania

export interface ProgressCallback {
  (progress: {
    step: 'comic' | 'animation' | 'meme' | 'complete'
    progress: number
    message: string
    estimatedTimeRemaining?: number
  }): void
}

export class ProgressTracker {
  private callbacks: ProgressCallback[] = []
  private startTime: number = Date.now()
  private stepStartTime: number = Date.now()

  constructor() {
    this.startTime = Date.now()
    this.stepStartTime = Date.now()
  }

  onProgress(callback: ProgressCallback) {
    this.callbacks.push(callback)
  }

  private notify(step: 'comic' | 'animation' | 'meme' | 'complete', progress: number, message: string) {
    const elapsed = (Date.now() - this.startTime) / 1000
    const stepElapsed = (Date.now() - this.stepStartTime) / 1000
    
    // Odhadovaný čas na základe aktuálneho progressu
    let estimatedTimeRemaining: number | undefined
    if (progress > 0 && progress < 100) {
      const estimatedTotal = elapsed / (progress / 100)
      estimatedTimeRemaining = Math.max(0, estimatedTotal - elapsed)
    }

    this.callbacks.forEach(callback => {
      callback({
        step,
        progress: Math.min(100, Math.max(0, progress)),
        message,
        estimatedTimeRemaining,
      })
    })
  }

  startStep(step: 'comic' | 'animation' | 'meme', message: string) {
    this.stepStartTime = Date.now()
    this.notify(step, 0, message)
  }

  updateProgress(step: 'comic' | 'animation' | 'meme', progress: number, message: string) {
    this.notify(step, progress, message)
  }

  complete() {
    this.notify('complete', 100, 'Hotovo!')
  }
}

