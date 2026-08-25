import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { Database } from '../_shared/database.types.ts';
import { createClient } from '@supabase/supabase-js'


export default {
  fetch: withSupabase<Database>({ auth: ["user"] }, async (req, ctx) => {
    try {
      const { setNum } = await req.json();
      if (!setNum) return Response.json({ error: 'setNum is required' }, { status: 400 });
      const normalizedSetNum = String(setNum).includes('-') ? String(setNum) : `${setNum}-1`;
      const { data, error } = await ctx.supabase.from('sets').select('*').eq('id', normalizedSetNum).maybeSingle();
      if (error) {
        throw error
      }
      
      if (!data) {
        const set = await fetch(
          `https://rebrickable.com/api/v3/lego/sets/${normalizedSetNum}/`, {
          headers: {
            Authorization: `key ${Deno.env.get('REBRICKABLE_KEY')}`
          }
        })
        if (!set.ok) {
          return Response.json({ error: set.statusText }, { status: set.status })
        }
        const setData = await set.json();

        const theme = await fetch(
          `https://rebrickable.com/api/v3/lego/themes/${setData['theme_id']}/`, {
          headers: {
            Authorization: `key ${Deno.env.get('REBRICKABLE_KEY')}`
          }
        })
        if (!theme.ok) {
          return Response.json({ error: theme.statusText }, { status: theme.status })
        }
        const themeData = await theme.json();

        const SUPABASE_SECRET_KEYS = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')!)
        const supabaseAdmin = createClient<Database>(
          Deno.env.get('SUPABASE_URL')!,
          SUPABASE_SECRET_KEYS['default']
        )
        const { data: insertedData, error: insertError} = await supabaseAdmin.from('sets').upsert(
        {
          id: normalizedSetNum,
          name: setData['name'],
          theme: themeData['name'],
          piece_count: setData['num_parts'],
          year_released: setData['year'],
          image_url: setData['set_img_url']
        },
        {
          onConflict: 'id'
        }).select('*').single();
        if (insertError) {
          throw insertError
        }
        return Response.json({
          data: insertedData
        });
      }
      return Response.json({
        data
      });
    } catch (err) {
      return Response.json({ error: String(err) }, { status: 500 })
    }
  })
};
