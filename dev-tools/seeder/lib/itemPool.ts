export type InventoryCategory =
  | "very_short_term"
  | "short_term"
  | "mid_term"
  | "long_term";

export interface PoolItem {
  name: string;
  category: InventoryCategory;
  unit: string;
  quantityRange: [number, number];
  // Typical shelf life once purchased/cooked, in days.
  shelfLifeDaysRange: [number, number];
}

// Hand-picked so that any random subset still makes sense together for an
// Indian-household-style recipe (staples + aromatics + a protein + veggies).
export const ITEM_POOL: PoolItem[] = [
  // very_short_term — a day or two
  { name: "Milk", category: "very_short_term", unit: "litre", quantityRange: [0.5, 1], shelfLifeDaysRange: [1, 2] },
  { name: "Curd", category: "very_short_term", unit: "kg", quantityRange: [0.25, 0.5], shelfLifeDaysRange: [1, 3] },
  { name: "Paneer", category: "very_short_term", unit: "kg", quantityRange: [0.2, 0.4], shelfLifeDaysRange: [1, 3] },
  { name: "Fresh Cream", category: "very_short_term", unit: "ml", quantityRange: [100, 200], shelfLifeDaysRange: [1, 2] },
  { name: "Boneless Chicken", category: "very_short_term", unit: "kg", quantityRange: [0.3, 0.8], shelfLifeDaysRange: [1, 2] },
  { name: "Fish Fillet", category: "very_short_term", unit: "kg", quantityRange: [0.3, 0.6], shelfLifeDaysRange: [1, 2] },
  { name: "Spinach", category: "very_short_term", unit: "bunch", quantityRange: [1, 2], shelfLifeDaysRange: [1, 3] },
  { name: "Coriander Leaves", category: "very_short_term", unit: "bunch", quantityRange: [1, 1], shelfLifeDaysRange: [2, 4] },

  // short_term — cooked/prepped, a few days
  { name: "Cooked Dal", category: "short_term", unit: "bowl", quantityRange: [1, 2], shelfLifeDaysRange: [2, 4] },
  { name: "Mixed Veg Curry", category: "short_term", unit: "bowl", quantityRange: [1, 2], shelfLifeDaysRange: [2, 3] },
  { name: "Leftover Rice", category: "short_term", unit: "bowl", quantityRange: [1, 2], shelfLifeDaysRange: [2, 3] },
  { name: "Boiled Eggs", category: "short_term", unit: "pcs", quantityRange: [2, 6], shelfLifeDaysRange: [3, 5] },
  { name: "Chapati Dough", category: "short_term", unit: "kg", quantityRange: [0.3, 0.6], shelfLifeDaysRange: [2, 3] },
  { name: "Chicken Curry", category: "short_term", unit: "bowl", quantityRange: [1, 2], shelfLifeDaysRange: [2, 3] },

  // mid_term — a week or two
  { name: "Onion", category: "mid_term", unit: "kg", quantityRange: [1, 2], shelfLifeDaysRange: [10, 20] },
  { name: "Tomato", category: "mid_term", unit: "kg", quantityRange: [0.5, 1.5], shelfLifeDaysRange: [7, 12] },
  { name: "Ginger-Garlic Paste", category: "mid_term", unit: "kg", quantityRange: [0.1, 0.3], shelfLifeDaysRange: [10, 21] },
  { name: "Capsicum", category: "mid_term", unit: "kg", quantityRange: [0.3, 0.6], shelfLifeDaysRange: [7, 10] },
  { name: "Carrot", category: "mid_term", unit: "kg", quantityRange: [0.3, 0.6], shelfLifeDaysRange: [10, 15] },
  { name: "Green Chili", category: "mid_term", unit: "kg", quantityRange: [0.05, 0.15], shelfLifeDaysRange: [7, 14] },
  { name: "Potato", category: "mid_term", unit: "kg", quantityRange: [1, 2], shelfLifeDaysRange: [14, 21] },
  { name: "Cucumber", category: "mid_term", unit: "kg", quantityRange: [0.3, 0.6], shelfLifeDaysRange: [7, 10] },
  { name: "Cabbage", category: "mid_term", unit: "pcs", quantityRange: [1, 1], shelfLifeDaysRange: [10, 15] },

  // long_term — weeks to months
  { name: "Rice", category: "long_term", unit: "kg", quantityRange: [2, 5], shelfLifeDaysRange: [90, 180] },
  { name: "Wheat Flour", category: "long_term", unit: "kg", quantityRange: [2, 5], shelfLifeDaysRange: [60, 120] },
  { name: "Toor Dal", category: "long_term", unit: "kg", quantityRange: [1, 2], shelfLifeDaysRange: [90, 180] },
  { name: "Moong Dal", category: "long_term", unit: "kg", quantityRange: [1, 2], shelfLifeDaysRange: [90, 180] },
  { name: "Chana", category: "long_term", unit: "kg", quantityRange: [0.5, 1], shelfLifeDaysRange: [90, 180] },
  { name: "Sugar", category: "long_term", unit: "kg", quantityRange: [1, 2], shelfLifeDaysRange: [180, 365] },
  { name: "Salt", category: "long_term", unit: "kg", quantityRange: [1, 1], shelfLifeDaysRange: [365, 730] },
  { name: "Turmeric Powder", category: "long_term", unit: "kg", quantityRange: [0.1, 0.2], shelfLifeDaysRange: [180, 365] },
  { name: "Cumin Seeds", category: "long_term", unit: "kg", quantityRange: [0.05, 0.15], shelfLifeDaysRange: [180, 365] },
  { name: "Mustard Oil", category: "long_term", unit: "litre", quantityRange: [0.5, 1], shelfLifeDaysRange: [120, 240] },
  { name: "Cooking Oil", category: "long_term", unit: "litre", quantityRange: [0.5, 1], shelfLifeDaysRange: [120, 240] },
  { name: "Red Chili Powder", category: "long_term", unit: "kg", quantityRange: [0.1, 0.2], shelfLifeDaysRange: [180, 365] },
  { name: "Garam Masala", category: "long_term", unit: "kg", quantityRange: [0.05, 0.1], shelfLifeDaysRange: [180, 365] },
  { name: "Tea Leaves", category: "long_term", unit: "kg", quantityRange: [0.1, 0.25], shelfLifeDaysRange: [180, 365] },
];
