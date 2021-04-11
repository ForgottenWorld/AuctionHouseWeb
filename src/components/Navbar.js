function NavLink(props) {

    return( 
        <div className={`navlink ${props.linkClass}`} onClick={props.clickAction}>
            <div className="navlink-name">{props.name}</div>
        </div>
    );
}

export default function Navbar(props) {

    return (
        <div className={`navbar bg${props.currentlyOn}`}>
            <NavLink name="Home" linkClass={"homelink"} clickAction={() => props.navigate(0)} />
            <NavLink name="Mercato internazionale" linkClass={"marketlink"} clickAction={() => props.navigate(1)} />
        </div>
    )
}