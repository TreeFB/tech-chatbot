import React, { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import PropTypes from 'prop-types';

const OrganisationDropdown = ({ selectedOrganisations, setSelectedOrganisations }) => {

  const [query, setQuery] = useState("");
  const [defaultOptions, setDefaultOptions] = useState("");

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
            return await response.json();
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
