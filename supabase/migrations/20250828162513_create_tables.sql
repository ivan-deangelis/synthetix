create type "public"."api_set_status" as enum ('active', 'inactive', 'draft', 'archived');

create type "public"."api_set_visibility" as enum ('public', 'private');

create table "public"."api_sets" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "visibility" api_set_visibility not null default 'private'::api_set_visibility,
    "status" api_set_status not null default 'draft'::api_set_status,
    "user_id" text not null default (auth.jwt() ->> 'sub'::text),
    "subdomain" text,
    "api_secret" text,
    "schema" jsonb not null default '{}'::jsonb,
    "headers" jsonb not null default '{}'::jsonb,
    "created_at" timestamp with time zone default now()
);


alter table "public"."api_sets" enable row level security;

create table "public"."api_sets_data" (
    "id" bigint generated always as identity not null,
    "api_set_id" uuid not null,
    "data" jsonb not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."api_sets_data" enable row level security;

CREATE UNIQUE INDEX api_sets_data_pkey ON public.api_sets_data USING btree (id);

CREATE UNIQUE INDEX api_sets_pkey ON public.api_sets USING btree (id);

CREATE INDEX idx_api_sets_data_api_set_id ON public.api_sets_data USING btree (api_set_id);

CREATE INDEX idx_api_sets_user_id ON public.api_sets USING btree (user_id);

alter table "public"."api_sets" add constraint "api_sets_pkey" PRIMARY KEY using index "api_sets_pkey";

alter table "public"."api_sets_data" add constraint "api_sets_data_pkey" PRIMARY KEY using index "api_sets_data_pkey";

alter table "public"."api_sets_data" add constraint "api_sets_data_api_set_id_fkey" FOREIGN KEY (api_set_id) REFERENCES api_sets(id) ON DELETE CASCADE not valid;

alter table "public"."api_sets_data" validate constraint "api_sets_data_api_set_id_fkey";

grant delete on table "public"."api_sets" to "anon";

grant insert on table "public"."api_sets" to "anon";

grant references on table "public"."api_sets" to "anon";

grant select on table "public"."api_sets" to "anon";

grant trigger on table "public"."api_sets" to "anon";

grant truncate on table "public"."api_sets" to "anon";

grant update on table "public"."api_sets" to "anon";

grant delete on table "public"."api_sets" to "authenticated";

grant insert on table "public"."api_sets" to "authenticated";

grant references on table "public"."api_sets" to "authenticated";

grant select on table "public"."api_sets" to "authenticated";

grant trigger on table "public"."api_sets" to "authenticated";

grant truncate on table "public"."api_sets" to "authenticated";

grant update on table "public"."api_sets" to "authenticated";

grant delete on table "public"."api_sets" to "service_role";

grant insert on table "public"."api_sets" to "service_role";

grant references on table "public"."api_sets" to "service_role";

grant select on table "public"."api_sets" to "service_role";

grant trigger on table "public"."api_sets" to "service_role";

grant truncate on table "public"."api_sets" to "service_role";

grant update on table "public"."api_sets" to "service_role";

grant delete on table "public"."api_sets_data" to "anon";

grant insert on table "public"."api_sets_data" to "anon";

grant references on table "public"."api_sets_data" to "anon";

grant select on table "public"."api_sets_data" to "anon";

grant trigger on table "public"."api_sets_data" to "anon";

grant truncate on table "public"."api_sets_data" to "anon";

grant update on table "public"."api_sets_data" to "anon";

grant delete on table "public"."api_sets_data" to "authenticated";

grant insert on table "public"."api_sets_data" to "authenticated";

grant references on table "public"."api_sets_data" to "authenticated";

grant select on table "public"."api_sets_data" to "authenticated";

grant trigger on table "public"."api_sets_data" to "authenticated";

grant truncate on table "public"."api_sets_data" to "authenticated";

grant update on table "public"."api_sets_data" to "authenticated";

grant delete on table "public"."api_sets_data" to "service_role";

grant insert on table "public"."api_sets_data" to "service_role";

grant references on table "public"."api_sets_data" to "service_role";

grant select on table "public"."api_sets_data" to "service_role";

grant trigger on table "public"."api_sets_data" to "service_role";

grant truncate on table "public"."api_sets_data" to "service_role";

grant update on table "public"."api_sets_data" to "service_role";

create policy "Users can delete own api_sets"
on "public"."api_sets"
as permissive
for delete
to authenticated
using ((( SELECT (auth.jwt() ->> 'sub'::text)) = user_id));


create policy "Users can insert own api_sets"
on "public"."api_sets"
as permissive
for insert
to authenticated
with check ((( SELECT (auth.jwt() ->> 'sub'::text)) = user_id));


create policy "Users can update own api_sets"
on "public"."api_sets"
as permissive
for update
to authenticated
using ((( SELECT (auth.jwt() ->> 'sub'::text)) = user_id))
with check ((( SELECT (auth.jwt() ->> 'sub'::text)) = user_id));


create policy "Users can view own api_sets"
on "public"."api_sets"
as permissive
for select
to authenticated
using ((( SELECT (auth.jwt() ->> 'sub'::text)) = user_id));


create policy "Users can delete own api_sets_data"
on "public"."api_sets_data"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM api_sets s
  WHERE ((s.id = api_sets_data.api_set_id) AND (s.user_id = (auth.jwt() ->> 'sub'::text))))));


create policy "Users can insert own api_sets_data"
on "public"."api_sets_data"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM api_sets s
  WHERE ((s.id = api_sets_data.api_set_id) AND (s.user_id = (auth.jwt() ->> 'sub'::text))))));


create policy "Users can update own api_sets_data"
on "public"."api_sets_data"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM api_sets s
  WHERE ((s.id = api_sets_data.api_set_id) AND (s.user_id = (auth.jwt() ->> 'sub'::text))))))
with check ((EXISTS ( SELECT 1
   FROM api_sets s
  WHERE ((s.id = api_sets_data.api_set_id) AND (s.user_id = (auth.jwt() ->> 'sub'::text))))));


create policy "Users can view own api_sets_data"
on "public"."api_sets_data"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM api_sets s
  WHERE ((s.id = api_sets_data.api_set_id) AND (s.user_id = (auth.jwt() ->> 'sub'::text))))));



