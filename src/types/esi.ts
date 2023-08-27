import internal from "stream";

export type Order = {
    duration: number;
    is_buy_order: boolean;
    issued: string;
    location_id: string;
    min_volume: number;
    order_id: number;
    price: number;
    range: string;
    type_id: number;
    volume_remain: number;
    volume_total: number;
};

export type OrderError = {
    error: string;
}

export type OrderHeaders = {
    "Cache-Control": string;
    ETag: string;
    Expires: string;
    "Last-Modified": string;
    "X-Pages": number;
}