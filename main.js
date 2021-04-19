const request = require("request");
const secret = require("./secret");
const Color = require("./colors");
const Gradient = require("./gradients");
const fs = require("fs");
// https://www.figma.com/file/u0ptswZNoDi9TXnAaJJM1g/Evida-Afkoblingsflow_UX_01?node-id=0%3A1
const start = Date.now();
var options = {
  method: "GET",
  url: "https://api.figma.com/v1/files/u0ptswZNoDi9TXnAaJJM1g",
  headers: { "X-Figma-Token": secret["X-Figma-Token"] },
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  const data = JSON.parse(body).document.children[0].children;
  console.log(data);
  const desktopFonts = data
    .filter((child) => child.name === "Desktop Fonts")[0]
    ?.children?.filter((child) => child.type === "TEXT");

  const mobileFonts = data
    .filter((child) => child.name === "Mobile Fonts")[0]
    ?.children.filter((child) => child.type === "TEXT");

  const colors = data
    .filter((child) => child.name === "Colors")[0]
    ?.children.filter((child) => child.type !== "TEXT");

  const gradients = data
    .filter((child) => child.name === "Gradients")[0]
    ?.children.filter((child) => child.type !== "TEXT");

  const colorObjects = colors?.map((color) => new Color(color));

  const gradientObjects = gradients?.map((gradient) => new Gradient(gradient));

  colorObjects?.forEach((color) => {
    console.log(color.cssVariables);
  });

  console.log("\n");
  gradientObjects?.forEach((gradient) => {
    gradient.colorObjects?.forEach((colorObject) =>
      console.log(colorObject.cssVariables)
    );
    console.log();
  });

  console.log("\n");

  gradientObjects?.forEach((gradient) => {
    console.log(gradient.cssVariables, "\n");
  });
  const end = Date.now();
  const time = ((end - start) / 1000).toFixed(2);
  console.log("Completed in:", time + "s");
});
