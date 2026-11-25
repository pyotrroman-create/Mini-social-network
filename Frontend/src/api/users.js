import api from './axios'

export const getMe = async () => {
    const { data } = await api.get('/users/me')
    return data.user
}

export const getUser = async (userId) => {
    const { data } = await api.get(`/users/${userId}`)
    return data.user
}

export const getFollowers = async (userId) => {
    const { data } = await api.get(`/users/${userId}/followers`)
    return data.followers
}

export const getFollowing = async (userId) => {
    const { data } = await api.get(`/users/${userId}/following`)
    return data.following
}

export const followUser = (userId) => {
    return api.post(`/users/${userId}/follow`)
}

export const unfollowUser = (userId) => {
    return api.delete(`/users/${userId}/follow`)
}

export const searchUsers = async (query) => {
    const { data } = await api.get('/users/search', {
        params: { q: query },
    })

    return data.users
}

export const updateMyProfile = async (profile) => {
    const { data } = await api.patch('/users/me', profile)
    return data.user
}

export const updateMyAvatar = async (file) => {
    const formData = new FormData()
    formData.append('profileImage', file)

    const { data } = await api.patch('/users/me/avatar', formData)
    return data.profileImage
}