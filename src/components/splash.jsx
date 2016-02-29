import React from 'react'

export default class SplashPage extends React.Component {
  constructor(props) {
    super(props)
  }



  render() {
    const title = this.props.graph.get('title');
    const created_at = formatDate(this.props.graph.get('created'));
    const updated_at = formatDate(this.props.graph.get('updated'));
    return (
      <div id="splash">
        <div id="splash-inner">
          <h1>Market Map Diagramming Tool</h1>
          <p className='subtitle'>
            for market assessments such as EMMA & PCMA
          </p>

          <div id='splash-file-options'>

            { title &&
              <div id='file-option-continue'>
                <a className='button magenta' href='#' onClick={this.props.hideSplash}>
                  Continue with existing project
                </a>
                <div className='existing-project-info'>
                  {this.props.graph.get}
                  <div><b>Project Title:</b> {title}</div>
                  <div><b>Created:</b> {created_at}</div>
                  <div><b>Last updated:</b> {updated_at}</div>
                </div>
              </div>
            }

            <div id='file-options-other'>
              <a className='button magenta' href='#' onClick={this.props.newGraph}>
                Start a new project
              </a>
              <br/>
              <a
                className='button magenta'
                href='#'
                onClick={() => this.refs.file_input.click()}
              >
                Load a saved project file
              </a>
              <input
                type='file'
                style={{display: 'none'}}
                onChange={this.props.loadJSON}
                ref='file_input'
              />
            </div>
          </div>



          <h2>About this tool</h2>
          <p className='splash-small-p'>
            The EMMA methodology aims to improve and support market-appropriate responses in disaster preparedness and emergency contexts. (For more on EMMA and the market assessment process, please visit <a href='http://www.emma-toolkit.org/' target='_blank'>www.emma-toolkit.org</a>).
          </p>

          <div className='splash-logos'>
            <a href='http://www.rescue.org/' target='_blank'>
              <img src={require('../images/irc.gif')} />
            </a>
            <a href='https://www.usaid.gov/' target='_blank'>
              <img src={require('../images/usaid.png')} />
            </a>
            <p className='splash-small-p'>
              The tool was developed with support from the <a href='https://www.usaid.gov' target='_blank'>United States Agency for International Development (USAID)</a> as part of the Strengthening Global Capacity for Markets in Crises project Office for Foreign Disaster Assistance (OFDA).
            </p>
            <p className='small-text'>
              The contents of this site are the responsibility of the IRC and do not necessarily reflect the views of USAID or the United States Government.
            </p>
          </div>
        </div>
      </div>
    )
  }
}

function formatDate(date) {
  if (!date) return null;
  return date.toISOString().slice(0,19).replace('T',' - ');
}