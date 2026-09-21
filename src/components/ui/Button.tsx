import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'
import { Icon, type IconName } from '../icons/Icon'
import styles from './Button.module.css'

type Common = {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'md' | 'lg'
  icon?: IconName
  iconPosition?: 'start' | 'end'
  block?: boolean
  children: ReactNode
  className?: string
}

type AsButton = Common & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }
type AsLink = Common & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

export function buttonClass({ variant = 'primary', size = 'md', block, className }: Partial<Common>) {
  return [styles.button, styles[variant], styles[size], block && styles.block, className].filter(Boolean).join(' ')
}

export function Button(props: AsButton | AsLink) {
  const { variant, size, icon, iconPosition = 'end', block, children, className, ...rest } = props
  const cls = buttonClass({ variant, size, block, className })
  const content = (
    <>
      {icon && iconPosition === 'start' ? <Icon name={icon} className={styles.icon} /> : null}
      <span className={styles.label}>{children}</span>
      {icon && iconPosition === 'end' ? <Icon name={icon} className={styles.icon} /> : null}
    </>
  )

  if (typeof rest.href === 'string') {
    const { href, ...anchor } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
    const external = /^(https?:|tel:|mailto:)/.test(href)
    return external ? (
      <a href={href} className={cls} {...anchor}>
        {content}
      </a>
    ) : (
      <Link href={href} className={cls} {...anchor}>
        {content}
      </Link>
    )
  }

  const button = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button type="button" className={cls} {...button}>
      {content}
    </button>
  )
}
