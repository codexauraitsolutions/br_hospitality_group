// Typed server-side data-fetch helpers, used by both public SSR pages and admin API routes.
// All reads go through the Admin SDK — there is no client-side Firestore access anywhere.
import { adminDb } from '@/lib/firebaseAdmin'
import {
  SiteSettings, Vertical, VerticalSlug, MediaItem, MediaSection,
  Testimonial, TeamMember, ActivityType, ActivityEntry,
} from '@/types'

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'BR Hospitality Group',
  tagline: 'Hospitality Beyond Expectations',
  phone1: '', phone2: '', whatsapp: '', email: '', address: '', mapsEmbedUrl: '',
  instagram: '', facebook: '', youtube: '',
  seoTitle: 'BR Hospitality Group', seoDescription: '', seoKeywords: '',
  gaId: '', searchConsoleVerification: '',
  homeStats:  { years: '', guests: '', venues: '', maxGuests: '' },
  aboutStats: { founded: '', venues: '', guests: '', eventsPerYear: '' },
  toggles: {
    showBrandCards: true, showSlideshow: true, showVideos: true,
    showGallery: true, showReviews: true, showWhatsappFloat: true, showWhyChooseUs: true,
  },
  servicesStrip: [],
  whyChooseUs: [],
  values: [],
  aboutIntroTitle: '', aboutIntroText1: '', aboutIntroText2: '', taglineband: '',
  logoUrl: '', logoMediaId: null,
  amenitiesMaster: [
    '🍽️ Multi-cuisine Menu', '🏛️ Banquet Hall', '🎤 Live Events', '🅿️ Valet Parking', '❄️ AC Halls',
    '🎂 Custom Cakes', '🍷 Bar & Lounge', '📸 Photo Zone', '🌿 Open Dining', '🎨 Décor Team',
    '🅿️ Car Parking', '❄️ Central AC', '🏛️ Grand Hall', '🛏️ Luxury Rooms', '🌾 Farm Stay',
    '🏊 Swimming Pool', '🎪 Outdoor Events', '🍽️ Restaurant', '🎤 AV Setup', '🌿 Gardens',
    '🏋️ Gym', '🎯 Activities', '🚐 Transport', '🏰 Castle Architecture', '🎠 Kids Zone',
    '🌾 Nature Walks', '🎪 Event Lawn', '🛏️ Royal Rooms', '🐄 Petting Farm', '🎯 Adventure',
    '📸 Photo Ops', '🚐 Pickup', '🏛️ 5 Grand Halls', '🎤 Sound System', '💡 Stage Lighting',
    '🍽️ In-house Catering', '📽️ AV Projectors', '🌿 Green Rooms', '💐 Floral Design', '🎊 Event Mgmt',
    '🌾 Open Lawns', '🎮 Indoor Games', '🎯 Outdoor Activities', '🍽️ Catering', '🎪 Party Area',
    '🅿️ Parking', '🌿 Nature Walk', '🎤 DJ Setup', '🏡 Club House', '🌾 Farm Activities',
    '❄️ AC Banquet', '🎤 Event Setup', '🌱 Organic Garden', '🐄 Farm Animals', '👨‍🍳 Expert Chefs',
    '🎪 Live Counters', '🥘 Hyderabadi Specials', '🌱 Veg & Non-veg', '❄️ Chilled Beverages',
    '🚚 Equipment Provided', '🧹 Setup & Cleanup', '🍰 Dessert Counters', '🧑‍🍳 Service Staff', '📋 Custom Menus',
  ],
}

const DEFAULT_VERTICAL_FIELDS = { coverImageUrl: '', coverMediaId: null, externalUrl: '' }
function normalizeVertical(slug: string, data: FirebaseFirestore.DocumentData): Vertical {
  return { slug, ...DEFAULT_VERTICAL_FIELDS, ...data } as Vertical
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const doc = await adminDb().collection('settings').doc('site').get()
    if (!doc.exists) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...doc.data() } as SiteSettings
  } catch {
    return DEFAULT_SETTINGS
  }
}

export async function getVerticals(opts: { onlyLive?: boolean } = {}): Promise<Vertical[]> {
  try {
    const query = adminDb().collection('verticals').orderBy('sortOrder')
    const snap = await query.get()
    let items = snap.docs.map(d => normalizeVertical(d.id, d.data()))
    if (opts.onlyLive) items = items.filter(v => v.status === 'live')
    return items
  } catch {
    return []
  }
}

export async function getVerticalBySlug(slug: string): Promise<Vertical | null> {
  try {
    const doc = await adminDb().collection('verticals').doc(slug).get()
    if (!doc.exists) return null
    return normalizeVertical(doc.id, doc.data()!)
  } catch {
    return null
  }
}

export async function getMedia(opts: {
  section?: MediaSection
  verticalSlug?: VerticalSlug
  activeOnly?: boolean
  limit?: number
} = {}): Promise<MediaItem[]> {
  try {
    let query: FirebaseFirestore.Query = adminDb().collection('media')
    if (opts.section) query = query.where('section', '==', opts.section)
    if (opts.verticalSlug) query = query.where('verticalSlug', '==', opts.verticalSlug)
    const snap = await query.get()
    let items = snap.docs.map(d => ({ id: d.id, ...d.data() }) as MediaItem)
    items.sort((a, b) => a.sortOrder - b.sortOrder)
    if (opts.activeOnly) items = items.filter(m => m.active)
    if (opts.limit) items = items.slice(0, opts.limit)
    return items
  } catch {
    return []
  }
}

export async function getActiveTestimonials(opts: { homeOnly?: boolean; verticalSlug?: VerticalSlug } = {}): Promise<Testimonial[]> {
  try {
    const snap = await adminDb().collection('testimonials').where('active', '==', true).get()
    let items = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Testimonial)
    items.sort((a, b) => a.sortOrder - b.sortOrder)
    if (opts.homeOnly) items = items.filter(t => t.showOnHome)
    if (opts.verticalSlug) items = items.filter(t => t.verticalSlug === opts.verticalSlug)
    return items
  } catch {
    return []
  }
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const snap = await adminDb().collection('team_members').where('active', '==', true).get()
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }) as TeamMember)
    items.sort((a, b) => a.sortOrder - b.sortOrder)
    return items
  } catch {
    return []
  }
}

export async function logActivity(message: string, type: ActivityType, actorEmail: string, verticalSlug: VerticalSlug | null = null) {
  await adminDb().collection('activity').add({
    message, type, actorEmail, verticalSlug, createdAt: new Date().toISOString(),
  })
}

export async function getRecentActivity(limit = 8): Promise<ActivityEntry[]> {
  try {
    const snap = await adminDb().collection('activity').orderBy('createdAt', 'desc').limit(limit).get()
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as ActivityEntry)
  } catch {
    return []
  }
}
