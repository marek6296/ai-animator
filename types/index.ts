export interface UserInput {
  self: string
  situation: string
  friends: string
  generateComic?: boolean
  generateAnimation?: boolean
  generateMemePack?: boolean
}

export interface ComicPanel {
  imageUrl: string
  text: string
  panelNumber: number
}

export interface Comic {
  panels: ComicPanel[]
  title: string
}

export interface Animation {
  frames: string[]
  gifUrl?: string
}

export interface Meme {
  imageUrl: string
  text: string
  template: string
}

export interface MemePack {
  memes: Meme[]
}

export interface GenerationResult {
  comic: Comic | null
  animation: Animation | null
  memePack: MemePack | null
}

export interface ProgressUpdate {
  step: 'comic' | 'animation' | 'meme' | 'complete'
  progress: number // 0-100
  message: string
  estimatedTimeRemaining?: number // v sekundách
}

