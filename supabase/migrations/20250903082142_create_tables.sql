drop policy "Users can view all api sets" on "public"."api_sets";

create policy "Users can view all api sets"
on "public"."api_sets"
as permissive
for select
to authenticated, anon
using (true);



