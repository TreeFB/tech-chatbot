import {hooks} from 'botframework-webchat';
import React, { useEffect, useCallback, useState } from 'react';

// src/components/HistoryContainer.js
import './HistoryContainer.css'; 
import PropTypes from 'prop-types';

const { useSendPostBack } = hooks;

    // Components to send a PostBack
    // List
    const ListPostBackButton = ({ sendPostBack, dlt }) => {

        const [listLoaded, setListLoaded] = useState(0);

        const handlePostBackButtonClick = useCallback(() => {
          // Event to list the blobs
          dlt.postActivity({
            type: 'event',
            name: 'event_listBlobs',
            value: { CustomProperty: "value" }
          }).subscribe(
            id => console.log(`dlt: Event sent with id: ${id}`),
            error => console.error(`dlt: Error sending event: ${error}`)
          );
        }, [dlt, sendPostBack]);

        useEffect(() => {
          //preload the history - I can only get it to work in the active run loop call from DL, rather than startup
          if (listLoaded<2) {
            setListLoaded(listLoaded+1);
          }
          else if (listLoaded == 2) {
            setListLoaded(listLoaded+1);
            handlePostBackButtonClick();
          }
        });

        // HTML response for button
        return (
          <button className="app__postback-button" onClick={handlePostBackButtonClick} type="button">
            Reload Conversations
          </button>
        );

      };

    // Define prop types
    ListPostBackButton.propTypes = {
      sendPostBack: PropTypes.func.isRequired,
      dlt: PropTypes.any.isRequired,
      postBackValue: PropTypes.string.isRequired,
    };

    // Delete all
    const DeletePostBackButton = ({ sendPostBack, dlt }) => {
      const handlePostBackButtonClick = useCallback(() => {
        const isConfirmed = window.confirm("Are you sure you want to clear all entries? This cannot be undone!");
        if (isConfirmed) {
          // Event to remove the entry
          dlt.postActivity({
            type: 'event',
            name: 'event_deleteAllBlobs',
            value: { CustomProperty: "value" }
          }).subscribe(
            id => console.log(`dlt: Event sent with id: ${id}`),
            error => console.error(`dlt: Error sending event: ${error}`)
          );

        } else {
          console.log("Action canceled");
        }
      }, [sendPostBack, dlt]);
      
      // HTML response for button
      return (
        <button className="app__postback-button" onClick={handlePostBackButtonClick} type="button">
          Delete All Conversations
        </button>
      );
    };
      
    // Define prop types
    DeletePostBackButton.propTypes = {
        sendPostBack: PropTypes.func.isRequired,
        dlt: PropTypes.any.isRequired,
        postBackValue: PropTypes.string.isRequired,
      };
      

    // Main container component
    const HistoryContainer = ( {dlt} ) => {
        const sendPostBack = useSendPostBack();

        // Define the handlePostBackButtonClick function
        const handlePostBackButtonClick = useCallback((postBackValue) => {
            sendPostBack(postBackValue);
        }, [sendPostBack]);

        // Make the function globally accessible
        window.handlePostBackButtonClick = handlePostBackButtonClick;
        
        // HTML div response for container content
        return (
            <div id="history_container">
                <h3>Previous Conversations [<span id="prevConversationsLength">0</span>]:</h3>
                <div id="history_list_container">
                    <div id="history_list">
                        Please load the conversations
                    </div>
                    <h4>Today</h4>
                    <div id="today_list" className="category-list">
                    </div>
                    <h4>Yesterday</h4>
                    <div id="yesterday_list" className="category-list">
                    </div>
                    <h4>Last 7 Days</h4>
                    <div id="last7days_list" className="category-list">
                    </div>
                    <h4>Last 30 Days</h4>
                    <div id="last30days_list" className="category-list">
                    </div>
                </div>
                <div id="history_buttons">
                <ListPostBackButton sendPostBack={sendPostBack} dlt={dlt}/>
                </div>
            </div>
        );
    };

// Define prop types
HistoryContainer.propTypes = {
  dlt: PropTypes.any.isRequired
};

export default HistoryContainer;