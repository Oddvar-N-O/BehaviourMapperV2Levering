import React from 'react'
import AllIcons from '../components/AllIcons';
import './ContextMenu.css'

class ContextMenu extends React.Component {
    render () {
        return (
            <div className='context-menu'>
                <h2>Choose favorite events</h2>
                <div className='events'>
                <AllIcons
                    close={this.props.close}
                    selectIcon={this.props.selectIcon}
                />
                </div>
            </div>
            
        )
    }
}


export default ContextMenu