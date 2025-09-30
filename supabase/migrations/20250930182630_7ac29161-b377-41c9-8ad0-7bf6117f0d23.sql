-- Add approval fields to polls table
ALTER TABLE public.polls
ADD COLUMN approved BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN approved_by UUID REFERENCES public.profiles(id);

-- Update existing polls to be approved by default (backward compatibility)
UPDATE public.polls SET approved = true WHERE approved = false;

-- Update RLS policy for viewing polls to require approval
DROP POLICY IF EXISTS "Anyone can view active polls" ON public.polls;
CREATE POLICY "Anyone can view approved active polls"
ON public.polls
FOR SELECT
USING ((is_active = true AND approved = true) OR user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Create policy for admins to approve polls
CREATE POLICY "Admins can update any poll"
ON public.polls
FOR UPDATE
USING (public.is_admin(auth.uid()));