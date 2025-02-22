import React, { useEffect, useState } from 'react';
import WebChatContainer from './components/WebChatContainer';
import PromptButtonContainer from './components/PromptButtonContainer';
import HistoryContainer from './components/HistoryContainer';
import './App.css';
import 'botframework-webchat';
import {Components} from 'botframework-webchat';



function App() {
  const [dlt, setDlt] = useState(null);
  const [webChatReady, setWebChatReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewHistory, setViewHistory] = useState(true);

  const handleFullscreen = () => {setIsFullscreen(!isFullscreen);};
  const showHistory = () => {setViewHistory(false);};
  const hideHistory = () => {setViewHistory(true);};

  useEffect(() => {
    const fetchDirectLineToken = async () => {
      try {
          
        //get user details
        var userId, userName;
        const userResponse = await fetch('.auth/me');
        
        if (userResponse.status!=200 || !userResponse.headers.get("content-type").includes("json")) {
          userId = crypto.randomUUID();
          //userId = "acba2c25-7cfd-43c4-acf2-681e2ccdc249"; // DEBUG
          userName = userId;
        } else {
          var user = await userResponse.json();
          userId = user.clientPrincipal.userId;
          userName = user.clientPrincipal.userDetails;
        }

        // get bot token
        const directLineToken = process.env.REACT_APP_DIRECT_LINE_TOKEN; 
        //const directLineToken = "3wJDd4tF6q4.KNCovmaK9riWdvWBOFZRZPja_QfkX74dv8p-PFMz8lc"; // DEBUG
        
        const res = await fetch('https://directline.botframework.com/v3/directline/tokens/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + directLineToken // Replace with your actual token or dynamic token retrieval
          },
          body: JSON.stringify({
              user: { 
                  aadObjectId: userId,
                  id: "dl_"+userId, // user id must start with 'dl_'
                  name: userName,
                  role: "user" 
              }
          })
        });
        const { token } = await res.json();
        setDlt(window.WebChat.createDirectLine({ token }));

        setWebChatReady(true); // Signal that WebChat is ready

      } catch (error) {
        console.error('Error fetching token:', error);
      }
    };

    // Create access token
    fetchDirectLineToken();
  }, []); // Empty dependency array means this useEffect runs once on mount

  if (!webChatReady) {
    return <div>Loading...</div>; // Render a loading indicator until WebChat is ready
  }

  // HTML content to return as App
  return (
    <div>
    <div className={`container ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="column column-1">
        <div className="columnHeader">
          <h1><img src="logo192.png" width="32px" className='fb-logo'/>ForrestBrown Taskbot</h1>
          <span className="fullscreen-button material-symbols-outlined" onClick={handleFullscreen}>fullscreen</span>
        </div>
        <WebChatContainer dlt={dlt} />
      </div>
      <div className="column column-2">
        <div className="columnHeader">
          <h1>Prompts</h1>
          <span className="history-button material-symbols-outlined" onClick={showHistory} >history</span>
        </div>        
        <PromptButtonContainer dlt={dlt} />
      </div>
    </div>
    <div className={`container sidebar-container ${viewHistory ? 'history-hidden' : 'history-visible'}`}>
      <div className={`sidebar history-sidebar column`}>
        <div className="columnHeader">
          <h1>History Clipboard</h1>
          <div className="tooltip-container">
          <span className="question-mark-icon material-symbols-outlined">question_mark</span>
            <div className="tooltip-content">
              Here is where previous conversations had with ChatGPT can be accessed to continue working on.
              <br/><br/>
              When on the main menu, please either list the conversations using the button below, select a conversation to work on, or delete a conversation from the clipboard.
            </div>
          </div>
          <span className="history-close-button material-symbols-outlined" onClick={hideHistory} >close</span>
        </div>          
        <div className="history-sidebar-list" style={{ textAlign: "center" }}>
          <Components.Composer directLine={dlt}>
            <HistoryContainer dlt={dlt}/>
          </Components.Composer>
        </div>
      </div>
    </div>
    </div>
);
}

export default App;
