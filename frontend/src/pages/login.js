import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Login() {
  const [placeholder, setPlaceholder] = useState('Prosjektet finnes ikke.')
  const color = 'green'

  useEffect(() => {
<<<<<<< HEAD
    fetch(`getfigure?description=bike&color=${color}`)
    .then(res => res.blob())
    .then(images => {
=======
    fetch('getfigure?description=bike&color=red').then(res => res.blob()).then(images => {
>>>>>>> a255d600c67fcfe207d07c6081eb5990ec7aaa58
      var image = URL.createObjectURL(images)
      document.getElementById("figur").src = image
      }); 
    },
  []);
  useEffect(() => {
    fetch('getproject?u_id=1&name=prosjektnamn')
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
