
export default function basepath (path) {
    
    const parts = path.split('/');

    return parts.slice(0, parts.length - 1).join('/')
}