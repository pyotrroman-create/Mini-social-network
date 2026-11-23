import api from './axios'

export const getExplorePosts = async () => {
    const { data } = await api.get('/posts/explore')
    return data.posts
}

export const getPost = async (postId) => {
    const { data } = await api.get(`/posts/${postId}`)
    return data.post
}

export const getUserPosts = async (userId) => {
    const { data } = await api.get(`/posts/user/${userId}`)
    return data.posts
}

export const getPostLikes = async (postId) => {
    const { data } = await api.get(`/posts/${postId}/likes`)
    return data.likesCount
}

export const getMyLikedPosts = async () => {
    const { data } = await api.get('/posts/me/likes')
    return data.postIds
}

export const likePost = (postId) => {
    return api.post(`/posts/${postId}/likes`)
}

export const unlikePost = (postId) => {
    return api.delete(`/posts/${postId}/likes`)
}

export const getPostComments = async (postId) => {
    const { data } = await api.get(`/posts/${postId}/comments`)
    return data.comments
}

export const addPostComment = async (postId, text) => {
    const { data } = await api.post(
        `/posts/${postId}/comments`,
        { text }
    )

    return data.comment
}
