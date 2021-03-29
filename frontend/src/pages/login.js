import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Login() {
  const [placeholder, setPlaceholder] = useState('Prosjektet finnes ikke.')
  const color = 'green'

  useEffect(() => {
    fetch(window.backend_url + `getfigure?description=bike&color=${color}`)
    .then(res => res.blob())
    .then(images => {
      var image = URL.createObjectURL(images)
      document.getElementById("figur").src = image
      }); 
    },
  []);
  useEffect(() => {
    fetch(window.backend_url + 'getproject?u_id=1&name=prosjektnamn')
    .then(res => res.json())
    .then(data => {
      setPlaceholder(data)
      });
    },
  []);
    return (
      <div className="login">
          <Link to="/startpage"><img alt="en figur" id="figur" /></Link>
          {placeholder}
      </div>
    );

    
  }
  
  export default Login;
