
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { message, user_id, conversation_history = [] } = await req.json()

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get user's allergy profile
    let userProfile = { allergies: '', symptoms: '', name: '' };
    if (user_id) {
      const { data: patient } = await supabase
        .from('patients')
        .select('symptoms, name')
        .eq('id', user_id)
        .single()
      
      if (patient) {
        userProfile = {
          allergies: patient.symptoms || '',
          symptoms: patient.symptoms || '',
          name: patient.name || ''
        };
      }
    }

    // Enhanced fallback responses with user context
    const fallbackResponses = {
      doctor: `I found some allergy specialists near you. Here are a few options:

🏥 **Dr. Sarah Chen** - Allergist & Immunologist
📍 2.3 miles away | ⭐ 4.8/5 rating
📞 Contact: (555) 123-4567

🏥 **Dr. Michael Rodriguez** - Dermatologist 
📍 3.1 miles away | ⭐ 4.6/5 rating
📞 Contact: (555) 234-5678

🏥 **Dr. Emily Johnson** - Allergist & Immunologist
📍 4.5 miles away | ⭐ 4.9/5 rating
📞 Contact: (555) 345-6789

Would you like me to help you schedule an appointment or provide more information about any of these specialists?`,

      allergy: `Based on your profile${userProfile.allergies ? ` showing allergies to: **${userProfile.allergies}**` : ''}, here are my recommendations:

🚨 **Immediate Steps:**
- Always read ingredient labels carefully
- Carry emergency medication (EpiPen) if prescribed
- Inform restaurants about your allergies when dining out

🥗 **Safe Food Alternatives:**
- Use our Food Type scanner to check packaged products
- Consider allergen-free brands and certified products
- Keep a food diary to track reactions

👨‍⚕️ **Medical Advice:**
I recommend consulting with an allergist for personalized treatment. Would you like me to help you find specialists in your area?`,

      emergency: `🚨 **EMERGENCY ALLERGY REACTION PROTOCOL:**

**SEVERE REACTIONS (Anaphylaxis):**
1. 🆘 Call 911 IMMEDIATELY
2. 💉 Use EpiPen if available (inject into thigh)
3. 🏥 Get to emergency room even if symptoms improve
4. 📞 Contact your doctor

**MILD TO MODERATE REACTIONS:**
1. 💊 Take antihistamines (Benadryl)
2. 🚿 Remove/wash off allergen exposure
3. 🧊 Apply cool compress for skin reactions
4. 📱 Monitor symptoms closely

**ALWAYS HAVE READY:**
- Emergency medications
- Emergency contact numbers
- Medical alert bracelet/card

If you're experiencing symptoms NOW, please seek immediate medical attention!`,

      food_safety: `🍽️ **Food Safety for Allergy Management:**

**Reading Labels:**
- Check "Contains" statements
- Look for "may contain" warnings
- Be aware of hidden allergens

**Cross-Contamination Prevention:**
- Use separate cutting boards and utensils
- Clean surfaces thoroughly
- Store allergen-free foods separately

**Dining Out Safely:**
- Call ahead to discuss allergies
- Speak directly with the chef
- Consider carrying allergy cards

Would you like specific guidance for your known allergies: ${userProfile.allergies}?`,

      default: `Hello${userProfile.name ? ` ${userProfile.name}` : ''}! 👋 

I'm your AI Allergy Assistant, here to help with:

🔍 **Allergen Detection** - Scan food ingredients
👨‍⚕️ **Find Specialists** - Locate nearby allergists
🥗 **Dietary Guidance** - Safe food recommendations
🚨 **Emergency Help** - Reaction protocols
📚 **Education** - Understanding allergies

${userProfile.allergies ? `I see you have allergies to: **${userProfile.allergies}**. I'll provide personalized advice based on your profile.` : ''}

How can I assist you today? You can ask about:
- Finding doctors or specialists
- Managing specific allergies
- Emergency procedures
- Food safety tips`
    };

    // Try Hugging Face for enhanced responses
    let response = fallbackResponses.default;
    let aiPowered = false;

    try {
      const context = `User allergies: ${userProfile.allergies}. User message: ${message}`;
      
      const hfResponse = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `As an allergy specialist assistant, respond helpfully to: ${context}`,
          parameters: {
            max_length: 200,
            temperature: 0.7,
            return_full_text: false
          }
        }),
      });

      if (hfResponse.ok) {
        const hfData = await hfResponse.json();
        const aiResponse = hfData.generated_text || hfData[0]?.generated_text;
        
        if (aiResponse && aiResponse.trim()) {
          response = aiResponse.trim();
          aiPowered = true;
        } else {
          // Use pattern matching for better responses
          const lowerMessage = message.toLowerCase();
          
          if (lowerMessage.includes('doctor') || lowerMessage.includes('specialist') || lowerMessage.includes('find')) {
            response = fallbackResponses.doctor;
          } else if (lowerMessage.includes('emergency') || lowerMessage.includes('severe') || lowerMessage.includes('reaction')) {
            response = fallbackResponses.emergency;
          } else if (lowerMessage.includes('food') || lowerMessage.includes('eat') || lowerMessage.includes('safe')) {
            response = fallbackResponses.food_safety;
          } else if (lowerMessage.includes('allerg') || lowerMessage.includes('symptom')) {
            response = fallbackResponses.allergy;
          }
        }
      } else {
        // Use pattern matching fallback
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('doctor') || lowerMessage.includes('specialist')) {
          response = fallbackResponses.doctor;
        } else if (lowerMessage.includes('emergency') || lowerMessage.includes('severe')) {
          response = fallbackResponses.emergency;
        } else if (lowerMessage.includes('food') || lowerMessage.includes('eat')) {
          response = fallbackResponses.food_safety;
        } else if (lowerMessage.includes('allerg') || lowerMessage.includes('react')) {
          response = fallbackResponses.allergy;
        }
      }
    } catch (error) {
      console.error('Hugging Face API error:', error);
      // Use pattern matching fallback
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('doctor') || lowerMessage.includes('specialist')) {
        response = fallbackResponses.doctor;
      } else if (lowerMessage.includes('emergency') || lowerMessage.includes('severe')) {
        response = fallbackResponses.emergency;
      } else if (lowerMessage.includes('food') || lowerMessage.includes('eat')) {
        response = fallbackResponses.food_safety;
      } else if (lowerMessage.includes('allerg') || lowerMessage.includes('react')) {
        response = fallbackResponses.allergy;
      }
    }

    console.log('AI Chatbot response generated for user:', user_id, 'AI powered:', aiPowered);

    return new Response(
      JSON.stringify({
        success: true,
        response,
        ai_powered: aiPowered,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in ai-chatbot function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate response',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})
