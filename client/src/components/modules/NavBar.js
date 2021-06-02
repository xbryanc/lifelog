import React from 'react';
import classNames from 'classnames';

import CONSTANTS from '../../../../constants';

import "../../css/navbar.css";
import { Link } from 'react-router-dom';
import icon from "../../../public/media/navbar_icon_transparent.svg";


export default class NavBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            width: 0,
            path: window.location.pathname,
        }
    }

    componentDidMount() {
        this.updateWidth();
        window.addEventListener('resize', this.updateWidth);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWidth);
    }

    render() {
        if (!this.props.userInfo) return null;
        if (this.state.width <= CONSTANTS.NAVBAR_HAMBURGER_WIDTH_THRESHOLD) {
            return (
                <div onClick={this.updatePath}>
                    <nav className="navbar">
                        <Link to="/" className="navbar-brand nav-link">lifelog</Link>

                        <button className="navbar-toggler first-button" type="button" data-toggle="collapse" data-target="#navbarExpandedContent"
                            aria-controls="navbarExpandedContent" aria-expanded="false" aria-label="Toggle navigation">
                            <img className="hamburger" src="/media/menuicon.svg" />
                        </button>

                        <div className="collapse navbar-collapse" id="navbarExpandedContent">
                            <Link to="/home" className={classNames("nav-item", "nav-link", {"nav-current": this.state.path.startsWith("/home")})}>Home</Link>
                            <div className="nav-item dropdown">
                                <img className={classNames("nav-link dropdown-toggle profileIcon", {"nav-current": this.state.path.startsWith("/profile")})} id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" src={icon}/>
                                <div className="dropdown-menu dropdown-menu-left" aria-labelledby="navbarDropdown">
                                    <div className="helpDiv">
                                    </div>
                                    <Link to="/profile" className="dropdown-item">Profile</Link>
                                    <a className="dropdown-item" href="/logout" onClick={this.props.logout}>Logout</a>
                                </div>
                            </div>
                        </div>
                    </nav>
                </div>
            );
        }
        return (
            <div onClick={this.updatePath}>
                <nav className="navbar navbar-expand-lg">
                    <Link to="/" className="navbar-brand nav-link">lifelog</Link>
                    <div className="navbar-nav">
                        <React.Fragment>
                            <Link to="/home" className={classNames("nav-item", "nav-link", {"nav-current": this.state.path.startsWith("/home")})}>Home</Link>
                            <div className="nav-item dropdown">
                                <img className={classNames("nav-link dropdown-toggle profileIcon", {"nav-current": this.state.path.startsWith("/profile")})} id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" src={icon}/>
                                <div className="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                                    <div className="helpDiv">
                                    </div>
                                    <Link to="/profile" className="dropdown-item">Profile</Link>
                                    <a className="dropdown-item" href="/logout" onClick={this.props.logout}>Logout</a>
                                </div>
                            </div>
                        </React.Fragment>
                    </div>
                </nav>
            </div>
        );
    }

    updateWidth = () => {
        this.setState({
            width: window.innerWidth,
        });
    }

    updatePath = () => {
        this.setState({
            path: window.location.pathname,
        });
    }
}
