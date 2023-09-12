
CREATE POLICY "Only Creators can delete Mind Maps"
ON public.mind_maps
FOR DELETE USING (
  auth.uid() = created_by
);


CREATE POLICY "Creators and Collaborators can update Mind Maps"
ON public.mind_maps
FOR UPDATE USING (
  auth.uid() = created_by
  or
  auth.uid()::text = ANY(collaborators)
);