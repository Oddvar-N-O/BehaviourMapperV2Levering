import React from "react"
import "./UploadMap.css"
import * as AiIcons from "react-icons/ai";
import { Link } from 'react-router-dom';

function UploadMap() {
    return(
        <div className="upload-map">
            <div id="upload-box">
                <Link to="/startpage" className="close-icon">
                    <AiIcons.AiOutlineClose />
                </Link>
                <form>
                    <input type="file" /> <br></br>
                    <button>Upload</button>
                </form>
            </div>
        </div>
    )
}

export default UploadMap