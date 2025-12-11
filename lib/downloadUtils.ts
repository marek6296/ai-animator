import jsPDF from 'jspdf'
import JSZip from 'jszip'
import type { Comic, Animation, MemePack } from '@/types'

// Stiahnutie komiksu ako PDF
export async function downloadComicAsPDF(comic: Comic) {
  const pdf = new jsPDF()
  const imgWidth = 180
  const imgHeight = 120
  const margin = 10
  let yPosition = margin

  for (let i = 0; i < comic.panels.length; i++) {
    const panel = comic.panels[i]
    
    // Ak by sme mali viac panelov ako sa zmestí na stránku, pridaj novú stránku
    if (yPosition + imgHeight + 30 > 280) {
      pdf.addPage()
      yPosition = margin
    }

    try {
      // Načítaj obrázok
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        img.onload = () => resolve(null)
        img.onerror = reject
        img.src = panel.imageUrl
      })

      // Pridaj obrázok
      pdf.addImage(img, 'PNG', margin, yPosition, imgWidth, imgHeight)
      yPosition += imgHeight + 5

      // Pridaj text
      pdf.setFontSize(10)
      pdf.text(panel.text.substring(0, 80), margin, yPosition)
      yPosition += 15
    } catch (error) {
      console.error(`Chyba pri načítaní panelu ${i + 1}:`, error)
      // Pokračuj s ďalším panelom
    }
  }

  pdf.save(`${comic.title || 'komiks'}.pdf`)
}

// Stiahnutie animácie ako GIF (použijeme všetky rámce)
export async function downloadAnimationAsGIF(animation: Animation) {
  // Pre jednoduchosť stiahneme všetky rámce ako ZIP
  // V produkcii by ste použili knižnicu na vytvorenie skutočného GIF
  const zip = new JSZip()
  
  for (let i = 0; i < animation.frames.length; i++) {
    try {
      const response = await fetch(animation.frames[i])
      const blob = await response.blob()
      zip.file(`frame-${i + 1}.png`, blob)
    } catch (error) {
      console.error(`Chyba pri načítaní rámca ${i + 1}:`, error)
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(zipBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'animacia-frames.zip'
  link.click()
  URL.revokeObjectURL(url)
}

// Stiahnutie meme packu ako ZIP
export async function downloadMemePackAsZIP(memePack: MemePack) {
  const zip = new JSZip()
  
  for (let i = 0; i < memePack.memes.length; i++) {
    const meme = memePack.memes[i]
    try {
      const response = await fetch(meme.imageUrl)
      const blob = await response.blob()
      zip.file(`meme-${i + 1}-${meme.template.replace(/\s+/g, '-')}.png`, blob)
    } catch (error) {
      console.error(`Chyba pri načítaní memu ${i + 1}:`, error)
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(zipBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'meme-pack.zip'
  link.click()
  URL.revokeObjectURL(url)
}

// Stiahnutie všetkého
export async function downloadAll(comic: Comic, animation: Animation, memePack: MemePack) {
  try {
    // Stiahneme všetko postupne
    await downloadComicAsPDF(comic)
    await new Promise(resolve => setTimeout(resolve, 500))
    await downloadAnimationAsGIF(animation)
    await new Promise(resolve => setTimeout(resolve, 500))
    await downloadMemePackAsZIP(memePack)
  } catch (error) {
    console.error('Chyba pri stiahnutí:', error)
    throw error
  }
}


