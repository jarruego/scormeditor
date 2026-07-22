-- =============================================================================
-- SCORMEditor · `folders.updated_at` se queda desactualizado al renombrar
-- (no había trigger que lo tocara). Hace falta para poder ordenar el
-- explorador de carpetas por "última modificación".
-- =============================================================================

create or replace function scormeditor.touch_folder_updated_at()
returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_touch_folder_updated_at
  before update on scormeditor.folders
  for each row execute function scormeditor.touch_folder_updated_at();
