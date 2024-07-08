import React, { useEffect, useState } from 'react';
import WebChatContainer from './components/WebChatContainer';
import PromptButtonContainer from './components/PromptButtonContainer';
import './App.css';
import 'botframework-webchat';



function App() {
  const [dlt, setDlt] = useState(null);
  const [webChatReady, setWebChatReady] = useState(false);


  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);

  };

  // useEffect(() => {
  //   const loadScript = (src) => {
  //     return new Promise((resolve, reject) => {
  //       const script = document.createElement('script');
  //       script.src = src;
  //       script.crossOrigin = 'anonymous';
  //       script.onload = () => {
  //         console.log(`Script loaded: ${src}`);
  //         resolve();
  //       };
  //       script.onerror = () => {
  //         console.error(`Error loading script: ${src}`);
  //         reject();
  //       };
  //       document.head.appendChild(script);
  //     });
  //   };

  //   loadScript('https://cdn.botframework.com/botframework-webchat/latest/webchat.js')
  //   .then(() => {
  //       const fetchDirectLineToken = async () => {
  //         try {
  //           const res = await fetch('https://directline.botframework.com/v3/directline/tokens/generate', {
  //             method: 'POST',
  //             headers: {
  //               'Content-Type': 'application/json',
  //               'Authorization': 'Bearer 3wJDd4tF6q4.KNCovmaK9riWdvWBOFZRZPja_QfkX74dv8p-PFMz8lc' // Replace with your actual token or dynamic token retrieval
  //             }
  //           });
  //           const { token } = await res.json();
  //           setDlt(window.WebChat.createDirectLine({ token }));

  //           setWebChatReady(true); // Signal that WebChat is ready

  //         } catch (error) {
  //           console.error('Error fetching token:', error);
  //         }
  //       };

  //       fetchDirectLineToken();
  //     })
  //     .catch((error) => {
  //       console.error('Error loading WebChat script:', error);
  //     });
  // }, []); // Empty dependency array means this useEffect runs once on mount

  // if (!webChatReady) {
  //   return <div>Loading...</div>; // Render a loading indicator until WebChat is ready
  // }


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
    <div className={`container ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="column column-1">
        <div>
          <h1>ForrestBrown - Techbot</h1>
          <span className="fullscreen-button material-symbols-outlined" onClick={handleFullscreen}>fullscreen</span>
        </div>
        <WebChatContainer dlt={dlt} />
      </div>
      <div className="column column-2">
        <h1>Prompts</h1>
        <PromptButtonContainer dlt={dlt} />
      </div>
      {/*<div className="column column-3">
        <h1>History</h1>
          <p style={{ textAlign: "center" }}><span style={{ color: "green" }} className="material-symbols-outlined">construction</span><br/>Functionality in Development.<br/>Please check back soon!</p>
      </div>*/}
    </div>
  );
}

export default App;
