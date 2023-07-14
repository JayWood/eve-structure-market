export type ForQuery = {
    bid: boolean;
    types: Array<number>;
    regions: Array<number>;
    systems: any;
    hours: number;
    minq: number;
}

export type Order = {
    forQuery: ForQuery;
    volume: number;
    wavg: number;
    avg: number;
    variance: number;
    stdDev: number;
    median: number;
    fivePercent: number;
    max: number;
    min: number;
    highToLow: boolean;
    generated: number;
}

export type ItemCollection = {
    buy: Order;
    sell: Order;
}

export type QueryResponse = Array<ItemCollection>;