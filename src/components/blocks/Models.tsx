'use client'

/* 3. Выбор кузова — structure.md §2, content.md «3. Выбор кузова». Кузовов нет — блок не рендерится (page.tsx). */
import { BodyPicker } from '../contact/BodyPicker'
import { useContact } from '../contact/ContactProvider'
import { SectionTitle } from '../ui/SectionTitle'
import styles from './Models.module.css'

export function Models() {
  const { bodies, body, setBody } = useContact()

  return (
    <section id="models" className="section" aria-labelledby="models-title">
      <div className={`container ${styles.inner}`}>
        <SectionTitle
          id="models-title"
          title="Какая у вас BMW?"
          titleShort="Ваша BMW"
          subtitle="Выберите кузов — в разделах первыми встанут детали для него, а мы сразу поймём, о какой машине речь."
          subtitleShort="Детали под ваш кузов — первыми"
        />
        <BodyPicker bodies={bodies} value={body} onChange={setBody} />
        <p className={`t-small ${styles.status}`} role="status">
          {body ? (
            <>
              <span>
                {body.kind === 'body' ? (
                  <>
                    <span className="only-desktop">Выбрана BMW {body.code}.</span>
                    <span className="only-mobile">BMW {body.code} ·</span>
                  </>
                ) : (
                  <>
                    <span className="only-desktop">Модель напишете в сообщении.</span>
                    <span className="only-mobile">Другая BMW ·</span>
                  </>
                )}
              </span>{' '}
              <button type="button" className={styles.reset} onClick={() => setBody(null)}>
                Сбросить
              </button>
            </>
          ) : null}
        </p>
      </div>
    </section>
  )
}
