import { getActiveInventory, groupByCategory, daysUntil } from "@/lib/inventory";
import { INVENTORY_CATEGORIES } from "@/types";
import {
  addInventoryItem,
  deleteInventoryItem,
  setInventoryItemStatus,
} from "./actions";

export const dynamic = "force-dynamic";

function expiryLabel(days: number | null) {
  if (days === null) return null;
  if (days < 0) return { text: `expired ${Math.abs(days)}d ago`, tone: "text-red-600" };
  if (days === 0) return { text: "expires today", tone: "text-red-600" };
  if (days <= 2) return { text: `expires in ${days}d`, tone: "text-amber-600" };
  return { text: `expires in ${days}d`, tone: "text-zinc-500" };
}

export default async function InventoryPage() {
  const items = await getActiveInventory();
  const grouped = groupByCategory(items);

  return (
    <div className="mx-auto max-w-3xl w-full px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Track what&apos;s in the kitchen, grouped by how long it keeps.
      </p>

      <form
        action={addInventoryItem}
        className="mt-8 grid grid-cols-2 gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:grid-cols-5"
      >
        <input
          name="name"
          placeholder="Item name"
          required
          className="col-span-2 rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 sm:col-span-1"
        />
        <select
          name="category"
          required
          defaultValue=""
          className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="" disabled>
            Category
          </option>
          {INVENTORY_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          name="quantity"
          type="number"
          min="0"
          step="0.1"
          defaultValue={1}
          className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          name="unit"
          placeholder="unit (kg, pcs...)"
          defaultValue="unit"
          className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          name="expiry_date"
          type="date"
          className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          className="col-span-2 rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 sm:col-span-5"
        >
          Add item
        </button>
      </form>

      <div className="mt-10 space-y-8">
        {INVENTORY_CATEGORIES.map((cat) => {
          const catItems = grouped[cat.value];
          return (
            <section key={cat.value}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                {cat.label}
              </h2>
              <p className="text-xs text-zinc-400">{cat.hint}</p>
              {catItems.length === 0 ? (
                <p className="mt-2 text-sm text-zinc-400">No items.</p>
              ) : (
                <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
                  {catItems.map((item) => {
                    const label = expiryLabel(daysUntil(item.expiry_date));
                    return (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {item.name}{" "}
                            <span className="font-normal text-zinc-400">
                              ({item.quantity} {item.unit})
                            </span>
                          </p>
                          {label && (
                            <p className={`text-xs ${label.tone}`}>{label.text}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <form
                            action={setInventoryItemStatus.bind(
                              null,
                              item.id,
                              "consumed"
                            )}
                          >
                            <button
                              type="submit"
                              className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                            >
                              Used up
                            </button>
                          </form>
                          <form action={deleteInventoryItem.bind(null, item.id)}>
                            <button
                              type="submit"
                              className="rounded border border-zinc-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-zinc-700 dark:hover:bg-red-950/30"
                            >
                              Remove
                            </button>
                          </form>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
