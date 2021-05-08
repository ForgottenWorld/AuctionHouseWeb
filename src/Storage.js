export const saveUsername = (username) => localStorage.setItem("mkt_mc_username", username);

export const loadUsername = () => localStorage.getItem("mkt_mc_username");

export const saveToken = (token) => localStorage.setItem("mkt_mc_token", token);

export const loadToken = () => localStorage.getItem("mkt_mc_token");