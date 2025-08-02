export class ItemNotFoundError extends Error {
    constructor(id: string) {
        super(`Item with ID ${id} not found`);
        this.name = 'ItemNotFoundError';
    }
}

export class InsufficientStockError extends Error {
    constructor(id: string, current: number, requested: number) {
        super(
            `Cannot update item ${id}: current stock ${current}, attempted change ${requested}`
        );
        this.name = 'InsufficientStockError';
    }
}

export class InvalidItemError extends Error {
    constructor(reason: string) {
        super(`Invalid item: ${reason}`);
        this.name = 'InvalidItemError';
    }
}

export class DuplicateIdError extends Error {
    constructor(id: string) {
        super(`Duplicate ID found: ${id}`);
        this.name = 'DuplicateIdError';
    }
}