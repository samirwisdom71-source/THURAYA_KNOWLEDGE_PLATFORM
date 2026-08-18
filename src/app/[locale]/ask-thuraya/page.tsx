import { notFound } from 'next/navigation';
import { AskForm } from '@/components/AskForm';
import { HomeStillLife } from '@/components/HomeStillLife';
import { Reveal } from '@/components/Reveal';
import { getPublicContent, localizedData } from '@/lib/content';
import { isLocale } from '@/lib/locale';
import { Markdown } from '@/lib/markdown';
import { fallbackStill, sectionHero, stills } from '@/lib/visuals';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const items = await getPublicContent('ask_thuraya', { limit: 60 });
  const [featured, ...rest] = items;
  const featuredData = featured ? localizedData(featured, locale) : null;
  const usedImages = [sectionHero.askSalon, sectionHero.askNote, sectionHero.ask, stills.cups];

  const copy = locale === 'ar'
    ? {
      kicker: 'حوار معرفي هادئ',
      title: 'اسأل ثريا',
      lead: 'أسئلة تُراجع قبل أي نشر. الاسم والبريد لا يظهران للعامة تلقائيًا، والإجابة تبقى تجربة شخصية لا تمثل جهة عمل.',
      read: 'اقرأ الإجابات',
      write: 'اكتب سؤالك',
      promises: [
        ['مراجعة أولًا', 'كل سؤال جديد يُحفظ للمراجعة ولا يُنشر تلقائيًا.'],
        ['خصوصية السؤال', 'الاسم والبريد اختياريان، ولا يُعلنان مع السؤال.'],
        ['منصة شخصية', 'الإجابات تعبر عن تجربة معرفية، لا عن جهة عمل.'],
      ] as const,
      answersKicker: 'من الحوار',
      answersTitle: 'أسئلة وجدت طريقها إلى إجابة',
      featuredLabel: 'سؤال مختار',
      more: 'المزيد من الأسئلة',
      composeKicker: 'أرسل للمراجعة',
      composeTitle: 'ما السؤال الذي يشغلك؟',
      composeLead: 'اكتب بوضوح. يصل السؤال إلى المراجعة أولًا، ولا يُنشر الاسم أو البريد معه.',
    }
    : {
      kicker: 'A quiet knowledge conversation',
      title: 'Ask Thuraya',
      lead: 'Questions are reviewed before any publication. Name and email are never auto-published, and answers remain a personal practice — not an employer voice.',
      read: 'Read answers',
      write: 'Write your question',
      promises: [
        ['Reviewed first', 'New questions are saved for review and never auto-published.'],
        ['Private by default', 'Name and email are optional and never announced with the question.'],
        ['A personal platform', 'Answers speak from lived knowledge, not from an employer.'],
      ] as const,
      answersKicker: 'From the conversation',
      answersTitle: 'Questions that found an answer',
      featuredLabel: 'Featured question',
      more: 'More questions',
      composeKicker: 'Send for review',
      composeTitle: 'What question is on your mind?',
      composeLead: 'Write clearly. The question reaches review first, and name or email are never published with it.',
    };

  return (
    <>
      <section className="askHero">
        <HomeStillLife
          src={sectionHero.askSalon}
          alt={locale === 'ar' ? 'صالون هادئ للحديث: كرسيان وصينية شاي ونور دافئ' : 'A quiet conversation salon with two chairs, a tea tray and warm light'}
          className="askHeroMedia"
          priority
          sizes="100vw"
        />
        <div className="askHeroShade" aria-hidden="true" />
        <div className="container">
          <div className="askHeroCard">
            <span className="kicker">{copy.kicker}</span>
            <h1>{copy.title}</h1>
            <p>{copy.lead}</p>
            <div className="heroActions">
              <a className="btn gold" href="#ask-answers">{copy.read}</a>
              <a className="btn secondary" href="#ask-form">{copy.write}</a>
            </div>
          </div>
        </div>
      </section>

      <section className="askPromises">
        <div className="container askPromiseGrid">
          {copy.promises.map(([title, body], index) => (
            <Reveal key={title} delay={index * 80}>
              <article className="askPromise">
                <span>0{index + 1}</span>
                <h2>{title}</h2>
                <p>{body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section askAnswers" id="ask-answers">
        <div className="container">
          <Reveal>
            <div className="sectionHead">
              <div>
                <span className="kicker">{copy.answersKicker}</span>
                <h2>{copy.answersTitle}</h2>
              </div>
            </div>
          </Reveal>

          {featured && featuredData && (
            <Reveal>
              <article className="askFeature">
                <HomeStillLife
                  src={sectionHero.askNote}
                  alt={locale === 'ar' ? 'بطاقة سؤال مكتوبة بخط اليد' : 'A handwritten question card'}
                  className="askFeatureMedia"
                  sizes="(max-width: 1050px) 92vw, 38vw"
                />
                <div className="askFeatureBody">
                  <span className="kicker">{copy.featuredLabel}</span>
                  <h3>{String(featuredData.question || '')}</h3>
                  <div className="askAnswer prose">
                    <Markdown text={String(featuredData.answer || '')} />
                  </div>
                </div>
              </article>
            </Reveal>
          )}

          {rest.length > 0 && (
            <>
              <h3 className="askMoreLabel">{copy.more}</h3>
              <div className="askBoard">
                {rest.map((item, index) => {
                  const data = localizedData(item, locale);
                  return (
                    <Reveal key={item.id} delay={Math.min(index, 6) * 60}>
                      <details className="askCard">
                        <summary>
                          <HomeStillLife
                            src={fallbackStill(item, index, usedImages)}
                            alt=""
                            className="askCardMedia"
                            sizes="120px"
                          />
                          <span>
                            <small>{String(data.category || copy.answersKicker)}</small>
                            <b>{String(data.question || '')}</b>
                          </span>
                        </summary>
                        <div className="askCardAnswer">
                          <Markdown text={String(data.answer || '')} />
                        </div>
                      </details>
                    </Reveal>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="section askCompose" id="ask-form">
        <div className="container askComposeGrid">
          <Reveal>
            <div className="askComposeVisual">
              <HomeStillLife
                src={sectionHero.ask}
                alt={locale === 'ar' ? 'كوبان من الشاي وورقة سؤال على طاولة خشب' : 'Two tea cups and a written question on a wooden table'}
                className="askComposePhoto"
                sizes="(max-width: 1050px) 92vw, 42vw"
              />
            </div>
          </Reveal>
          <Reveal delay={90}>
            <div className="askComposePanel">
              <span className="kicker">{copy.composeKicker}</span>
              <h2>{copy.composeTitle}</h2>
              <p>{copy.composeLead}</p>
              <AskForm locale={locale} />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
