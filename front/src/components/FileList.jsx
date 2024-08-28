import React, { useState, useEffect } from 'react';

// Example URL for the backend API
const API_URL = 'http://localhost:3000/files';

const FileList = ({ clientId }) => {
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [filters, setFilters] = useState({
    name: '',
    extension: '',
    weight: '',
    createdAt: '',
    clientId: '',
  });

  useEffect(() => {
    // Fetch files from the backend when the component mounts
    const fetchFiles = async () => {
      try {
        let url = API_URL;
        if (clientId) {
          url += `/client/${clientId}`;
        }else{
            url += `/`;
        }

        const response = await fetch(url);
        const data = await response.json();
        console.log(data); // Add this line to see the structure of the data
        setFiles(Array.isArray(data) ? data : []);
        setFilteredFiles(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch files:', error);
        setFiles([]);
        setFilteredFiles([]);
      }
    };
  
    fetchFiles();
  }, [clientId]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  useEffect(() => {
    const applyFilters = () => {
      let filtered = files;

      if (filters.name) {
        filtered = filtered.filter((file) =>
          file.name.toLowerCase().includes(filters.name.toLowerCase())
        );
      }

      if (filters.extension) {
        filtered = filtered.filter((file) =>
          file.extension.toLowerCase().includes(filters.extension.toLowerCase())
        );
      }

      if (filters.weight) {
        filtered = filtered.filter(
          (file) => file.weight.toString().includes(filters.weight)
        );
      }

      if (filters.createdAt) {
        filtered = filtered.filter((file) =>
          new Date(file.createdAt).toISOString().includes(filters.createdAt)
        );
      }

      if (!clientId && filters.clientId) {
        filtered = filtered.filter((file) =>
          file.client.toLowerCase().includes(filters.clientId.toLowerCase())
        );
      }

      setFilteredFiles(filtered);
    };

    applyFilters();
  }, [filters, files, clientId]);

  return (
    <div>
      <h1>File List</h1>

      <div>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={filters.name}
            onChange={handleFilterChange}
          />
        </label>
        <label>
          Extension:
          <input
            type="text"
            name="extension"
            value={filters.extension}
            onChange={handleFilterChange}
          />
        </label>
        <label>
          Weight (in bytes):
          <input
            type="text"
            name="weight"
            value={filters.weight}
            onChange={handleFilterChange}
          />
        </label>
        <label>
          Created At:
          <input
            type="text"
            name="createdAt"
            value={filters.createdAt}
            onChange={handleFilterChange}
            placeholder="YYYY-MM-DD"
          />
        </label>

        {!clientId && (
          <label>
            Client ID:
            <input
              type="text"
              name="clientId"
              value={filters.clientId}
              onChange={handleFilterChange}
            />
          </label>
        )}
      </div>

      {filteredFiles.length === 0 ? (
        <p>No files found.</p> 
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Extension</th>
              <th>Weight (bytes)</th>
              <th>Created At</th>
              {!clientId && <th>Client ID</th>}
            </tr>
          </thead>
          <tbody>
            {filteredFiles.map((file) => (
              <tr key={file._id}>
                <td>{file.name}</td>
                <td>{file.extension}</td>
                <td>{file.weight}</td>
                <td>{new Date(file.createdAt).toLocaleDateString()}</td>
                {!clientId && <td>{file.client}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FileList;