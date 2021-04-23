import React from 'react'
import './AddComment.css'
import * as AiIcons from 'react-icons/ai';

class AddComment extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            comment: "",
            currentComment: "",
            alreadySaved: false,
        };
        this.handleChange = this.handleChange.bind(this);
    };

    clearComment() {
        this.setState({comment: ""});
    }
    setComment(text) {
        this.setState({comment: text});
    }

    handleChange(e) {
        const {name, value} = e.target;
        this.setState({
            [name]: value
        }, function() {});
    };

    render () {
        return (
            <div className="comment-box">
                <div className="comment-box-heading">
                    <h2>Comment </h2>
                    <div className="x" onClick={this.props.close}>
                        <AiIcons.AiOutlineClose/>
                    </div>
                </div>
                <form>
                    <legend>Notes</legend> 
                    <textarea 
                        id="comment"
                        name="comment" 
                        value={this.state.comment} 
                        placeholder="E.g. time of day, wheather conditions, special events etc." 
                        onChange={this.handleChange}
                    />
                    <input type="submit" value={this.state.alreadySaved ? "Update comment" : "Save comment"} onClick={this.props.save}></input>
                </form>
                
            </div>
        )
    }
}


export default AddComment