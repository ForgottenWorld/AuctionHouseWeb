import { useEffect, useState } from "react";
import textures from "../texturesBase64.js";
import "../Loader.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowCircleLeft, faSearch } from "@fortawesome/free-solid-svg-icons";

function Item(props) {
    const item = props.item;
    const textureEnum = item.minecraftEnum.toLowerCase().replace("_wood", "_log").replace("iron_fence", "iron_bars");
    return (
        <div className="mc-item" onClick={() => props.selectItem(item.minecraftEnum)}>
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
    return (
        <tr className="listing">
            <td className="seller-face"><img alt="?" src={`https://minotar.net/avatar/${item.sellerUuid}/32`} />{item.sellerNickname}</td>
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

    const [sortBy, setSortBy] = useState(1);

    const changeSortBy = (sortId) => {
        const tmp = [...listings];
        if (sortBy === sortId) {
            tmp.reverse()
            setListings(tmp);
            return
        }
        setSortBy(sortId)
        let sorter;
        switch (sortId) {
            case 1:
            sorter = (a,b) => a.sellerNickname.localeCompare(b.sellerNickname);
            break;
            case 2:
            sorter = (a,b) => (a.amount - b.amount);
            break;
            case 3:
            sorter = (a,b) => (a.unitPrice - b.unitPrice);
            break;
            case 4:
            sorter = (a,b) => (a.unitPrice * a.amount - b.unitPrice * b.amount);
            break;
        }
        tmp.sort(sorter);
        setListings(tmp);
    }

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
    }, [setItemsWithListings]);

    useEffect(() => {
        if (currentItem === null) {
            if (listings !== null) setListings(null);
            return;
        }
        (async () => { try {
            const resp = await fetch(`https://market.forgottenworld.it/api/listing/listByEnum/${currentItem}`);
            setListings(await resp.json());
        } catch (e) {
            console.log(e);
        }})()
    }, [currentItem, listings, setListings]);

    return (
        <div className="page market">
            <div className="title">MERCATO INTERNAZIONALE</div>
            {
                currentItem
                ? <FontAwesomeIcon className="mkt-back-button" icon={faArrowCircleLeft} onClick={() => setCurrentItem(null)}/>
                : null
            }
            <div className="market-inner">
                <div className="search-container">
                    <div className="search-bar">
                        <input type="text" className="search-bar-input" hint="Cerca..."/>
                        <FontAwesomeIcon className="search-icon" icon={faSearch} />
                    </div>
                </div>
                {
                    listings || itemsWithListings
                    ? currentItem
                        ? listings?.length
                            ? <table className="listings">
                                <tr className="listings-header listing">
                                    <th onClick={() => changeSortBy(1)} className="seller-face">Venditore</th>
                                    <th onClick={() => changeSortBy(2)} className="item-count">Quantità</th>
                                    <th onClick={() => changeSortBy(3)} className="price">Prezzo</th>
                                    <th onClick={() => changeSortBy(4)} className="total">Totale</th>
                                </tr>
                                <tbody>
                                    { listings.map((it, i) => <Listing key={`mkt_listing_${i}`} item={it} />) }
                                </tbody>
                            </table>
                            : <div className="loader-container">
                                <div className="loader"></div>
                            </div>
                        : <div className="items-list">
                            { itemsWithListings.map((it, i) => <Item key={`mkt_listing_item_${i}`} item={it} selectItem={setCurrentItem} />) }
                        </div>
                    : <div className="loader-container">
                        <div className="loader"></div>
                    </div>
                }
            </div>
        </div>
    )
}