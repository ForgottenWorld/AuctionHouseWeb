import { useEffect, useRef, useState } from "react";
import "../Loader.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowCircleLeft, faSearch } from "@fortawesome/free-solid-svg-icons";
import { PurchaseConfirmation } from "./PurchaseConfirmation";
import { UsernamePrompt } from "./UsernamePrompt";
import { Item } from "./Item";
import { Listing } from "./Listing";
import logo from '../images/logo.png';
import { WEBSOCKET_API_URL } from "../Configuration";
import { loadToken, loadUsername, saveToken } from "../Storage";
import { getItemListings, getItemsWithListings } from "../ApiBindings";
import { getListingSorterById } from "../ListingSorters";


export default function Market() {

    const [listings, setListings] = useState(null);
    const [itemsWithListings, setItemsWithListings] = useState(null);
    const [currentItem, setCurrentItem] = useState(null);
    const [buyingItem, setBuyingItem] = useState(null);
    const [searchNeedle, setSearchNeedle] = useState("");
    const [searchTokens, setSearchTokens] = useState([]);
    const [username, setUsername] = useState(loadUsername() ?? null);
    const [sortBy, setSortBy] = useState(1);
    const [token, setToken] = useState(loadToken() ?? null);
    const [isValidated, setIsValidated] = useState(false);
    const [listingsChanged, setListingsChanged] = useState(false);

    const webSocket = useRef(null);

    useEffect(() => {
        if (token?.length !== 32) return;
        if (webSocket.current) {
            webSocket.current.close();
        }
        webSocket.current = new WebSocket(WEBSOCKET_API_URL);
        webSocket.current.onopen = (_e) => webSocket.current.send(`HELLO%${token}`);
        webSocket.current.onmessage = (e) => {
            switch(e.data) {
                case "LISTINGS_CHANGED":
                    setListingsChanged(true);
                    break;
                case "TOKEN_CONFIRMED":
                    saveToken(token);
                    setIsValidated(true);
                    webSocket.current?.send("PING");
                    break;
                case "PONG":
                    setInterval(() => webSocket.current?.send("PING"), 5000);
                    break;
                default:
                    break;
            }
        };
    }, [token, setIsValidated, setListingsChanged]);

    const changeSortBy = (sortId) => {
        const tmp = [...listings];
        if (sortBy === sortId) {
            tmp.reverse();
            setListings(tmp);
            return;
        }
        setSortBy(sortId);
        tmp.sort(getListingSorterById(sortId));
        setListings(tmp);
    }

    useEffect(() => {
        if (!isValidated || (!listingsChanged && itemsWithListings !== null)) return;
        (async () => {
            try {
                setItemsWithListings(await getItemsWithListings(token));
                setListingsChanged(false);
            } catch (e) {
                console.log(e);
            }
        })()
    }, [itemsWithListings, setItemsWithListings, listingsChanged, setListingsChanged, isValidated, token]);

    useEffect(() => {
        if (currentItem === null) {
            if (listings !== null) setListings(null);
            return;
        }
        if (listings?.length && !listingsChanged) return;
        setSearchNeedle("");
        (async () => {
            try {
                const newListings = await getItemListings(currentItem, token);
                if (newListings.length === 0) {
                    setCurrentItem(null);
                    setListings(null);
                } else {
                    setListings(newListings);
                }
            } catch (e) {
                console.log(e);
            }
        })()
    }, [currentItem, setCurrentItem, listings, setListings, token, listingsChanged]);

    const handleNeedleChange = (e) => {
        setSearchNeedle(e.target.value)
        setSearchTokens(
            searchNeedle
                .split(" ")
                .filter(s => s !== "")
                .map(s => s.toLowerCase())
        );
    }

    const loader = () => (<div className="loader-container"><div className="loader"></div></div>);

    const header = () => (
        <div className="page-header">
            {
                isValidated
                    ? <div className="mkt-session-username">
                        <img className="mkt-session-face" alt="" src={`https://minotar.net/avatar/${username}/32`} />
                        {username}
                    </div>
                    : null
            }
            <img src={logo} alt="logo" className="logo" />
            {
                currentItem
                    ? <FontAwesomeIcon
                        className="mkt-back-button"
                        icon={faArrowCircleLeft}
                        onClick={() => setCurrentItem(null)} />
                    : <div className="mkt-back-button-pholder"></div>
            }
        </div>
    );

    const listingsTable = () => (
        <table className="listings">
            { listingsHeader() }
            { listingsBody() }
        </table>
    )

    const listingsHeader = () => (
        <thead>
            <tr className="listings-header listing">
                <th onClick={() => changeSortBy(1)} className="seller-face">Venditore</th>
                <th onClick={() => changeSortBy(2)} className="item-count">Quantità</th>
                <th onClick={() => changeSortBy(3)} className="price">Prezzo</th>
                <th onClick={() => changeSortBy(4)} className="total">Totale</th>
            </tr>
        </thead>
    )

    const listingsBody = () => (
        <tbody>
            {
                listings.map((it, i) => 
                    <Listing 
                        needle={searchTokens} 
                        setBuyingItem={setBuyingItem} 
                        key={`mkt_listing_${i}`} 
                        item={it} />
                )
            }
        </tbody>
    )

    const listingsChart = () => (
        <div className="items-list">
            {
                itemsWithListings.map((it, i) => 
                    <Item 
                        needle={searchTokens} 
                        key={`mkt_listing_item_${i}`} 
                        item={it} 
                        selectItem={setCurrentItem} />
                )
            }
        </div>
    )

    const searchBar = () => (
        <div className="search-container">
            <div className="search-bar">
                <input
                    type="text"
                    value={searchNeedle}
                    onChange={handleNeedleChange}
                    className="search-bar-input"
                    placeholder="Cerca…" />
                <FontAwesomeIcon className="search-icon" icon={faSearch} />
            </div>
        </div>
    )

    return (
        <div className="page market">
            { header() }
            {
                !isValidated
                    ? <div className="market-inner">
                        <UsernamePrompt
                            setToken={setToken} 
                            setIsValidated={setIsValidated}
                            username={username}
                            setUsername={setUsername} />
                    </div>
                    : <div className="market-inner">
                        { searchBar() }
                        {
                            listings || itemsWithListings
                                ? currentItem
                                    ? listings?.length
                                        ? !buyingItem
                                            ? listingsTable()
                                            : <PurchaseConfirmation 
                                                cancel={() => setBuyingItem(null)} 
                                                token={token} 
                                                item={buyingItem} />
                                        : loader()
                                    : listingsChart()
                                : loader()
                        }
                    </div>
            }
        </div>
    )
}