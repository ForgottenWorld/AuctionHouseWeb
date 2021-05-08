import { useState } from "react";
import { API_URL } from "../Configuration";
import { saveToken, saveUsername } from "../Storage";

export function UsernamePrompt(props) {

    const [canSend, setCanSend] = useState(props.username.length >= 3);
    const [error, setError] = useState(null);

    const randomString = (length, rs) => {
        rs += Math.random().toString(20).substr(2, length);
        return (rs.length > length) ? rs.slice(0, length) : randomString(length, rs);
    };

    const handleChange = e => {
        const text = e.target.value.trim();
        props.setUsername(text);
        setCanSend(text.length >= 3);
        saveUsername(text)
    };

    const sendValidationRequest = async () => {
        try {
            const token = randomString(32, "");
            await fetch(`${API_URL}/session/updateToken/${props.username}/${token}`);
            saveToken(token);
            props.setToken(token);
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <div className="mkt-username-prompt">
            <div className="mkt-username-prompt-inner">
                <div className="mkt-username-prompt-info">
                    Per poter accedere al mercato internazionale,
                    devi convalidare il tuo account Minecraft. Inserisci
                    il tuo username qui sotto, riceverai un messaggio
                    di conferma sul server.
                </div>
                <input
                    type="text"
                    maxLength={16}
                    className="mkt-username-promp-input"
                    value={props.username}
                    onChange={handleChange} />
                {
                    error
                        ? <div className="mkt-username-prompt-error"><b>ERRORE: </b>{error}</div>
                        : null
                }
                <button
                    onClick={() => sendValidationRequest()}
                    disabled={!canSend}
                    className="mkt-username-send">CONFERMA</button>
            </div>
        </div>
    );
}
