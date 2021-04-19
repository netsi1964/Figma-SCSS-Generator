const request = require("request");
const secret = require("./secret");
const fs = require("fs");
const start = Date.now();

const shareLinkToDocument = `https://www.figma.com/file/M9XFhgu1E9IhShJ2q8iaGU/dynamisk-tekst?node-id=0%3A1`;
const documentID = shareLinkToDocument.split("file/")[1].split("/")[0];
const DYNAMIC_TEXT_COMPONENT_NAME = "dynamisk tekst";

var options = {
  method: "GET",
  url: `https://api.figma.com/v1/files/${documentID}`,
  headers: { "X-Figma-Token": secret["X-Figma-Token"] },
};

let md = "";
let translations = {};

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  fs.writeFileSync("body.json", body);

  const json = JSON.parse(body);
  const document = json.document;
  const data = document.children[0].children;

  // Find component ID of DYNAMIC_TEXT_COMPONENT_NAME
  const dynamicTextComponentID = getIdOfDynamicTextComponent(json);
  if (dynamicTextComponentID) {
    markUp(json.name, "# ");
    markUp(
      `Dokument opdateret: ${new Date(json.lastModified).toLocaleString()}`,
      "### "
    );
    markUp(`Texts generated: ${new Date().toLocaleString()}\n`, "### ");

    const frames = data.filter((child) => child.type === "FRAME");

    frames.forEach((frame) => {
      {
        // markUp(frame.name, "## ");
        // markUp(underline(frame.name, "## "));
        const instancesOfDynamicText = frame.children.filter(
          (obj) =>
            obj.type === "INSTANCE" &&
            obj.componentId === dynamicTextComponentID
        );
        instancesOfDynamicText.forEach((instance) => {
          const groups = instance.children.filter(
            (child) => child.type === "GROUP"
          );
          const id = groups[0].name;

          const texts = groups[0].children.filter(
            (child) => child.type === "TEXT"
          );
          const text = texts[0].characters;
          translations[id] = text.replace(/\n/gi, "");
        });
      }
    });
    markUp(JSON.stringify(translations, null, 2) + "\n```", "```\n");
  }
  console.log(md);
  fs.writeFileSync("result.md", md);

  const end = Date.now();
  const time = ((end - start) / 1000).toFixed(2);
  console.log("Completed in:", time + "s");
});

function underline(text, prefix = "") {
  return "=".repeat(`${prefix ? prefix : ""}${text}`.length);
}

function markUp(text, prefix = "") {
  md += `${prefix ? prefix : ""}${text}\n`;
}

function getIdOfDynamicTextComponent(json) {
  const components = json.components;
  const keys = Object.keys(components);
  const ids = keys.filter((key) => {
    const value = components[key];
    return value.name === DYNAMIC_TEXT_COMPONENT_NAME;
  });
  return ids[0];
}
