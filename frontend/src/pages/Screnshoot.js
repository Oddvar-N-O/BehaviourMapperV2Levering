import React from 'react';
import domtoimage from 'dom-to-image';

class Screenshot extends React.Component {
    constructor(props) {
     super(props);
   }
 
 takeScreenshot = event => {
   event.preventDefault();
   var node = document.querySelector('.previewComponent');
     domtoimage.toPng(node).then(function (dataUrl) {
         var img = new Image();
         img.src = dataUrl;
         document.body.appendChild(img);
         console.log(img)
     }).catch(function (error) {
         console.error('oops, something went wrong!', error);
     });
 }
   
   render() {
     return (
       <div className="previewComponent">
            <div>
                <input
                        id="submit"
                        type="submit"
                        value="Take screenshot"
                        onClick={this.takeScreenshot}
                    />
            </div>
        </div>
     )
   }
 }
 
export default Screenshot;