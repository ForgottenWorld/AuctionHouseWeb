import { API_URL } from "./Configuration";

export const getItemListings = async (item, token) => {
    const resp = await fetch(`${API_URL}/listing/listByEnum/${item}?token=${token}`);
    return await resp.json();
}

export const getItemsWithListings = async (token) => {
    const resp = await fetch(`${API_URL}/listing/list?token=${token}`)
    return await resp.json();
};