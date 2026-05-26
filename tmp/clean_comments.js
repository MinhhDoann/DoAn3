import fs from 'fs';
import path from 'path';

const dir = 'c:/Users/Lenovo/OneDrive/Desktop/doan3/FE/src/pages';
const files = fs.readdirSync(dir);

files.forEach(file => {
    if (file.endsWith('.tsx')) {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Remove // comments but ignore http:// or https://
        // Regex: (space or start of line)// ...
        // We look for // that is not preceded by :
        const newContent = content.replace(/(?<!:)\/\/.*$/gm, '');
        
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent);
            console.log(`Cleaned ${file}`);
        }
    }
});
