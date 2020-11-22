import { useCallback, useEffect, useState } from "react";
const mcAssets = require("minecraft-assets")("1.16.4");

function Item(props) {
    const lcEnum = props.item.toLowerCase();
    return (
        <div className="mc-item" onClick={() => props.selectItem(lcEnum)}>
            <div className="item-icon"><img alt={props.item} src={mcAssets.textureContent[lcEnum].texture} /></div>
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
            <td className="price">{props.price}</td>
        </tr>
    )
}

export default function Market() {

    const [listings, setListings] = useState([]);
    const [itemsWithListings, setItemsWithListings] = useState([]);
    const [currentItem, setCurrentItem] = useState(null);

    const updateItemsWithListings = useCallback(async () => {
        try {
            const resp = await fetch("https://market.forgottenworld.it/api/listing/list");
            setItemsWithListings(await resp.json());
        } catch (e) {
            console.log(e);
        }
    }, []);

    const updateListings = useCallback(async () => {
        if (currentItem === null) {
            setListings([]);
            return;
        }
        try {
            const resp = await fetch(`https://market.forgottenworld.it/api/listing/listByEnum/${currentItem}`);
            setListings(await resp.json());
        } catch (e) {
            console.log(e);
        }
    }, [currentItem]);

    useEffect(() => updateItemsWithListings(), [updateItemsWithListings]);

    useEffect(() => updateListings(), [updateListings, currentItem]);

    return (
        <div className="page market">
            <div className="title">MERCATO INTERNAZIONALE</div>
            <div className="market-inner">
                {
                    listings.length !== 0
                        ? <table className="listings">
                            <tr className="listings-header listing">
                                <th className="seller-face">Venditore</th>
                                <th className="item-count">Quantità</th>
                                <th className="price">Totale</th>
                            </tr>
                            <tbody>
                            {listings.map(item => <Listing 
                                uuid={item.sellerUuid} 
                                name={item.sellerNickname} 
                                count={item.amount} 
                                price={(item.unitPrice * item.amount).toFixed(2)} />)}
                            </tbody>
                        </table>
                        : <div className="items-list">
                            {itemsWithListings.map(item => <Item 
                                item={item.minecraftEnum} 
                                listings={item.totalCount} 
                                minPrice={parseFloat(item.minUnitPrice).toFixed(2)}
                                selectItem={setCurrentItem} />)}
                        </div>
                }
            </div>
        </div>
    )
}