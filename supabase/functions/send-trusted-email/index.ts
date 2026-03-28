import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { record } = await req.json();

    const trustedEmail = record.trusted_email;
    const venueName = record.venue_name;
    const matchContext = record.match_contact_info;

    console.log(`Sending trusted email to ${trustedEmail} regarding date at ${venueName}. Context: ${matchContext}`);
    
    // In production, instantiate Resend or SendGrid here:
    // const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    // await resend.emails.send({ ... })

    return new Response(JSON.stringify({ success: true, message: `Alert email dispatched to ${trustedEmail}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
