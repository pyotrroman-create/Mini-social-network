import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    getPostLikes,
    likePost,
    unlikePost,
} from '../api/posts'
import { useFeed } from '../context/useFeed'
import styles from './PostCard.module.css'
import commentIcon from '../assets/icons/comment.svg'
import heartIcon from '../assets/icons/heart.svg'
import heartFilledIcon from '../assets/icons/heart-filled.svg'
import avatarRing from '../assets/avatar-ring.svg'


function PostCard({ post }) {
    const navigate = useNavigate()

    const {
        me,
        loading,
        isLiked,
        isFollowing,
        updateLike,
        toggleFollow,
    } = useFeed()

    const author = post.author

    const liked = isLiked(post._id)
    const following = isFollowing(author._id)
    const isOwnPost = String(me?._id) === String(author._id)

    const [likesCount, setLikesCount] = useState(0)
    const [likeLoading, setLikeLoading] = useState(false)
    const [followLoading, setFollowLoading] = useState(false)

    useEffect(() => {
        let active = true

        getPostLikes(post._id)
            .then((count) => {
                if (active) {
                    setLikesCount(count)
                }
            })
            .catch((error) => {
                console.error('Failed to load likes:', error)
            })

        return () => {
            active = false
        }
    }, [post._id])

    const openProfile = (event) => {
        event.stopPropagation()
        navigate(`/users/${author._id}`)
    }

    const openPost = () => {
        navigate(`/posts/${post._id}`, {
            state: {
                backgroundLocation: {
                    pathname: `/users/${author._id}`,
                    search: '',
                    hash: '',
                    state: null,
                    key: 'profile-background',
                },
            },
        })
    }

    const handleLike = async (event) => {
        event.stopPropagation()

        if (likeLoading || loading) return

        setLikeLoading(true)

        try {
            if (liked) {
                await unlikePost(post._id)
                updateLike(post._id, false)
                setLikesCount((count) => Math.max(0, count - 1))
            } else {
                await likePost(post._id)
                updateLike(post._id, true)
                setLikesCount((count) => count + 1)
            }
        } catch (error) {
            console.error('Like error:', error)
        } finally {
            setLikeLoading(false)
        }
    }

    const handleFollow = async (event) => {
        event.stopPropagation()

        if (followLoading || loading || isOwnPost) return

        setFollowLoading(true)

        try {
            await toggleFollow(author._id)
        } catch (error) {
            console.error('Follow error:', error)
        } finally {
            setFollowLoading(false)
        }
    }

    return (
        <article className={styles.card}>
            <div className={styles.header}>
                <button
                    type="button"
                    className={styles.author}
                    onClick={openProfile}
                >
                    <span className={styles.avatarContainer}>
                        <img
                            className={styles.avatar}
                            src={author.profileImage || '/default-avatar.png'}
                            alt=""
                        />
                        <img
                            className={styles.avatarRing}
                            src={avatarRing}
                            alt=""
                            aria-hidden="true"
                        />
                    </span>
                    <span className={styles.username}>
                        {author.username}
                    </span>
                </button>

                {!isOwnPost && (
                    <button
                        type="button"
                        className={styles.follow}
                        onClick={handleFollow}
                        disabled={followLoading || loading}
                    >
                        {following ? 'unfollow' : 'follow'}
                    </button>
                )}
            </div>
            <button
                type="button"
                className={styles.imageButton}
                onClick={openPost}
            >
                <img
                    className={styles.image}
                    src={post.image}
                    alt={`Post by ${author.username}`}
                />
            </button>

            <div className={styles.details}>
                <div className={styles.actions}>
                    <button
                        type="button"
                        className={[
                            styles.action,
                            liked ? styles.liked : '',
                        ].join(' ')}
                        onClick={handleLike}
                        disabled={likeLoading || loading}
                        aria-label={liked ? 'Unlike' : 'Like'}
                        aria-pressed={liked}
                    >
                        <img
                            src={liked ? heartFilledIcon : heartIcon}
                            alt=""
                            className={styles.actionIcon}
                        />
                    </button>
                    <button
                        type="button"
                        className={styles.action}
                        onClick={openPost}
                        aria-label="Comments"
                    >
                        <img src={commentIcon} alt="" className={styles.actionIcon} />
                    </button>
                </div>

                <button
                    type="button"
                    className={styles.likes}
                    onClick={openPost}
                >
                    {likesCount} likes
                </button>
            </div>

            <div className={styles.bottomSpace} aria-hidden="true" />
            <div className={styles.divider} aria-hidden="true" />
        </article>
    )
}

export default PostCard