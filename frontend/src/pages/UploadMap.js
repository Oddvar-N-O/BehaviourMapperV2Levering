import React from "react"
import "./UploadMap.css"
import * as AiIcons from "react-icons/ai";
import { Link } from 'react-router-dom';
import axios from 'axios'

class UploadMap extends React.Component {
    constructor() {
        super()
        this.state = {
            name: "",
            selectedFile: null,
        }
    }

    changeFile = event => {
        // the first element of target.files
        // is the file itself
        console.log(event.target.files[0]);
        // we set the file on change in input
        this.setState({
            selectedFile: event.target.files[0]
        })
    }

    uploadFile  = () => {
        // Vi lager en informasjonskapsel som vi vil sende
        const imageDBEntry = new FormData();
        // vi gir den tittel, innhold og navn(det siste)
        imageDBEntry.append('image', this.state.selectedFile, this.state.selectedFile.name)
        // vi sender til upload
        // bør det ikke være en egen addresse for
        // faktiske uploading?

        // Du kan skrive det under som:
        // axios.post('http://localhost:3000/upload', imageDBEntry);
        // Da det eneste som trends
        axios.post('http://localhost:3000/upload', imageDBEntry, {
            onUploadProgress: ProgressEvent => {
                console.log('Progress: '+ Math.round(ProgressEvent.loaded / ProgressEvent.total * 100 ) + '%')
            }
        })
            .then(result => {
                console.log(result)
            });
    }

    render() {
        return(
            <div className="upload-map">
                <div id="upload-box">
                    <Link to="/startpage" className="close-icon">
                        <AiIcons.AiOutlineClose />
                    </Link>
                    <form>
                        <input type="file" onChange={this.changeFile} /> <br></br>
                    </form>
                    <button id="upload-button" onClick={this.uploadFile}>Upload</button>
                </div>
            </div>
        )
    }
}


export default UploadMap