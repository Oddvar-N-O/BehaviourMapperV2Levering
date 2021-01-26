import React from "react"
import "./UploadMap.css"
import * as AiIcons from "react-icons/ai";
import { Link } from 'react-router-dom';

// methods from https://medium.com/excited-developers/file-upload-with-react-flask-e115e6f2bf99

class UploadMap extends React.Component {
    constructor() {
        super()
        this.state = {
            iamgeURL: '',
        }
        this.handleUploadImage = this.handleUploadImage.bind(this);
    }

    handleUploadImage(ev) {
        ev.preventDefault();
    
        const data = new FormData();
        data.append('file', this.uploadInput.files[0]);
        data.append('filename', this.fileName.value);
    
        fetch('http://localhost:5000/upload', {
          method: 'POST',
          body: data,
        }).then((response) => {
          response.json().then((body) => {
            this.setState({ imageURL: `http://localhost:5000/${body.file}` });
          });
        });
    }

    render() {
        return(
            <div className="upload-map">
                <div id="upload-box">
                    <Link to="/startpage" className="close-icon">
                        <AiIcons.AiOutlineClose />
                    </Link>
                    <form onSubmit={this.handleUploadImage}>
                        <div>
                            <input ref={(ref) => { this.uploadInput = ref; }} type="file" />
                        </div>
                        <div>
                            <input ref={(ref) => { this.fileName = ref; }} type="text" placeholder="Enter filename" />
                        </div>
                        <br />
                        <div>
                            <button>Upload</button>
                        </div>
                        <img src={this.state.imageURL} alt="img" />
                    </form>
                </div>
            </div>
        )
    }
}


export default UploadMap     