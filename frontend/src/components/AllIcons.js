import React, { Component } from 'react'
import Icon from './Icon'
// import { colors, description } from "./IconData"

// Velger farge som settes i state
// 

class AllIcons extends React.Component {
    constructor() {
        super()
        this.state = {
            color: "red",
            descriptions: [],
            icon: ""
        };
    };

    componentDidMount() {
        fetch(`getallfiguredescriptions?color=${this.state.color}`)
        .then(response => response.json()) 
        .then(data => {
            console.log("data: " + data)
            this.setState({
                descriptions: data
            })
            console.log("state inside: " + this.state.descriptions)
        })
        console.log("state outside: " + this.state.descriptions)
    };

    

    render () {

        const allIcons = this.state.descriptions.map(icon => <Icon key={icon.description} description={icon} color={this.state.color}/>)

        return (
            <div>
                {allIcons}
                {/* <Icon description={this.state.descriptions[0]} color={this.state.color}/> */}
            </div>
        )
    }
}


export default AllIcons