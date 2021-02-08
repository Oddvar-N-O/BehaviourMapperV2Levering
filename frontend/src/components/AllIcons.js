import React from 'react'
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
            for (let i=0; i<this.state.allIconData.length; i++){
                if (this.state.allIconData[i].color === "red"){
                    this.state.redData.push(this.state.allIconData[i])
                } else if (this.state.allIconData[i].color === "blue") {
                    this.state.blueData.push(this.state.allIconData[i])
                } else {
                    this.state.greenData.push(this.state.allIconData[i])
                }
            }            
        })
        this.handleChange = this.handleChange.bind(this)
    };

    handleChange(event) {
        this.setState({
            color: event.target.value
        })        
    }

    render () {
        const redIcons = this.state.redData.map(data => 
            <div onClick={this.props.closeIconSelect}>
                <Icon key={data.id} 
                description={data.description} 
                color={data.color}/>
                </div>)
            
        const blueIcons = this.state.blueData.map(data => 
            <div onClick={this.props.closeIconSelect}>
                <Icon key={data.id} 
                description={data.description} 
                color={data.color}/>
                </div>)
        const greenIcons = this.state.greenData.map(data => 
            <div onClick={this.props.closeIconSelect}>
                <Icon key={data.id} 
                description={data.description} 
                color={data.color}/>
                </div>)

        return (
            <div className="icon-select">
                <ul className="gender-select">
                    <li onClick={() => {
                        this.setState({color: "blue"})}}
                        className={ this.state.color === "blue" ? "selected" : "not-selected" }
                        >Man</li>
                    <li onClick={() => {
                        this.setState({color: "red"})}}
                        className={ this.state.color === "red" ? "selected" : "not-selected" }
                        >Woman</li>
                    <li onClick={() => {
                        this.setState({color: "green"})}}
                        className={ this.state.color === "green" ? "selected" : "not-selected" }
                        >Child</li>
                </ul>
        
                <div className={this.state.color==="red" ? "icons-visible" : "icons-invisible"}>
                    {redIcons}
                </div>
                    
                <div className={this.state.color==="blue" ? "icons-visible" : "icons-invisible"}>
                    {blueIcons}
                </div>

                <div className={this.state.color==="green" ? "icons-visible" : "icons-invisible"}>
                    {greenIcons}
                </div>
                
            </div>
        )
    }
}


export default AllIcons