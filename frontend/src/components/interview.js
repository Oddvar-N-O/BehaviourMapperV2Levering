import React from 'react'
import './Interview.css'
import * as AiIcons from 'react-icons/ai';
import { withTranslation } from 'react-i18next';

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
        const { t } = this.props;
        return (
            <div className="interview-box">
                <div className="interview-box-heading">
                    <h2>{t('interview.interview')}</h2>
                    <div className="x" onClick={this.props.close}>
                        <AiIcons.AiOutlineClose/>
                    </div>
                </div>
                <form>
                    <legend>{t('interview.notes')}</legend> 
                    <textarea 
                        id="interview"
                        name="interview" 
                        value={this.state.interview} 
                        onChange={this.handleChange}
                    />
                </form>
                
            </div>
        )
    }
}


export default withTranslation('common', {withRef: true})(Interview)