import React from 'react'
import './interview.css'

class CoordinateWindow extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            alreadySaved: false,
            leftX: null,
            lowerY: null,
            rightX:  null,
            upperY: null,
        };
        this.handleChange = this.handleChange.bind(this);
    };

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
                    <label>
                        Upper Left Corner:
                        <input type="text" name="name" />
                    </label>
                    <label>
                        Upper Right Corner:
                        <input type="text" name="name" />
                    </label>
                    <label>
                        Lower Left Corner:
                        <input type="text" name="name" />
                    </label>
                    <label>
                        Lower Right Corner:
                        <input type="text" name="name" />
                    </label>
                    <input type="submit" value="Submit" />
                    {/* <input type="submit" value="Save interview" onClick={this.props.save} className={this.state.alreadySaved ? "invisible" : "visible"}></input> */}
                </form>
                
            </div>
        )
    }
}


export default CoordinateWindow