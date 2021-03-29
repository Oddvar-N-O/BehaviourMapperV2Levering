import React, { useEffect, useState } from 'react'

function Icon(props) {

    const [icon, setIcon] = useState("")
    const u_id = window.sessionStorage.getItem('uID');
    
    useEffect(() => {
        fetch(window.backend_url + `getfigure?description=${props.description}&color=${props.color}&u_id=${u_id}`)
        .then(result => result.blob()) 
        .then(images => {
            var image = URL.createObjectURL(images)
            setIcon(image)
        })
    },
    [props.description, props.color, u_id]); 
    
    return (
        <>  
            <img id={props.description + " " + props.color} className="single-icon" alt="icon" src={icon}></img>
        </>
    );    
}
export default Icon