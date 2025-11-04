drop policy "Users can view own ai_data" on "public"."ai_data";

create policy "Users can view own ai_data"
on "public"."ai_data"
as permissive
for select
to authenticated, anon
using (true);



