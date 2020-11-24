import HomeLink from './HomeLink';

export default function Navbar(props) {

    return (
        <div className="navbar">
            <HomeLink clickAction={() => props.navigate(1)} />
        </div>
    )
}