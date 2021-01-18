import React, {Component} from "react"
import "./UploadMap.css"
import * as AiIcons from "react-icons/ai";
import { Link } from 'react-router-dom';

class UploadMap extends React.Component() {
    constructor() {
        super()
        this.state = {
            name: "",
            selectedFile: null,
        }
    }
    render() {
        return(
            <div className="upload-map">
                <div id="upload-box">
                    <Link to="/startpage" className="close-icon">
                        <AiIcons.AiOutlineClose />
                    </Link>
                    <form>
                        <input type="file" /> <br></br>
                        
                    </form>
                </div>
            </div>
        )
    }
}


// export default UploadMap