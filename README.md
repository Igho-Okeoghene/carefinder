## **Carefinder Overview**
Carefinder is a civic health tool that helps Nigerians find, export, and share hospital information. It addresses a real access-to-healthcare gap by building a searchable, shareable, and exportable hospital directory with role-based admin tools. The platform distinguishes two audiences: public users who search and share hospital information, and admin users who create and curate hospital entries via a protected dashboard.

---

## **Tech Stack**

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js + React + TypeScript |
| Backend / DB | Supabase (Postgres + PostGIS extension for geospatial queries) |
| Authentication | Supabase Auth with Role-based Row Level Security |
| Map | Mapbox GL JS (interactive hospital map with radius search) |
| CSV Export | PapaParse (client-side, no server roundtrip) |
| Email Sharing | Resend API (transactional email for hospital list sharing) |
| Markdown Editor | react-md-editor (admin entry creation) |
| Styling | Tailwind CSS |
| Deployment | Vercel |

---

## **Core Features**

### **1. Hospital Search & Map**
- ✅ Search by hospital name, city, or Local Government Area (LGA)
- ✅ Filter by specialty (maternity, emergency, dental, pediatric, etc.) and ownership type (public/private)
- ✅ Results displayed on interactive Mapbox map AND in a sortable list view simultaneously
- ✅ Supabase PostGIS integration for radius-based queries: 'hospitals within X km of my location'
- ✅ Browser Geolocation API detects user position and pre-populates radius search
- ✅ Hospital detail page: name, address, phone, email, specialties, visiting hours, Markdown description, and rating

### **2. CSV Export**
- ✅ Column selection modal: choose which fields to include (name, address, phone, email, specialties, rating, etc.)
- ✅ Client-side export using PapaParse (no server roundtrip)
- ✅ Date-stamped filenames: `hospitals-{searchQuery}-{date}.csv` for traceability
- ✅ Supports exporting current filtered results or entire hospital directory

### **3. Hospital Sharing**
- ✅ **Shareable URLs**: Generate human-readable links with encoded filter parameters (e.g., `/search?city=Lagos&specialty=maternity&radius=10`)
- ✅ **One-click copy** with clipboard feedback ("Copied!" message)
- ✅ **Email sharing**: Send curated hospital list via Resend API
  - Recipient selects hospitals and enters email
  - Email contains formatted hospital details (name, address, phone, rating)
  - "Explore More" button links back to Carefinder

### **4. Authentication & Authorization**
- ✅ **Role-based access**: Two roles (admin, public user)
- ✅ **Supabase Auth**: Email/password authentication for admins
- ✅ **Row-Level Security (RLS)**: Enforced at database layer
  - Admins can INSERT, UPDATE, DELETE hospital records
  - Public users can READ hospital data without authentication
- ✅ **Admin dashboard protection**: Redirects unauthorized users to home
- ✅ **Review moderation**: Admins approve/hide user reviews

### **5. Admin Dashboard**
- ✅ Create, edit, delete hospital entries via form
- ✅ Required field validation: name, address, phone, city, LGA
- ✅ Markdown editor with live preview for descriptions and visiting hours
- ✅ Coordinate input (latitude/longitude) for precise hospital locations
- ✅ Specialty and ownership type management
- ✅ Review moderation panel: approve/hide pending reviews with star ratings
- ✅ Hospital list management table

### **6. Ratings & Reviews**
- ✅ Logged-in users can leave 1–5 star ratings with optional text reviews
- ✅ Aggregate star rating and review count displayed on hospital cards and detail pages
- ✅ Reviews marked as pending until admin approval
- ✅ Approved reviews visible to public; hidden reviews don't show
- ✅ Admin moderation dashboard shows pending reviews with rating and text
- ✅ User-friendly review submission with validation

---

## **Implementation Status vs. Specification**

| Feature | Status | Notes |
|---------|--------|-------|
| Hospital Search & Map | ✅ Complete | Full search, filter, PostGIS radius queries implemented |
| CSV Export | ✅ Complete | Column selection, date stamps, client-side export working |
| Shareable Links | ✅ Complete | URL-based filter sharing with clipboard copy |
| Email Sharing | ✅ Complete | Resend API integration for email delivery |
| Role-Based Auth | ✅ Complete | Supabase Auth + RLS policies enforced |
| Markdown Editor | ✅ Complete | react-md-editor for descriptions and hours |
| Ratings & Reviews | ✅ Complete | 1-5 stars, moderation, user-only submissions |
| Form Validation | ⚠️ Partial | HTML `required` + JS checks in place; **Zod schemas needed** |
| Image Uploads | ❌ Not Implemented | **Supabase Storage integration needed** |
| Admin Invite System | ❌ Not Implemented | **Supabase Edge Functions needed for secure invite flow** |

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
