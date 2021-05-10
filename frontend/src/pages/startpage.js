/* eslint-disable no-unused-expressions */
/* eslint-disable no-sequences */
import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import './startpage.css';
import { Authenticated, useToken } from './auth/AuthContext'
import { useTranslation } from 'react-i18next';

function useSetUserSession() {
  let accessToken = useToken()
  useEffect(() => {
    if (accessToken!==null) {
      var fetchstring = `https://auth.dataporten.no/openid/userinfo`;
      fetch(fetchstring, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken.access_token}`,
        }
      }).then(res => res.json()).then(data => {
        window.sessionStorage.setItem('uID',data.sub);
      });
    }
  }, [accessToken]);
  
}



function Startpage() {
  // useSetUserSession()
  <Authenticated>
    {useSetUserSession()}
  </Authenticated>
  
  const {t} = useTranslation('common');

  // State for new_project
  const [new_project, setNewProject] = useState(false); // set state for new_project to false
  const changeNewVisibility = () => setNewProject(!new_project); // change state for new procject (true/false)
  const hideNewProject = () => setNewProject(false); // set state to false

  // State for load_project
  const [load_project, setLoadProject] = useState(false);
  const changeLoadVisibility = () => setLoadProject(!load_project);
  const hideLoadProject = () => setLoadProject(false);

  // Add a cleanup for session in logoutfunction.
  function logout() {
    window.sessionStorage.clear()
    window.location.href = window.backend_url + "logout";
  }

    return (
      <Authenticated>
        <div className="startpage">
          <h1>Behaviour Mapper</h1>
          <div className="menu">
            <ul id='start-menu'>
              {/* NEW PROJECT */}
              <li onClick={ () => { hideLoadProject(), changeNewVisibility() }}
                className={new_project ? 'active' : 'passive'}
                >{t('startpage.new')}</li>
              {/* LOAD PROJECT */}
              <li onClick={ () => { hideNewProject(), changeLoadVisibility() }}
                className={load_project ? 'active' : 'passive'}
              ><Link to={"/manageProject"}>{t('startpage.manage')}</Link></li>
              {/* LOG OUT */}
              <li onClick={ () => { logout() }}>{t('startpage.logout')}</li>
            </ul>
            <ul id={new_project ? 'load-map' : 'invisible'}>
              <Link to={{
                  pathname: "/newproject",
                  state: {
                    fromLoadMap: false,
                    projectName: "",
                    description: "",
                }
                }}><li>{t('startpage.web-map')}</li></Link>
                {/* <li>Use Template??</li> */}
                <Link to={{
                  pathname: "/newproject",
                  state: {
                    fromLoadMap: true,
                    projectName: "",
                    description: "",
                }
                }}><li>{t('startpage.load')}</li></Link>
            </ul>
          </div>
        </div>
      </Authenticated>
    );
  }
  
  export default Startpage;