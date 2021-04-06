import React from 'react';
import domtoimage from 'dom-to-image';

class Screenshot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      p_id: 1,
      name: "nameson",
      u_id: window.sessionStorage.getItem('uID'),
    }
    this.takeScreenshot = this.takeScreenshot.bind(this);
  }
 
  takeScreenshot = event => {
    event.preventDefault();
    var node = document.querySelector('.previewComponent');
    domtoimage.toPng(node).then(dataURI => this.dataURItoBlob(dataURI))
    .then(blob => {
      let file = new File([blob], "this.png", {lastModified: new Date().getTime(), type: "image/png"})
      const data = new FormData();
      data.append('file', file);
      data.append('p_id', 1);
      data.append('u_id', window.sessionStorage.getItem('uID'));
      data.append('map', false);
      fetch(window.backend_url + 'upload', {
        method: 'POST',
        body: data,})
      }).catch(function (error) {
          console.error('oops, something went wrong!', error);
      });
  }

  // https://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
  dataURItoBlob(dataURI) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteString = atob(dataURI.split(',')[1]);
  else
      byteString = unescape(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], {type:mimeString});
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