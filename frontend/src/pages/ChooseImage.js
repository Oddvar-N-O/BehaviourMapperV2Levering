import React from 'react';
import Kart from '../components/Kart';
import './ChooseImage.css'

class ChooseImage extends React.Component {
    constructor() {
        super()
        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(event) { 
        const {name, value} = event.target  
        this.setState({
            [name]: value
        })
    }

    setRedirect() {
      this.props.history.push('/upload')
    }

    render() {
        return (
          <div id="mapbox">
            <Kart />
            {/*Det er her vi sendes til Mapping*/}
            <button className="download" onClick={this.setRedirect.bind(this)}>Upload Image</button>
            {/* <li id="cancel">Cancel</li> */}
          </div>
        )
    }
}


export default ChooseImage