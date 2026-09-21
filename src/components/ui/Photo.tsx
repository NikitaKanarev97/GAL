import Image from 'next/image'
import type { DirectusFile } from '@/data/types'
import styles from './Photo.module.css'

type Props = {
  file: DirectusFile
  alt: string
  /** пропорция места из content-model.md, «4 / 3» */
  ratio?: string
  sizes: string
  priority?: boolean
  className?: string
  imgClassName?: string
}

/** Фото, кадрированное под пропорцию места по фокус-точке. Ниже первого экрана — lazy. */
export function Photo({ file, alt, ratio, sizes, priority, className, imgClassName }: Props) {
  const x = Math.round((file.focal_point_x ?? 0.5) * 100)
  const y = Math.round((file.focal_point_y ?? 0.5) * 100)
  return (
    <div
      className={[styles.frame, className].filter(Boolean).join(' ')}
      style={ratio ? { aspectRatio: ratio } : undefined}
      data-anim="frame"
    >
      <Image
        src={file.src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        className={[styles.img, imgClassName].filter(Boolean).join(' ')}
        style={{ objectPosition: `${x}% ${y}%` }}
      />
    </div>
  )
}
