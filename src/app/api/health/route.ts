// API Health Check
export async function GET() {
  try {
    return Response.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      supabase_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'
    });
  } catch (error) {
    return Response.json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
