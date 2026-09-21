/*
 * /privacy — политика обработки персональных данных (content.md «/privacy»).
 * Текст описывает то, что сайт делает на самом деле: форм нет, заявка — черновик в Telegram,
 * событие перехода без имени и контактов, выбор кузова — в браузере. Реквизиты оператора — site_settings.
 * Перед запуском текст сверяет клиент — content-debt.md D39.
 */
import type { Metadata } from 'next'
import { getSettings } from '@/data'
import { formatPhone } from '@/lib/format'
import styles from '../doc.module.css'

export const metadata: Metadata = {
  title: 'Политика конфиденциальности — GAL',
  robots: { index: false },
}

const EDITION = '17 сентября 2026'

export default async function PrivacyPage() {
  const s = await getSettings()
  const operator = s.legal_form && s.legal_name ? `${s.legal_form} ${s.legal_name}${s.inn ? ` (ИНН ${s.inn})` : ''}` : 'GAL'
  const contacts = [
    `Telegram @${s.telegram_username}`,
    s.phone ? `телефон ${formatPhone(s.phone)}` : null,
    s.email ? `почта ${s.email}` : null,
  ].filter(Boolean)

  return (
    <article className={`container ${styles.doc}`}>
      <header className={styles.part}>
        <h1 className={`t-display t-h2 ${styles.title}`}>Политика конфиденциальности</h1>
        <p className={styles.muted}>Редакция от {EDITION}</p>
      </header>

      <section className={styles.part}>
        <h2 className="t-h3">1. Кто обрабатывает данные</h2>
        <p>
          Оператор — {operator}. Политика действует для этого сайта и для переписки, которая начинается с него. Пользуясь
          сайтом или отправляя нам сообщение, вы соглашаетесь с ней.
        </p>
      </section>

      <section className={styles.part}>
        <h2 className="t-h3">2. Какие данные мы получаем</h2>
        <ul className={styles.list}>
          <li>
            На сайте нет форм: мы не просим имя, телефон или почту. Кнопки связи открывают Telegram с черновиком сообщения —
            отправляете его вы сами.
          </li>
          <li>
            Когда вы нажимаете кнопку связи, мы получаем данные обращения без имени и контактов: тему, раздел и деталь, выбранный
            кузов BMW, короткий код обращения, страницу и источник перехода.
          </li>
          <li>
            Технические данные посещения — IP-адрес, тип устройства и браузера, просмотренные страницы, источник перехода и
            cookie — собирает сервис веб-аналитики Яндекс Метрика.
          </li>
          <li>Выбранный кузов хранится только в вашем браузере, чтобы в разделах сразу стояли подходящие детали.</li>
          <li>
            В переписке, по телефону или в WhatsApp вы сами решаете, что сообщить: имя, номер, VIN, фото машины или салона,
            адрес доставки.
          </li>
        </ul>
      </section>

      <section className={styles.part}>
        <h2 className="t-h3">3. Зачем</h2>
        <ul className={styles.list}>
          <li>подобрать деталь по VIN, назвать цену и сроки;</li>
          <li>договориться о ремонте в Gal service или перешиве салона в Gal custom;</li>
          <li>оформить оплату, самовывоз или доставку;</li>
          <li>понимать, какие разделы сайта полезны и откуда к нам приходят, — в обезличенном виде.</li>
        </ul>
      </section>

      <section className={styles.part}>
        <h2 className="t-h3">4. Кому передаём</h2>
        <p>
          Данные не продаём. Для доставки передаём службе доставки (СДЭК, Яндекс Доставка, ПЭК, Авито Доставка или другая
          транспортная компания) только то, что
          нужно для отправки: имя, телефон и адрес. Статистику посещений обрабатывает ООО «Яндекс» по своим правилам.
          Переписка идёт в Telegram и WhatsApp — они хранят сообщения по собственным политикам.
        </p>
      </section>

      <section className={styles.part}>
        <h2 className="t-h3">5. Сколько храним и как защищаем</h2>
        <p>
          Данные заказа храним, пока идёт заказ, ремонт или гарантийный срок, и столько, сколько требует закон. Статистика
          посещений обезличена. Доступ к переписке и заказам есть только у нас.
        </p>
      </section>

      <section className={styles.part}>
        <h2 className="t-h3">6. Ваши права</h2>
        <p>
          Вы можете узнать, какие ваши данные у нас есть, попросить исправить или удалить их и отозвать согласие. Cookie можно
          отключить в настройках браузера — сайт продолжит работать. Запрос отправьте любым способом из раздела ниже, ответим в
          течение 10 рабочих дней.
        </p>
      </section>

      <section className={styles.part}>
        <h2 className="t-h3">7. Контакты</h2>
        <p>
          {operator}: {contacts.join(', ')}.
        </p>
        <p className={styles.muted}>
          Политику можем обновлять — актуальная редакция всегда на этой странице. Обработка данных — по Федеральному закону
          № 152-ФЗ «О персональных данных».
        </p>
      </section>
    </article>
  )
}
