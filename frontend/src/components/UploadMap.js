import React from "react"
import "./UploadMap.css"
import * as AiIcons from "react-icons/ai";
import { Link } from 'react-router-dom';

// methods from https://medium.com/excited-developers/file-upload-with-react-flask-e115e6f2bf99

class UploadMap extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            iamgeURL: '',
            buttonText: 'Choose image',
            u_id: window.sessionStorage.getItem('uID'),
        }
        this.handleUploadImage = this.handleUploadImage.bind(this);
    }

    handleUploadImage(ev) {
        alert("upload start")
        ev.preventDefault();
    
        const data = new FormData();
        data.append('file', this.uploadInput.files[0]);
        data.append('u_id', this.state.u_id);
        // data.append('filename', this.fileName.value);
    
        fetch(window.backend_url + 'upload', {
          method: 'POST',
          body: data,
        }).then((response) => {
          response.json().then((body) => {
            this.setState({ imageURL: window.backend_url + `${body.file}` });
          });
        });
        alert("upload finished")
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
                            <label className='file-button'><input ref={(ref) => { this.uploadInput = ref; }} type="file"  ></input>Choose file</label>
                        </div>
                        {/* <div>
                            <input ref={(ref) => { this.fileName = ref; }} type="text" placeholder="Enter filename" />
                        </div>  */}
                        <br />
                        <div>
                            <button>Upload</button>
                        </div>
                        {/* <img src={this.state.imageURL} alt="img" /> */}
                    </form>
                </div>
            </div>
        )
    }
}


export default UploadMap     