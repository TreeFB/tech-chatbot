// src/components/MenuContainer.js
import './MenuContainer.css'; 
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'react-tooltip';
import {hooks, Components} from 'botframework-webchat';
//import MeetingUploadForm from './forms/MeetingUploadForm.js';

const MenuContainer = ({ dlt }) => {
  const GenButtonPrompt = ({ title, message, disabled, icon }) => {
    const [isDisabled] = useState(disabled || false);

      const handleClick = () => {        
        const textareaField = document.querySelector('.webchat__auto-resize-textarea__textarea');
      
          if (textareaField) {
            // Manually set the value using the native value setter
            const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
            nativeTextareaValueSetter.call(textareaField, message);
            
            // Create and dispatch the input event
            const inputEvent = new Event('input', { bubbles: true });
            textareaField.dispatchEvent(inputEvent);
            
            // Create and dispatch the change event
            const changeEvent = new Event('change', { bubbles: true });
            textareaField.dispatchEvent(changeEvent);
            
            // // Set the cursor position after the second chevron
            // const cursorPosition = message.indexOf('>') + 1; // Adjust this logic if needed
            // textareaField.focus();
            // textareaField.setSelectionRange(cursorPosition, cursorPosition);

                // Find the positions of the chevrons
            const firstChevronIndex = message.indexOf('<') -1;
            const secondChevronIndex = message.indexOf('>', firstChevronIndex + 1) +1;
            
            // Set the selection range to select the content between the chevrons
            if(firstChevronIndex +secondChevronIndex > 0) {
              const selectionStart = firstChevronIndex + 1;
              const selectionEnd = secondChevronIndex;
              textareaField.focus();
              textareaField.setSelectionRange(selectionStart, selectionEnd);
            } else {
              // If no chevrons found or less than four chevrons found, place the cursor at the end
              textareaField.focus();
              textareaField.setSelectionRange(message.length, message.length);
            }

          }
      };

      return <button className="button_icon" onClick={handleClick} disabled={isDisabled} 
          data-tooltip-id="tooltip"
          data-tooltip-content={message}
          data-tooltip-place="bottom"
          data-tooltip-delay-show="2000"
      ><span className="material-symbols-outlined">{icon}</span><Tooltip id="tooltip"/><span className="button_text">{title}</span></button>;
    };

    GenButtonPrompt.propTypes = {
      title: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      disabled: PropTypes.bool,
      icon: PropTypes.string.isRequired
    };

    const { useSendMessage } = hooks;
    
    const GenButton = ({ title, message, icon }) => {
      const sendMessage = useSendMessage();

      const handleClick = () => {
        sendMessage(message);
      };
      return <button className="button_icon" onClick={handleClick}><span className="material-symbols-outlined">{icon}</span><span  className="button_text">{title}</span></button>;
    };

    GenButton.propTypes = {
      title: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired
    };
    


    
  //const [selectedOrganisations, setSelectedOrganisations] = useState([]);
  return (
    <div id="menu_container">
      <Components.Composer directLine={dlt}>
      <div className="prompt-section prompt-section-projectlist">
        <h3>Tasks</h3>
        <div className="horizontal">
          <GenButton title="Case Study" icon="edit_document" message="!menuitem:casestudy"/>
          <GenButton title="Numbers" icon="money_bag" message="!menuitem:numbers"/>
          <GenButton title="TaxCalc" icon="calculate" message="!menuitem:taxcalc"/>
        </div>
        <h3>Case Studies</h3>
        <div className="horizontal">
          <GenButton title="Upload Notes" icon="drive_folder_upload" message="!menuitem:uploadnotes"/>
          <GenButton title="Summarise Call" icon="summarize" message="!menuitem:summarisecall"/>
          <GenButton title="Discuss Project" icon="chat_bubble" message="!menuitem:discussproject"/>
        </div>
        <h3>Bots</h3>
        <div className="horizontal">
          <GenButton title="CPBioBot" icon="article_person" message="!menuitem:cpbiobot"/>
          <GenButton title="ProjListBot" icon="list" message="!menuitem:projlistbot"/>
          <GenButton title="SkellyBot" icon="skeleton" message="!menuitem:skellybot"/>
          <GenButton title="Freebot" icon="barefoot" message="!menuitem:freebot"/>
        </div>
      </div>
      <div className="prompt-section prompt-section-general">
          <div className="header-with-tooltip">
          <h3>System</h3>
        </div>
          <div className="horizontal">
            <GenButton title="Exit to Menu" icon="menu_open" message="!exit"/>
            <GenButton title="Logout" icon="logout" message="!logout"/>
          </div>
      </div>
      </Components.Composer>
    </div>
    
  );
}

MenuContainer.propTypes = {
  dlt: PropTypes.any.isRequired
};


export default MenuContainer;