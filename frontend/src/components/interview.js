import React from 'react'
import * as AiIcons from 'react-icons/ai';

class Interview extends React.Component {
    constructor() {
        super()
        this.state = {
            answer: "",
        };
    };

    componentDidMount() {
    };

    handleChange() {
   
    };

    render () {
        return (
            <div className="icon-select">
                Interviewboks
                <div className="x" onClick={this.props.close}><AiIcons.AiOutlineClose  className="close-icon"/></div>
                
            </div>
        )
    }
}


export default Interview