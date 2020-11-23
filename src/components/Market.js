import { useEffect, useState } from "react";
import textures from "../texturesBase64.js";

function Item(props) {
    const lcEnum = props.item.toLowerCase().replace("_wood", "_log").replace("iron_fence", "iron_bars");
    return (
        <div className="mc-item" onClick={() => props.selectItem(lcEnum)}>
            <div className="item-icon"><img alt={props.item} src={textures[lcEnum]} /></div>
            <div className="item-info">
                <div className="item-listings">{props.listings}</div>
                <div className="item-min-price">{props.minPrice} z</div>
            </div>
        </div>
    )
}

function Listing(props) {
    return (
        <tr className="listing">
            <td className="seller-face"><img alt="?" src={`https://minotar.net/avatar/${props.uuid}/32`} />{props.name}</td>
            <td className="item-count">{props.count}</td>
            <td className="price">{props.price}z</td>
            <td className="total">{(props.price * props.count).toFixed(2)}z</td>
        </tr>
    )
}

export default function Market() {

    const [listings, setListings] = useState(null);
    const [itemsWithListings, setItemsWithListings] = useState(null);
    const [currentItem, setCurrentItem] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const resp = await fetch("https://market.forgottenworld.it/api/listing/list");
                setItemsWithListings(await resp.json());
            } catch (e) {
                console.log(e);
            }
        })()
    }, []);

    useEffect(() => {
        if (currentItem === null) {
            if (listings !== null) setListings(null);
            return;
        }
        (async () => {try {
            const resp = await fetch(`https://market.forgottenworld.it/api/listing/listByEnum/${currentItem}`);
            setListings(await resp.json());
        } catch (e) {
            console.log(e);
        }})()
    }, [currentItem, listings]);

    return (
        <div className="page market">
            <div className="title">MERCATO INTERNAZIONALE</div>
            <div className="market-inner">
                {
                    listings || itemsWithListings
                    ? listings && listings.length !== 0
                        ? <table className="listings">
                            <tr className="listings-header listing">
                                <th className="seller-face">Venditore</th>
                                <th className="item-count">Quantità</th>
                                <th className="price">Prezzo</th>
                                <th className="total">Totale</th>
                            </tr>
                            <tbody>
                            {listings.map(item => <Listing 
                                uuid={item.sellerUuid} 
                                name={item.sellerNickname} 
                                count={item.amount} 
                                price={item.unitPrice.toFixed(2)} />)}
                            </tbody>
                        </table>
                        : <div className="items-list">
                            {itemsWithListings.map(item => <Item 
                                item={item.minecraftEnum} 
                                listings={item.totalCount}
                                minPrice={parseFloat(item.minUnitPrice).toFixed(2)}
                                selectItem={setCurrentItem} />)}
                        </div>
                    : <span>Caricamento...</span>
                }
            </div>
        </div>
    )
}