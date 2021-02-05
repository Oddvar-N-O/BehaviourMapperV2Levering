import React from 'react';
import './newProject.css'
import { Link } from 'react-router-dom';
import * as AiIcons from 'react-icons/ai';

class NewProject extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            projectName: "",
            projectNameLegend: "Project Name",
            projectImageLegend: "Image",
            description: "",
            iamgeURL: '',
            redirect: false,
            fromLoadMap: props.location.state.fromLoadMap,
            liColor: "#F3F7F0",
        }
        
        this.handleChange = this.handleChange.bind(this);
        this.handleUploadImage = this.handleUploadImage.bind(this);
        this.setRedirect = this.setRedirect.bind(this)
    }

    handleChange(event) { 
        const {name, value} = event.target;
        this.setState({
            [name]: value
        })
        
    }

    changeColor() {
        this.setState({ liColor: "#FF0000" })
    }

    handleUploadImage(ev) {
        if (!this.state.fromLoadMap) {
            return
        }
        ev.preventDefault();
        
        const data = new FormData();
        data.append('file', this.uploadInput.files[0]);
    
        fetch('http://localhost:5000/upload', {
          method: 'POST',
          body: data,
        }).then((response) => {
            response.json().then((body) => {
            this.setState({ imageURL: `http://localhost:5000/${body.file}` });
          });
        });
        
    }

    setRedirect(event) {
        event.preventDefault();
        if (this.state.fromLoadMap) {
            if (this.state.projectName !== "" && this.uploadInput.files.length !== 0){
                this.handleRedirect();
            } else  {
                this.setState({projectNameLegend: "Project Name Required"});
                this.setState({projectImageLegend: "Image Required"});
                this.changeColor();
            }
        } else {
            if (this.state.projectName !== ""){
                this.handleRedirect();
            } else  {
                this.setState({projectNameLegend: "Project Name Required"});
                this.changeColor();
            }
        }
        
    }
    handleRedirect() {
        const data = new FormData();
        data.append('name', this.state.projectName);
        data.append('description', this.state.description);
        data.append('startdate', new Date());
        
        fetch('http://localhost:5000/addproject', {
        method: 'POST',
        body: data,
        }).then((response) => {
            response.json().then(() => {
                if (this.fromLoadMap) {
                    this.props.history.push({
                        pathname: '/mapping',
                    });
                } else {
                    this.props.history.push({
                        pathname: '/chooseImage',
                        state: {
                            kartnavn: this.state.projectName
                        },
                    });
                }
                
            });
        });
    }

    render() {
        return (
            <div id="new-project">
                <div className={ this.state.fromLoadMap ? 'new-project-box-upload' : 'new-project-box'}>
                    <Link to="/startpage" className="close-icon">
                        <AiIcons.AiOutlineClose />
                    </Link>
                    <div id="heading-and-form">
                        <h2>New Project {this.state.fromLoadMpap}</h2>
                        <form>
                            <legend>{this.state.projectNameLegend}</legend> 
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

                    <form className= { this.state.fromLoadMap ? 'file-management' : 'hide-file-management'}>
                        <legend>{this.state.projectImageLegend}</legend>
                        <input ref={(ref) => { this.uploadInput = ref; }} type="file"  className='file-button'></input>
                    </form>

                    <ul>
                       <li 
                        onClick={ (e) => {
                            if (this.state.fromLoadMap && this.uploadInput.files.length !== 0) {
                                this.handleUploadImage(e);
                            }
                            this.setRedirect(e);
                            
                        }} style={{backgroundColor: this.state.liColor}}>Let's go!</li>
                    </ul>
                </div>
                
            </div>
        )
    }
}
export default NewProject