import { useEffect, useState } from "react";
import textures from "../texturesBase64.js";
import "../Loader.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowCircleLeft, faSearch } from "@fortawesome/free-solid-svg-icons";

function UsernamePrompt(props) {
    const item = props.item;

    const [username, setUsername] = useState("");
    const [canSend, setCanSend] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => setCanSend(username.trim().length >= 3), [username, setCanSend]);

    const sendOrder = async () => {
        try {
            const resp = await fetch(`https://market.forgottenworld.it/api/listing/placeOrder/${item.id}/${username}`);
            const status = (await resp.json()).status;
            switch (parseInt(status)) {
                case -1:
                    setError("Questo lotto non esiste o è già stato ordinato da qualcun'altro.");
                    break;
                default:
                    props.cancel()
                    break;
            }
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <div className="mkt-username-prompt">
            <div className="mkt-username-prompt-inner">
                <div className="mkt-username-prompt-info">
                    Per acquistare questo lotto, inserisci il tuo 
                    nome utente su Minecraft. Riceverai una richiesta 
                    di conferma sul server.
                </div>
                <div className="mkt-username-prompt-price">Totale: <span className="price-value">{(item.unitPrice * item.amount).toFixed(2)}</span>z</div>
                <input type="text" maxLength={16} className="mkt-username-promp-input" value={username} onChange={e => setUsername(e.target.value)}/>
                {
                    error
                    ? <div className="mkt-username-prompt-error"><b>ERRORE: </b>{error}</div>
                    : null
                }
                <button onClick={() => sendOrder()} disabled={!canSend} className="mkt-username-send">CONFERMA</button>
                <button onClick={() => props.cancel()} className="mkt-username-cancel">ANNULLA</button>
            </div>
        </div>
    )
}

function Item(props) {
    const item = props.item;
    const textureEnum = item.minecraftEnum.toLowerCase().replace("_wood", "_log").replace("iron_fence", "iron_bars");
    const visible = props.needle.every(t => textureEnum.includes(t))
    return (
        <div className={`mc-item ${!visible ? "hidden" : ""}`} onClick={() => props.selectItem(item.minecraftEnum)}>
            <div className="item-icon"><img alt={item.minecraftEnum} src={textures[textureEnum]} /></div>
            <div className="item-info">
                <div className="item-listings">{item.totalCount}</div>
                <div className="item-min-price">{parseFloat(item.minUnitPrice).toFixed(2)}z</div>
            </div>
        </div>
    )
}

function Listing(props) {
    const item = props.item;
    const lcName = item.sellerNickname.toLowerCase();
    const visible = props.needle.every(t => lcName.includes(t));
    return (
        <tr className={`listing ${!visible ? "hidden" : ""}`} onClick={() => props.setBuyingItem(item)}>
            <td className="seller-face"><img alt="" src={`https://minotar.net/avatar/${item.sellerUuid}/32`} />{item.sellerNickname}</td>
            <td className="item-count">{item.amount}</td>
            <td className="price">{item.unitPrice.toFixed(2)}z</td>
            <td className="total">{(item.unitPrice * item.amount).toFixed(2)}z</td>
        </tr>
    )
}

export default function Market() {

    const [listings, setListings] = useState(null);
    const [itemsWithListings, setItemsWithListings] = useState(null);
    const [currentItem, setCurrentItem] = useState(null);
    const [buyingItem, setBuyingItem] = useState(null);
    const [searchNeedle, setSearchNeedle] = useState("");
    const [searchTokens, setSearchTokens] = useState([]);

    const [sortBy, setSortBy] = useState(1);

    const changeSortBy = (sortId) => {
        const tmp = [...listings];
        if (sortBy === sortId) {
            tmp.reverse()
            setListings(tmp);
            return
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

    useEffect(() => setSearchTokens(searchNeedle.split(" ").map(s => s.trim().toLowerCase()).filter(s => s !== "")), [setSearchTokens, searchNeedle]);

    useEffect(() => {
        if (itemsWithListings !== null) return;
        (async () => {
            try {
                const resp = await fetch("https://market.forgottenworld.it/api/listing/list");
                setItemsWithListings(await resp.json());
            } catch (e) {
                console.log(e);
            }
        })()
    }, [setItemsWithListings, itemsWithListings]);

    useEffect(() => {
        if (currentItem === null) {
            if (listings !== null) setListings(null);
            return;
        }
        if (listings?.length) return;
        setSearchNeedle("");
        (async () => {
            try {
                const resp = await fetch(`https://market.forgottenworld.it/api/listing/listByEnum/${currentItem}`);
                setListings(await resp.json());
            } catch (e) {
                console.log(e);
            }
        })()
    }, [currentItem, listings, setListings]);

    return (
        <div className="page market">
            <div className="title">MERCATO INTERNAZIONALE</div>
            {
                currentItem
                    ? <FontAwesomeIcon className="mkt-back-button" icon={faArrowCircleLeft} onClick={() => setCurrentItem(null)} />
                    : null
            }
            <div className="market-inner">
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
                                    : <UsernamePrompt
                                        cancel={() => setBuyingItem(null)} 
                                        item={buyingItem}/>
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
        </div>
    )
}