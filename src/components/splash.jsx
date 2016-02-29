import React from 'react'

export default class SplashPage extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const title = this.props.graph.get('title');
    return (
      <div id="splash">
        <div id="splash-inner">
          <h1>Emergency Market Map Diagram Builder</h1>

          <p className='splash-small-p'>
            This website is a browser-based tool for creating Market Map diagrams for use in assessments and reports such as EMMA and PCMMA.
          </p>

          <div id='splash-file-options'>

            <div id='file-option-continue'>
              <a className='button green' href='#' onClick={this.props.hideSplash}>
                Continue working on your project
              </a>
              <div className='existing-project-info'>
                {this.props.graph.get}
                {title && <div><b>Project Title:</b> {title}</div>}
                <div><b>Created:</b> [date]</div>
                <div><b>Last updated:</b> [date]</div>
              </div>
            </div>

            <div id='file-options-other'>
              <a className='button magenta' href='#' onClick={this.props.newGraph}>
                Start a new project
              </a>
              <br/>
              <a
                className='button purple'
                href='#'
                onClick={() => this.refs.file_input.click()}
              >
                Load a saved project file
              </a>
              <input
                type='file'
                style={{display: 'none'}}
                onClick={this.props.loadJSON}
                ref='file_input'
              />
            </div>
          </div>



          <p className='splash-small-p'>
            The tool was developed with support from the <a href='https://www.usaid.gov' target='_blank'>United States Agency for International Development (USAID)</a> as part of the Strengthening Global Capacity for Markets in Crises project Office for Foreign Disaster Assistance (OFDA).
            The contents are the responsibility of the IRC and do not necessarily reflect the views of USAID or the United States Government.


            The EMMA methodology aims to improve and support market-appropriate responses in disaster preparedness and emergency contexts. (For more on EMMA and the market assessment process, please visit <a href='http://www.emma-toolkit.org/' target='_blank'>www.emma-toolkit.org</a>).
          </p>

          <p className='splash-logos'>
            <a href='http://www.rescue.org/' target='_blank'>
              <img src={require('../images/irc.gif')} />
            </a>
            <a href='https://www.usaid.gov/' target='_blank'>
              <img src={require('../images/usaid.png')} />
            </a>
          </p>
        </div>
      </div>
    )
  }
}
