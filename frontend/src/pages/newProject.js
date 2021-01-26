import React from 'react';
import "./newProject.css"
import { Link } from 'react-router-dom';
import * as AiIcons from "react-icons/ai";

class NewProject extends React.Component {
    constructor() {
        super()
        this.state = {
            projectName: "",
            projectNameText: "Project Name",
            description: "",
            redirect: false,
        }
        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(event) { 
        const {name, value} = event.target  
        this.setState({
            [name]: value
        })
    }

    setRedirect(event) {
        if (this.state.projectName !== ""){
            event.preventDefault();
    
            const data = new FormData();
            data.append('name', this.state.projectName);
            data.append('description', this.state.description);
            data.append('startdate', new Date());
        
            fetch('http://localhost:5000/addproject', {
            method: 'POST',
            body: data,
            }).then((response) => {
            response.json().then((body) => {
                this.props.history.push('/mapping');
            });
            });
            this.props.history.push('/mapping')
            }
        
        else {
            this.setState({projectNameText: "Project Name Required"})
        }
    }

    render() {
        return (
            <div id="new-project">
                <div id="new-project-box">
                    <Link to="/startpage" className="close-icon">
                        <AiIcons.AiOutlineClose />
                    </Link>
                    <div id="heading-and-form">
                        <h2>New Project</h2>
                        <form>
                            <legend>{this.state.projectNameText}</legend> 
                            <input 
                                id="project-name"
                                type="text" 
                                name="projectName" 
                                value={this.state.projectName} 
                                onChange={this.handleChange}
                            /> 
                            <br/>
                            <legend>Description</legend>
                            <textarea 
                                id="description"
                                name="description" 
                                value={this.state.description} 
                                placeholder="E.g. time of day, wheather conditions, special events etc." 
                                onChange={this.handleChange}
                            />
                        </form>
                    </div>
                    <ul>
                        {/*Det er her vi sendes til Mapping*/}
                    <li id="start" onClick={this.setRedirect.bind(this)}>Let's go!</li>
                        {/* <li id="cancel">Cancel</li> */}
                    </ul>
                </div>
                
            </div>
        )
    }
}
export default NewProject