import React from 'react'
import AllIcons from '../components/AllIcons';
import './ContextMenu.css'

class ContextMenu extends React.Component {
    constructor() {
        super()
        this.state = {

        };
    };


    render () {
        return (
            <div className='context-menu'>
                <h2>Choose favorite events</h2>
                <AllIcons
                    close={this.props.close}
                    selectIcon={this.props.selectIcon}
                />
            </div>
            
        )
    }
}


export default ContextMenu