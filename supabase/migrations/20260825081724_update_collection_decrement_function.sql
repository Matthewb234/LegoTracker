CREATE OR REPLACE FUNCTION "public"."decrement_in_collection"("p_set_id" "text")
RETURNS "public"."collection_items"
LANGUAGE "plpgsql"
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
set_quantity integer;
  result public.collection_items;
BEGIN
SELECT quantity INTO set_quantity
FROM public.collection_items
WHERE user_id = auth.uid() AND set_id = p_set_id;

IF set_quantity IS NULL THEN
    RAISE EXCEPTION 'Set not in collection';
END IF;

  IF set_quantity > 1 THEN
UPDATE public.collection_items
SET quantity = quantity - 1
WHERE user_id = auth.uid() AND set_id = p_set_id
    RETURNING * INTO result;

RETURN result;
ELSE
DELETE FROM public.collection_items
WHERE user_id = auth.uid() AND set_id = p_set_id;

RETURN NULL;
END IF;
END;
$$;