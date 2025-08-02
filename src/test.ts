import test from "node:test";
import { InventoryManager } from "./managers/InventoryManager";

async function testCSVImport() {
    const manager = await InventoryManager.create();
    const report = await manager.loadFromCSV('C:\\Users\\User\\Documents\\inventory-task\\src\\data\\inventory.csv');

    console.log("Loaded Items:");
    console.table(report.loaded);

    console.log("Failed Rows:");
    for (const { row, error } of report.failed) {
        console.log("Row:", row);
        console.log("Error:", error.message);
    }
}
 testCSVImport();

async function testExport() {
    const manager = await InventoryManager.create();

    await manager.loadFromCSV('C:\\Users\\User\\Documents\\inventory-task\\src\\data\\inventory.csv');

    await manager.exportToCSV('C:\\Users\\User\\Documents\\inventory-task\\src\\data\\exported_inventory.csv');

    console.log('Exported to exported_inventory.csv');
}
testExport();