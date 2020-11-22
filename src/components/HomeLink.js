export default function HomeLink(props) {

    return( 
        <div className="homelink" onClick={props.clickAction}>
            <div className="homelink-name">MERCATO<br/>INTERNAZIONALE</div>
        </div>
    );
}