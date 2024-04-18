function _ls(key, def = null){
    return localStorage.getItem(key) || def;
}
