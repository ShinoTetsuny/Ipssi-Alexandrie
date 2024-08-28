import React, { useState } from 'react';

const FileUpload = ({ onUploadSuccess, clientId }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
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

    try {
      const response = await fetch('http://localhost:3000/files/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        if (onUploadSuccess) onUploadSuccess(result.file); // Callback on success
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('File upload failed.');
    }
  };

  return (
    <div>
      <h2>Upload File</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          <label htmlFor="file">Choose file:</label>
          <input
            type="file"
            id="file"
            name="file"
            accept=".pdf,.txt,.doc,.docx,.jpg,.png"
            onChange={handleFileChange}
            required
          />
        </div>

        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default FileUpload;
