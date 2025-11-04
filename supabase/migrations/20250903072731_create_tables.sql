alter table "public"."ai_data" drop constraint "ai_data_api_set_data_id_fkey";

drop index if exists "public"."idx_ai_data_api_set_data_id";

alter table "public"."api_sets" alter column "status" drop default;

alter type "public"."api_set_status" rename to "api_set_status__old_version_to_be_dropped";

create type "public"."api_set_status" as enum ('active', 'inactive', 'draft', 'archived', 'processing');

alter table "public"."api_sets" alter column status type "public"."api_set_status" using status::text::"public"."api_set_status";

alter table "public"."api_sets" alter column "status" set default 'draft'::api_set_status;

drop type "public"."api_set_status__old_version_to_be_dropped";

alter table "public"."ai_data" drop column "api_set_data_id";


