import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cxlthnmntpxmntckdqbx.supabase.co";
const supabaseKey = "sb_publishable_tohZy6xPb3MfQkeWJDZNiQ_hYrxgzgi";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);