import '../../App.css';
import '../WebChatContainer.css';
import React, { useEffect, useState, useRef } from "react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import PropTypes from 'prop-types';
import {hooks} from 'botframework-webchat';

const MeetingUploadForm = ({ selectedOrganisations, setSelectedOrganisations, includeMeetingTime }) => {

  const [organisation, setOrganisation] = useState({id:0});
  const [projects, setProjects] = useState([]);
  const [writerTeam, setWriterTeam] = useState("");
  const [techSector, setTechSector] = useState("");
  const [meetingTime, setMeetingTime] = useState("");

  const [organisationQuery, setOrganisationQuery] = useState("");
  const [claimQuery, setClaimQuery] = useState("");
  const [claimOptions, setClaimOptions] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const projectSelectRef = useRef();

  const writerTypeOptions = [
    {id:'AGI Writers',name:'AGI Writers'},
    {id:'FB Researchers',name:'FB Researchers'},
    {id:'DB Any',name:'FB Any'},
    {id:'Not Ready',name:'Not Ready'},
  ];
  const techSectorOptions = [
    {id:'Analogue',name:'Analogue (engineering, manufacturing,..)'},
    {id:'Digital',name:'Digital (software, IT, electronics,...)'},
  ];

  useEffect(() => {
    if (selectedOrganisations) {
      //setDefaultOptions("");
    }
  }, [selectedOrganisations]);

  useEffect(() => {
    if (organisationQuery) {
      //Do nothing yet
      console.log("OrganisationSearch: "+organisationQuery);
    }
    if (claimQuery) {
      //Do nothing yet
      console.log("ClaimSearch: "+claimQuery);
    }
  }, [organisationQuery,claimQuery]);

  // Call search API and load
  const loadOrganisationOptions = async (searchString) => {
    if (searchString.length > 2) {
        const response = await fetch(`https://fb-dev-func-connect-api.azurewebsites.net/api/capsule/organisations/search?code=axXgpY8dbT_gi0JUZYMXs4sKrvf3QKLXTxwaYqTgZfBqAzFuxTFvwQ%3D%3D&search=${searchString}`);
        if (response.ok) {
            return await response.json();
        }
    }
    return [];
  };

  const loadClaimOptions = async (org) => {
    if (org.id != 0) {
      const response = await fetch(`https://fb-dev-func-connect-api.azurewebsites.net/api/capsule/organisations/${org.id}/projects?code=1hDoeI1ma0oNcBzCXofq88Q3N90GWQcw0SUixCQRwriMAzFuhk2vhw%3D%3D`);
        if (response.ok) {
            var claims = await response.json();
            return claims;
        }
    }
    return [];
  };  

  const setSelectedOrganisation = async (org) => {
    setOrganisation(org)
    console.log("Organisation: "+org.name);
    console.log("OrganisationId: "+org.id);
    
    var projectOptions = await loadClaimOptions(org);
    setClaimOptions(projectOptions);
    return setSelectedOrganisations(org);
  };  

  const { useSendPostBack } = hooks;
  
  const BotMessageButton = ({ title, icon }) => {

    const sendMessage = useSendPostBack();
    const handleClick = () => {
      var projectList = projects.map((p) => p.name).join(",");
      var opportunityIdList = projects.map((p) => p.id).join(",");
      var meetingTimeParts = meetingTime.split("T");
      var formMessage = `{"submit":true,
        "clientName":"${organisation.name}","claimYears":"${projectList}",
        "capsuleOrganisationId":"${organisation.id}","capsuleOpportunityIds":"${opportunityIdList}",
        "clientMeetingDate":"${meetingTimeParts[0]}","clientMeetingTime":"${meetingTimeParts[1]}",
        "claimWriterTeam":"${writerTeam.id}","claimTechSector":"${techSector.id}"}`;
      sendMessage(formMessage);
      setFormSubmitted(true);
    };
    return  <button className="button_icon submit" onClick={handleClick} disabled={formSubmitted||organisation.id==0||projects.length==0||writerTeam==""||techSector==""||(includeMeetingTime&&meetingTime=="")}>
                <span className="material-symbols-outlined">{icon}</span>{title}
            </button>;
  };  

  BotMessageButton.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired
  };

  return (
    <div className="column webchat-form">
      <h2>Please enter the client details:</h2>
      <div className='horizontal'>
        <h3 className='select-inline-label'>Organisation</h3>
        <AsyncSelect
          className='select-inline'
          placeholder="Enter client name"
          cacheOptions
          getOptionLabel={(e) => e.name}
          getOptionValue={(e) => e.id}
          isDisabled={formSubmitted}
          loadOptions={loadOrganisationOptions}
          onInputChange={(value) => {setOrganisationQuery(value)}}
          onChange={(value) => {setSelectedOrganisation(value); projectSelectRef.current.clearValue();}}
        />
      </div>

      <div className='horizontal'>
        <h3 className='select-inline-label'>Projects</h3>
        <Select
          isMulti
          ref={projectSelectRef}
          className='select-inline'
          getOptionLabel={(e) => e.name}
          getOptionValue={(e) => e.id}
          isDisabled={formSubmitted}
          placeholder="Enter claim period"
          options={claimOptions}
          onInputChange={(value) => setClaimQuery(value) }
          onChange={(value) => setProjects(value)}
        />
      </div>
      { includeMeetingTime &&
      <div className='horizontal'>
        <h3 className='select-inline-label'>Meeting Time</h3>
        <input type="datetime-local" disabled={formSubmitted} onChange={(value) => setMeetingTime(value.target.value)}/>     
      </div>
      }
      <div className='horizontal'>
        <h3 className='select-inline-label'>Writer Team</h3>
        <Select
          className='select-inline'
          placeholder="Choose writer team"
          isDisabled={formSubmitted}
          getOptionLabel={(e) => e.name}
          getOptionValue={(e) => e.id}
          options={writerTypeOptions}
          onChange={(value) => setWriterTeam(value)}
        />      
      </div>

      <div className='horizontal'>
        <h3 className='select-inline-label'>Tech Sector</h3>
        <Select
          className='select-inline'
          placeholder="Choose tech sector"
          isDisabled={formSubmitted}
          getOptionLabel={(e) => e.name}
          getOptionValue={(e) => e.id}
          options={techSectorOptions}
          onChange={(value) => setTechSector(value)}
        />  
      </div>
      <div >
          <BotMessageButton title="Submit" icon="save"/>
      </div>
    </div>
  );
};

MeetingUploadForm.propTypes = {
    dlt: PropTypes.any.isRequired,
    selectedOrganisations: PropTypes.string,
    setSelectedOrganisations: PropTypes.string,
    includeMeetingTime: PropTypes.bool
  };

export default MeetingUploadForm;
