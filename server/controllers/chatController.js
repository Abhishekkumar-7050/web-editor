const { model } = require('../config/gemini');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// Language configurations
const languageConfigs = {
  javascript: {
    extension: 'js',
    command: 'node',
    tempDir: 'js_temp'
  },
  python: {
    extension: 'py',
    command: 'python',
    tempDir: 'py_temp'
  },
  cpp: {
    extension: 'cpp',
    command: os.platform() === 'win32' ? '.\\a.exe' : './a.out',
    compile: os.platform() === 'win32' 
      ? 'g++ "{file}" -o a.exe'
      : 'g++ "{file}" -o a.out',
    tempDir: 'cpp_temp'
  },
  java: {
    extension: 'java',
    command: 'java',
    compile: 'javac "{file}"',
    tempDir: 'java_temp',
    className: 'Main'  // For Java files
  }
};

const generateResponse = async (req, res) => {
  try {
    const { prompt, action } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Different prompts based on action type
    let enhancedPrompt;
    if (action === 'execute') {
      enhancedPrompt = `
Please provide the code execution result with the following structure:

1. Code output/result
2. Any console logs
3. Potential errors or warnings
4. Performance considerations

Code to execute: ${prompt}
      `.trim();
    } else {
      enhancedPrompt = `
Please provide a detailed response with the following structure:

1. Brief explanation of the solution
2. Code implementation with comments
3. Step-by-step explanation of how the code works
4. Example usage with different scenarios
5. Best practices and potential improvements
6. Add a "Run this code" button functionality using HTML/JavaScript

Original prompt: ${prompt}
      `.trim();
    }

    const result = await model.generateContent(enhancedPrompt);
    const text = result.response.text();

    res.json({ 
      response: text,
      model: "gemini-1.5-pro"
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: "Error generating response",
      details: error.message,
      model: "gemini-1.5-pro"
    });
  }
};

const executeCode = async (req, res) => {
  try {
    const { code, language = 'javascript' } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const config = languageConfigs[language];
    if (!config) {
      return res.status(400).json({ error: 'Unsupported language' });
    }

    // Create temp directory
    const tempDir = path.join(os.tmpdir(), config.tempDir);
    await fs.mkdir(tempDir, { recursive: true });

    // Create temp file
    const fileName = `temp_${Date.now()}.${config.extension}`;
    const filePath = path.join(tempDir, fileName);
    await fs.writeFile(filePath, code);

    let output = '';
    let error = null;

    try {
      // Compile if needed (C++, Java)
      if (config.compile) {
        const compileCommand = config.compile.replace('{file}', filePath);
        await new Promise((resolve, reject) => {
          exec(compileCommand, { cwd: tempDir }, (err, stdout, stderr) => {
            if (err) {
              reject(new Error(stderr || err.message));
              return;
            }
            resolve(stdout);
          });
        });
      }

      // Execute the code
      let executeCommand;
      switch (language) {
        case 'cpp':
          executeCommand = config.command;
          break;
        case 'java':
          // For Java, we need to execute the class file
          executeCommand = `${config.command} ${config.className}`;
          break;
        default:
          executeCommand = `${config.command} "${fileName}"`;
      }

      output = await new Promise((resolve, reject) => {
        exec(executeCommand, { cwd: tempDir }, (err, stdout, stderr) => {
          if (err) {
            reject(new Error(stderr || err.message));
            return;
          }
          resolve(stdout);
        });
      });
    } catch (err) {
      error = err.message;
    }

    // Cleanup
    try {
      await fs.unlink(filePath);
      if (config.compile) {
        if (language === 'cpp') {
          const executablePath = path.join(tempDir, os.platform() === 'win32' ? 'a.exe' : 'a.out');
          await fs.unlink(executablePath).catch(() => {});
        } else if (language === 'java') {
          await fs.unlink(path.join(tempDir, `${config.className}.class`)).catch(() => {});
        }
      }
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }

    res.json({
      success: !error,
      output: output || '',
      error: error,
      language
    });
  } catch (error) {
    console.error('Execution error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      language: req.body.language
    });
  }
};

module.exports = {
  generateResponse,
  executeCode
}; 