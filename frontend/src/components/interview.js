import React from 'react'
import './interview.css'
import * as AiIcons from 'react-icons/ai';

class Interview extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            interview: "",
            currentInterview: "",
            alreadySaved: false,
        };
        this.handleChange = this.handleChange.bind(this);
    };

    clearInterview() {
        this.setState({interview: ""});
    }
    setInterview(text) {
        this.setState({interview: text});
    }

    handleChange(e) {
        const {name, value} = e.target;
        this.setState({
            [name]: value
        }, function() {});
    };

    render () {
        return (
            <div className="interview-box">
                <div className="interview-box-heading">
                    <h2>Interview </h2>
                    <div className="x" onClick={this.props.close}>
                        <AiIcons.AiOutlineClose/>
                    </div>
                </div>
                <form>
                    <legend>Notes</legend> 
                    <textarea 
                        id="interview"
                        name="interview" 
                        value={this.state.interview} 
                        placeholder="E.g. time of day, wheather conditions, special events etc." 
                        onChange={this.handleChange}
                    />
                    {/* <input type="submit" value="Save interview" onClick={this.props.save} className={this.state.alreadySaved ? "invisible" : "visible"}></input> */}
                </form>
                
            </div>
        )
    }
}


export default Interview