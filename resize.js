import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dirs = [
    'public/textures/table',
    'public/textures/mate'
];

async function resizeImages() {
    for (const dir of dirs) {
        const fullDir = path.resolve(dir);
        if (!fs.existsSync(fullDir)) continue;
        
        const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
        
        for (const file of files) {
            const filePath = path.join(fullDir, file);
            const tempPath = filePath + '.tmp.jpg';
            
            console.log('Resizing', filePath);
            await sharp(filePath)
                .resize(2048, 2048, { fit: 'inside' })
                .toFile(tempPath);
                
            fs.renameSync(tempPath, filePath);
            console.log('Done', filePath);
        }
    }
}

resizeImages().then(() => console.log('All textures resized successfully!')).catch(console.error);
