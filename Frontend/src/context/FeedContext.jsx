import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getMyLikedPosts } from '../api/posts'
import {
    getMe,
    getFollowing,
    followUser,
    unfollowUser,
} from '../api/users'
import { FeedContext } from './feedContextStore'

export function FeedProvider({ children }) {
    const token = useSelector((state) => state.auth.token)

    const [data, setData] = useState({
        token: null,
        me: null,
        likedPostIds: [],
        followingIds: [],
        loading: true,
        error: '',
    })

    useEffect(() => {
        if (!token) return

        let active = true

        async function loadUserData() {
            try {
                const currentUser = await getMe()

                const [likes, following] = await Promise.all([
                    getMyLikedPosts(),
                    getFollowing(currentUser._id),
                ])

                if (!active) return

                setData({
                    token,
                    me: currentUser,
                    likedPostIds: likes.map(String),
                    followingIds: following.map((item) =>
                        String(item.following._id)
                    ),
                    loading: false,
                    error: '',
                })
            } catch (err) {
                console.error('Feed initialization error:', err)

                if (active) {
                    setData({
                        token,
                        me: null,
                        likedPostIds: [],
                        followingIds: [],
                        loading: false,
                        error: 'Failed to load user data',
                    })
                }
            }
        }

        loadUserData()

        return () => {
            active = false
        }
    }, [token])

    const authenticated = Boolean(token)
    const dataIsCurrent = data.token === token

    const me = authenticated && dataIsCurrent
        ? data.me
        : null

    const likedPostIds = authenticated && dataIsCurrent
        ? data.likedPostIds
        : []

    const followingIds = authenticated && dataIsCurrent
        ? data.followingIds
        : []

    const loading = authenticated
        ? !dataIsCurrent || data.loading
        : false

    const error = authenticated && dataIsCurrent
        ? data.error
        : ''

    const isLiked = (postId) => {
        return likedPostIds.includes(String(postId))
    }

    const isFollowing = (userId) => {
        return followingIds.includes(String(userId))
    }

    const updateLike = (postId, liked) => {
        const id = String(postId)

        setData((current) => {
            if (current.token !== token) return current

            const nextIds = liked
                ? [...new Set([...current.likedPostIds, id])]
                : current.likedPostIds.filter(
                    (item) => item !== id
                )

            return {
                ...current,
                likedPostIds: nextIds,
            }
        })
    }

    const toggleFollow = async (userId) => {
        if (loading) return

        const id = String(userId)
        const currentlyFollowing = isFollowing(id)

        if (currentlyFollowing) {
            await unfollowUser(id)
        } else {
            await followUser(id)
        }

        setData((current) => {
            if (current.token !== token) return current

            const nextIds = currentlyFollowing
                ? current.followingIds.filter(
                    (item) => item !== id
                )
                : [...new Set([...current.followingIds, id])]

            return {
                ...current,
                followingIds: nextIds,
            }
        })
    }
    return (
        <FeedContext.Provider
            value={{
                me,
                loading,
                error,
                isLiked,
                isFollowing,
                updateLike,
                toggleFollow,
            }}
        >
            {children}
        </FeedContext.Provider>
    )
}