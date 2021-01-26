import React from 'react';
import "./newProject.css"
import { withRouter } from "react-router";
import { Link } from 'react-router-dom';
import * as AiIcons from "react-icons/ai";
// import Upload from "../components/UploadMap"

class NewProject extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            projectName: "",
            projectNameText: "Project Name",
            description: "",
            iamgeURL: '',
            redirect: false,
            fromLoadMap: props.location.state.fromLoadMap
        }
        
        this.handleChange = this.handleChange.bind(this)
        this.handleUploadImage = this.handleUploadImage.bind(this);
    }

    handleChange(event) { 
        const {name, value} = event.target  
        this.setState({
            [name]: value
        })
    }

    handleUploadImage(ev) {
        ev.preventDefault();

        const data = new FormData();
        data.append('file', this.uploadInput.files[0]);
        // data.append('filename', this.fileName.value);
    
        fetch('http://localhost:5000/upload', {
          method: 'POST',
          body: data,
        }).then((response) => {
          response.json().then((body) => {
            this.setState({ imageURL: `http://localhost:5000/${body.file}` });
          });
        });
    }

    setRedirect() {
        if (this.state.projectName !== ""){
            this.props.history.push('/chooseImage')
            }
        
        else {
            this.setState({projectNameText: "Project Name Required"})
        }
    }

    render() {
        return (
            <div id="new-project">
                <div className={ this.state.fromLoadMap ? 'new-project-box-big' : 'new-project-box'}>
                    <Link to="/startpage" className="close-icon">
                        <AiIcons.AiOutlineClose />
                    </Link>
                    <div id="heading-and-form">
                        <h2>New Project {this.state.fromLoadMpap}</h2>
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

                    <form onSubmit={this.handleUploadImage} className= { this.state.fromLoadMap ? 'file-management' : 'hide-file-management'}>
                        <div>
                            <label className='file-button'><input ref={(ref) => { this.uploadInput = ref; }} type="file"  ></input>Choose file</label>
                        </div>
                        <div>
                        <label className='upload-button'><button className="hidden-button" />Upload</label>
                        </div>
                        </form>

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