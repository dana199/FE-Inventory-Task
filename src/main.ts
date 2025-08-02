import { InsufficientStockError, ItemNotFoundError } from "./errors/InventoryErrors";
import { InventoryManager } from "./managers/InventoryManager";

async function initializeInventory() {
    //Initialize 
    const manager = await InventoryManager.create();
    console.log("Inventory Manager initialized:", manager);

    try {
        await manager.updateQuantity('2', +5);
        const afterPlus = await manager.getItem('2');
        console.log('After +5:', afterPlus.quantity); 
        await manager.updateQuantity('2', -11);
    } catch (error) {
        if (error instanceof ItemNotFoundError || error instanceof InsufficientStockError) {
            console.error(' Error:', error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}

initializeInventory();