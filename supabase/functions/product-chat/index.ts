import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.89.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch products from database for context
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('name, description, price, category, subcategory, colors, sizes, in_stock, slug')
      .eq('in_stock', true)
      .limit(50);

    if (productsError) {
      console.error('Error fetching products:', productsError);
    }

    const productContext = products?.map(p => 
      `- ${p.name} (${p.category}${p.subcategory ? '/' + p.subcategory : ''}): ৳${p.price} - ${p.description || 'No description'}. Colors: ${JSON.stringify(p.colors) || 'N/A'}. Sizes: ${p.sizes?.join(', ') || 'N/A'}. Slug: ${p.slug}`
    ).join('\n') || 'No products available';

    const systemPrompt = `You are a friendly and helpful shopping assistant for a fashion e-commerce store. Your role is to help customers find the perfect products based on their preferences, style, and needs.

Available Products:
${productContext}

Guidelines:
- Be warm, friendly, and conversational
- Ask clarifying questions about style preferences, occasions, budget, and size when helpful
- Recommend specific products from the available catalog
- When recommending a product, mention its name, price (in ৳ Taka), and key features
- If a customer asks for something not in the catalog, politely suggest alternatives
- Keep responses concise but helpful (2-3 sentences typically)
- You can suggest up to 3 products at a time
- If customers want to view a product, tell them they can search for it or browse the categories`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service credits exhausted. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Product chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
