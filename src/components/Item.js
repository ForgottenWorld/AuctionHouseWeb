import textures from "../texturesBase64.js";

export function Item(props) {
    const item = props.item;
    const textureEnum = item.minecraftEnum.toLowerCase();
    const visible = props.needle.every(t => textureEnum.includes(t));

    if (!visible) return null;

    return (
        <div className="mc-item" onClick={() => props.selectItem(item.minecraftEnum)}>
            <div className="item-icon"><img alt={item.minecraftEnum} src={textures[textureEnum]} /></div>
            <div className="item-info">
                <div className="item-listings">{item.totalCount}</div>
                <div className="item-min-price">{parseFloat(item.minUnitPrice).toFixed(2)}z</div>
            </div>
        </div>
    );
}
