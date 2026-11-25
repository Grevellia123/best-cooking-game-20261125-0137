// Sizzle & Serve — recipes and ingredient definitions.
// Every dish is a set of ingredients; the plate must hold exactly that set.

export const INGREDIENTS = [
  { id: 'bun',     name: 'Bun',     key: '1', color: '#e8b06a', dark: '#b97f3e' },
  { id: 'patty',   name: 'Patty',   key: '2', color: '#8a5a33', dark: '#5f3a1e' },
  { id: 'lettuce', name: 'Lettuce', key: '3', color: '#7dc24a', dark: '#4d8a2a' },
  { id: 'tomato',  name: 'Tomato',  key: '4', color: '#e84a3f', dark: '#b02a22' },
  { id: 'cheese',  name: 'Cheese',  key: '5', color: '#ffc93c', dark: '#d99e12' },
  { id: 'pasta',   name: 'Pasta',   key: '6', color: '#f2d06b', dark: '#c9a13a' },
  { id: 'sauce',   name: 'Sauce',   key: '7', color: '#c0392b', dark: '#8e2318' },
];

export const RECIPES = [
  { id: 'burger',  name: 'Classic Burger', price: 12, needs: ['bun', 'patty', 'lettuce'] },
  { id: 'cheese',  name: 'Cheese Burger',  price: 15, needs: ['bun', 'patty', 'cheese', 'tomato'] },
  { id: 'salad',   name: 'Garden Salad',   price: 10, needs: ['lettuce', 'tomato', 'cheese'] },
  { id: 'pasta',   name: 'Pasta Marinara', price: 14, needs: ['pasta', 'tomato', 'sauce'] },
  { id: 'deluxe',  name: 'Deluxe Stack',   price: 20, needs: ['bun', 'patty', 'cheese', 'lettuce', 'tomato'] },
];

export function ingredientById(id) {
  return INGREDIENTS.find((i) => i.id === id) || null;
}

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id) || null;
}

// True when the plate (a multiset of ingredient ids) is exactly the recipe.
export function plateMatchesRecipe(plate, recipe) {
  if (plate.length !== recipe.needs.length) return false;
  const have = [...plate].sort().join(',');
  const want = [...recipe.needs].sort().join(',');
  return have === want;
}

// How many of the recipe's ingredients are already on the plate.
export function plateProgress(plate, recipe) {
  const remaining = [...recipe.needs];
  let hit = 0;
  for (const item of plate) {
    const at = remaining.indexOf(item);
    if (at !== -1) { remaining.splice(at, 1); hit += 1; }
  }
  return hit;
}
