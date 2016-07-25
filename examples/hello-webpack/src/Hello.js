import React from 'react'
import { connect } from '../../../lib'

class Hello extends React.Component {
  render() {
    return (
      <div>
        <div>{this.props.hello} {this.props.name}</div>
        <div><input onChange={e => this.props.updateName(e.target.value)} /></div>
      </div>
    )
  }
}

export default connect(
  state => ({
    name: state.name
  }),
  { updateName: 'updateName' } // shortcut for below
  // actionFactory => ({
  //   updateName: name => actionFactory.get('updateName').next(name)
  // })
)(Hello)
