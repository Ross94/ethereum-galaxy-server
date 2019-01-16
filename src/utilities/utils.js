const fs = require('fs')

function checkResourceExists(resourcepath: string) {
    return fs.existsSync(resourcepath)
}

//create filepath folder if does not exist
function ensureDirExists(filepath: string) {
    const subdirsTokens = filepath.split('/')
    const subdirs = subdirsTokens.slice(1, subdirsTokens.length - 1)
    const directoriesFullPath = subdirs.map((_, i, a) =>
        a.slice(0, i + 1).join('/')
    )

    directoriesFullPath.forEach(directory => {
        if (!checkResourceExists(directory)) {
            fs.mkdirSync(directory)
        }
    })
}

function deleteFile(filepath: string) {
    if (checkResourceExists(filepath)) {
        fs.unlinkSync(filepath)
    }
}

function deleteFolder(path: string) {
    if (checkResourceExists(path)) {
        fs.readdirSync(path).forEach((file, index) => {
            var curPath = path + '/' + file
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolder(curPath)
            } else {
                fs.unlinkSync(curPath)
            }
        })
        fs.rmdirSync(path)
    }
}

/*compare two date in DD-MM-YYYY format int as result
 0     -> equals
 < 0   -> date1 later
 > 0   -> date2 later
*/
function dateComparator(date1, date2) {
    function process(date) {
        const parts = date.split('-')
        return new Date(parts[2], parts[1] - 1, parts[0])
    }
    return process(date2) - process(date1)
}

module.exports = {
    checkResourceExists,
    ensureDirExists,
    deleteFile,
    deleteFolder,
    dateComparator
}
