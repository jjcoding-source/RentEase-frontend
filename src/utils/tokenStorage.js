const KEY = 'estates_token'

export const getToken    = ()        => localStorage.getItem(KEY)
export const saveToken   = (token)   => localStorage.setItem(KEY, token)
export const removeToken = ()        => localStorage.removeItem(KEY)