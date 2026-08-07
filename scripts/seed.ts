// One-off seed script: run with `npm run seed`
// - Creates the first super_admin staff user (Firebase Auth + staff/{uid} doc)
// - Seeds verticals/{slug} with the real content ported from the old index.html/admin.html
// - Seeds settings/site with the current site-wide copy (stats, testimonials source, etc.)
// Safe to re-run: verticals/settings are upserted, and staff creation is skipped if the
// SEED_ADMIN_EMAIL already exists.
import { config } from 'dotenv'
config({ path: '.env.local' })
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

const projectId   = process.env.FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
const privateKey  = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY in .env.local — see FIREBASE_SETUP.md')
  process.exit(1)
}

const app  = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
const db   = getFirestore(app)
const auth = getAuth(app)

const now = new Date().toISOString()

const verticals = [
  {
    slug: 'pbr', name: 'PBR Prime Restaurant', short: 'PBR Restaurant',
    location: 'Champapet, Hyderabad', category: 'Fine Dining · Hotel',
    tagline: 'A Premier Dining Destination', color: '#1a2d5a', icon: '🍽️',
    about: `PBR Prime Restaurant at Champapet is a landmark dining destination that brings together authentic Hyderabadi cuisine with modern culinary artistry. Our chefs craft each dish with the finest ingredients, served in an ambience that blends traditional warmth with contemporary elegance.\n\nWhether hosting an intimate family gathering, corporate luncheon, or grand celebration dinner, PBR Prime offers private dining halls, banquet spaces, and a live kitchen experience that makes every meal an occasion.`,
    highlights: [{ value: '500+', label: 'Seats' }, { value: '15+', label: 'Years' }, { value: '★ 4.8', label: 'Rating' }],
    amenities: ['🍽️ Multi-cuisine Menu','🏛️ Banquet Hall','🎤 Live Events','🅿️ Valet Parking','❄️ AC Halls','🎂 Custom Cakes','🍷 Bar & Lounge','📸 Photo Zone','🌿 Open Dining','🎨 Décor Team','🅿️ 500 Car Parking','❄️ Central AC'],
  },
  {
    slug: 'kms', name: 'KMS Convention & Resorts', short: 'KMS Convention',
    location: 'Turkyamjal, AV Nagar, Hyderabad', category: 'Convention · Resort · Farm Stay',
    tagline: 'Grand Events, Luxurious Stays', color: '#1a5038', icon: '🏛️',
    about: `KMS Convention & Resorts is a world-class destination combining spectacular event venues with the serenity of a luxury resort stay. Nestled in the lush surroundings of Turkyamjal, AV Nagar, KMS offers sprawling convention halls accommodating large-scale events — from grand weddings to international corporate summits.\n\nThe resort features beautifully landscaped grounds, luxurious rooms, a farm stay experience, adventure activities, and impeccable service.`,
    highlights: [{ value: '2000+', label: 'Capacity' }, { value: '15 Acres', label: 'Grounds' }, { value: '★ 4.9', label: 'Rating' }],
    amenities: ['🏛️ Grand Hall','🛏️ Luxury Rooms','🌾 Farm Stay','🏊 Swimming Pool','🎪 Outdoor Events','🍽️ Restaurant','🎤 AV Setup','🅿️ Large Parking','🌿 Gardens','🏋️ Gym','🎯 Activities','🚐 Transport'],
  },
  {
    slug: 'lush', name: 'Lush Castle Resort', short: 'Lush Castle',
    location: 'Kongara Kalan, Near Wonderla, Hyderabad', category: 'Resort · Farm Stay',
    tagline: "Royal Luxury in Nature's Lap", color: '#7a4a10', icon: '🏰',
    about: `Lush Castle Resort is an enchanting escape set amidst verdant countryside near Wonderla, Hyderabad. Inspired by royal architecture, the castle-themed resort offers a unique blend of regal luxury and farm-fresh living — ideal for weekend getaways, destination weddings, and family vacations.\n\nWith stunning castle architecture, open lawns, a farm experience, swimming pool, and curated activities for all ages, Lush Castle creates memories that last a lifetime.`,
    highlights: [{ value: '50 Acres', label: 'Property' }, { value: '80+ Rooms', label: 'Available' }, { value: '★ 4.9', label: 'Rating' }],
    amenities: ['🏰 Castle Architecture','🌿 Farm Stay','🏊 Pool','🎠 Kids Zone','🌾 Nature Walks','🍽️ Multi Cuisine','🎪 Event Lawn','🛏️ Royal Rooms','🐄 Petting Farm','🎯 Adventure','📸 Photo Ops','🚐 Pickup'],
  },
  {
    slug: 'jaya', name: 'Jaya Convention', short: 'Jaya Convention',
    location: 'Choutuppal, Hyderabad', category: 'Convention Centre',
    tagline: 'Grand Celebrations, Grand Memories', color: '#4a1a60', icon: '🎊',
    about: `Jaya Convention is a premier convention centre in Choutuppal, designed to host grand events with elegance. From opulent weddings to large corporate conferences, Jaya provides state-of-the-art infrastructure and impeccable hospitality.\n\nWith multiple halls of varying capacities, modern AV systems, dedicated décor teams, and in-house catering, Jaya Convention is the ideal venue for every milestone moment.`,
    highlights: [{ value: '3000+', label: 'Capacity' }, { value: '5 Halls', label: 'Available' }, { value: '★ 4.8', label: 'Rating' }],
    amenities: ['🏛️ 5 Grand Halls','🎤 Sound System','💡 Stage Lighting','🍽️ In-house Catering','🎨 Décor Team','🅿️ 500 Car Parking','❄️ Central AC','📽️ AV Projectors','🌿 Green Rooms','💐 Floral Design','🎊 Event Mgmt','🚐 Transport'],
  },
  {
    slug: 'rich', name: 'Rich Field Farm House', short: 'Rich Field Farm',
    location: 'Turkyamjal, Hyderabad', category: 'Farm House · Stay',
    tagline: 'Nature, Peace & Pure Joy', color: '#1a3a60', icon: '🌾',
    about: `Rich Field Farm House in Turkyamjal is a serene countryside escape offering the perfect blend of nature, comfort and fun. Ideal for corporate team outings, birthday celebrations, family reunions and school trips.\n\nThe property features open green lawns, indoor and outdoor activity zones, a swimming pool, and a fully equipped party area — surrounded by beautiful natural landscapes.`,
    highlights: [{ value: '200+', label: 'Capacity' }, { value: '10 Acres', label: 'Property' }, { value: '★ 4.7', label: 'Rating' }],
    amenities: ['🌾 Open Lawns','🏊 Swimming Pool','🎮 Indoor Games','🎯 Outdoor Activities','🍽️ Catering','🎪 Party Area','🅿️ Parking','❄️ AC Halls','🌿 Nature Walk','🎠 Kids Zone','🎤 DJ Setup','🚐 Transport'],
  },
  {
    slug: 'global', name: 'Global City Club House', short: 'Global City Club',
    location: 'Shankarpally, Hyderabad', category: 'Club House · Farm Stay',
    tagline: 'Premium Club Living & Farm Experience', color: '#2a5a20', icon: '🌿',
    about: `Global City Club House in Shankarpally offers an exclusive club house and farm stay experience. The property is designed for private parties, corporate events, and a tranquil farm stay in modern comfort.\n\nWith beautifully designed club interiors, outdoor pavilions, farm activities, and curated dining, Global City is perfect for luxury without leaving the city's vicinity.`,
    highlights: [{ value: '300+', label: 'Capacity' }, { value: '20 Acres', label: 'Grounds' }, { value: '★ 4.8', label: 'Rating' }],
    amenities: ['🏡 Club House','🌿 Farm Stay','🍽️ Restaurant','🏊 Pool','🎪 Event Lawn','🌾 Farm Activities','❄️ AC Banquet','🅿️ Parking','🎤 Event Setup','🌱 Organic Garden','🚐 Pickup','🐄 Farm Animals'],
  },
  {
    slug: 'catering', name: 'PBR Catering Services', short: 'PBR Catering',
    location: 'Hyderabad · 50 – 5000 Guests', category: 'Catering · Events',
    tagline: 'Every Event Deserves Perfect Food', color: '#1a2d5a', icon: '🍱',
    about: `PBR Catering Services is Hyderabad's trusted catering partner for events of all scales — from intimate gatherings of 50 guests to grand celebrations of 5000. Our experienced chefs craft customised menus featuring diverse cuisines to suit every palate.\n\nFrom weddings and corporate events to birthday parties and cultural festivals, PBR Catering delivers consistent quality, timely service, and a dining experience that impresses every guest.`,
    highlights: [{ value: '5000+', label: 'Max Guests' }, { value: '50+', label: 'Menu Items' }, { value: '★ 4.9', label: 'Rating' }],
    amenities: ['🍽️ Multi-cuisine','👨‍🍳 Expert Chefs','🎪 Live Counters','🥘 Hyderabadi Specials','🌱 Veg & Non-veg','❄️ Chilled Beverages','🚚 Equipment Provided','🧹 Setup & Cleanup','🎂 Custom Cakes','🍰 Dessert Counters','🧑‍🍳 Service Staff','📋 Custom Menus'],
  },
]

// Per-vertical guest reviews, ported from the old VERTS.reviews[] — seeded as testimonials
// scoped to their vertical (showOnHome:false), separate from the 3 homepage testimonials below.
const verticalReviews: Record<string, { name: string; quote: string; rating: number }[]> = {
  pbr: [
    { name: 'Kiran Rao',  quote: 'Absolutely stunning food and service. The biryani is the best in Hyderabad!', rating: 5 },
    { name: 'Priya Mehta', quote: 'Hosted my parents anniversary — the team went above and beyond!', rating: 5 },
    { name: 'Arjun K.',   quote: 'Great ambience, generous portions. Perfect for our team.', rating: 4 },
    { name: 'Sneha R.',   quote: 'Loved every dish. Already planning our next visit!', rating: 5 },
  ],
  kms: [
    { name: 'Suresh Nair',    quote: "Hosted our daughter's wedding — 1200 guests and everything was perfect!", rating: 5 },
    { name: 'TechCorp Events', quote: 'The convention facility is world-class. Our conference was seamless.', rating: 5 },
    { name: 'Anjali Family',  quote: 'Farm stay experience was magical. Kids loved every moment!', rating: 5 },
    { name: 'Ravi Kumar',     quote: 'Amazing venue, beautiful grounds, professional staff.', rating: 4 },
  ],
  lush: [
    { name: 'Deepa Family',  quote: 'A fairytale resort! Our kids were in awe of the castle.', rating: 5 },
    { name: 'Rohan & Nisha', quote: 'Hosted our destination wedding — the lawn and décor were breathtaking!', rating: 5 },
    { name: 'Vikram R.',     quote: 'Farm stay is one of a kind. Peaceful and well-maintained.', rating: 5 },
    { name: 'Meera S.',      quote: 'Beautiful property, friendly staff. Food was excellent!', rating: 4 },
  ],
  jaya: [
    { name: 'Aarav & Priya', quote: "The grandest hall I've seen. Our wedding was absolutely perfect!", rating: 5 },
    { name: 'Synergy Corp',  quote: 'Professional team, great facilities. Corporate event was a huge success.', rating: 5 },
    { name: 'Lakshmi D.',    quote: 'Beautiful venue, helpful staff, reasonable pricing.', rating: 4 },
    { name: 'Ramesh K.',     quote: 'The catering was excellent and décor team was creative.', rating: 5 },
  ],
  rich: [
    { name: 'TechTeam Hyd',   quote: 'Best outing venue for our 50-member team. Activities were amazing!', rating: 5 },
    { name: 'Anand Family',   quote: 'Lovely farm house, good food, great for family picnic.', rating: 4 },
    { name: 'Sunita R.',      quote: "Celebrated son's birthday here — kids had an absolute blast!", rating: 5 },
    { name: 'Vivek M.',       quote: 'Good amenities, responsive management, will come back.', rating: 4 },
  ],
  global: [
    { name: 'Rahul S.',           quote: 'Exceptional property! Club house and farm stay combo is unique.', rating: 5 },
    { name: 'Neethu V.',          quote: 'Great for private parties. Team was very accommodating.', rating: 4 },
    { name: 'Infosys Events',     quote: 'Corporate retreat done right — activities, food, stay — all perfect!', rating: 5 },
    { name: 'Krishnapur Family',  quote: 'Organic farm experience was a highlight. Kids loved it!', rating: 5 },
  ],
  catering: [
    { name: 'Venkat Rao',       quote: "Catered daughter's wedding for 800 guests — every dish was perfection!", rating: 5 },
    { name: 'Google Hyderabad', quote: 'Best biryani catering in Hyderabad. Our office party was a huge hit!', rating: 5 },
    { name: 'Ashok Events',     quote: '500 guests, flawless execution. Live counters were a crowd favourite!', rating: 5 },
    { name: 'Padma S.',         quote: 'Great variety, punctual, courteous staff. Highly recommended.', rating: 4 },
  ],
}

const homeTestimonials = [
  { name: 'Suresh & Kamala Rao', role: 'Wedding, Lush Castle Resort', verticalSlug: 'lush',
    quote: "Hosted our daughter's wedding at Lush Castle Resort — 800 guests and everything was absolutely perfect. The décor, food and service exceeded all expectations!", rating: 5 },
  { name: 'Priya Mehta, HR Director', role: 'Corporate Event, KMS Convention', verticalSlug: 'kms',
    quote: 'KMS Convention is world-class. Our annual corporate conference for 600 delegates went seamlessly. The AV setup, catering and staff were all top-notch.', rating: 5 },
  { name: 'Anand Kumar', role: 'Birthday Event, PBR Catering', verticalSlug: 'catering',
    quote: "PBR Catering handled our son's birthday for 500 people. The live counters, food variety and presentation were outstanding. Highly recommend!", rating: 5 },
]

const teamMembers = [
  { name: 'Mr. B. Rajesh', role: 'Founder & Chairman',
    bio: "With 20+ years in hospitality, Rajesh built BR Group from a single restaurant into Hyderabad's most trusted hospitality brand." },
  { name: 'Mrs. Lakshmi Devi', role: 'Director – Operations',
    bio: 'Lakshmi oversees day-to-day operations across all 7 verticals, ensuring consistent quality and guest satisfaction.' },
  { name: 'Chef Suresh Kumar', role: 'Executive Head Chef',
    bio: 'With 18 years of culinary expertise, Chef Suresh leads all food operations and menu innovation across the group.' },
]

const settings = {
  siteName: 'BR Hospitality Group',
  tagline: 'Hospitality Beyond Expectations',
  phone1: '', phone2: '', whatsapp: '',
  email: 'info@brhospitality.com',
  address: 'Hyderabad, Telangana, India',
  mapsEmbedUrl: '',
  instagram: '', facebook: '', youtube: '',
  seoTitle: 'BR Hospitality Group',
  seoDescription: 'BR Hospitality Group — 7 premium venues across Hyderabad spanning fine dining, conventions, resorts, farm stays and catering.',
  seoKeywords: '', gaId: '', searchConsoleVerification: '',
  homeStats:  { years: '15+', guests: '50K+', venues: '7', maxGuests: '5000' },
  aboutStats: { founded: '2009', venues: '7', guests: '50K+', eventsPerYear: '500+' },
  toggles: {
    showBrandCards: true, showSlideshow: true, showVideos: true,
    showGallery: true, showReviews: true, showWhatsappFloat: true, showWhyChooseUs: true,
  },
  servicesStrip: [
    { icon: '🍽️', label: 'Fine Dine' }, { icon: '🏛️', label: 'Conventions' },
    { icon: '🌴', label: 'Resorts' }, { icon: '🌾', label: 'Farm Stay' },
    { icon: '🍱', label: 'Catering' }, { icon: '🎊', label: 'Celebrations' },
  ],
  whyChooseUs: [
    { icon: '🏆', title: '15+ Years Experience', text: 'Over a decade of crafting unforgettable events, meals and stays across Hyderabad.' },
    { icon: '🌟', title: 'Premium Quality', text: 'From ingredients to interiors, we maintain the highest standards across every vertical.' },
    { icon: '👨‍🍳', title: 'Expert Teams', text: 'Dedicated chefs, event managers and hospitality professionals at your service.' },
    { icon: '💛', title: 'Personalised Service', text: 'Every event is treated as unique. We tailor every detail to your vision and needs.' },
  ],
  values: [
    { icon: '🏆', title: 'Excellence', text: 'We settle for nothing less than the best in every dish, every event and every stay.' },
    { icon: '💛', title: 'Warmth', text: 'Every guest is family. We treat every visit with genuine care and hospitality.' },
    { icon: '🌿', title: 'Sustainability', text: 'We source responsibly and operate our farm stays with respect for nature.' },
    { icon: '🎯', title: 'Precision', text: 'From timing to presentation, we execute with detail-oriented precision every time.' },
    { icon: '🤝', title: 'Trust', text: '15 years of trust built with thousands of families, corporates and celebrants.' },
    { icon: '🚀', title: 'Innovation', text: 'We constantly evolve our menus, décor and experiences to stay ahead.' },
  ],
  aboutIntroTitle: 'A Legacy Built on Passion & Service',
  aboutIntroText1: 'BR Hospitality Group was founded with a single vision — to create spaces where people come together, celebrate life and create memories that last a lifetime. What started as a single restaurant in Champapet has grown into a sprawling hospitality empire spanning fine dining, grand convention centres, luxury resorts, farm stays, club houses and professional catering services.',
  aboutIntroText2: 'Today, our seven distinct verticals across Hyderabad serve over 50,000 guests annually — from intimate family dinners to grand weddings of 3000+ guests. Every venue carries the same DNA: uncompromising quality, heartfelt service and an obsessive attention to detail.',
  taglineband: 'One Group. Many Experiences. Endless Memories.',
}

async function seedVerticals() {
  const batch = db.batch()
  verticals.forEach((v, i) => {
    const ref = db.collection('verticals').doc(v.slug)
    batch.set(ref, {
      name: v.name, short: v.short, location: v.location, category: v.category,
      tagline: v.tagline, color: v.color, icon: v.icon, about: v.about,
      highlights: v.highlights, amenities: v.amenities,
      status: 'live', phone: '', whatsapp: '', googleMapsUrl: '',
      sortOrder: i, createdAt: now, updatedAt: now,
    }, { merge: true })
  })
  await batch.commit()
  console.log(`✔ Seeded ${verticals.length} verticals`)
}

async function seedTestimonials() {
  const existing = await db.collection('testimonials').limit(1).get()
  if (!existing.empty) { console.log('… testimonials already seeded, skipping'); return }

  const batch = db.batch()
  let sortOrder = 0

  for (const t of homeTestimonials) {
    const ref = db.collection('testimonials').doc()
    batch.set(ref, {
      name: t.name, role: t.role, quote: t.quote, rating: t.rating,
      verticalSlug: t.verticalSlug, avatarMediaId: null,
      showOnHome: true, active: true, sortOrder: sortOrder++, createdAt: now,
    })
  }

  for (const [slug, reviews] of Object.entries(verticalReviews)) {
    for (const r of reviews) {
      const ref = db.collection('testimonials').doc()
      batch.set(ref, {
        name: r.name, role: '', quote: r.quote, rating: r.rating,
        verticalSlug: slug, avatarMediaId: null,
        showOnHome: false, active: true, sortOrder: sortOrder++, createdAt: now,
      })
    }
  }

  await batch.commit()
  console.log(`✔ Seeded ${homeTestimonials.length + Object.values(verticalReviews).flat().length} testimonials`)
}

async function seedTeam() {
  const existing = await db.collection('team_members').limit(1).get()
  if (!existing.empty) { console.log('… team_members already seeded, skipping'); return }

  const batch = db.batch()
  teamMembers.forEach((m, i) => {
    const ref = db.collection('team_members').doc()
    batch.set(ref, { ...m, photoMediaId: null, sortOrder: i, active: true })
  })
  await batch.commit()
  console.log(`✔ Seeded ${teamMembers.length} team members`)
}

async function seedSettings() {
  await db.collection('settings').doc('site').set(settings, { merge: true })
  console.log('✔ Seeded site settings')
}

async function seedSuperAdmin() {
  const email    = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  const name     = process.env.SEED_ADMIN_NAME || 'Admin'

  if (!email || !password) {
    console.log('… SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD not set, skipping super_admin creation')
    return
  }

  let user
  try {
    user = await auth.getUserByEmail(email)
    console.log(`… staff user ${email} already exists (uid ${user.uid}), leaving as-is`)
  } catch {
    user = await auth.createUser({ email, password, displayName: name })
    console.log(`✔ Created Firebase Auth user ${email} (uid ${user.uid})`)
  }

  await db.collection('staff').doc(user.uid).set({
    email, name, role: 'super_admin', assignedVerticals: [], active: true, createdAt: now,
  }, { merge: true })
  console.log(`✔ Upserted staff/${user.uid} as super_admin`)
}

async function main() {
  await seedVerticals()
  await seedTestimonials()
  await seedTeam()
  await seedSettings()
  await seedSuperAdmin()
  console.log('\nDone. You can now log in at /login with your SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD.')
  process.exit(0)
}

main().catch(err => { console.error(err); process.exit(1) })
