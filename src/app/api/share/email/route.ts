import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email, hospitals } = await request.json()

    const hospitalList = hospitals.map((hospital: any) => `
      <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h3 style="margin: 0 0 10px 0; color: #2563eb;">${hospital.name}</h3>
        <p style="margin: 5px 0;"><strong>Address:</strong> ${hospital.address}</p>
        <p style="margin: 5px 0;"><strong>Phone:</strong> ${hospital.phone}</p>
        ${hospital.email ? `<p style="margin: 5px 0;"><strong>Email:</strong> ${hospital.email}</p>` : ''}
        <p style="margin: 5px 0;"><strong>Rating:</strong> ${hospital.rating_avg.toFixed(1)} (${hospital.rating_count} reviews)</p>
      </div>
    `).join('')

    const { data, error } = await resend.emails.send({
      from: 'Carefinder <noreply@yourdomain.com>',
      to: [email],
      subject: `Healthcare Facilities in Nigeria - ${hospitals.length} hospitals shared with you`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Carefinder Nigeria</h1>
          <p>Someone has shared ${hospitals.length} healthcare facilities with you.</p>
          <div style="margin: 30px 0;">
            ${hospitalList}
          </div>
          <p style="margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Explore More on Carefinder
            </a>
          </p>
          <hr style="margin: 30px 0;" />
          <p style="color: #666; font-size: 12px;">
            This email was sent via Carefinder - Helping Nigerians find quality healthcare.
          </p>
        </div>
      `
    })

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}