import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.89.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting for product chat
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = {
  maxRequests: 20,      // Maximum requests per window
  windowMs: 60 * 1000,  // 1 minute window
};

function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (record && now > record.resetTime) {
    rateLimitStore.delete(identifier);
  }

  const currentRecord = rateLimitStore.get(identifier);

  if (!currentRecord) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1 };
  }

  if (currentRecord.count >= RATE_LIMIT.maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  currentRecord.count++;
  rateLimitStore.set(identifier, currentRecord);
  return { allowed: true, remaining: RATE_LIMIT.maxRequests - currentRecord.count };
}

// Input sanitization
function sanitizeMessage(message: string): string {
  if (!message || typeof message !== 'string') return '';
  // Remove potential XSS and limit length
  return message
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .substring(0, 2000); // Limit length
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client identifier for rate limiting (use IP or fallback)
    const clientId = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'anonymous';
    
    // Check rate limit
    const rateLimit = checkRateLimit(clientId);
    if (!rateLimit.allowed) {
      console.warn(`Rate limit exceeded for chat client: ${clientId}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": "60"
          } 
        }
      );
    }

    const { messages } = await req.json();
    
    // Validate messages array
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize all messages
    const sanitizedMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : msg.role === 'assistant' ? 'assistant' : 'user',
      content: sanitizeMessage(msg.content),
    })).filter((msg: { role: string; content: string }) => msg.content.length > 0);

    if (sanitizedMessages.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid messages provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service not configured");
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

    const systemPrompt = `You are a friendly and helpful shopping assistant for zen-z.store, a fashion e-commerce store. Your role is to help customers find the perfect products based on their preferences, style, and needs.

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
- If customers want to view a product, tell them they can search for it or browse the categories
- Never discuss topics unrelated to shopping or fashion
- Do not share any sensitive information or make up products that don't exist`;

    console.log(`Processing chat request with ${sanitizedMessages.length} messages`);

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
          ...sanitizedMessages,
        ],
        stream: true,
        max_tokens: 500, // Limit response length
      }),
    });

    if (!response.ok) {
      const status = response.status;
      console.error(`AI gateway error: ${status}`);
      
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Unable to process your request. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Product chat error:", error);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
