import React, { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { hasRole } from '../security/AuthService';
import '../styles/components/FileList.css';
import { getToken } from '../security/AuthService'; 

const API_URL = 'http://localhost:3000/files';

const FileList = ({ onDeleteSuccess, onUploadSuccess, clientId, page = 'ADMIN' }) => {
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [filters, setFilters] = useState({
    name: '',
    extension: '',
    weight: '',
    createdAt: '',
    clientId: '',
  });
  const [toUpdate, setToUpdate] = useState(false);
  const [file, setFile] = useState(null);
  const [extensions, setExtensions] = useState([]);
  const token = getToken();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        let url = API_URL;
        if (clientId) {
          url += `/client/${clientId}`;
        } else {
          url += `/`;
        }

        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        const filesArray = Array.isArray(data) ? data : [];
        setFiles(filesArray);
        setFilteredFiles(filesArray);

        // Extract unique file extensions
        const uniqueExtensions = [
          ...new Set(filesArray.map((file) => file.extension.toLowerCase())),
        ];
        setExtensions(uniqueExtensions);
      } catch (error) {
        console.error('Failed to fetch files:', error);
        setFiles([]);
        setFilteredFiles([]);
      }
    };
    fetchFiles();
  }, [clientId, toUpdate]);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...files];

      if (filters.name) {
        filtered = filtered.filter((file) =>
          file.name.toLowerCase().includes(filters.name.toLowerCase())
        );
      }

      if (filters.extension) {
        filtered = filtered.filter(
          (file) => file.extension.toLowerCase() === filters.extension.toLowerCase()
        );
      }

      if (filters.weight) {
        filtered = filtered.sort((a, b) => {
          if (filters.weight === 'asc') return a.weight - b.weight;
          if (filters.weight === 'desc') return b.weight - a.weight;
          return 0;
        });
      }

      if (filters.createdAt) {
        filtered = filtered.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          if (filters.createdAt === 'asc') return dateA - dateB;
          if (filters.createdAt === 'desc') return dateB - dateA;
          return 0;
        });
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clientId) {
      alert('Client ID is required');
      return;
    }

    const formData = new FormData();
    formData.append('client', clientId);
    formData.append('file', file);
    console.log(formData);

    try {
      const response = await fetch('http://localhost:3000/files/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
      }
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        setToUpdate(!toUpdate);
        if (onUploadSuccess) onUploadSuccess(result.file); // Callback on success
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('File upload failed.');
    }
  };

  const handleDelete = async (fileId) => {
    try {
      const response = await fetch(`${API_URL}/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
      }
      });

      if (response.ok) {
        // Remove deleted file from local state
        const newFiles = files.filter((file) => file._id !== fileId);
        setToUpdate(!toUpdate);
        if (onDeleteSuccess) onDeleteSuccess(file);
        setFilteredFiles(newFiles.filter((file) =>
          filters.name ? file.name.toLowerCase().includes(filters.name.toLowerCase()) : true &&
          filters.extension ? file.extension.toLowerCase().includes(filters.extension.toLowerCase()) : true &&
          filters.weight ? file.weight.toString().includes(filters.weight) : true &&
          filters.createdAt ? new Date(file.createdAt).toISOString().includes(filters.createdAt) : true &&
          !clientId && filters.clientId ? file.client.toLowerCase().includes(filters.clientId.toLowerCase()) : true
        ));
        alert('File deleted successfully');
      } else {
        console.error('Failed to delete file');
        alert('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fetch(`${API_URL}/${fileId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
      }
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const getFilePreviewUrl = (file) => {
    return `${API_URL}/${file._id}`;
  };

  const isImageFile = (extension) => ['jpg', 'jpeg', 'png', 'gif'].includes(extension.toLowerCase());
  const isPdfFile = (extension) => extension.toLowerCase() === 'pdf';

  return (
    <div className="file-list-container">
      {page === "HOME" && (
        <div>
          <h2>Télécharger un fichier vers le serveur</h2>
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="file-upload-form">
            <div>
              <label htmlFor="file">Choisissez un fichier:</label>
              <input
                type="file"
                id="file"
                name="file"
                accept=".pdf,.txt,.doc,.docx,.jpg,.png"
                onChange={handleFileChange}
                required
              />
            </div>
            <button type="submit">Envoyer</button>
          </form>
        </div>
      )}
      <h2>Liste de fichier</h2>
      <div className="file-filters">
        <label>
          Nom:
          <input
            type="text"
            name="name"
            value={filters.name}
            onChange={handleFilterChange}
          />
        </label>
        <label>
          Extension:
          <select
            name="extension"
            value={filters.extension}
            onChange={handleFilterChange}
          >
            <option value="">All</option>
            {extensions.map((ext) => (
              <option key={ext} value={ext}>
                {ext}
              </option>
            ))}
          </select>
        </label>
        <label>
          Taille :
          <select name="weight" value={filters.weight} onChange={handleFilterChange}>
            <option value="">Sans Ordre</option>
            <option value="asc">Ascendant</option>
            <option value="desc">Descendant</option>
          </select>
        </label>
        <label>
          Date de création :
          <select name="createdAt" value={filters.createdAt} onChange={handleFilterChange}>
            <option value="">Sans Ordre</option>
            <option value="asc">Ascendant</option>
            <option value="desc">Descendant</option>
          </select>
        </label>

        {hasRole('ADMIN') && (
          <label>
            ID Client :
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
        <p>Aucun fichier trouver.</p>
      ) : (
        <table className="file-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Extension</th>
              <th>Taille (bytes)</th>
              <th>Date de création</th>
              <th>Previsualisation</th>
              {!clientId && <th>ID Client</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFiles.map((file) => (
              <tr key={file._id}>
                <td>{file.name}</td>
                <td>{file.extension}</td>
                <td>{file.weight}</td>
                <td>{new Date(file.createdAt).toLocaleDateString()}</td>
                <td>
                  {isImageFile(file.extension) ? (
                    <img
                      src={getFilePreviewUrl(file)}
                      alt={file.name}
                      style={{ width: '100px', height: 'auto' }}
                    />
                  ) : isPdfFile(file.extension) ? (
                    <div style={{ width: '100px', height: '150px' }}>
                      <Document 
                        file={getFilePreviewUrl(file)}>
                        <Page pageNumber={1} width={100} />
                      </Document>
                    </div>
                  ) : (
                    'No preview available'
                  )}
                </td>
                {hasRole('ADMIN') && <td>{file.client}</td>}
                <td>
                  <button onClick={() => handleDownload(file._id, file.name)}>Télécharger</button>
                  <button onClick={() => handleDelete(file._id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FileList;
