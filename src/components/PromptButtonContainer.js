// src/components/PromptButtonContainer.js
import './PromptButtonContainer.css'; 
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'react-tooltip';
import {hooks, Components} from 'botframework-webchat';
//import MeetingUploadForm from './forms/MeetingUploadForm.js';

const PromptButtonContainer = ({ dlt }) => {
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
      ><span className="material-symbols-outlined">{icon}</span><Tooltip id="tooltip"/>{title}</button>;
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
      return <button className="button_icon" onClick={handleClick}><span className="material-symbols-outlined">{icon}</span>{title}</button>;
    };

    GenButton.propTypes = {
      title: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired
    };
    

    // Drop down

    function populateInputField(text) {
      const textareaField = document.querySelector('.webchat__auto-resize-textarea__textarea');
      
      if (textareaField) {
        // Manually set the value using the native value setter
        const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        nativeTextareaValueSetter.call(textareaField, text);
        
        // Create and dispatch the input event
        const inputEvent = new Event('input', { bubbles: true });
        textareaField.dispatchEvent(inputEvent);
        
        // Create and dispatch the change event
        const changeEvent = new Event('change', { bubbles: true });
        textareaField.dispatchEvent(changeEvent);
        
        textareaField.focus();
      }
    }
  
    
    const DropdownMenu = ({ title, options, message }) => {
      const [selectedValue, setSelectedValue] = useState("");
    
      const handleSelection = (message) => {
        populateInputField(message);
        setSelectedValue(message); // Update the state with the selected value
      };
    
      return (
        <select value={selectedValue} onChange={(e) => handleSelection(e.target.value)}
          data-tooltip-id="tooltip"
          data-tooltip-content={message}
          data-tooltip-place="bottom"
          data-tooltip-delay-show="2000"
          >
          <option disabled value="">{title}</option>
          {options.map((option, index) => (
            <option key={index} value={option.message}>{option.title}</option>
          ))}
          <Tooltip id="tooltip"/>
        </select>
      );
    };

    DropdownMenu.propTypes = {
      title: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      options: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired
      })).isRequired
    };
    
    
    
    const DropDownExtraQuestions = () => {
      const dropdownOptions = [
        { title: 'Baseline', message: "What questions could we ask the client to reinforce the baseline section, and explain why." },
        { title: 'Advance', message: "What questions could we ask the client to reinforce the advance section, and explain why." },
        { title: 'Uncertainty', message: "What questions could we ask the client to reinforce the uncertainty section, and explain why." },
        { title: 'Work Done', message: "What questions could we ask the client to reinforce the work done section, and explain why." }
        // Add more options as needed
      ];

      return (
          <DropdownMenu options={dropdownOptions} title="Extra Questions" message="What questions could we ask the client to reinforce the <baseline|advance|uncertainty|work done> section, and explain why." className="buttons"/>
      );
    };
  
    const DropDownTopics = () => {
      const dropdownOptions = [
        { title: 'Baseline', message: "Show me the baseline of available technology and why they could not be used as is for this project based on all the information provided and the BEIS/DSIT guidelines for R&D." },
        { title: 'Advance', message: "Show me one or more technological advances for this project based on all the information provided and the BEIS/DSIT guidelines for R&D." },
        { title: 'Uncertainty', message: "Show me one or more technological uncertainties per advance for this project based on all the information provided and the BEIS/DSIT guidelines for R&D." },
        { title: 'Work Done', message: "Show me the work done to overcome each of the technological uncertainties based on all the information provided and the BEIS/DSIT guidelines for R&D." }
        // Add more options as needed
      ];

      return (
          <DropdownMenu options={dropdownOptions} title="Topics" message="Show me <baseline|advance|uncertainty|work done> for this project based on all the information provided and the BEIS/DSIT guidelines for R&D." className="buttons"/>
      );
    };
    
  //const [selectedOrganisations, setSelectedOrganisations] = useState([]);
  return (
    <div id="button_container">
      {/*<MeetingUploadForm dlt={dlt}
            selectedOrganisations={selectedOrganisations}
            setSelectedOrganisations={setSelectedOrganisations} />      */}
      <div className="prompt-section prompt-section-projectlist">
      <div className="header-with-tooltip">
        <h2>Project List Assistant</h2> 
        <div className="tooltip-container">
          <span className="question-mark-icon material-symbols-outlined">question_mark</span>
          <div className="tooltip-content">
            Set of pre-built prompts to help with summarising the projects into a list.<br/><br/>Please replace the content between angle brackets (&lt;  &gt;) as required.
          </div>
        </div>
      </div>
        <h3>Probes</h3>
        <div className="horizontal">
          <GenButtonPrompt title="New Field" icon="variable_add" message="Add an extra field for each project to describe the <common technology|clients|etc> related to the projects."/>
          <GenButtonPrompt title="Questions" icon="help" message="What questions do we have outstanding on each project?"/>
        </div>
        <h3>List Structure</h3>
        <div className="horizontal">
          <GenButtonPrompt title="Merge" icon="merge" message="Merge Project <name or number> and Project <name or number>, then regenerate the project list."/>
          <GenButtonPrompt title="Split" icon="call_split" message="Project <name or number> into two projects with the topics <X> and <Y>, and regenerate the project list."/>
        {/* </div><div className="horizontal"> */}
          <GenButtonPrompt title="Keep" icon="keep" message="Keep Projects <X, Y and Z> and delete all the others."/>
          <GenButtonPrompt title="Delete" icon="delete" message="Delete Project <name or number> from the list."/>
        </div>
        <h3>Refinement</h3>
        <div className="horizontal">
          <GenButtonPrompt title="Focus" icon="center_focus_weak" message="Project <name or number> should focus on <this feature>. Remember this change and regenerate the project list"/>
          <GenButtonPrompt title="Fix" icon="healing" message="Correct the term <X> to be <Y>. Use this change as context and regenerate the project list now the topic has changed."/>
        </div>
        <h3>Buttons</h3>
        <div className="horizontal">
          <GenButtonPrompt title="Regenerate" icon="restart_alt" message="Regenerate the project list."/>
          <GenButtonPrompt disabled={true} icon="history" title="Reset" message="Restart the review."/>
          <GenButtonPrompt disabled={true} icon="sync" title="Switch" message="Summarise a different file."/>
          <GenButtonPrompt title="Save" icon="save" message="Format the text in CSV format. Keep the text unchanged and include column headers."/>
        </div>
      </div>
      <div className="prompt-section prompt-section-casestudy">
        <div className="header-with-tooltip">
          <h2>Case Study Assistant</h2>
          <div className="tooltip-container">
            <span className="question-mark-icon material-symbols-outlined">question_mark</span>
            <div className="tooltip-content">
              Set of pre-built prompts to help with building the project&apos;s Skeleton.<br/><br/>Please replace the content between angle brackets (&lt;  &gt;) as required.
            </div>
          </div>
        </div>
        <div className="horizontal grid">
          <h3 className="first-item">Probes</h3>
          <h3 className="second-item">Topics</h3>
        </div>
            <div className="horizontal">
              <GenButtonPrompt title="Guidelines Check" icon="developer_guide" message="Based on the BEIS/DSIT guidelines for R&D, explain how this section meets the requirements, and also where it does not (quoting any relevant paragraphs from the guidelines)."/>
              <DropDownExtraQuestions/> 
              <DropDownTopics/>
          </div>
          
          
        <h3>Refinement</h3>
          <div className="horizontal">
            <GenButtonPrompt title="Topic Change" icon="topic" message="Change the focus on the case study to be about <topic>."/>
            <GenButtonPrompt title="Focus" icon="reset_focus" message="Focus this section only on the points made about X & Y, and regenerate this section of text."/>
            <GenButtonPrompt title="Store" icon="archive" message="This <baseline|advance|uncertainty|work down> section contains good information, retain this as the standard description for the time being."/>
          </div>
          <h3>Buttons</h3>
          <div className="horizontal">
            <GenButtonPrompt disabled={true} title="Switch Project" icon="tactic" message="(Reload project list in workflow) Switch to a different project"/>
            <GenButtonPrompt title="Regenerate Skeleton" icon="skeleton" message="Make these changes to the <baseline|advance|uncertainty|work down> and regenerate the project case study skeleton based on the original chat prompt."/>
            <GenButtonPrompt title="Regenerate Section" icon="humerus" message="Make these changes to the case study section being reviewed and regenerate the section based on the original chat prompt."/>
          </div>
      </div>
      <div className="prompt-section prompt-section-general">
          <div className="header-with-tooltip">
          <h2>Quick Actions</h2>
          <div className="tooltip-container">
            <span className="question-mark-icon material-symbols-outlined">question_mark</span>
            <div className="tooltip-content">
              Global commands to reset converstion dialogs.
            </div>
          </div>
        </div>
          <div className="horizontal">
            <Components.Composer directLine={dlt}>
            <GenButton title="Exit to Menu" icon="menu_open" message="!exit"/>
            <GenButton title="Logout" icon="logout" message="!logout"/>
            </Components.Composer>
          </div>
      </div>
    </div>
    
  );
}

PromptButtonContainer.propTypes = {
  dlt: PropTypes.any.isRequired
};


export default PromptButtonContainer;