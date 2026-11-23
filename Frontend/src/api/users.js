
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
