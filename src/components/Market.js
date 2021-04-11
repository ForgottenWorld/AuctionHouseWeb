import { useEffect, useState } from "react";
import "../Loader.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowCircleLeft, faSearch } from "@fortawesome/free-solid-svg-icons";
import { PurchaseConfirmation } from "./PurchaseConfirmation";
import { UsernamePrompt } from "./UsernamePrompt";
import { Item } from "./Item";
import { Listing } from "./Listing";

export default function Market() {

    const [listings, setListings] = useState(null);
    const [itemsWithListings, setItemsWithListings] = useState(null);
    const [currentItem, setCurrentItem] = useState(null);
    const [buyingItem, setBuyingItem] = useState(null);
    const [searchNeedle, setSearchNeedle] = useState("");
    const [searchTokens, setSearchTokens] = useState([]);
    const [username, setUsername] = useState(null);

    const [sortBy, setSortBy] = useState(1);

    const [token, setToken] = useState(localStorage.getItem("mkt_mc_token") ?? null);
    const [isValidated, setIsValidated] = useState(false);
    const [validationAttempts, setValidationAttempts] = useState(0);

    useEffect(() => {
        if (validationAttempts === 30 || isValidated || !token) return;
        (async () => {
            const resp = await fetch(`https://market.forgottenworld.it/api/session/check/${token}`);
            const parsed = await resp.json();
            const status = parsed.status;
            if (status === 1) {
                setUsername(parsed.error.match(/^The token is valid for the user (.*)$/)[1]);
                setIsValidated(true);
                localStorage.setItem("mkt_mc_token", token);
            }
            else setTimeout(() => setValidationAttempts(validationAttempts + 1), 5000);
        })();
    }, [token, isValidated, setIsValidated, validationAttempts, setValidationAttempts]);

    const changeSortBy = (sortId) => {
        const tmp = [...listings];
        if (sortBy === sortId) {
            tmp.reverse();
            setListings(tmp);
            return;
        }
        setSortBy(sortId);
        let sorter;
        switch (sortId) {
            case 1:
                sorter = (a, b) => a.sellerNickname.localeCompare(b.sellerNickname);
                break;
            case 2:
                sorter = (a, b) => (a.amount - b.amount);
                break;
            case 3:
                sorter = (a, b) => (a.unitPrice - b.unitPrice);
                break;
            case 4:
                sorter = (a, b) => (a.unitPrice * a.amount - b.unitPrice * b.amount);
                break;
            default:
                return;
        }
        tmp.sort(sorter);
        setListings(tmp);
    }

    useEffect(() => setSearchTokens(searchNeedle
        .split(" ")
        .map(s => s.trim().toLowerCase())
        .filter(s => s !== "")),
        [setSearchTokens, searchNeedle]
    );

    useEffect(() => {
        if (!isValidated || itemsWithListings !== null) return;
        (async () => {
            try {
                const resp = await fetch(`https://market.forgottenworld.it/api/listing/list?token=${token}`);
                setItemsWithListings(await resp.json());
            } catch (e) {
                console.log(e);
            }
        })()
    }, [setItemsWithListings, itemsWithListings, isValidated, token]);

    useEffect(() => {
        if (currentItem === null) {
            if (listings !== null) setListings(null);
            return;
        }
        if (listings?.length) return;
        setSearchNeedle("");
        (async () => {
            try {
                const resp = await fetch(`https://market.forgottenworld.it/api/listing/listByEnum/${currentItem}?token=${token}`);
                setListings(await resp.json());
            } catch (e) {
                console.log(e);
            }
        })()
    }, [currentItem, listings, setListings, token]);

    return (
        <div className="page market">
            {
                isValidated
                    ? <div className="mkt-session-username">
                        <img className="mkt-session-face" alt="" src={`https://minotar.net/avatar/${username}/32`}></img>{username}
                    </div>
                    : null
            }
            <div className="title">Mercato internazionale</div>
            {
                currentItem
                    ? <FontAwesomeIcon className="mkt-back-button" icon={faArrowCircleLeft} onClick={() => setCurrentItem(null)} />
                    : null
            }
            {
                isValidated
                    ? <div className="market-inner">
                        <div className="search-container">
                            <div className="search-bar">
                                <input
                                    type="text"
                                    value={searchNeedle}
                                    onChange={e => setSearchNeedle(e.target.value)}
                                    className="search-bar-input"
                                    placeholder="Cerca..." />
                                <FontAwesomeIcon className="search-icon" icon={faSearch} />
                            </div>
                        </div>
                        {
                            listings || itemsWithListings
                                ? currentItem
                                    ? listings?.length
                                        ? !buyingItem
                                            ? <table className="listings">
                                                <thead>
                                                    <tr className="listings-header listing">
                                                        <th onClick={() => changeSortBy(1)} className="seller-face">Venditore</th>
                                                        <th onClick={() => changeSortBy(2)} className="item-count">Quantità</th>
                                                        <th onClick={() => changeSortBy(3)} className="price">Prezzo</th>
                                                        <th onClick={() => changeSortBy(4)} className="total">Totale</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {listings.map((it, i) => <Listing needle={searchTokens} setBuyingItem={setBuyingItem} key={`mkt_listing_${i}`} item={it} />)}
                                                </tbody>
                                            </table>
                                            : <PurchaseConfirmation cancel={() => setBuyingItem(null)} token={token} item={buyingItem} />
                                        : <div className="loader-container">
                                            <div className="loader"></div>
                                        </div>
                                    : <div className="items-list">
                                        {itemsWithListings.map((it, i) => <Item needle={searchTokens} key={`mkt_listing_item_${i}`} item={it} selectItem={setCurrentItem} />)}
                                    </div>
                                : <div className="loader-container">
                                    <div className="loader"></div>
                                </div>
                        }
                    </div>
                    : <div className="market-inner">
                        <UsernamePrompt resetValidationAttempts={() => setValidationAttempts(0)} setToken={setToken} setIsValidated={setIsValidated} />
                    </div>
            }
        </div>
    )
}