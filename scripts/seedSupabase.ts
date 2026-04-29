import { createClient } from '@supabase/supabase-js';
import { MOCK_PROPERTIES } from '../src/data/mockData';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://juvrjybfkqcdsyflckso.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Y6MMp6Lq465rPtSXieh9RQ_aigJ1O8x';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log('Seeding Supabase. URL:', supabaseUrl);
  
  for (const prop of MOCK_PROPERTIES) {
    const propertyData = {
      // Don't insert `id`, let Supabase generate UUID if it uses UUID, 
      // or if id is string in mockup we can try inserting it if the table allows.
      // Usually it's better to just skip id or ensure valid UUID.
      title: prop.title,
      description: prop.description,
      price: prop.price,
      location: prop.location,
      image_url: prop.imageUrl,
      images: prop.images || [],
      type: prop.type,
      status: prop.status,
      submitted_by: 'system',
      submitted_at: prop.submittedAt || new Date().toISOString(),
      features: prop.features || []
    };

    const { data, error } = await supabase
      .from('properties')
      .insert([propertyData])
      .select();

    if (error) {
      console.error('Error inserting property:', prop.title, error.message);
    } else {
      console.log('Successfully inserted:', prop.title);
    }
  }

  console.log('Finished seeding.');
}

seed();
