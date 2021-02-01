import React from 'react';
import "./newProject.css"
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
        const {name, value} = event.target;
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
            if (response.status > 199 && response.status < 300) {
                console.log(response.status)
            }
            response.json().then((body) => {
            this.setState({ imageURL: `http://localhost:5000/${body.file}` });
          });
        });
    }

    setRedirect(event) {
        if (this.state.projectName !== ""){
            event.preventDefault();
            console.log(this.state.fromLoadMap)
            if (this.state.fromLoadMap === true) {
        
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
            } else {
                // this.props.history.push('/chooseImage')
            } 
        } else {
            this.setState({projectNameText: "Project Name Required"})
        }
    }

    changeButton(event) {
        const {name, value} = event.target;
        this.state.projectName = value;
        this.setState({})

        var relevantButton;
        var textButton = document.getElementById('choose-name');
        if (this.state.fromLoadMap === true) { 
            relevantButton = document.getElementById('start-UP');
        } else {
            relevantButton = document.getElementById('start-OSM');
        }
        
        if (this.state.projectName !== ""){
            relevantButton.style.display = 'block';
            textButton.style.display = 'none';
        } else {
            relevantButton.style.display = 'none';
            textButton.style.display = 'block';
            /* relevantButton.style.display = 'none';
            uselessButton = document.getElementById('start_startButton');
            uselessButton.style.display = 'block';*/
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
                                onChange={(e) => this.changeButton(e)}
                                
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
                        <input ref={(ref) => { this.uploadInput = ref; }} type="file"  className='file-button'></input>
                        <button className='upload-button'>Upload</button>
                    </form>

                    <ul>
                        {/*Det er her vi sendes til Mapping*/}
                        <li id="start-UP" onClick={this.setRedirect.bind(this)}>Go to Behaviour Mapping</li>
                        <Link to={{
                        pathname: "/chooseImage",
                        state: {
                            kartnavn: this.state.projectName
                        }
                        }}><li id="start-OSM">World Map</li></Link>
                        <li id="choose-name">Choose a name to proceed</li>
                        <li>Choose a file</li>
                        {/*<li id="start" onClick={this.setRedirect.bind(this)}>Let's go!</li>*/}
                        {/* <li id="cancel">Cancel</li> */}
                    </ul>
                </div>
                
            </div>
        )
    }
}
export default NewProject