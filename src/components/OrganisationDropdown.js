import React, { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import PropTypes from 'prop-types';

const OrganisationDropdown = ({ selectedOrganisations, setSelectedOrganisations }) => {

  const [query, setQuery] = useState("");
  const [defaultOptions, setDefaultOptions] = useState(null);

  // normalize any PascalCase to camelCase for id/name so consumers can rely on lowercase
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


  useEffect(() => {
    if (selectedOrganisations) {
      setDefaultOptions("");
    }
  }, [selectedOrganisations]);

  useEffect(() => {
    if (query) {
      //Do nothing yet
      console.log("Search: "+query);
    }
  }, [query]);

  // Call search API and load
  const loadOptions = async (searchString) => {
    if (searchString.length > 2) {
        const response = await fetch(`https://fb-dev-func-connect-api.azurewebsites.net/api/capsule/organisations/search?code=axXgpY8dbT_gi0JUZYMXs4sKrvf3QKLXTxwaYqTgZfBqAzFuxTFvwQ%3D%3D&search=${searchString}`);
        if (response.ok) {
            const data = await response.json();
            return normalizeArray(data);
        }
    }
    return [];
  };

  return (
    <AsyncSelect
      cacheOptions
      //isMulti
      defaultOptions
      getOptionLabel={(e) => e.name}
      getOptionValue={(e) => e.id}
      loadOptions={loadOptions}
      value={defaultOptions}
      onInputChange={(value) => setQuery(value) }
      onChange={(value) => setSelectedOrganisations(value)}
    />
  );
};

OrganisationDropdown.propTypes = {
    selectedOrganisations: PropTypes.any.isRequired,
    setSelectedOrganisations: PropTypes.any.isRequired
  };

export default OrganisationDropdown;
