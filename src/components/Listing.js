export function Listing(props) {
    const item = props.item;
    const lcName = item.sellerNickname.toLowerCase();
    const visible = props.needle.every(t => lcName.includes(t));
    const unitPrice = parseFloat(item.unitPrice);

    if (!visible) return null;

    return (
        <tr className="listing" onClick={() => props.setBuyingItem(item)}>
            <td className="seller-face">
                <img alt="" src={`https://minotar.net/avatar/${item.sellerUuid}/32`} />
                {item.sellerNickname}
            </td>
            <td className="item-count">{item.amount}</td>
            <td className="price">{unitPrice.toFixed(2)}z</td>
            <td className="total">{(item.unitPrice * item.amount).toFixed(2)}z</td>
        </tr>
    );
}
