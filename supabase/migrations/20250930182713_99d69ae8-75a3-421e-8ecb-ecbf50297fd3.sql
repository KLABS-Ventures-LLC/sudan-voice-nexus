-- Fix function security by adding search_path

-- Update update_votes_count function
CREATE OR REPLACE FUNCTION public.update_votes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.poll_options
    SET votes_count = votes_count + 1
    WHERE id = NEW.option_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.poll_options
    SET votes_count = votes_count - 1
    WHERE id = OLD.option_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.poll_options
    SET votes_count = votes_count - 1
    WHERE id = OLD.option_id;
    UPDATE public.poll_options
    SET votes_count = votes_count + 1
    WHERE id = NEW.option_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- Update update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;