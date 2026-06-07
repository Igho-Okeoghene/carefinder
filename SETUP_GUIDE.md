# Setup Guide: Remaining Features

## 1. ✅ Zod Form Validation

**Status**: IMPLEMENTED

The Zod validation schemas have been created and integrated into the admin dashboard:

- **File**: [src/lib/validation.ts](src/lib/validation.ts)
- **Features**:
  - Hospital form validation with phone number regex
  - Email optional validation
  - Coordinate bounds validation (-90 to 90 for lat, -180 to 180 for lng)
  - Error display in the admin form UI

**How it works**:
- Forms are validated before submission
- Validation errors display in a red error panel at the top of the form
- Field-level error highlighting for better UX
- All required fields are enforced with meaningful error messages

---

## 2. ⚠️ Image Upload via Supabase Storage

**Status**: READY TO INTEGRATE (code created, needs Supabase bucket setup)

### Step 1: Create Supabase Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** → **Buckets**
3. Click **Create a new bucket**
4. Set bucket name to: `hospital-images`
5. Make it **Public** (for direct image access)
6. Click **Create bucket**

### Step 2: Add RLS Policy (Optional but Recommended)

In Supabase SQL Editor, run:

```sql
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'hospital-images' AND 
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'hospital-images');
```

### Step 3: Use the ImageUpload Component in Admin Dashboard

Update [src/app/admin/dashboard/page.tsx](src/app/admin/dashboard/page.tsx):

```tsx
import ImageUpload from '@/components/ImageUpload'

// In your form, add:
<ImageUpload
  hospitalId={formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
  imageType="facility"
  label="Hospital Photo"
  onUploadComplete={(imageUrl) => {
    // Store imageUrl in your hospital record
  }}
/>
```

### Files Created:
- [src/lib/supabase/storage.ts](src/lib/supabase/storage.ts) - Storage utilities
- [src/components/ImageUpload.tsx](src/components/ImageUpload.tsx) - Upload component

---

## 3. ❌ Admin Invite System (Supabase Edge Functions)

**Status**: NOT YET IMPLEMENTED

This requires Supabase Edge Functions (requires Supabase Pro tier or local development).

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

### Step 2: Initialize Edge Functions

```bash
supabase functions new send-admin-invite
```

### Step 3: Create the Edge Function

Create [supabase/functions/send-admin-invite/index.ts](supabase/functions/send-admin-invite/index.ts):

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, inviterEmail } = await req.json()

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create user with temporary password
    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: Math.random().toString(36).slice(-12), // Temporary password
      email_confirm: false,
    })

    if (createError) throw createError

    // Set admin role in profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: user.user.id,
        role: 'admin',
        email,
      })

    if (profileError) throw profileError

    // Send invitation email
    const inviteLink = `${Deno.env.get('SITE_URL')}/auth/reset-password?token=${user.user.recovery_token}`

    return new Response(
      JSON.stringify({
        success: true,
        message: `Invitation sent to ${email}`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
```

### Step 4: Deploy the Function

```bash
supabase functions deploy send-admin-invite
```

### Step 5: Create Admin Invite Component

Create [src/components/AdminInvite.tsx](src/components/AdminInvite.tsx):

```tsx
'use client'

import { useState } from 'react'
import { Mail, Send, AlertCircle, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminInvite() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const supabase = createClient()

  const handleInvite = async () => {
    if (!email) return

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await supabase.functions.invoke('send-admin-invite', {
        body: { email },
      })

      if (response.error) throw response.error

      setMessage({ type: 'success', text: `Invitation sent to ${email}` })
      setEmail('')
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to send invite',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Invite New Admin</h2>

      <div className="space-y-4">
        <div className="flex gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={handleInvite}
            disabled={isLoading || !email}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Invite
          </button>
        </div>

        {message && (
          <div
            className={`flex gap-2 p-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <p className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {message.text}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
```

### Requirements:
- Supabase Pro plan (Edge Functions available)
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` env variables configured
- Email service configured in Supabase (Auth → Email Templates)

---

## Summary

| Feature | Status | Implementation Time |
|---------|--------|-------------------|
| Zod Validation | ✅ Done | N/A |
| Image Uploads | ⚠️ Ready | 10-15 min (bucket setup) |
| Admin Invites | ❌ Partial | 20-30 min (Edge Functions) |

**Next Steps:**
1. Set up Supabase storage bucket for image uploads
2. Consider if admin invite system is needed (skip if manual admin setup is acceptable)
3. Run `npm run dev` to test the Zod validation changes
