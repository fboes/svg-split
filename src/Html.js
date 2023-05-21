const htmlConvert = (text) => {
  return String(text).replace(/[<>"&']/g, (m) => {
    switch (m) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case '"':
        return "&quot;";
      case "'":
        return "&apos;";
      default:
        return m;
    }
  });
};

export const getHtmlPreview = (filesOutput, fileInput) => {
  filesOutput = filesOutput.map((fileOutput) => {
    return htmlConvert(fileOutput);
  });
  fileInput = htmlConvert(fileInput);
  let html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${fileInput}</title>
    <style>
      * { margin: 0; padding: 0;}
      body { padding: 0.5em; background: #eee; text-align: center; }
      h1 { margin-bottom: 0.5em; }
      img { width: 100%; height: auto; border: 1px solid #ddd; background: white }
      ul { list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem; font-size: 0.6rem; }
    </style>
  </head>
  <body>
    <h1>${fileInput}</h1>
    <ul>
`;
  filesOutput.forEach((filesOutput) => {
    html += `      <li>${filesOutput} <a href="${filesOutput}"><img src="${filesOutput}" alt="${filesOutput}" /></a></li>\n`;
  });
  html += `    </ul>
  </body>
</html>
`;
  return html;
};
