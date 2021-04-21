import React, { useEffect, useState } from 'react';

function EventIcon(props) {
    const [updating, setUpdating] = useState(false);
    const [id, setId] = useState(null);
    const [ourIconCoordinates, setCoordinates] = useState({x: 0, y: 0});
    const [mapSizeOnCreation, setMapSize] = useState({x: 0, y: 0});
    const [rotation, setRotation] = useState('rotate(0deg)');
    const [comment, setComment] = useState(null);
    const [send, setSend] = useState(false);
    const [bccolor, setBcolor] = useState('blue');

    useEffect(() => { // plasser ikonet
        console.log(props.currentNewID);
        setId(props.currentNewID)
        console.log('coord: ' + ourIconCoordinates.x + " " + ourIconCoordinates.y)
        setCoordinates({x: 400, y: 200});
        console.log('coord: ' + ourIconCoordinates.x + " " + ourIconCoordinates.y)
        if (bccolor == 'blue') {
            setBcolor('green');
        } else {
            setBcolor('blue');
        }
        
    });

    useEffect(() => { // oppdater eller send for første gang
        if(send) {
            if(updating) {
                console.log('updating')
            } else {
                console.log('sending for the first time')
                setUpdating(true)
            }
          sendToDatabase();
        }
        console.log('Not Sending')
    });
    
    // change rotation, change values, when values changed update component
    // include a variable checking for updates, run this when outside
    // the function.
    /* const [allProjects, setAllProjects] = useState('No projects found');
    const [currProj, setCurrProj] = useState({"id": null});
    const [currImage, setCurrImage] = useState(null)*/

    function sendToDatabase() {
        console.log('sending')
      /*   setBackgroundColor("#9b34ee");
        updateTimer.current = setTimeout(() => {
          setBackgroundColor("inherit");
          updateTimer.current = null;
        }, 1000);*/
    }

  
    return ( // id="container"
        <div>
            <img id={props.currentNewID} src={props.chosenSRC}
            style={{transform: rotation, backgroundColor: bccolor,
            left: ourIconCoordinates.x, top: ourIconCoordinates.y,
            height: '10px', width: '10px'}}></img>
        </div>
    )
  }
  
  export default EventIcon;