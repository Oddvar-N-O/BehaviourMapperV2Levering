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
        }
        
        this.handleChange = this.handleChange.bind(this);
        this.handleUploadImage = this.handleUploadImage.bind(this);
        this.setRedirect = this.setRedirect.bind(this);
        this.imageChosen = this.imageChosen.bind(this);
        this.redirectToMapping = this.redirectToMapping.bind(this);
        this.Loading = this.Loading.bind(this)
    }

    handleChange(event) { 
        const {name, value} = event.target;
        this.setState({
            [name]: value
        }, function() {})
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
        console.log('upload done')
    }

    redirectToMapping() {
        this.props.history.push({
            pathname: '/mapping',
            state: {
                p_id: this.state.p_id,
                imageUploaded: true,
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
        if (this.state.survey){
            if (this.state.questions===""){
                console.log('missing questions!') // TODO: fix translation!
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
            const data = new FormData();
            data.append('name', this.state.projectName);
            data.append('description', this.state.description);
            data.append('startdate', new Date());
            data.append('map', this.uploadInput.files[0].name);
            data.append('u_id', this.state.u_id);
            
            fetch(window.backend_url + 'addproject', {
            method: 'POST',
            body: data,
            }).then((response) => {
                response.json().then((data) => {
                    this.setState({p_id: data.p_id[0]});
                    this.handleUploadImage(data.p_id[0]);
                });
            });
        } else {
            this.props.history.push({
                pathname: '/chooseImage',
                state: {
                    projectName: this.state.projectName,
                    description: this.state.description,
                    survey: this.state.survey,
                    u_id : this.state.u_id,
                },
            });
        }  
    }

    Loading() {
        if (this.this.state.loading) {
            return <img className="loading" src="https://i.gifer.com/VAyR.gif" alt=""></img>
        }
        return <div>hei</div>
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
                        <Link to="/startpage" className="close-icon">
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