import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SERVICE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TARGET_USER_ID = process.env.ADMIN_USER_ID; // prefer user id
const TARGET_EMAIL = process.env.ADMIN_EMAIL; // fallback: find by email

if (!SERVICE_URL || !SERVICE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const supabaseAdmin = createClient(SERVICE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserIdByEmail(email) {
  // Try admin.listUsers (may be paginated). Use a simple approach and search first page.
  try {
    const res = await supabaseAdmin.auth.admin.listUsers();
    if (res.error) throw res.error;
    let users = [];
    if (res.data && Array.isArray(res.data.users)) users = res.data.users;
    else if (Array.isArray(res.data)) users = res.data;
    else if (Array.isArray(res.users)) users = res.users;
    const found = users.find((u) => u.email === email);
    if (found) return found.id;
  } catch (err) {
    // fallback: try to query auth.users via RPC (may not be allowed)
    console.error('listUsers failed or did not find user; please provide ADMIN_USER_ID if listUsers is not available', err?.message ?? err);
  }
  return null;
}

async function main() {
  let userId = TARGET_USER_ID;
  if (!userId && TARGET_EMAIL) {
    userId = await findUserIdByEmail(TARGET_EMAIL);
    if (!userId) {
      console.error('Could not find user by email. Provide ADMIN_USER_ID in env instead.');
      process.exit(1);
    }
  }

  if (!userId) {
    console.error('No ADMIN_USER_ID or ADMIN_EMAIL provided. Set ADMIN_USER_ID=<uuid> or ADMIN_EMAIL=<email> in your .env.');
    process.exit(1);
  }

  console.log('Inserting admin role for user id:', userId);
  const { error } = await supabaseAdmin.from('user_roles').insert([{ role: 'admin', user_id: userId }]);
  if (error) {
    console.error('Failed to insert admin role:', error.message ?? error);
    process.exit(1);
  }

  console.log('Admin role inserted successfully.');
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
