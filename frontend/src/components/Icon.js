import React, { useEffect, useState } from 'react'

function Icon(props) {

    const [icon, setIcon] = useState("")
    
    useEffect(() => {
        fetch(`getfigure?description=${props.description}&color=${props.color}`)
        .then(result => result.blob()) 
        .then(images => {
            var image = URL.createObjectURL(images)
            setIcon(image)
        })
    },
    [props.description, props.color]); 
    
    return (
        <>  
            <img id={props.description + " " + props.color} className="single-icon" alt="icon" src={icon}></img>
        </>
    );    
}
export default Icon