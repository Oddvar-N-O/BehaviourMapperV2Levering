import React from 'react';
import './newProject.css'
import { Link } from 'react-router-dom';
import * as AiIcons from 'react-icons/ai';
import { Authenticated } from './auth/AuthContext'
import { withTranslation } from 'react-i18next';

class NewProject extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            projectName: props.location.state.projectName,
            description: props.location.state.description,
            projectNameLegend: "newProject.name",
            projectImageLegend: "newProject.image",
            redirect: false,
            fromLoadMap: props.location.state.fromLoadMap,
            survey: props.location.state.survey,
            liColor: "#FDFFFC",
            p_id: "",
            u_id: window.sessionStorage.getItem('uID'),
            loading: false,
            questions: "",
            lowerLeftCorner: "",
            upperRightCorner: "",
        }
        
        this.handleChange = this.handleChange.bind(this);
        this.handleUploadImage = this.handleUploadImage.bind(this);
        this.setRedirect = this.setRedirect.bind(this);
        this.imageChosen = this.imageChosen.bind(this);
        this.redirectToMapping = this.redirectToMapping.bind(this);
        this.Loading = this.Loading.bind(this)
        this.findIntegerCoordinates = this.findIntegerCoordinates.bind(this)
    }

    handleChange(event) { 
        const {name, value} = event.target;
        console.log('n: ' + name)
        console.log('v: ' + value)
        this.setState({
            [name]: value
        }, function() {})
        // console.log('StateVerd: ' + this.state.lowerLeftCorner + ' ' + this.state.upperRightCorner)
        if (this.state.projectNameLegend === "newProject.nameRequired" && event.target.id === "project-name") {
            this.setState({projectNameLegend: "newProject.name"}, () => {
                this.changeColor();
            });   
        }
    }
    imageChosen() {
        if (this.state.projectImageLegend === "newProject.iamgeRequired") {
            this.setState({projectImageLegend: "newProject.image"}, () => {
                this.changeColor();
            }); 
        }  
    }

    changeColor() {
        if (this.state.liColor === "#FDFFFC") {
            this.setState({ liColor: "#EF2E3B" })
        } else if (this.state.projectNameLegend === "newProject.name"){
            this.setState({ liColor: "#FDFFFC" })
        }  
    }

    handleUploadImage(p_id) {
        this.setState({ loading: true })
        const data = new FormData();
        data.append('file', this.uploadInput.files[0]);
        data.append('p_id', p_id);
        data.append('u_id', this.state.u_id);
        data.append('map', true);
    
        fetch(window.backend_url + 'upload', {
          method: 'POST',
          body: data,
        }).then(setTimeout(
            () => this.redirectToMapping(), 3000));
    }

    redirectToMapping() {
        this.props.history.push({
            pathname: '/mapping',
            state: {
                p_id: this.state.p_id,
                imageUploaded: true,
                onlyObservation: !this.state.survey
            },
        })
    }

    setRedirect(event) {
        event.preventDefault();
        let informationMissing = false
        if (this.state.projectName === "") {
            this.setState({projectNameLegend: "newProject.nameRequired"})
            informationMissing = true
        }
        if (this.state.fromLoadMap){
            if (this.uploadInput.files.length === 0){
                this.setState({projectImageLegend: "newProject.imageRequired"})
                informationMissing = true
            }
        }
        if (this.state.fromLoadMap){
            console.log('yes')
            if (this.state.lowerLeftCorner==="" || this.state.upperRightCorner===""){
                console.log('empty')
                if (informationMissing===false) {
                    if (window.confirm("If you do not add coordinates you cannot download shapefiles")){
                        this.handleRedirect();
                    } 
                }
                informationMissing = true
            }
        }
        if (this.state.survey){
            if (this.state.questions===""){
                if (informationMissing===false) {
                    if (window.confirm("Do you want to continue without any questions?")){
                        this.handleRedirect();
                    } 
                }
                informationMissing = true
            }
        }
        if (informationMissing) {
            this.changeColor();
        } else {
            this.handleRedirect();
        }
    }

    handleRedirect() {
        if (this.state.fromLoadMap){
            this.redirectLoad()
        }
        if (!this.state.survey){
            if (!this.state.fromLoadMap){
                this.redirectMappingWeb()
            }
        }
        if (this.state.survey){
            if (!this.state.fromLoadMap){
                this.redirectSurveyWeb()
            }
        }
    }

    findIntegerCoordinates(coord) {
        coord = coord.split(",");
        coord[0] = parseInt(coord[0], 10);
        coord[1] = parseInt(coord[1], 10);
        return coord;
      }

    redirectLoad() {
        const data = new FormData();
        console.log(this.state.lowerLeftCorner)
        console.log(this.state.upperRightCorner)

        let lowerLeftCorner = this.findIntegerCoordinates(this.state.lowerLeftCorner)
        let upperRightCorner = this.findIntegerCoordinates(this.state.upperRightCorner)
        console.log('LLC: ' + lowerLeftCorner)
        console.log('URC: ' + upperRightCorner)

        data.append('name', this.state.projectName);
        data.append('description', this.state.description);
        data.append('startdate', new Date());
        data.append('leftX',  lowerLeftCorner[0]);
        data.append('lowerY', lowerLeftCorner[1]);
        data.append('rightX', upperRightCorner[0]);
        data.append('upperY', upperRightCorner[0]);
        data.append('map', this.uploadInput.files[0].name);
        data.append('u_id', this.state.u_id);
        if (this.state.survey){
            data.append('questions', this.state.questions)
          } else {
            data.append('questions', 0)
          }
        fetch(window.backend_url + 'addproject', {
        method: 'POST',
        body: data,
        }).then((response) => {
            response.json().then((data) => {
                this.setState({p_id: data.p_id[0]});
                this.handleUploadImage(data.p_id[0]);
            });
        });
    }

    redirectMappingWeb() {
        this.props.history.push({
            pathname: '/chooseImage',
            state: {
                projectName: this.state.projectName,
                description: this.state.description,
                survey: this.state.survey,
                u_id : this.state.u_id,
                questions : 0,
                onlyObservation : true,
            },
        });
    }

    redirectSurveyWeb() {
        this.props.history.push({
            pathname: '/chooseImage',
            state: {
                projectName: this.state.projectName,
                description: this.state.description,
                survey: this.state.survey,
                u_id : this.state.u_id,
                questions : this.state.questions,
                onlyObservation : false,
            },
        });
    }

    Loading() {
        if (this.this.state.loading) {
            return <img className="loading" src="https://i.gifer.com/VAyR.gif" alt=""></img>
        }
    }

    render() {
        const { t } = this.props;
        let loadingGif
        if (this.state.loading) {
            loadingGif = <img className="loading" src="https://i.gifer.com/VAyR.gif" alt=""></img>
        }
        return (
            <Authenticated>
                <div className="new-project">
                    {loadingGif}
                    <div className={ this.state.fromLoadMap ? 'new-project-box-upload' : 'new-project-box'}>
                        <Link to="/startpage" className={this.state.fromLoadMap ? "close-icon-upload" : "close-icon"}>
                            <AiIcons.AiOutlineClose />
                        </Link>
                        <div id="heading-and-form">
                            <h2>{t('newProject.title')}</h2>
                            <form>
                                <legend>{t(this.state.projectNameLegend)}</legend> 
                                <input 
                                    id="project-name"
                                    type="text" 
                                    name="projectName" 
                                    value={this.state.projectName}
                                    onChange={this.handleChange} 
                                /> 
                                <br/>
                                <legend>{t('newProject.desc')}</legend>
                                <textarea 
                                    className={this.state.survey ? 'survey-description' : 'mapping-description'}
                                    name="description" 
                                    value={this.state.description} 
                                    placeholder={t('newProject.descPlaceholder')} 
                                    onChange={this.handleChange}
                                />
                                <br/>
                                <div className={this.state.survey ? 'questionsField' : 'invisible'}>
                                    <legend>{t('newProject.questions')}</legend>
                                    <textarea 
                                        className="questions"
                                        name="questions" 
                                        value={this.state.questions} 
                                        placeholder={t('newProject.questionsPlaceholder')} 
                                        onChange={this.handleChange}
                                    />
                                </div>
                            </form>
                            <form className= {this.state.fromLoadMap ? 'file-management' : 'invisible'}>
                                <legend>{t(this.state.projectImageLegend)}</legend>
                                <input 
                                    ref={(ref) => { this.uploadInput = ref; }} 
                                    type="file"  
                                    className='file-button' 
                                    onChange={this.imageChosen}
                                />
                            </form>
                            <form className= {this.state.fromLoadMap ? 'file-management' : 'invisible'}>
                                <p>{t('newProject.setShapefileCoords')}</p>
                                <label className="label">
                                    {t('newProject.shpLowerLeft')}<br/>
                                    <input type="text"
                                        name="lowerLeftCorner" 
                                        value={this.state.lowerLeftCorner} 
                                        placeholder=" X, Y"
                                        onChange={this.handleChange}
                                    />
                                </label>
                                <label className="label">
                                    {t('newProject.shpUpperRight')}<br/>
                                    <input type="text"
                                        name="upperRightCorner"
                                        value={this.state.upperRightCorner}
                                        placeholder=" X, Y"
                                        onChange={this.handleChange}
                                    />
                                </label>
                            </form>
                        </div>
                        <ul>
                            <li onClick={ (e) => {
                                this.setRedirect(e);     
                            }} style={{backgroundColor: this.state.liColor}}>{t('newProject.go')}</li>
                        </ul>
                    </div>
                    
                </div>
            </Authenticated>
        )
    }
}
export default withTranslation('common')(NewProject)