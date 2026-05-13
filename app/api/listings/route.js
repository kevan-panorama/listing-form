import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

const requiredFields = [
  'agentName',
  'agentEmail',
  'agentPhone',
  'propertyTitle',
  'propertyType',
  'address',
  'city',
  'neighborhood',
  'bedrooms',
  'bathrooms',
  'surfaceSqm',
  'price',
  'commission',
  'ownerName',
  'ownerPhone',
  'ownerEmail'
];

const requiredDocs = ['titleDeed', 'ownerId', 'authorization', 'photos', 'floorplan', 'energyCertificate'];

export async function POST(request) {
  try {
    const data = await request.formData();

    const missingFields = requiredFields.filter((field) => !String(data.get(field) || '').trim());
    const missingDocs = requiredDocs.filter((doc) => data.getAll(doc).length === 0);

    if (missingFields.length > 0 || missingDocs.length > 0) {
      return NextResponse.json(
        {
          error: 'Incomplete listing.',
          missingFields,
          missingDocs,
          status: 'INCOMPLETE'
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const propertyId = crypto.randomUUID();
    const uploadedFiles = [];

    for (const docKey of requiredDocs) {
      const files = data.getAll(docKey);

      for (const file of files) {
        if (!(file instanceof File)) continue;

        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storagePath = `${propertyId}/${docKey}/${Date.now()}-${safeName}`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabase.storage
          .from('property-documents')
          .upload(storagePath, buffer, {
            contentType: file.type || 'application/octet-stream',
            upsert: false
          });

        if (uploadError) {
          throw new Error(`File upload failed: ${uploadError.message}`);
        }

        uploadedFiles.push({
          document_type: docKey,
          file_name: file.name,
          storage_path: storagePath,
          mime_type: file.type,
          size_bytes: file.size
        });
      }
    }

    const listingPayload = {
      id: propertyId,
      status: 'READY_FOR_PIPELINE',
      agent_name: data.get('agentName'),
      agent_email: data.get('agentEmail'),
      agent_phone: data.get('agentPhone'),
      property_title: data.get('propertyTitle'),
      property_type: data.get('propertyType'),
      address: data.get('address'),
      city: data.get('city'),
      neighborhood: data.get('neighborhood'),
      gps_link: data.get('gpsLink'),
      bedrooms: Number(data.get('bedrooms')),
      bathrooms: Number(data.get('bathrooms')),
      surface_sqm: Number(data.get('surfaceSqm')),
      price: Number(data.get('price')),
      commission: data.get('commission'),
      owner_name: data.get('ownerName'),
      owner_phone: data.get('ownerPhone'),
      owner_email: data.get('ownerEmail'),
      ownership_status: data.get('ownershipStatus'),
      notes: data.get('notes'),
      files: uploadedFiles
    };

    const { error: insertError } = await supabase.from('property_listings').insert(listingPayload);

    if (insertError) {
      throw new Error(`Database insert failed: ${insertError.message}`);
    }

    if (process.env.MAKE_WEBHOOK_URL) {
      await fetch(process.env.MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingPayload)
      });
    }

    return NextResponse.json({
      id: propertyId,
      status: 'READY_FOR_PIPELINE',
      message: 'Listing submitted successfully.'
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Server error.' }, { status: 500 });
  }
}
