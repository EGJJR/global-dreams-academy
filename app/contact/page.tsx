import ContactPageClient, { type TopicBanner } from './ContactPageClient'

function resolveTopic(raw: string | string[] | undefined): TopicBanner {
  const t = Array.isArray(raw) ? raw[0] : raw
  if (t === 'donate') return 'donate'
  if (t === 'partner') return 'partner'
  return null
}

export default function ContactPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const topicBanner = resolveTopic(searchParams.topic)
  return <ContactPageClient topicBanner={topicBanner} />
}
