import React from 'react';
import Kart from '../components/Kart';
import './ChooseImage.css'

class ChooseImage extends React.Component {
    constructor(props) {
        super(props)
        this.handleChange = this.handleChange.bind(this)

        this.state = {
          kartnavn: props.location.state.kartnavn,

        }
    }

    handleChange(event) { 
        const {name, value} = event.target  
        this.setState({
            [name]: value
        })
    }

    showProps() {
      console.log(this.props);
      console.log("teeesst");
      console.log(this.state.kartnavn)
    }

    setRedirect() {
      this.props.history.push('/upload');
    }

    render() {
        return (
          <div id="mapbox">
            <Kart name={this.state.kartnavn}/>
            {/*Det er her vi sendes til Mapping*/}
            <button className="download" onClick={() => this.showProps()}>Show Props</button>
            <button className="download" onClick={this.setRedirect.bind(this)}>Upload Image</button>
            {/* <li id="cancel">Cancel</li> */}
          </div>
        )
    }
}


export default ChooseImage