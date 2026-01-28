import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

const supabase = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey
);

/**
 * Upload a screenshot to Supabase Storage
 * @returns Public URL of the uploaded screenshot
 */
export async function uploadScreenshot(
  jobId: string,
  screenshot: Buffer,
  filename: string
): Promise<string> {
  const path = `${jobId}/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from('screenshots')
    .upload(path, screenshot, {
      contentType: 'image/png',
      upsert: true
    });

  if (uploadError) {
    throw new Error(`Failed to upload screenshot: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from('screenshots').getPublicUrl(path);
  return data.publicUrl;
}
