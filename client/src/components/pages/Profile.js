import React, { Component } from 'react';
import Calendar from 'react-calendar';
import classNames from 'classnames';
import '../../css/app.css';
import '../../css/profile.css';

import CONSTANTS from '../../../../constants';

/*
Subscription structure: list of:
[
    {
        start: String,
        end: String,
        frequency: String,
        cost: Number,
        description: String,
        location: String,
        tags: [String],
        ---
        show: Boolean (always set to False),
        editing: Boolean,
        editCost: Number,
        editDescription: String,
        editLocation: String,
        ---
    }
]
*/

export default class Profile extends Component {
    constructor(props) {
        super(props);
        let subscriptionCopy = [];
        this.props.userInfo.subscriptions.forEach(sub => {
            let newSub = Object.assign({}, sub);
            let newTags = [];
            sub.tags.forEach(tag => {
                newTags.push(tag);
            });
            newSub.tags = newTags;
            subscriptionCopy.push(newSub);
        });
        this.state = {
            subscriptions: subscriptionCopy,
            setShow: false,
        };
    }

    componentDidMount() {
        document.title = "Profile";
    }
    
    render() {
        return (
            <div className="profileContainer">
                {!this.state.setShow ? (null) :
                    <div className="subPopupContainer" onClick={this.commitDate}>
                        <div className="subPopup" onClick={e => e.stopPropagation()}>
                            Selecting {this.state.setField} date as {this.state.setDate}
                            <Calendar
                                className="subCalendar"
                                onClickDay={e => this.changeDate(e.toLocaleDateString())}
                                calendarType="US"
                                defaultValue={new Date(this.state.setDate)}
                            />
                            <div className="button saveButton" onClick={this.commitDate}>
                                Select Date
                            </div>
                        </div>
                    </div>
                }
                <div className="subContainer">
                    <div className="subTitle">
                        <div className="subTitleMain">
                            SUBSCRIPTIONS
                            {this.subChanged() ?
                            <div className="subChanged">*</div>
                            :
                            null}
                        </div>
                        <div className="subTitleSecondary">
                            <div className="smallButton text green" onClick={this.addSub}>+</div>
                        </div>
                    </div>
                    <div className="subList">
                        {this.state.subscriptions.map((el, ind) => (
                            <div key={ind} className="subEntry">
                                <div className="subHeader">
                                    <div className="subLocation" onClick={() => this.handleSubClick(el)}>
                                        {el.editing ?
                                        <input type="text" className="subEditEntry" name="subLocationEntry" id="subLocationEntry" value={el.editLocation} onChange={e => this.editSub(el, "editLocation", e.target.value)} onClick={e => e.stopPropagation()} />
                                        :
                                        el.location}
                                    </div>
                                    <div className={classNames("subTimeFrame", {"editing": el.editing})} onClick={() => {if (!el.editing) this.handleSubClick(el)}}>
                                        <div className={classNames("subTimeStart", {"editing": el.editing})} onClick={() => this.selectDate(el, "start")}>
                                            {this.formatSubTime(el.start)}
                                        </div>
                                        <div className="subTimeDash">-</div>
                                        <div className={classNames("subTimeEnd", {"editing": el.editing})} onClick={() => this.selectDate(el, "end")}>
                                            {this.formatSubTime(el.end)}
                                        </div>
                                        <div className="subTimeFrequency">
                                            {el.editing ?
                                            <select className="subFrequencyEntry" name="subFrequency" id="subFrequency" value={el.frequency} onChange={e => this.selectFrequency(el, e.target.value)}>
                                                {CONSTANTS.SUBSCRIPTION_FREQUENCIES.map((freq, ind) => (
                                                    <option key={ind} value={freq}>{freq}</option>
                                                ))}
                                            </select>
                                            :
                                            this.formatFrequency(el.frequency)}
                                        </div>
                                    </div>
                                    <div className="subTagsList" onClick={() => this.handleSubClick(el)}>
                                        {el.tags.map((tag, tagInd) => (
                                            <div key={tagInd} className="subTag">
                                                {tag}
                                            </div>
                                        ))}
                                    </div>
                                    <div className={classNames("subCost", {"zero": !el.editing && (!el.cost || parseInt(el.cost) === 0)})} onClick={() => this.handleSubClick(el)}>
                                        {el.editing ?
                                        <input type="number" className="subEditEntry" name="subCostEntry" id="subCostEntry" value={el.editCost} onChange={e => this.editSub(el, "editCost", e.target.value)} onClick={e => e.stopPropagation()} />
                                        :
                                        this.formatCost(el.cost)}
                                    </div>
                                    <div className="subIcons">
                                        <img
                                            className="smallButton buttonPicture"
                                            onClick={el.editing ? () => this.commitSubEdit(el) : () => this.startSubEdit(el)}
                                            src={el.editing ? "/media/check.svg" : "/media/pencil.svg"}
                                        />
                                        <div className="smallButton text red" onClick={() => this.deleteSub(ind)}>x</div>
                                    </div>
                                </div>
                                {el.show ?
                                <div className="subBody">
                                    {el.editing ?
                                    <textarea type="text" className="subEditDescription" name="subDescriptionEntry" id="subDescriptionEntry" value={el.editDescription} onChange={e => this.editSub(el, "editDescription", e.target.value)} onClick={e => e.stopPropagation()} />
                                    :
                                    el.description}
                                </div>
                                :
                                null
                                }
                            </div>
                        ))}
                    </div>
                    <div className="button saveButton" onClick={this.saveProfile}>
                        Save
                    </div>
                </div>
            </div>
        );
    }

    subChanged = () => {
        let currentSubs = this.state.subscriptions;
        let prevSubs = this.props.userInfo.subscriptions;
        if (currentSubs.length != prevSubs.length) {
            return true;
        }
        let changed = false;
        currentSubs.forEach((_, ind) => {
            if (changed) {
                return;
            }
            let cur = currentSubs[ind];
            let prev = prevSubs[ind];
            if (cur.cost !== prev.cost || cur.description !== prev.description || cur.location !== prev.location ||
                cur.start !== prev.start || cur.end !== prev.end || cur.frequency != prev.frequency) {
                changed = true;
            }
            let curTags = cur.tags;
            let prevTags = prev.tags;
            if (curTags.length != prevTags.length) {
                changed = true;
            }
            curTags.forEach((_, ind) => {
                if (curTags[ind] != prevTags[ind]) {
                    changed = true;
                }
            });
        })
        return changed;
    }

    addSub = () => {
        let newSubscriptions = this.state.subscriptions;
        let newSub = Object.assign({}, CONSTANTS.EMPTY_SUBSCRIPTION);
        newSub.tags = [];
        newSubscriptions.push(newSub);
        this.setState({
            subscriptions: newSubscriptions,
        });
    }

    deleteSub = (ind) => {
        let newSubscriptions = this.state.subscriptions;
        newSubscriptions.splice(ind, 1);
        this.setState({
            subscriptions: newSubscriptions,
        });
    }

    editSub = (sub, fieldName, value) => {
        sub[fieldName] = value;
        this.setState({
            subscriptions: this.state.subscriptions,
        });
    }

    selectFrequency = (el, freq) => {
        el.frequency = freq;
        this.setState({
            subscriptions: this.state.subscriptions,
        });
    }

    selectDate = (sub, fieldName) => {
        if (!sub.editing) {
            return;
        }
        let emptyDate = !sub[fieldName] || sub[fieldName] === "";
        this.setState({
            setSub: sub,
            setField: fieldName,
            setDate: emptyDate ? new Date(Date.now()).toLocaleDateString() : sub[fieldName],
            setShow: true,
        });
    }

    changeDate = (date) => {
        this.setState({
            setDate: date,
        });
    }

    commitDate = () => {
        this.state.setSub[this.state.setField] = this.state.setDate;
        this.setState({
            setShow: false,
            subscriptions: this.state.subscriptions,
        });
    }

    handleSubClick = (sub) => {
        sub.show = !sub.show;
        this.setState({
            subscriptions: this.state.subscriptions,
        });
    }

    formatSubTime = (date) => {
        if (!date || date === "") {
            return "\u221E";
        }
        return date;
    }

    formatFrequency = (freq) => {
        if (!freq || freq === "") {
            return "(SET)";
        }
        return `(${freq})`;
    }

    formatCost = (costInPennies) => {
        let dollar = Math.floor(costInPennies / 100);
        let cents = costInPennies % 100;
        let rest = `${Math.floor(cents / 10)}${cents % 10}`;
        return `$${dollar}.${rest}`;
    }

    startSubEdit = (sub) => {
        sub.editing = true;
        sub.editCost = sub.cost;
        sub.editLocation = sub.location;
        sub.editDescription = sub.description;
        this.setState({
            subscriptions: this.state.subscriptions,
        })
    }

    commitSubEdit = (sub) => {
        sub.editing = false;
        sub.cost = sub.editCost;
        sub.location = sub.editLocation;
        sub.description = sub.editDescription;
        this.setState({
            subscriptions: this.state.subscriptions,
        });
    }

    saveProfile = () => {
        let subscriptions = this.state.subscriptions;
        subscriptions.forEach(s => {
            delete s.show;
            delete s.editing;
            delete s.editCost;
            delete s.editLocation;
            delete s.editDescription;
        });
        let body = {
            subscriptions: this.state.subscriptions,
        };
        fetch("/api/save_profile", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
        }).then(
            res => {
                if (res.status === 200) {
                    window.location.reload();
                } else {
                    alert("There was an issue saving your entry. Please make sure you're logged in.");
                }
            }
        )
    }
}