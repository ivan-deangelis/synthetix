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


