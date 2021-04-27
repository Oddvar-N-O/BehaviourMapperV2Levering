import React from 'react'
import './AddComment.css'
import * as AiIcons from 'react-icons/ai';
import { withTranslation } from 'react-i18next';

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
        const { t } = this.props;
        return (
            <div className="comment-box">
                <div className="comment-box-heading">
                    <h2>{t('comments.comment')} </h2>
                    <div className="x" onClick={this.props.close}>
                        <AiIcons.AiOutlineClose/>
                    </div>
                </div>
                <form>
                    <legend>{t('comments.notes')}</legend> 
                    <textarea 
                        id="comment"
                        name="comment" 
                        value={this.state.comment} 
                        // placeholder="E.g. time of day, wheather conditions, special events etc." 
                        onChange={this.handleChange}
                    />
                    <input type="submit" value={this.state.alreadySaved ? t('comments.update') : t('comments.save')} onClick={this.props.save}></input>
                </form>
                
            </div>
        )
    }
}


export default withTranslation('common', { withRef: true })(AddComment)