import { API_URL } from "./consts";

export const checkToken = async (token) => {
    const resp = await fetch(`${API_URL}/session/check/${token}`);
    const parsed = await resp.json();
    const status = parsed.status;
    return status === 1;
}

export const getItemListings = async (item, token) => {
    const resp = await fetch(`${API_URL}/listing/listByEnum/${item}?token=${token}`);
    return await resp.json();
}

export const getItemsWithListings = async (token) => {
    const resp = await fetch(`${API_URL}/listing/list?token=${token}`)
    return await resp.json();
};