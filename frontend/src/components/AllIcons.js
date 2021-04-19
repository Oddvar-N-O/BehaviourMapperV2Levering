import React from 'react'
import Icon from './Icon'
import './AllIcons.css'
import * as AiIcons from 'react-icons/ai';

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
            yellowData: [],
            u_id: window.sessionStorage.getItem('uID'),

        };
    };

    componentDidMount() {
        fetch(window.backend_url + `getfiguredata?u_id=${this.state.u_id}`)
        .then(response => response.json()) 
        .then(data => {
            // console.log('DATA: ' + data[1].id)
            this.setState({
                allIconData: data
            })
            console.log(this.state.allIconData)
            for (let i=0; i<this.state.allIconData.length; i++){
                if (this.state.allIconData[i].color === "red"){
                    this.state.redData.push(this.state.allIconData[i])
                } else if (this.state.allIconData[i].color === "blue") {
                    this.state.blueData.push(this.state.allIconData[i])
                } else if (this.state.allIconData[i].color === "green") {
                    this.state.greenData.push(this.state.allIconData[i])
                } else {
                    this.state.yellowData.push(this.state.allIconData[i])
                }
            }            
        })
        this.handleChange = this.handleChange.bind(this)
        console.log(this.state.yellowData)
    };

    handleChange(event) {
        this.setState({
            color: event.target.value
        })        
    }

    render () {
        const redIcons = this.state.redData.map(data => 
            
            <div key={data.id} className='single-icon'>
                <div className='single-icon' onClick={this.props.selectIcon}>
                    <Icon 
                    description={data.description} 
                    color={data.color}
                    f_id={data.id}/>
                    </div>
                    <div className="icon-description">{data.description}
                </div>
            </div>)
            
        const blueIcons = this.state.blueData.map(data => 
            <div key={data.id} className='single-icon'>
                <div className='single-icon' onClick={this.props.selectIcon}>
                    <Icon
                    description={data.description} 
                    color={data.color}
                    f_id={data.id}/>
                    </div>
                    <div className="icon-description">{data.description}
                </div>
            </div>)

        const greenIcons = this.state.greenData.map(data => 
            <div key={data.id} className='single-icon'>
                <div className='single-icon' onClick={this.props.selectIcon}>
                    <Icon 
                    description={data.description} 
                    color={data.color}
                    f_id={data.id}/>
                    </div>
                    <div className="icon-description">{data.description}
                </div>
            </div>)

        const yellowIcons = this.state.yellowData.map(data => 
            <div key={data.id} className='single-icon'>
                <div className='single-icon' onClick={this.props.selectIcon}>
                    <Icon 
                    description={data.description} 
                    color={data.color}
                    f_id={data.id}/>
                    </div>
                    <div className="icon-description">{data.description}
                </div>
            </div>)

        return (
            <div className="icon-select">
                <ul className="gender-select">
                    <li onClick={() => {
                        this.setState({color: "blue"})}}
                        className={ this.state.color === "blue" ? "selected" : "not-selected" }
                        >Man
                    </li>
                    <li onClick={() => {this.setState({color: "red"})}}
                        className={ this.state.color === "red" ? "selected" : "not-selected" }
                        >Woman
                    </li>
                    <li onClick={() => {this.setState({color: "green"})}}
                        className={ this.state.color === "green" ? "selected" : "not-selected" }
                        >Child
                    </li>
                    <li onClick={() => {this.setState({color: "yellow"})}}
                        className={ this.state.color === "yellow" ? "selected" : "not-selected" }
                        >Group
                    </li>
                    <div className="x" onClick={this.props.close}><AiIcons.AiOutlineClose /></div>
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

                <div className={this.state.color==="yellow" ? "icons-visible" : "icons-invisible"}>
                    {yellowIcons}
                </div>
                
            </div>
        )
    }
}


export default AllIcons