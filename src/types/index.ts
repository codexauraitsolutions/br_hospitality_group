// A string ID, not a fixed union — verticals are created dynamically by super_admins,
// not limited to the original 7 seeded properties.
export type VerticalSlug = string

export type VerticalStatus = 'live' | 'draft'

export interface Highlight {
  value: string
  label: string
}

export interface Vertical {
  slug:           VerticalSlug
  name:           string
  short:          string
  location:       string
  category:       string
  tagline:        string
  color:          string
  icon:           string
  about:          string
  highlights:     Highlight[]
  amenities:      string[]
  status:         VerticalStatus
  phone:          string
  whatsapp:       string
  googleMapsUrl:  string
  coverImageUrl:  string
  coverMediaId:   string | null
  externalUrl:    string
  sortOrder:      number
  createdAt:      string
  updatedAt:      string
}

export type MediaSection = 'vertical_gallery' | 'vertical_video' | 'vertical_cover' | 'banner' | 'team' | 'testimonial' | 'logo'
export type MediaType = 'image' | 'video'

export interface MediaItem {
  id:            string
  section:       MediaSection
  verticalSlug:  VerticalSlug | null
  s3Key:         string
  url:           string
  type:          MediaType
  filename:      string
  size:          number
  width?:        number
  height?:       number
  caption:       string
  sortOrder:     number
  active:        boolean
  createdAt:     string
}

export type BookingStatus = 'new' | 'confirmed' | 'completed' | 'cancelled'

export interface Booking {
  id:            string
  verticalSlug:  VerticalSlug
  name:          string
  phone:         string
  email:         string
  eventDate:     string
  guests:        number
  eventType:     string
  message:       string
  status:        BookingStatus
  createdAt:     string
  updatedAt:     string
}

export type EnquiryStatus = 'new' | 'read' | 'replied'

export interface Enquiry {
  id:            string
  name:          string
  phone:         string
  email:         string
  venueSlug:     VerticalSlug | 'general'
  eventType:     string
  message:       string
  status:        EnquiryStatus
  adminNotes:    string
  createdAt:     string
  repliedAt:     string | null
}

export interface Testimonial {
  id:            string
  name:          string
  role:          string
  quote:         string
  rating:        number
  verticalSlug:  VerticalSlug | null
  avatarMediaId: string | null
  showOnHome:    boolean
  active:        boolean
  sortOrder:     number
  createdAt:     string
}

export interface TeamMember {
  id:            string
  name:          string
  role:          string
  bio:           string
  photoUrl:      string
  photoMediaId:  string | null
  sortOrder:     number
  active:        boolean
}

export interface HomeStats {
  years:      string
  guests:     string
  venues:     string
  maxGuests:  string
}

export interface AboutStats {
  founded:        string
  venues:         string
  guests:         string
  eventsPerYear:  string
}

export interface SiteToggles {
  showBrandCards:      boolean
  showSlideshow:       boolean
  showVideos:          boolean
  showGallery:         boolean
  showReviews:         boolean
  showWhatsappFloat:   boolean
  showWhyChooseUs:     boolean
}

export interface IconCard {
  icon:  string
  title: string
  text:  string
}

export interface ServiceItem {
  icon:  string
  label: string
}

export interface SiteSettings {
  siteName:                   string
  tagline:                    string
  phone1:                     string
  phone2:                     string
  whatsapp:                   string
  email:                      string
  address:                    string
  mapsEmbedUrl:                string
  instagram:                  string
  facebook:                   string
  youtube:                    string
  seoTitle:                   string
  seoDescription:             string
  seoKeywords:                string
  gaId:                       string
  searchConsoleVerification:  string
  homeStats:                  HomeStats
  aboutStats:                 AboutStats
  toggles:                    SiteToggles
  servicesStrip:              ServiceItem[]
  whyChooseUs:                IconCard[]
  values:                     IconCard[]
  amenitiesMaster:            string[]
  aboutIntroTitle:            string
  aboutIntroText1:            string
  aboutIntroText2:            string
  taglineband:                string
  logoUrl:                    string
  logoMediaId:                string | null
}

export type StaffRole = 'super_admin' | 'manager'

export interface StaffUser {
  uid:               string
  email:             string
  name:              string
  role:              StaffRole
  assignedVerticals: VerticalSlug[]
  active:            boolean
  createdAt:         string
}

export type ActivityType = 'upload' | 'edit' | 'delete' | 'enquiry' | 'booking'

export interface ActivityEntry {
  id:            string
  message:       string
  type:          ActivityType
  actorEmail:    string
  verticalSlug:  VerticalSlug | null
  createdAt:     string
}
