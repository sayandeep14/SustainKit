-- Consume only requested quantities when a recipe is cooked. The operation is
-- transactional, so recipe history and inventory cannot get out of sync.
create or replace function record_cooked_recipe(
  p_household_id uuid,
  p_meal_slot meal_slot,
  p_recipe_name text,
  p_recipe_json jsonb,
  p_items_used jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  item_id uuid;
  amount numeric;
  available numeric;
  remaining numeric;
begin
  if jsonb_typeof(p_items_used) <> 'array' then
    raise exception 'items_used must be a JSON array';
  end if;

  for item in select value from jsonb_array_elements(p_items_used) loop
    begin
      item_id := (item->>'inventory_item_id')::uuid;
      amount := (item->>'quantity_used')::numeric;
    exception when others then
      raise exception 'Each inventory usage must contain a valid id and numeric quantity';
    end;

    if amount is null or amount <= 0 then
      raise exception 'Inventory usage quantities must be greater than zero';
    end if;

    select quantity into available
    from inventory_items
    where id = item_id
      and household_id = p_household_id
      and status = 'active'
    for update;

    if not found then
      raise exception 'Inventory item % is not active or does not belong to this household', item_id;
    end if;

    remaining := available - amount;
    if remaining < 0 then
      raise exception 'Not enough inventory for item % (available %, requested %)', item_id, available, amount;
    end if;

    update inventory_items
    set quantity = remaining,
        status = case when remaining = 0 then 'consumed'::inventory_status else 'active'::inventory_status end,
        updated_at = now()
    where id = item_id;
  end loop;

  insert into recipe_history (
    household_id, meal_slot, recipe_name, recipe_json, items_used
  ) values (
    p_household_id, p_meal_slot, p_recipe_name, p_recipe_json, p_items_used
  );
end;
$$;
