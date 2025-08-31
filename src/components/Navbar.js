import { Link } from "react-router-dom";
import logo from "../pictures/stupid-games-logo.png";
import "./Navbar.css";

export default function Navbar({endGame, won}) {
    return (
        <div className="navbar-container">
        <nav className={(won ? "navbar-won" : (endGame ? "navbar-endgame" : "navbar"))}>
            <Link className="link"  to="/Home">HOME</Link>
            <Link className="link" to="/Games">GAMES</Link>
            <div ><img className="logo" src = {logo} alt = "logo" /></div>
            <Link className="link" to="/About" >ABOUT</Link>
            <Link className="link" to="/Contact">CONTACT</Link>
            
        </nav>
        </div>
    );
}