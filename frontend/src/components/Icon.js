import React, { Component } from 'react'

class Icon extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            color: this.props.color,
            description: this.props.description,
            icon: null
        };
    };

    componentDidMount() {
        // console.log(this.props)
        fetch(`getfigure?description=${this.state.description}&color=${this.state.color}`)
        .then(result => result.blob()) 
        .then(images => {
            var image = URL.createObjectURL(images)
            this.setState({
                icon: image,
            })
        }); 
    };

    render () {
        return (
            <>
                <img className="single-icon" src={ this.state.icon }></img>
            </>
        )
    }
}


export default Icon