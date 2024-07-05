import React, { useEffect } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes

import './WebChatContainer.css';
import 'botframework-webchat';

const WebChatContainer = ({ dlt }) => {
  useEffect(() => {
    const { renderWebChat, createDirectLine, createStore } = window.WebChat;

    if (renderWebChat && createDirectLine && createStore) {
      const store = createStore({}, ( ) => next => action => next(action));

      const styleOptions = {
        bubbleBackground: 'rgba(3, 172, 24, 0.1)',
        bubbleFromUserBackground: 'rgba(136, 181, 214, 0.2)',
        sendBoxHeight: 100,
        sendBoxButtonAlignment: 'top',
        sendBoxTextWrap: true,
        bubbleMaxWidth: '80%',
        primaryFont: 'Rubik'
      };

      const webchatElement = document.getElementById('webchat');
      if (webchatElement) {
        renderWebChat(
          {
            directLine: dlt,
            store,
            styleOptions
          },
          webchatElement
        );
      
          
        const textarea = document.querySelector('.webchat__auto-resize-textarea__textarea');
        if (textarea) {
          textarea.setAttribute('rows', '4');
        }
      
      } else {
        console.error('Element with id="webchat" not found.');
      }
    } else {
      console.error('Required WebChat methods are not available on the window object.');
    }
  }, [dlt]);

  return (
    <div id="webchat"></div>
  );
};

// Define propTypes
WebChatContainer.propTypes = {
  dlt: PropTypes.object.isRequired, // Adjust the type according to what dlt should be
};

export default WebChatContainer;
