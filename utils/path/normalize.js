import path from 'path';

export default function normalize(apiSrcDir, apiFile) {

    var relativePath = path.relative(apiSrcDir, apiFile);

    // Prepend slash and normalize path:
    return '/' + path.normalize(relativePath)

        // Replace backslash to forward slash
        .replace(/\\/g, '/')
    
        // Remove extension:
        .replace(/\..*$/, '');
}