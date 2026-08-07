import { MetadataRoute } from 'next'
import { getVerticals } from '@/lib/firestore'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const verticals = await getVerticals({ onlyLive: true })

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/gallery`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]

  // Verticals with their own external site aren't part of this app's own sitemap.
  const venuePages: MetadataRoute.Sitemap = verticals
    .filter(v => !v.externalUrl)
    .map(v => ({
      url: `${baseUrl}/venues/${v.slug}`,
      lastModified: new Date(v.updatedAt || v.createdAt || Date.now()),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

  return [...staticPages, ...venuePages]
}
