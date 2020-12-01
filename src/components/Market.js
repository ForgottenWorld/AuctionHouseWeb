import { useEffect, useState } from "react";
import textures from "../texturesBase64.js";
import "../Loader.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowCircleLeft, faSearch } from "@fortawesome/free-solid-svg-icons";

function PurchaseConfirmation(props) {

    const item = props.item;
    const [error, setError] = useState(null);

    const placeOrder = async () => {
        try {
            const resp = await fetch(`https://market.forgottenworld.it/api/listing/placeOrder/${item.id}/${props.token}`);
            const parsed = await resp.json();
            const status = parsed.status;
            switch (parseInt(status)) {
                case 1:
                    props.cancel();
                    break;
                default:
                    setError(parsed.error);
                    break;
            }
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <div className="mkt-purchase-confirmation">
            <div className="mkt-purchase-confirmation-inner">
                <div className="mkt-purchase-confirmation-message">
                    Sicuri di voler acquistare questo lotto?
                </div>
                <div className="mkt-purchase-confirmation-price">Totale: <span className="price-value">{(item.unitPrice * item.amount).toFixed(2)}</span>z</div>
                {
                    error
                        ? <div className="mkt-purchase-confirmation-error"><b>ERRORE: </b>{error}</div>
                        : null
                }
                <button onClick={() => placeOrder()} className="mkt-username-send">CONFERMA</button>
                <button onClick={() => props.cancel()} className="mkt-username-cancel">ANNULLA</button>
            </div>
        </div>
    )
}

function UsernamePrompt(props) {

    const [username, setUsername] = useState(localStorage.getItem("mkt_mc_username") ?? "");
    const [canSend, setCanSend] = useState(false);
    const [error, setError] = useState(null);

    const randomString = (length, rs) => {
        rs += Math.random().toString(20).substr(2, length);
        if (rs.length > length) return rs.slice(0, length);
        return randomString(length, rs);
    };

    useEffect(() => setCanSend(username.trim().length >= 3), [username, setCanSend]);

    const handleChange = e => {
        setUsername(e.target.value);
        localStorage.setItem("mkt_mc_username", e.target.value);
    };

    const sendValidationRequest = async () => {
        try {
            const token = randomString(32, "");
            await fetch(`https://market.forgottenworld.it/api/session/updateToken/${username}/${token}`);
            props.resetValidationAttempts();
            props.setToken(token);
        } catch (e) {
            setError(e);
        }
    }

    return (
        <div className="mkt-username-prompt">
            <div className="mkt-username-prompt-inner">
                <div className="mkt-username-prompt-info">
                    Per poter accedere al mercato internazionale,
                    devi convalidare il tuo account Minecraft. Inserisci
                    il tuo username qui sotto, riceverai un messaggio
                    di conferma sul server.
                </div>
                <input type="text" maxLength={16} className="mkt-username-promp-input" value={username} onChange={handleChange} />
                {
                    error
                        ? <div className="mkt-username-prompt-error"><b>ERRORE: </b>{error}</div>
                        : null
                }
                <button onClick={() => sendValidationRequest()} disabled={!canSend} className="mkt-username-send">CONFERMA</button>
                {/* <button onClick={() => props.cancel()} className="mkt-username-cancel">ANNULLA</button> */}
            </div>
        </div>
    )
}

function Item(props) {
    const item = props.item;
    const textureEnum = item.minecraftEnum.toLowerCase();
    const visible = props.needle.every(t => textureEnum.includes(t));
    return (
        visible
            ? <div className="mc-item" onClick={() => props.selectItem(item.minecraftEnum)}>
                <div className="item-icon"><img alt={item.minecraftEnum} src={textures[textureEnum]} /></div>
                <div className="item-info">
                    <div className="item-listings">{item.totalCount}</div>
                    <div className="item-min-price">{parseFloat(item.minUnitPrice).toFixed(2)}z</div>
                </div>
            </div>
            : null
    )
}

function Listing(props) {
    const item = props.item;
    const lcName = item.sellerNickname.toLowerCase();
    const visible = props.needle.every(t => lcName.includes(t));
    return (
        visible
            ? <tr className="listing" onClick={() => props.setBuyingItem(item)}>
                <td className="seller-face"><img alt="" src={`https://minotar.net/avatar/${item.sellerUuid}/32`} />{item.sellerNickname}</td>
                <td className="item-count">{item.amount}</td>
                <td className="price">{item.unitPrice.toFixed(2)}z</td>
                <td className="total">{(item.unitPrice * item.amount).toFixed(2)}z</td>
            </tr>
            : null
    )
}

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
            <div className="title">MERCATO INTERNAZIONALE</div>
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