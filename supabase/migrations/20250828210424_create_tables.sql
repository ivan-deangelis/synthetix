create type "public"."api_set_data_status" as enum ('pending', 'processing', 'completed', 'failed');

alter table "public"."api_sets_data" add column "status" api_set_data_status not null default 'pending'::api_set_data_status;


