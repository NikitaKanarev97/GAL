/*
 * Копирование в буфер. Вызывать синхронно в обработчике нажатия, до window.open:
 * новая вкладка уводит фокус, а без фокуса буфер недоступен.
 */
export function copyText(text: string): Promise<boolean> {
  // http и встроенные браузеры без Clipboard API — копируем сразу, пока фокус на странице
  if (!navigator.clipboard?.writeText) return Promise.resolve(execCopy(text))
  return navigator.clipboard.writeText(text).then(
    () => true,
    () => execCopy(text),
  )
}

function execCopy(text: string) {
  // Поле — в верхний открытый <dialog>: при showModal всё вне попапа inert, и select() там не срабатывает
  const host = [...document.querySelectorAll('dialog[open]')].at(-1) ?? document.body
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.top = '0'
  area.style.opacity = '0'
  host.appendChild(area)
  area.select()
  area.setSelectionRange(0, text.length) // iOS не выделяет по select()
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {}
  area.remove()
  return ok
}
