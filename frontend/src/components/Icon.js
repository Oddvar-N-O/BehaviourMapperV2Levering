import React, { useEffect, useState } from 'react'

function Icon(props) {

    const [icon, setIcon] = useState("")
    useEffect(() => {
        fetch(`getfigure?description=${props.description}&color=${props.color}`)
        .then(result => result.blob())
        .then(images => {
            // console.log('imS: ' + images)
            var image = URL.createObjectURL(images)
            // console.log('created IMAGE: ' + image)
            // image er det samme her som hos oss "./icons/man/bike.png"
            setIcon(image)
        })
    },
    [props.description, props.color, props.f_id]); 
    
    return ( // dette funker ikke
        <>  
            <img id={props.description + " " + props.color + " " + props.f_id} className="single-icon" alt="icon" src={icon}></img>
        </>
    );    
}
export default Icon