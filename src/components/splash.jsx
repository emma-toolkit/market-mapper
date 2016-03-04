import React from 'react'

export default class SplashPage extends React.Component {
  constructor(props) {
    super(props)
  }



  render() {
    const title = this.props.graph.get('title');
    const created_at = formatDate(this.props.created_at);
    // const updated_at = formatDate(this.props.graph.get('updated'));
    return (
      <div id="splash">
        <div id="splash-inner">
          <h1>Market System Mapping Tool</h1>
          <p className='subtitle'>
            For humanitarian market assessments including EMMA, PCMA and others
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
                  {/*<div><b>Last updated:</b> {updated_at}</div>*/}
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
            This tool aims to help people involved in market assessments to quickly build visually appealing market system maps for display in reports and report summary documents. It assumes that users already have a hand-drawn version of the map to work with. This tool is intended to be intuitive and easy-to-use. Basic guidance on its use is embedded in the tool itself, and additional information is available on the <a href='http://www.emma-toolkit.org/' target='_blank'>EMMA website</a>. If you have questions about the tool or are interested in developing or adapting it, please write to <a href='mailto:livelihoodsadmin@rescue.org' target='_blank'>livelihoodsadmin@rescue.org</a>.
          </p>

          <div className='splash-logos'>
            <a href='http://www.rescue.org/' target='_blank'>
              <img src={require('../images/irc.gif')} />
            </a>
            <a href='https://www.usaid.gov/' target='_blank'>
              <img src={require('../images/usaid.png')} />
            </a>
            <p className='splash-small-p'>
              The development of this market mapping tool was made possible with the generous support of the American people through the <a href='https://www.usaid.gov' target='_blank'>United States Agency for International Development (USAID)</a>.
            </p>
            <p className='small-text'>
              The contents are the responsibility of the IRC and do not necessarily reflect the views of USAID or the United States Government.
            </p>
          </div>
        </div>
      </div>
    )
  }
}

function formatDate(unix) {
  if (!unix) return null;
  return new Date(unix).toISOString().slice(0,19).replace('T',' - ');
}
