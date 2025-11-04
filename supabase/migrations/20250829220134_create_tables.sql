create table "public"."ai_data" (
    "id" uuid not null default gen_random_uuid(),
    "api_set_id" uuid not null,
    "api_set_data_id" bigint not null,
    "created_by" text not null default (auth.jwt() ->> 'sub'::text),
    "field_name" text not null,
    "ai_prompt" text not null,
    "ai_constraints" text,
    "status" text not null,
    "result" jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."ai_data" enable row level security;

CREATE UNIQUE INDEX ai_data_pkey ON public.ai_data USING btree (id);

CREATE INDEX idx_ai_data_api_set_data_id ON public.ai_data USING btree (api_set_data_id);

CREATE INDEX idx_ai_data_api_set_id ON public.ai_data USING btree (api_set_id);

CREATE INDEX idx_ai_data_created_by ON public.ai_data USING btree (created_by);

alter table "public"."ai_data" add constraint "ai_data_pkey" PRIMARY KEY using index "ai_data_pkey";

alter table "public"."ai_data" add constraint "ai_data_api_set_data_id_fkey" FOREIGN KEY (api_set_data_id) REFERENCES api_sets_data(id) not valid;

alter table "public"."ai_data" validate constraint "ai_data_api_set_data_id_fkey";

alter table "public"."ai_data" add constraint "ai_data_api_set_id_fkey" FOREIGN KEY (api_set_id) REFERENCES api_sets(id) not valid;

alter table "public"."ai_data" validate constraint "ai_data_api_set_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.merge_update_jsonb(table_name text, column_name text, row_id integer, object jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
declare
  target jsonb;
begin
  execute format('select %I from %I WHERE id = %L', column_name, table_name, row_id) into target;
  
  target := merge_update_jsonb(target, '{}', object);

  execute format('update %I set %I = %L::jsonb where id = %L', table_name, column_name, target::text, row_id);

  return target;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.merge_update_jsonb(target jsonb, path text[], object jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
declare
  i int;
  key text;
  value jsonb;
begin
  case jsonb_typeof(object) -- object, array, string, number, boolean, and null
    when 'object' then
      
      if jsonb_typeof(target #> path) <> 'object' or target #> path is null then
        target := jsonb_set(target, path, '{}', true);
      end if;

      for key, value in select * from jsonb_each(object) loop
        target := merge_update_jsonb(target, array_append(path, key), value); 
      end loop;
    when 'array' then
      if jsonb_typeof(target #> path) <> 'array' or target #> path is null then
        target := jsonb_set(target, path, '[]', true);
      end if;

      i := 0;

      for value in select * from jsonb_array_elements(object) loop
        target := merge_update_jsonb(target, array_append(path, i::text), value);
        i := i + 1;
      end loop;
    else
      target := jsonb_set(target, path, object, true);
  end case;
  
  return target;
end;
$function$
;

grant delete on table "public"."ai_data" to "anon";

grant insert on table "public"."ai_data" to "anon";

grant references on table "public"."ai_data" to "anon";

grant select on table "public"."ai_data" to "anon";

grant trigger on table "public"."ai_data" to "anon";

grant truncate on table "public"."ai_data" to "anon";

grant update on table "public"."ai_data" to "anon";

grant delete on table "public"."ai_data" to "authenticated";

grant insert on table "public"."ai_data" to "authenticated";

grant references on table "public"."ai_data" to "authenticated";

grant select on table "public"."ai_data" to "authenticated";

grant trigger on table "public"."ai_data" to "authenticated";

grant truncate on table "public"."ai_data" to "authenticated";

grant update on table "public"."ai_data" to "authenticated";

grant delete on table "public"."ai_data" to "service_role";

grant insert on table "public"."ai_data" to "service_role";

grant references on table "public"."ai_data" to "service_role";

grant select on table "public"."ai_data" to "service_role";

grant trigger on table "public"."ai_data" to "service_role";

grant truncate on table "public"."ai_data" to "service_role";

grant update on table "public"."ai_data" to "service_role";

create policy "Users can delete own ai_data"
on "public"."ai_data"
as permissive
for delete
to authenticated
using ((( SELECT (auth.jwt() ->> 'sub'::text)) = created_by));


create policy "Users can insert own ai_data"
on "public"."ai_data"
as permissive
for insert
to authenticated
with check ((( SELECT (auth.jwt() ->> 'sub'::text)) = created_by));


create policy "Users can update own ai_data"
on "public"."ai_data"
as permissive
for update
to authenticated
using ((( SELECT (auth.jwt() ->> 'sub'::text)) = created_by))
with check ((( SELECT (auth.jwt() ->> 'sub'::text)) = created_by));


create policy "Users can view own ai_data"
on "public"."ai_data"
as permissive
for select
to authenticated
using (true);



