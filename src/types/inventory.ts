export interface InventoryItem {
    id: string;   // Unique identifier for the item
    name: string; // Name of the item
    quantity: number; // Quantity of the item in stock
    price: number; // Price of the item
    category: string; // Category of the item (e.g., electronics, clothing)
}