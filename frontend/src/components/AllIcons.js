import React, { Component } from 'react'
import Icon from './Icon'
import './AllIcons.css'

class AllIcons extends React.Component {
    constructor() {
        super()
        this.state = {
            color: "blue",
            icon: "",
            allIconData: [],
            redData: [],
            blueData: [],
            greenData: [],

        };
    };

    componentDidMount() {
        fetch(`getfiguredata`)
        .then(response => response.json()) 
        .then(data => {
            this.setState({
                allIconData: data
            })
            console.log(this.state.allIconData)
            for (let i=0; i<this.state.allIconData.length; i++){
                if (this.state.allIconData[i].color === "red"){
                    this.state.redData.push(this.state.allIconData[i])
                } else if (this.state.allIconData[i].color === "blue") {
                    this.state.blueData.push(this.state.allIconData[i])
                } else {
                    this.state.greenData.push(this.state.allIconData[i])
                }
            }
            console.log(this.state.redData[5].id)
            
        })
        this.handleChange = this.handleChange.bind(this)
    };

    handleChange(event) {
        this.setState({
            color: event.target.value
        })
        console.log("event value: " + event.target.value)
        
    }

    render () {
        const redIcons = this.state.redData.map(data => 
            <li onClick={this.props.closeIconSelect}><Icon key={data.id} description={data.description} color={data.color}/></li>)
            
        const blueIcons = this.state.blueData.map(data => 
            <li onClick={this.props.closeIconSelect}><Icon key={data.id} description={data.description} color={data.color}/></li>)

        const greenIcons = this.state.greenData.map(data => 
            <li onClick={this.props.closeIconSelect}><Icon key={data.id} description={data.description} color={data.color}/></li>)

        return (
            <div className="icon-select">
                <ul className="gender-select">
                    <li onClick={() => {
                        this.setState({color: "blue"})}}
                        >Man</li>
                    <li onClick={() => {
                        this.setState({color: "red"})}}
                        >Woman</li>
                    <li onClick={() => {
                        this.setState({color: "green"})}}
                        >Child</li>
                </ul>
                
                <div className={this.state.color==="red" ? "visible" : "invisible"}>
                    {redIcons}
                </div>
                    
                <div className={this.state.color==="blue" ? "visible" : "invisible"}>
                    {blueIcons}
                </div>

                <div className={this.state.color==="green" ? "visible" : "invisible"}>
                    {greenIcons}
                </div>
            </div>
        )
    }
}


export default AllIcons