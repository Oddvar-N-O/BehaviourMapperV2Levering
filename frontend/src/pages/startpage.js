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

  // Decides which menu to show
  const [startMenu, setStartMenu] = useState(true)
  const changeStartMenuState = () => setStartMenu(!startMenu)

  const [projectTypeMenu, setProjectTypeMenu] = useState(false)
  const changeProjectMenuState = () => setProjectTypeMenu(!projectTypeMenu)
  
  const [mappingMenu, setMapping] = useState(false); 
  const changeMappingMenuState = () => setMapping(!mappingMenu)

  const [surveyMenu, setSurvey] = useState(false);
  const changeSurveyMenuState = () => setSurvey(!surveyMenu)

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

            <ul className= {`start-menu ${startMenu ? 'visible' : 'invisible'}`}>
              <li onClick={ () => { changeStartMenuState(), changeProjectMenuState() }}
                >{t('startpage.new')}</li>
              <li><Link to={"/manageProject"}>{t('startpage.manage')}</Link></li>
              <li onClick={ () => { logout() }}>{t('startpage.logout')}</li>
            </ul>

            <ul className={`start-menu ${projectTypeMenu ? 'visible' : 'invisible'}`}>
              <li onClick={ () => { changeMappingMenuState(), changeProjectMenuState() }}>{t('startpage.behaviourMapping')}</li>
              <li onClick={ () => { changeSurveyMenuState(), changeProjectMenuState() }}>{t('startpage.geographicalSurvey')}</li>
              <li onClick={ () => { changeStartMenuState(), changeProjectMenuState() }}>{t('startpage.back')}</li>
            </ul>

            {/* New Behaviourmapping Project */}
            <ul className={`start-menu ${mappingMenu ? 'visible' : 'invisible'}`}>
              <Link to={{
                  pathname: "/newproject",
                  state: {
                    fromLoadMap: false,
                    survey: false,
                    projectName: "",
                    description: "",
                }
                }}><li>{t('startpage.web-map')}</li></Link>
                <Link to={{
                  pathname: "/newproject",
                  state: {
                    fromLoadMap: true,
                    survey: false,
                    projectName: "",
                    description: "",
                }
                }}><li>{t('startpage.load')}</li></Link>
                <li onClick={ () => { changeMappingMenuState(), changeProjectMenuState() }}>
                {t('startpage.back')}
                </li>
            </ul>
            
            {/* New Geographical Survey Project */}
            <ul className={`start-menu ${surveyMenu ? 'visible' : 'invisible'}`}>
              <Link to={{
                  pathname: "/newproject",
                  state: {
                    fromLoadMap: false,
                    survey: true,
                    projectName: "",
                    description: "",
                }
                }}><li>{t('startpage.web-map')}</li></Link>
                <Link to={{
                  pathname: "/newproject",
                  state: {
                    fromLoadMap: true,
                    survey: true,
                    projectName: "",
                    description: "",
                }
                }}><li>{t('startpage.load')}</li></Link>
                <li onClick={ () => { changeSurveyMenuState(), changeProjectMenuState() }}>
                {t('startpage.back')}
                </li>
            </ul>
          </div>
        </div>
      </Authenticated>
    );
  }
  
  export default Startpage;