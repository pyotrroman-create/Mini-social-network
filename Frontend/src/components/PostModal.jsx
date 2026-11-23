import { useCallback, useEffect, useRef, useState } from 'react'
import {
    useLocation,
    useNavigate,
    useParams,
} from 'react-router-dom'
import {
    addPostComment,
    getPost,
    getPostLikes,
    getPostComments,
    likePost,
    unlikePost,
} from '../api/posts'
import { getUser } from '../api/users'
import { useFeed } from '../context/useFeed'
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react'
import styles from './PostModal.module.css'
import avatarRing from '../assets/avatar-ring.svg'
import commentIcon from '../assets/icons/comment.svg'
import heartIcon from '../assets/icons/heart.svg'
import heartFilledIcon from '../assets/icons/heart-filled.svg'
import smileIcon from '../assets/icons/smile.svg'

function formatTime(date) {
    if (!date) return ''

    const timestamp = new Date(date).getTime()
    if (Number.isNaN(timestamp)) return ''

    const seconds = Math.max(
        0,
        Math.floor((Date.now() - timestamp) / 1000)
    )

    if (seconds < 60) return 'now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min.`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} h.`
    if (seconds < 604800) {
        const days = Math.floor(seconds / 86400)
        return `${days} ${days === 1 ? 'day.' : 'days.'}`
    }

    const weeks = Math.floor(seconds / 604800)
    return `${weeks} ${weeks === 1 ? 'week.' : 'weeks.'}`
}

function PostModal() {
    const { postId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()

    const {
        me,
        loading: feedLoading,
        isFollowing,
        toggleFollow,
        isLiked,
        updateLike,
    } = useFeed()

    const [post, setPost] = useState(null)
    const [author, setAuthor] = useState(null)
    const [likesCount, setLikesCount] = useState(0)
    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [commentText, setCommentText] = useState('')
    const [sending, setSending] = useState(false)
    const [commentError, setCommentError] = useState('')
    const [showPicker, setShowPicker] = useState(false)
    const [liking, setLiking] = useState(false)
    const [following, setFollowing] = useState(false)
    const inputRef = useRef(null)
    const pickerRef = useRef(null)
    const cursorRef = useRef(0)
    const liked = isLiked(postId)


    useEffect(() => {
        const previousOverflow = document.body.style.overflow

        document.body.style.overflow = 'hidden'

        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [])


    useEffect(() => {
        let active = true

        async function loadPost() {
            setLoading(true)
            setError('')
            setPost(null)
            setAuthor(null)
            setComments([])
            setShowPicker(false)
            setCommentText('')

            try {
                const publication = await getPost(postId)

                const authorId =
                    typeof publication.author === 'object'
                        ? publication.author._id
                        : publication.author

                const [user, likes, postComments] =
                    await Promise.all([
                        getUser(authorId),
                        getPostLikes(postId),
                        getPostComments(postId),
                    ])

                if (!active) return

                setPost(publication)
                setAuthor(user)
                setLikesCount(likes)
                setComments(postComments)
            } catch (err) {
                console.error('Post loading error:', err)

                if (active) {
                    setError('Failed to load publication')
                }
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        }

        loadPost()

        return () => {
            active = false
        }
    }, [postId])


    const closeModal = useCallback(() => {
        if (location.state?.backgroundLocation) {
            navigate(-1)
            return
        }

        navigate(
            author?._id
                ? `/users/${author._id}`
                : '/',
            { replace: true }
        )
    }, [location.state, navigate, author])

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                if (showPicker) {
                    setShowPicker(false)
                } else {
                    closeModal()
                }
            }
        }

        document.addEventListener('keydown', handleEscape)

        return () => {
            document.removeEventListener('keydown', handleEscape)
        }
    }, [showPicker, closeModal])


    useEffect(() => {
        if (!showPicker) return

        const handleOutsideClick = (event) => {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(event.target)
            ) {
                setShowPicker(false)
            }
        }

        document.addEventListener('mousedown', handleOutsideClick)

        return () => {
            document.removeEventListener(
                'mousedown',
                handleOutsideClick
            )
        }
    }, [showPicker])


    const handleFollow = async () => {
        if (!author || following || feedLoading) return

        setFollowing(true)

        try {
            await toggleFollow(author._id)
        } catch (err) {
            console.error('Follow error:', err)
        } finally {
            setFollowing(false)
        }
    }

    const handleLike = async () => {
        if (liking || feedLoading) return

        setLiking(true)

        try {
            if (liked) {
                await unlikePost(postId)
                updateLike(postId, false)
                setLikesCount((count) => Math.max(0, count - 1))
            } else {
                await likePost(postId)
                updateLike(postId, true)
                setLikesCount((count) => count + 1)
            }
        } catch (err) {
            console.error('Like error:', err)
        } finally {
            setLiking(false)
        }
    }

    const handleEmojiClick = (emojiData) => {
        const emoji = emojiData.emoji
        const position = Math.min(
            cursorRef.current,
            commentText.length
        )

        const nextText =
            commentText.slice(0, position) +
            emoji +
            commentText.slice(position)

        const nextPosition = position + emoji.length

        setCommentText(nextText)
        cursorRef.current = nextPosition

        requestAnimationFrame(() => {
            inputRef.current?.focus()
            inputRef.current?.setSelectionRange(
                nextPosition,
                nextPosition
            )
        })
    }

    const handleSendComment = async (event) => {
        event.preventDefault()

        const text = commentText.trim()

        if (!text || sending) return

        setSending(true)
        setCommentError('')

        try {
            await addPostComment(postId, text)

            const updatedComments = await getPostComments(postId)

            setComments(updatedComments)
            setCommentText('')
            cursorRef.current = 0
            setShowPicker(false)
        } catch (err) {
            console.error('Comment error:', err)
            setCommentError('Failed to send comment')
        } finally {
            setSending(false)
        }
    }

    const focusComment = () => {
        const input = inputRef.current

        if (!input) return

        input.focus()

        const position = input.value.length

        input.setSelectionRange(position, position)
        cursorRef.current = position
    }

    const isOwnPost =
        me && author &&
        String(me._id) === String(author._id)

    const description = post?.caption ?? ''

    return (
        <div
            className={styles.overlay}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    closeModal()
                }
            }}
        >

            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-label="Publication"
            >
                {loading && (
                    <p className={styles.status}>
                        Loading publication...
                    </p>
                )}

                {error && (
                    <p className={styles.status}>
                        {error}
                    </p>
                )}

                {!loading && !error && post && author && (
                    <>
                        <div className={styles.imageSection}>
                            <img
                                src={post.image}
                                alt={`Post by ${author.username}`}
                            />
                        </div>

                        <div className={styles.details}>
                            <header className={styles.header}>
                                <button
                                    type="button"
                                    className={styles.author}
                                    onClick={() =>
                                        navigate(`/users/${author._id}`)
                                    }
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
                                </button>

                                <div className={styles.authorInfo}>
                                    <button
                                        type="button"
                                        className={styles.authorName}
                                        onClick={() =>
                                            navigate(`/users/${author._id}`)
                                        }
                                    >
                                        {author.username}
                                    </button>

                                    {!isOwnPost && (
                                        <>
                                            <span className={styles.dot}>·</span>

                                            <button
                                                type="button"
                                                className={styles.followButton}
                                                onClick={handleFollow}
                                                disabled={
                                                    following || feedLoading
                                                }
                                            >
                                                {isFollowing(author._id)
                                                    ? 'Unfollow'
                                                    : 'Follow'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </header>

                            <div className={styles.comments}>
                                {description && (
                                    <div className={styles.descriptionItem}>
                                        <img
                                            className={styles.commentAvatar}
                                            src={
                                                author.profileImage ||
                                                '/default-avatar.png'
                                            }
                                            alt=""
                                        />

                                        <div className={styles.commentBody}>
                                            <p className={styles.commentText}>
                                                <strong>
                                                    {author.username}
                                                </strong>{' '}
                                                {description}
                                            </p>

                                            <span className={styles.time}>
                                                {formatTime(post.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {comments.map((comment) => {
                                    const commentUser =
                                        typeof comment.user === 'object'
                                            ? comment.user
                                            : null

                                    return (
                                        <div
                                            key={comment._id}
                                            className={styles.comment}
                                        >
                                            <img
                                                className={styles.commentAvatar}
                                                src={
                                                    commentUser?.profileImage ||
                                                    '/default-avatar.png'
                                                }
                                                alt=""
                                            />

                                            <div className={styles.commentBody}>
                                                <p className={styles.commentText}>
                                                    <strong>
                                                        {commentUser?.username ||
                                                            'User'}
                                                    </strong>{' '}
                                                    {comment.text}
                                                </p>

                                                <span className={styles.time}>
                                                    {formatTime(
                                                        comment.createdAt
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className={styles.actions}>
                                <div className={styles.actionButtons}>
                                    <button
                                        type="button"
                                        className={[
                                            styles.iconButton,
                                            liked ? styles.liked : '',
                                        ].join(' ')}
                                        onClick={handleLike}
                                        disabled={liking || feedLoading}
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
                                        className={styles.iconButton}
                                        onClick={focusComment}
                                        aria-label="Comments"
                                    >
                                        <img
                                            src={commentIcon}
                                            alt=""
                                            className={styles.actionIcon}
                                        />
                                    </button>
                                </div>

                                <strong className={styles.likesCount}>
                                    {likesCount} likes
                                </strong>

                                <span className={styles.postTime}>
                                    {formatTime(post.createdAt).replace(/\./g, '')}
                                </span>
                            </div>

                            <form
                                className={styles.commentForm}
                                onSubmit={handleSendComment}
                            >
                                <div
                                    className={styles.emojiWrapper}
                                    ref={pickerRef}
                                >
                                    <button
                                        type="button"
                                        className={styles.emojiButton}
                                        onClick={() =>
                                            setShowPicker((value) => !value)
                                        }
                                        aria-label="Choose emoji"
                                    >
                                        <img
                                            src={smileIcon}
                                            alt=""
                                            className={styles.emojiIcon}
                                        />

                                    </button>

                                    {showPicker && (
                                        <div className={styles.emojiPicker}>

                                            <EmojiPicker
                                                onEmojiClick={handleEmojiClick}
                                                emojiStyle={EmojiStyle.APPLE}
                                                width={320}
                                                height={380}
                                                searchPlaceHolder="Search emoji"
                                            />

                                        </div>
                                    )}
                                </div>

                                <input
                                    ref={inputRef}
                                    className={styles.commentInput}
                                    type="text"
                                    value={commentText}
                                    placeholder="Add comment"
                                    onChange={(event) => {
                                        setCommentText(event.target.value)
                                        cursorRef.current =
                                            event.target.selectionStart ??
                                            event.target.value.length
                                    }}
                                    onClick={(event) => {
                                        cursorRef.current =
                                            event.target.selectionStart ?? 0
                                    }}
                                    onKeyUp={(event) => {
                                        cursorRef.current =
                                            event.target.selectionStart ?? 0
                                    }}
                                />

                                <button
                                    type="submit"
                                    className={styles.sendButton}
                                    disabled={
                                        !commentText.trim() || sending
                                    }
                                >
                                    Send
                                </button>
                            </form>

                            {commentError && (
                                <p className={styles.commentError}>
                                    {commentError}
                                </p>
                            )}
                        </div>
                    </>
                )
                }
            </div >
        </div >
    )
}

export default PostModal
