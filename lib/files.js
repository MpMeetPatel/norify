const fs = require('fs');
const path = require('path');

module.exports = {
    getCurrentDirectoryBase: () => {
        return path.basename(process.cwd());
    },
    directoryExist: (filePath) => {
        return fs.existsSync(filePath);
    }
};
