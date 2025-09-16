import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-container">
      <div className="hero-content">
        <h1>
          Welcome to <span>Stupid Games</span> 🤓.
        </h1>
        <p className="subtitle">
          Do you want something like Crazy Games? Lets play and feed us with your free time.We've gathered the most pointless, frustrating, and ridiculously fun games known to mankind. They have zero educational value. They will not make you smarter. 
          <br/>
          They are a glorious waste of time. Enjoy! <span className="subtitle-emoji">🥳</span>
        </p>
        <Link to="/games" className="cta-btn">
          Let's Get Stupid
        </Link>

        <p style={{ color: "red", fontWeight: "bold" }}>we are still working on this game, its shity but it suposed to be. Just wanted to train react.js with this. :-|</p>
      </div>
    </div>
  );
}