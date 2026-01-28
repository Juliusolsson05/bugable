import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function uploadScreenshot(
  jobId: string,
  screenshot: Buffer,
  filename: string
): Promise<string> {
  const path = `${jobId}/${filename}`;

  await supabase.storage
    .from('screenshots')
    .upload(path, screenshot, {
      contentType: 'image/png',
      upsert: true
    });

  const { data } = supabase.storage.from('screenshots').getPublicUrl(path);
  return data.publicUrl;
}
