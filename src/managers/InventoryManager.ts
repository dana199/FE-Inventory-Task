import csvParser from "csv-parser";
import { DuplicateIdError, InsufficientStockError, InvalidItemError, ItemNotFoundError } from "../errors/InventoryErrors";
import { InventoryItem } from "../types/inventory";
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';

export class InventoryManager {
    #items: InventoryItem[] = []; //private field to store items
    #isInitialized: boolean = false; //private field to check if the manager is initialized
    #queue: (() => void)[] = []; //private field to store queued operations

    private constructor() { }

    static async create() {
        const manager = new InventoryManager();
        await manager.#loadInitialData();
        manager.#isInitialized = true;
        manager.#queue.forEach((operation) => operation());
        manager.#queue = []; // Clear the queue after processing
        return manager;
    }

    async #loadInitialData() {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate async data loading
        this.#items = [
            { id: "10", name: "Laptop", quantity: 5, price: 1200, category: "electronics" },
            { id: "11", name: "Office Chair", quantity: 8, price: 150, category: "furniture" },
            { id: "12", name: "Notebook", quantity: 20, price: 5, category: "office" },
        ];
    }

    async #ensureInitialized() {
        if (!this.#isInitialized) {
            await new Promise<void>((resolve) => this.#queue.push(resolve));
        }
    }

    async getItem(id: string): Promise<InventoryItem> {
        await this.#ensureInitialized();

        const item = this.#items.find((i) => i.id === id);
        if (!item) {
            throw new ItemNotFoundError(id);
        }

        return item;
    }

    async updateQuantity(id: string, delta: number): Promise<void> {
        await this.#ensureInitialized();

        const item = this.#items.find((i) => i.id === id);
        if (!item) {
            throw new ItemNotFoundError(id);
        }

        const newQuantity = item.quantity + delta;

        if (newQuantity < 0) {
            throw new InsufficientStockError(id, item.quantity, delta);
        }

        item.quantity = newQuantity;
    }

    async getItemsByCategory(category: string): Promise<InventoryItem[]> {
        await this.#ensureInitialized();

        return this.#items.filter((item) => item.category === category);
    }

    async calculateTotalValue(): Promise<number> {
        await this.#ensureInitialized();

        return this.#items.reduce((total, item) => total + item.price * item.quantity, 0);
    }

    async #_validateItem(item: any): Promise<void> {
        const requiredFields = ['id', 'name', 'quantity', 'price', 'category'];

        for (const field of requiredFields) {
            if (!(field in item)) {
                throw new InvalidItemError(`Missing required field: ${field}`);
            }
        }

        if (typeof item.quantity !== 'number' || item.quantity < 0) {
            throw new InvalidItemError(`Invalid quantity: ${item.quantity}`);
        }

        if (typeof item.price !== 'number' || item.price < 0) {
            throw new InvalidItemError(`Invalid price: ${item.price}`);
        }

        if (!['electronics', 'furniture', 'office'].includes(item.category)) {
            throw new InvalidItemError(`Invalid category: ${item.category}`);
        }

        const isDuplicate = this.#items.some((i) => i.id === item.id);
        if (isDuplicate) {
            throw new DuplicateIdError(item.id);
        }
    }

    async loadFromCSV(path: string): Promise<{ loaded: InventoryItem[]; failed: { row: any; error: Error }[] }> {
        await this.#ensureInitialized();

        const loaded: InventoryItem[] = [];
        const failed: { row: any; error: Error }[] = [];

        return new Promise((resolve, reject) => {
            const stream = fs.createReadStream(path)
                .pipe(csvParser())
                .on('data', async (row) => {
                    // Convert fields to correct types (quantity, price)
                    try {
                        const item = {
                            id: row.id,
                            name: row.name,
                            quantity: Number(row.quantity),
                            price: Number(row.price),
                            category: row.category,
                        };

                        await this.#_validateItem(item);

                        this.#items.push(item);
                        loaded.push(item);
                    } catch (error) {
                        failed.push({ row, error: error instanceof Error ? error : new Error(String(error)) });
                    }
                })
                .on('end', () => {
                    resolve({ loaded, failed });
                })
                .on('error', (error) => {
                    reject(error);
                });
        });
    }

    async exportToCSV(path: string): Promise<void> {
        await this.#ensureInitialized();

        const headers = ['id', 'name', 'quantity', 'price', 'category'];
        const lines = [
            headers.join(','), // Header line
            ...this.#items.map(item =>
                [
                    item.id,
                    `"${item.name.replace(/"/g, '""')}"`,
                    item.quantity,
                    item.price,
                    item.category,
                ].join(',')
            )
        ].join('\n');

        await fsPromises.writeFile(path, lines, 'utf8');
    }
}  
