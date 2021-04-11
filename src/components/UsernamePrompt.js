import { useEffect, useState } from "react";

export function UsernamePrompt(props) {

    const [username, setUsername] = useState(localStorage.getItem("mkt_mc_username") ?? "");
    const [canSend, setCanSend] = useState(false);
    const [error, setError] = useState(null);

    const randomString = (length, rs) => {
        rs += Math.random().toString(20).substr(2, length);
        if (rs.length > length)
            return rs.slice(0, length);
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
                <input type="text" maxLength={16} className="mkt-username-promp-input" value={username} onChange={handleChange} />
                {error
                    ? <div className="mkt-username-prompt-error"><b>ERRORE: </b>{error}</div>
                    : null}
                <button onClick={() => sendValidationRequest()} disabled={!canSend} className="mkt-username-send">CONFERMA</button>

            </div>
        </div>
    );
}
