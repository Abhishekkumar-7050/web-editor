import React, { useState } from "react";
import { Editor } from "@monaco-editor/react";

const VSCodeEditor = () => {
  const [code, setCode] = useState("// Open a file to edit...");  
  const [fileHandle, setFileHandle] = useState(null);
  const [language, setLanguage] = useState("javascript");

  // Helper function to determine language from file extension
  const getLanguageFromFileName = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'php': 'php',
      'sql': 'sql',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'go': 'go',
      'rs': 'rust',
      'rb': 'ruby',
    };
    return languageMap[extension] || 'plaintext';
  };

  // Open a file from the system
  const openFile = async () => {
    try {
      const [handle] = await window.showOpenFilePicker();
      const file = await handle.getFile();
      const text = await file.text();
      setCode(text);
      setFileHandle(handle);
      // Set language based on file extension
      setLanguage(getLanguageFromFileName(file.name));
    } catch (err) {
      console.error("Error opening file:", err);
    }
  };

  // Save the file back to the system
  const saveFile = async () => {
    if (!fileHandle) return;
    try {
      const writable = await fileHandle.createWritable();
      await writable.write(code);
      await writable.close();
      alert("File saved successfully!");
    } catch (err) {
      console.error("Error saving file:", err);
    }
  };

  return (
    <div style={{ height: "90vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "10px", background: "#1e1e1e", color: "white" }}>
        <button onClick={openFile} style={{ marginRight: "10px" }}>📂 Open File</button>
        <button onClick={saveFile}>💾 Save File</button>
      </div>
      <Editor
        height="100%"
        theme="vs-dark"
        language={language}
        value={code}
        onChange={(value) => setCode(value)}
      />
    </div>
  );
};

export default VSCodeEditor;
