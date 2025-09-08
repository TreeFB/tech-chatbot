import '../../App.css';
import '../WebChatContainer.css';
import React, { useEffect, useState } from "react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import PropTypes from 'prop-types';
import {hooks} from 'botframework-webchat';

const TaxCalcUploadForm = ({ selectedOrganisations, setSelectedOrganisations }) => {

  const [organisation, setOrganisation] = useState({id:0});
  const [projects, setProjects] = useState([]);
  const [requestingTeam, setRequestingTeam] = useState("");
  const [writerTeam, setWriterTeam] = useState("");
  const [activities, setActivities] = useState("");
  const [description, setDescription] = useState("");
  const [writingDueDate, setWritingDueDate] = useState("");

  const [organisationQuery, setOrganisationQuery] = useState("");
  const [claimQuery, setClaimQuery] = useState("");
  const [claimOptions, setClaimOptions] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const writerTypeOptions = [
    {id:'Me',name:'Me'},
    {id:'AGI Numbers',name:'AGI Numbers'},
    {id:'FB Tax Advisors',name:'FB Tax Advisors'},
    {id:'Not Ready',name:'Not Ready'},
  ];
  const requestingTeamOptions = [
    {id:'FBC',name:'FBC'},
    {id:'Hawthorn',name:'Hawthorn'},
    {id:'Maple',name:'Maple'},
    {id:'Redwood',name:'Redwood'},
    {id:'Sherwood',name:'Sherwood'},
  ];  
  const activityOptions = [
    {id:'TaxCalc (Pre R&D)',name:'TaxCalc (Pre R&D)'},
    {id:'TaxCalc (Post R&D)',name:'TaxCalc (Post R&D)'},
  ];

  useEffect(() => {
    if (selectedOrganisations) {
      //setDefaultOptions("");
    }
  }, [selectedOrganisations]);

  useEffect(() => {
    if (organisationQuery) {
      //Do nothing yet
      //console.log("OrganisationSearch: "+organisationQuery);
    }
    if (claimQuery) {
      //Do nothing yet
      //console.log("ClaimSearch: "+claimQuery);
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
    if (projectOptions.length == 1) {
      setProjects([projectOptions[0]]);
      if (projectOptions[0].team) {
        const teamObj = requestingTeamOptions.find(t => t.name === projectOptions[0].team);
        setRequestingTeam(teamObj || "");              
      } else {
        setRequestingTeam("");  
      }      
    }    
    return setSelectedOrganisations(org);
  };  

  const { useSendPostBack } = hooks;
  
  const BotMessageButton = ({ title, icon }) => {

    const sendMessage = useSendPostBack();
    const handleClick = () => {
      var projectList = projects.map((p) => p.name).join(",");
      var opportunityIdList = projects.map((p) => p.id).join(",");
      var activityList = activities.map((p) => p.id).join(",");
      var formMessage = `{"submit":true,
        "clientName":"${organisation.name}","claimYears":"${projectList}",
        "capsuleOrganisationId":"${organisation.id}","capsuleOpportunityIds":"${opportunityIdList}","requestingTeam":"${requestingTeam.id}", 
        "taskActivity":"${activityList}","taskDescription":"${description}",
        "requestedTeam":"${writerTeam.id}","writingDueDate":"${writingDueDate}"}`;
      sendMessage(formMessage);
      setFormSubmitted(true);
    };
    return  <button className="button_icon submit" onClick={handleClick} disabled={formSubmitted||organisation.id==0||projects.length==0||requestingTeam==""||writerTeam==""||writingDueDate==""||activities==""}>
                <span className="material-symbols-outlined">{icon}</span>{title}
            </button>;
  };  

  BotMessageButton.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired
  };

  return (
    <div className="column webchat-form">
      <h2>Enter details for a new TaxCalc task:</h2>
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
          onChange={(value) => {
            setSelectedOrganisation(value); 
            setProjects([]);
            setRequestingTeam("");  
          }}
        />
      </div>

      <div className='horizontal'>
        <h3 className='select-inline-label'>Projects</h3>
        <Select
          isMulti
          className='select-inline'
          getOptionLabel={(e) => e.name}
          getOptionValue={(e) => e.id}
          isDisabled={formSubmitted}
          placeholder="Enter claim period"
          options={claimOptions}
          value={projects}
          onInputChange={(value) => setClaimQuery(value) }
          onChange={(value) => { 
            setProjects(value);
            if (value.length > 0 && value[0].team) {
              const teamObj = requestingTeamOptions.find(t => t.name === value[0].team);
              setRequestingTeam(teamObj || "");              
            } else {
              setRequestingTeam("");  
            }
          }}
        />
      </div>
      <div className='horizontal'>
        <h3 className='select-inline-label'>Requesting Team</h3>
        <Select
          className='select-inline'
          placeholder="Choose requesting team"
          isDisabled={formSubmitted}
          getOptionLabel={(e) => e.name}
          getOptionValue={(e) => e.id}
          options={requestingTeamOptions}
          value={requestingTeam}
          onChange={(value) => setRequestingTeam(value)}
        />
      </div>
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
        <h3 className='select-inline-label'>Activities</h3>
        <Select
          isMulti
          className='select-inline'
          placeholder="Choose task activities"
          isDisabled={formSubmitted}
          getOptionLabel={(e) => e.name}
          getOptionValue={(e) => e.id}
          options={activityOptions}
          onChange={(value) => setActivities(value)}
        />  
      </div>
      <div className='horizontal'>
        <h3 className='select-inline-label'>Information</h3>
        <textarea rows="3" disabled={formSubmitted} onChange={(value) => setDescription(value.target.value)}/>  
      </div>          
      <div className='horizontal'>
        <h3 className='select-inline-label'>Due By</h3>
        <input type="date" disabled={formSubmitted} onChange={(value) => setWritingDueDate(value.target.value)}/>  
        <span className='select-help-text' >(Typically a day from now)</span>
      </div>      
      <div >
          <BotMessageButton title="Submit" icon="save"/>
      </div>
    </div>
  );
};

TaxCalcUploadForm.propTypes = {
    dlt: PropTypes.any.isRequired,
    selectedOrganisations: PropTypes.string,
    setSelectedOrganisations: PropTypes.string
  };

export default TaxCalcUploadForm;
