// Simple Supabase connectivity test
// Usage:
//   node tools/test-supabase.js <SUPABASE_URL> <ANON_KEY>
// or set env: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

const url = process.argv[2] || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.argv[3] || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing parameters. Provide SUPABASE_URL and ANON_KEY as args or env vars.');
  console.error('Example: node tools/test-supabase.js https://xyz.supabase.co sb_publishable_...');
  process.exit(1);
}

const endpoint = new URL('/rest/v1/', url).toString();

(async () => {
  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });

    console.log('REQUEST:', endpoint);
    console.log('STATUS:', res.status);
    const text = await res.text();
    console.log('BODY (first 1000 chars):\n', text.slice(0, 1000));
  } catch (err) {
    console.error('Request failed:', err.message || err);
    process.exitCode = 2;
  }
})();
