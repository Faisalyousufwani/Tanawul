import fs from "fs";
import path from "path";

const getResLinks = (link) => {
  // 1. Create a folder (if it doesn't exist)
  const folderName = "resLinks";
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
    console.log(`Folder ${folderName} created`);
  } else {
    console.log(`Folder ${folderName} already exists.`);
  }
  // 2. Define file path
  const filePath = path.join(folderName, "links.txt");
  // 3. Create the file if it doesn't exist
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "", "utf8");
    console.log(`File 'example.txt' created inside ${folderName}`);
  }
  // 4. Append text to the file
  const textToAppend = "link\n";
  fs.appendFileSync(filePath, textToAppend, "utf8");
  console.log("Text appended to the file.");
};
export default getResLinks