import { useState } from "react";
import { API_URL } from "../consts";

export function PurchaseConfirmation(props) {

    const item = props.item;
    const [error, setError] = useState(null);
    const amount = parseInt(item.amount);
    const unitPrice = parseFloat(item.unitPrice);
    const total = (unitPrice * amount).toFixed(2);

    const placeOrder = async () => {
        try {
            const resp = await fetch(`${API_URL}/listing/placeOrder/${item.id}/${props.token}`);
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
    };

    return (
        <div className="mkt-purchase-confirmation">
            <div className="mkt-purchase-confirmation-inner">
                <div className="mkt-purchase-confirmation-message">
                    Sicuri di voler acquistare questo lotto?
                </div>
                <div className="mkt-purchase-confirmation-price">Totale: <span className="price-value">{total}</span>z</div>
                {error
                    ? <div className="mkt-purchase-confirmation-error"><b>ERRORE: </b>{error}</div>
                    : null}
                <button onClick={() => placeOrder()} className="mkt-username-send">CONFERMA</button>
                <button onClick={() => props.cancel()} className="mkt-username-cancel">ANNULLA</button>
            </div>
        </div>
    );
}
