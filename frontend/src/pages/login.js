import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Login() {
  const [placeholder, setPlaceholder] = useState('Intet bilde');

  useEffect(() => {
    fetch('/getFigure?description=walkWithPram&color=blue').then(res => res.blob()).then(images => {
      var image = URL.createObjectURL(images)
      setPlaceholder(image);
    });
  }, []);
    return (
      <div className="login">
          <Link to="/startpage"><img alt="en figur" id="figur" src={placeholder}  /></Link>
      </div>
    );

    
  }
  
  export default Login;