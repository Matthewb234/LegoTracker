CREATE OR REPLACE FUNCTION "public"."add_to_collection"("p_set_id" "text")
RETURNS "public"."collection_items"
LANGUAGE "plpgsql"
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  result public.collection_items;
BEGIN
  INSERT INTO public.collection_items (user_id, set_id, quantity)
  VALUES (auth.uid(), p_set_id, 1)
  ON CONFLICT (user_id, set_id)
  DO UPDATE SET quantity = collection_items.quantity + 1
  RETURNING * INTO result;

  RETURN result;
END;
$$;