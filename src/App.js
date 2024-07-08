import React, { useEffect, useState } from 'react';
import WebChatContainer from './components/WebChatContainer';
import PromptButtonContainer from './components/PromptButtonContainer';
import './App.css';
import 'botframework-webchat';



function App() {
  const [dlt, setDlt] = useState(null);
  const [webChatReady, setWebChatReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewHistory, setViewHistory] = useState(false);

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const showHistory = () => {
    setViewHistory(true);
  };
  
  const hideHistory = () => {
    setViewHistory(false);
  };

  useEffect(() => {
    const fetchDirectLineToken = async () => {
      try {

        const directLineToken = process.env.REACT_APP_DIRECT_LINE_TOKEN;

        const res = await fetch('https://directline.botframework.com/v3/directline/tokens/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + directLineToken // Replace with your actual token or dynamic token retrieval
          },
          body: JSON.stringify({
              user: { 
                  id: "dl_techbot", // user id must start with 'dl_'
                  name: "user" 
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

    fetchDirectLineToken();
  }, []); // Empty dependency array means this useEffect runs once on mount

  if (!webChatReady) {
    return <div>Loading...</div>; // Render a loading indicator until WebChat is ready
  }


  return (
    <div>
    <div className={`container ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="column column-1">
        <div className="columnHeader">
          <h1>ForrestBrown - Techbot</h1>
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
    <div className={`container sidebar-container ${viewHistory ? 'history-visible' : 'history-hidden'}`}>
      <div className={`sidebar history-sidebar column`}>
        <div className="columnHeader">
          <h1>History</h1>
          <span className="history-close-button material-symbols-outlined" onClick={hideHistory} >close</span>
        </div>          
        <div className="history-sidebar-list" style={{ textAlign: "center" }}>
          <div style={{ color: "green" }} className="material-symbols-outlined">construction</div>
          <br/>Functionality in Development.
          <br/>Please check back soon!
        </div>
      </div>
    </div>
    </div>
);
}

export default App;
