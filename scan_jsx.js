const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const directories = ["app", "components"];

function getFiles(dirs) {
  let files = [];
  dirs.forEach(dir => {
    let fullPath = path.resolve(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) return;
    const items = fs.readdirSync(fullPath, { withFileTypes: true });
    items.forEach(item => {
      const res = path.resolve(fullPath, item.name);
      if (item.isDirectory()) {
        files = [...files, ...getFiles([res])];
      } else if (item.isFile() && item.name.endsWith(".jsx")) {
        files.push(res);
      }
    });
  });
  return files;
}

const files = getFiles(directories);

files.forEach(file => {
  const code = fs.readFileSync(file, "utf-8");
  try {
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx"]
    });

    traverse(ast, {
      JSXText(pathNode) {
        const value = pathNode.node.value.trim();
        if (value.length > 0) {
          const parent = pathNode.parentPath.node;
          if (parent.type === "JSXElement") {
            const nameNode = parent.openingElement.name;
            let openingElementName = "Unknown";
            if (nameNode.type === "JSXIdentifier") openingElementName = nameNode.name;
            else if (nameNode.type === "JSXMemberExpression") openingElementName = nameNode.property.name;

            // Report all JSXText findings for debugging or as valid results
            const { line, column } = pathNode.node.loc.start;
            console.log(`${file}:${line}:${column} | Parent: ${openingElementName} | Snippet: "${value.substring(0, 40)}"`);
          }
        }
      },
      JSXExpressionContainer(pathNode) {
        if (pathNode.node.expression.type === "StringLiteral") {
          const value = pathNode.node.expression.value.trim();
          if (value.length > 0) {
            const parent = pathNode.parentPath.node;
            if (parent.type === "JSXElement") {
              const nameNode = parent.openingElement.name;
              let openingElementName = "Unknown";
              if (nameNode.type === "JSXIdentifier") openingElementName = nameNode.name;
              else if (nameNode.type === "JSXMemberExpression") openingElementName = nameNode.property.name;

              const { line, column } = pathNode.node.loc.start;
              console.log(`${file}:${line}:${column} | Parent: ${openingElementName} | Snippet: "{"${value.substring(0, 40)}""}`);
            }
          }
        }
      }
    });
  } catch (e) {
    // console.error(`Error parsing ${file}: ${e.message}`);
  }
});
