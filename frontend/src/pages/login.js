import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Login() {
  const [placeholder, setPlaceholder] = useState('Prosjektet finnes ikke.')

  useEffect(() => {
    fetch('getfigure?description=stand&color=red').then(res => res.blob()).then(images => {
      var image = URL.createObjectURL(images)
      document.getElementById("figur").src = image
    }); 
  },
  []);
  useEffect(() => {
    fetch('getproject?u_id=1&name=prosjektnamn').then(res => res.json()).then(data => {
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