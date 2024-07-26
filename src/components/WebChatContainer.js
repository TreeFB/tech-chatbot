import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import './WebChatContainer.css';
import 'botframework-webchat';
import {hooks} from 'botframework-webchat';


const { useSendPostBack } = hooks;


const WebChatContainer = ({ dlt }) => {
  const storeRef = useRef(null);

  useEffect(() => {
    const { renderWebChat, createDirectLine, createStore } = window.WebChat;

    //////////////////////////
    // History Functions
    //////////////////////////
    // Function to populate conversation history
    const populateConversationHistory = (data) => {
      // Ensure store is initialized
      if (!storeRef.current) return; 

      // Send message to webchat
      storeRef.current.dispatch({
        type: 'DIRECT_LINE/OUTGOING_ACTIVITY',
        payload: {
          activity: {
            type: 'message',
            from: { role: 'bot' },
            text: "**Reloading conversation, please wait...**",
          },
        },
      });

      // Loop through messages from blob to display in webchat
      data.forEach((item) => {  
        storeRef.current.dispatch({
          type: 'DIRECT_LINE/OUTGOING_ACTIVITY',
          payload: {
            activity: {
              type: 'message',
              from: { role: item.role === 'user' ? 'user' : 'bot' },
              text: item.content,
              value: {CustomProperty: "gptMessage"},
              id: item.id
            },
          },
        });
      });

    };
    


    // Function to populate history list
    const populateHistoryList = (data) => {
        
        ///// FUNCTIONS
        // Function to handle button click
        function handleButtonClick(value) {
           // eslint-disable-next-line no-undef
           handlePostBackButtonClick(value);
        }
        // Function to remove blobs
        function removeBlobEntry(value) {
          // Validate user wants to delete the entry
          const isConfirmed = window.confirm("Are you sure you want to remove this entry?");
          if (isConfirmed) {
            // Send event to process
            dlt.postActivity({
              type: 'event',
              name: 'event_deleteBlob',
              value: { CustomProperty: value }
            }).subscribe(
              id => console.log(`dlt: Event sent with id: ${id}`),
              error => console.error(`dlt: Error sending event: ${error}`)
            );
          } else {
            console.log("Action canceled");
          }
        }


        ///// Exec
        // Sort list
        data.sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified));

        // Helper function to get the start of a specific date
        function getStartOfDate(date) {
          return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        }

        // Initialize date variables
        const now = new Date();
        const todayStart = getStartOfDate(now);
        const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000); // Midnight of yesterday
        const last7DaysStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000); // Midnight 7 days ago
        const last30DaysStart = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000); // Midnight 7 days ago

        // Lists initialization
        const todayItems = [];
        const yesterdayItems = [];
        const last7DaysItems = [];
        const last30DaysItems = [];

        // Map data to lists
        data.forEach(item => {
          const lastModified = new Date(item.LastModified);
          
          if (lastModified >= todayStart && lastModified < now) {
              todayItems.push(item);
          } else if (lastModified >= yesterdayStart && lastModified < todayStart) {
              yesterdayItems.push(item);
          } else if (lastModified >= last7DaysStart && lastModified < yesterdayStart) {
              last7DaysItems.push(item);
          } else if (lastModified >= last30DaysStart && lastModified < yesterdayStart) {
              last30DaysItems.push(item);
          }
        });

        // Product list output
        function generateButtonsHTML(items) {
          return items.map(item => {
              const dts = item.LastModified;
              var [date, timeWithZone] = dts.split('T');
              var [time] = timeWithZone.split('+'); // Remove the timezone part

              const blobName = item.BlobName; 
              const lastItem = blobName.split("__").pop().replace(".json","");
              const cleanedBlobName = decodeURIComponent(lastItem);
              return `
                  <div class="app__div">
                      <span class="app__text" onclick="handleButtonClick('history__${blobName}')">${cleanedBlobName}</span>
                      <span class="app__dts">${date}<br>${time}</span>
                      <span class="app__icon historyButtons material-symbols-outlined" onclick="removeBlobEntry('delete__${blobName}')">close</span>
                  </div>`;
          }).join('');
        }

        // Get the div element by ID and replace as required
        document.getElementById('today_list').innerHTML = generateButtonsHTML(todayItems);
        document.getElementById('yesterday_list').innerHTML = generateButtonsHTML(yesterdayItems);
        document.getElementById('last7days_list').innerHTML = generateButtonsHTML(last7DaysItems);
        document.getElementById('last30days_list').innerHTML = generateButtonsHTML(last30DaysItems);
        document.getElementById('history_list').innerHTML = ''; // Clear existing content
        document.getElementById('history_list').style.display = 'none';
        const prevConversationsLength = document.getElementById('prevConversationsLength');
        prevConversationsLength.textContent = data.length;
      
        // Expose the function to the global scope for inline event handlers
        window.handleButtonClick = handleButtonClick;
        window.removeBlobEntry = removeBlobEntry;
    }

    //////////////////////////
    //////////////////////////

    // Initalise Store for WebChat
    if (renderWebChat && createDirectLine && createStore) {
      const store = createStore(
        {},
        ({ dispatch }) => (next) => (action) => {
          if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
            const { activity } = action.payload;
            
            // If event received from bot and SendHistory
            if (activity.type === 'event' && activity.value && activity.value.Id === 'event_SendHistory') {
              // Get Data
              populateConversationHistory(activity.value.Data);
            }
            // If event received from bot and ListHistory
            if (activity.type === 'event' && activity.value && activity.value.Id === 'event_ListHistory') {
              // Get list
              populateHistoryList(activity.value.Data);
            }
          }
          
          // If an outgoing event, spoof to make look as user
          if (action.type === 'DIRECT_LINE/OUTGOING_ACTIVITY') {
            console.log('Outgoing activity:', action.payload.activity);
            const { activity } = action.payload;
            // Dispatch the activity to display it as if it were sent by the user
            dispatch({
              type: 'DIRECT_LINE/INCOMING_ACTIVITY',
              payload: { activity },
            });
          }
          return next(action);
        }
      );
      
      // Initalise store variable
      storeRef.current = store;
      
      // Initalise webchat style
      const styleOptions = {
        bubbleBackground: 'rgba(3, 172, 24, 0.1)',
        bubbleFromUserBackground: 'rgba(136, 181, 214, 0.2)',
        sendBoxHeight: 100,
        sendBoxButtonAlignment: 'top',
        sendBoxTextWrap: true,
        bubbleMaxWidth: '80%',
        primaryFont: 'Rubik'
      };

      // // // // // // // //
      // Setup middleware/decorator
      // Setup decorator for trimming function
      const BotActivityDecorator = ({ activityID, children }) => {
        const contentRef = useRef(null); // Ref to access the content container
        const sendPostBack = useSendPostBack();
        
        // Button action config
        const handlePostBackButtonClick = useCallback((activityID) => {
          // Message with Id on where to trim history too
          sendPostBack("slicehistory " + activityID.id);
        }, [sendPostBack]);

        // Prop Types
        BotActivityDecorator.propTypes = {
          activityID: PropTypes.shape({
            id: PropTypes.string.isRequired
          }).isRequired,
          children: PropTypes.node.isRequired
        };

        const handleUpvoteButton = () => {
          // Pass the activity to the onButtonClick function
          handlePostBackButtonClick(activityID);
        };
        
        // HTML Output of decorator (scissors image in webchat)
        return (
          <div className="botActivityDecorator">
            <div className="botActivityDecorator__buttonBar">
                <button className="botActivityDecorator__button"  
                  onClick={handleUpvoteButton} // Call handleUpvoteButton on click
                  title="Trim Conversation">
                  <span className="material-symbols-outlined">content_cut</span>
                </button>
            </div>
            <div className="botActivityDecorator__content" ref={contentRef}>
              {children}
            </div>
          </div>
        );
      };
      

      // Middleware to apply decorator and pass activity content
      const activityMiddleware = () => next => (...setupArgs) => {
        const [card] = setupArgs;
      
        // Check if custom metadata is present
        const customValue = card.activity.value?.CustomProperty;
      
        // Example condition: Apply decorator if CustomProperty equals 'gptMessage'
        const shouldDecorate = card.activity.from.role === 'bot' && customValue === 'gptMessage';
        
        // Decorator render
        const RenderComponent = (...renderArgs) => (
          <BotActivityDecorator
            key={card.activity.id}
            activityID={card.activity}
            onButtonClick={(activityID, content) => handleUpvoteButton(activityID, content)}
          >
            {next(...setupArgs)(...renderArgs)}
          </BotActivityDecorator>
        );

        // Confirm outcome
        if (card.activity.type === 'messageReaction') {
          return false;
        } else if (shouldDecorate) {
          return RenderComponent;
        }
        return next(...setupArgs);
      };
      
      // Function to handle the button click
      const handleUpvoteButton = (activityID, content) => {
        console.log('Activity ID:', activityID);
        console.log('Activity Content:', content);
      };

      // // // // // // // //
      // Webchat Container
      // Setup the Webchat
      const webchatElement = document.getElementById('webchat');
      if (webchatElement) {
        renderWebChat(
          {
            directLine: dlt,
            store,
            styleOptions,
            activityMiddleware
          },
          webchatElement
        );

        // Alter textbox size
        const textarea = document.querySelector('.webchat__auto-resize-textarea__textarea');
        if (textarea) {
          textarea.setAttribute('rows', '4');
        }

      } else {
        // No webchat found
        console.error('Element with id="webchat" not found.');
      }
    } else {
      // Webchat didn't load correctly
      console.error('Required WebChat methods are not available on the window object.');
    }
  }, [dlt]);

  // Response App
  return <div id="webchat"></div>;
};

// Define propTypes
WebChatContainer.propTypes = {
  dlt: PropTypes.object.isRequired, // Adjust the type according to what dlt should be
};

export default WebChatContainer;

