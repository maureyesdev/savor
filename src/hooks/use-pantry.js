// TODO: NEED TO ADD A LIMIT OF 20 ITEMS
export function usePantry() {
  const SAVOR_PANTRY_KEY = 'savor:pantry';

  const getPantryItems = () => {
    try {
      return JSON.parse(localStorage.getItem(SAVOR_PANTRY_KEY)) || [];
    } catch (error) {
      console.error('Error parsing pantry items from localStorage:', error);
      return [];
    }
  };

  const savePantryItems = (items) => {
    localStorage.setItem(SAVOR_PANTRY_KEY, JSON.stringify(items));
  };

  const addPantryItem = (item) => {
    const clean = (item || '').trim().toLowerCase();
    if (!clean) return;
    const items = getPantryItems();
    if (items.includes(clean)) return; //
    savePantryItems([...items, clean]);
  };

  const removePantryItem = (itemName) => {
    const items = getPantryItems();
    const updatedItems = items.filter((i) => i !== itemName.toLowerCase());
    savePantryItems(updatedItems);
  };

  return { getPantryItems, addPantryItem, removePantryItem };
}
