import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { Database } from '../_shared/database.types.ts';

export default {
  fetch: withSupabase<Database>({ auth: ["user"] }, async (req, ctx) => {
    try {
      const { setNum } = await req.json();
      if (!setNum) return Response.json({ error: 'setNum is required' }, { status: 400 })
      
      const { data, error } = await ctx.supabase.rpc('add_to_collection', {p_set_id: setNum});
      if (error) {
        if (error.code === '23503') {
          return Response.json(
            { error: 'Set not found in catalog. Look it up first.' },
            { status: 400 }
          );
        }
        throw error;
      }
      if (data) return Response.json({ data });
      return Response.json({ error: 'Unexpected empty result' }, { status: 500 });
    } catch (err) {
        return Response.json({ error: String(err) }, { status: 500 })
    }
  }),
};