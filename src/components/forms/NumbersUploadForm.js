import '../../App.css';
import '../WebChatContainer.css';
import React, { useEffect, useState } from "react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import PropTypes from 'prop-types';
import {hooks} from 'botframework-webchat';

const NumbersUploadForm = ({ selectedOrganisations, setSelectedOrganisations }) => {

  // normalise API response casing
  const normalizeApiObject = (item) => {
    if (!item) return item;
    const result = { ...item };
    if (item.Id !== undefined && result.id === undefined) result.id = item.Id;
    if (item.Name !== undefined && result.name === undefined) result.name = item.Name;
    if (item.Team !== undefined && result.team === undefined) result.team = item.Team;
    if (item.Status !== undefined && result.status === undefined) result.status = item.Status;
    if (item.Owner !== undefined && result.owner === undefined) result.owner = item.Owner;
    return result;
  };
  const normalizeArray = (arr) => (Array.isArray(arr) ? arr.map(normalizeApiObject) : []);

  const [organisation, setOrganisation] = useState({id:0});
  const [projects, setProjects] = useState([]);
  const [requestingTeam, setRequestingTeam] = useState("");
  const [writerTeam, setWriterTeam] = useState("");
  const [claimScheme, setClaimScheme] = useState("");
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
  const claimSchemeOptions = [
    {id:'SME',name:'SME'},
    {id:'RDEC',name:'RDEC'},
    {id:'Hybrid',name:'Hybrid'},
    {id:'Merged Scheme',name:'Merged Scheme'},
  ];
  const requestingTeamOptions = [
    {id:'FB Consulting',name:'FB Consulting'},
    {id:'Hatfield',name:'Hatfield'},
    {id:'Hawthorn',name:'Hawthorn'},
    {id:'Maple',name:'Maple'},
    {id:'Redwood',name:'Redwood'},
    {id:'Sherwood',name:'Sherwood'},
  ];
  const activityOptions = [
    {id:'Numbers Prep',name:'Numbers Prep'},
    {id:'Accounts',name:'Accounts'},
    {id:'Payroll',name:'Payroll'},
    {id:'Timesheets',name:'Timesheets'},
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
            const data = await response.json();
            return normalizeArray(data);
        }
    }
    return [];
  };

  const loadClaimOptions = async (org) => {
    if (org.id != 0) {
      const response = await fetch(`https://fb-dev-func-connect-api.azurewebsites.net/api/capsule/organisations/${org.id}/projects?code=1hDoeI1ma0oNcBzCXofq88Q3N90GWQcw0SUixCQRwriMAzFuhk2vhw%3D%3D`);
        if (response.ok) {
            var claims = await response.json();
            return normalizeArray(claims);
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
        "requestedTeam":"${writerTeam.id}","claimScheme":"${claimScheme.id}","writingDueDate":"${writingDueDate}"}`;
      sendMessage(formMessage);
      setFormSubmitted(true);
    };
    return  <button className="button_icon submit" onClick={handleClick} disabled={formSubmitted||organisation.id==0||projects.length==0||requestingTeam==""||writerTeam==""||claimScheme==""||writingDueDate==""||activities==""}>
                <span className="material-symbols-outlined">{icon}</span>{title}
            </button>;
  };  

  BotMessageButton.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired
  };

  return (
    <div className="column webchat-form">
      <h2>Enter details for a new numbers task:</h2>
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
        <h3 className='select-inline-label'>Claim Scheme</h3>
        <Select
          className='select-inline'
          placeholder="Choose claim schema"
          isDisabled={formSubmitted}
          getOptionLabel={(e) => e.name}
          getOptionValue={(e) => e.id}
          options={claimSchemeOptions}
          onChange={(value) => setClaimScheme(value)}
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
        <span className='select-help-text' >(Typically a week from now)</span>
      </div>      
      <div >
          <BotMessageButton title="Submit" icon="save"/>
      </div>
    </div>
  );
};

NumbersUploadForm.propTypes = {
    dlt: PropTypes.any.isRequired,
    selectedOrganisations: PropTypes.string,
    setSelectedOrganisations: PropTypes.string
  };

export default NumbersUploadForm;
