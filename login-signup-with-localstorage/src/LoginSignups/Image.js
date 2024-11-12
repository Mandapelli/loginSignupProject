import React, { useState } from 'react';

const ImageUploadAndResult = () => {
  const [file, setFile] = useState(null);
  const [heading, setHeading] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [summary, setSummary] = useState('');
  const [messages, setMessages] = useState([]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    
    // Simulate the image upload and text extraction
    // Replace this part with an actual API call to the Flask backend for image processing
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        // Here, replace with actual API endpoint for image upload and text extraction
        const response = await fetch('/upload_image', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setHeading(data.heading);
          setExtractedText(data.extracted_text);
          setSummary(data.summary);
          setMessages([data.message || 'Upload successful!']);
        } else {
          setMessages(['Failed to upload image. Please try again.']);
        }
      } catch (error) {
        setMessages(['Error uploading image.']);
      }
    }
  };

  const handleDownloadPdf = async (event) => {
    event.preventDefault();

    const pdfData = {
      extracted_text: extractedText,
      heading: heading,
      summary: summary,
    };

    // Replace with your Flask backend API for PDF generation
    const response = await fetch('/download_pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pdfData),
    });

    if (response.ok) {
      // Trigger download of the PDF file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'extracted_text.pdf';
      a.click();
    } else {
      alert('Error generating PDF.');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Upload an Image</h1>
      
      <form onSubmit={handleUpload} style={styles.form}>
        <input
          type="file"
          name="file"
          accept="image/*"
          onChange={handleFileChange}
          style={styles.fileInput}
          required
        />
        <input type="submit" value="Upload" style={styles.submitButton} />
      </form>

      {messages.length > 0 && (
        <ul>
          {messages.map((message, index) => (
            <li key={index} style={styles.message}>{message}</li>
          ))}
        </ul>
      )}

      {heading && extractedText && summary && (
        <div style={styles.resultContainer}>
          <h1><strong>{heading}</strong></h1>
          <h2>Full Extracted Text:</h2>
          <p style={styles.textBox}>{extractedText}</p>
          <h2>Summary:</h2>
          <p style={styles.textBox}>{summary}</p>

          <form onSubmit={handleDownloadPdf}>
            <button type="submit" style={styles.button}>Download PDF</button>
          </form>
          
          <a href="/upload" style={styles.link}>Upload another image</a>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f4f4f9',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    margin: 0,
    padding: '20px',
  },
  heading: {
    fontSize: '2.5rem',
    color: '#333',
    marginBottom: '20px',
  },
  form: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  fileInput: {
    fontSize: '1rem',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    width: '100%',
    marginBottom: '20px',
  },
  submitButton: {
    backgroundColor: '#28a745',
    color: '#fff',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1.1rem',
  },
  resultContainer: {
    marginTop: '40px',
    textAlign: 'center',
    width: '100%',
    maxWidth: '800px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  textBox: {
    backgroundColor: '#fff',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px',
    whiteSpace: 'pre-wrap',
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    fontSize: '1.2rem',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  link: {
    textDecoration: 'none',
    fontSize: '1.1rem',
    color: '#007bff',
    marginTop: '10px',
  },
  message: {
    color: 'red',
    fontSize: '1rem',
  },
};

export default ImageUploadAndResult;