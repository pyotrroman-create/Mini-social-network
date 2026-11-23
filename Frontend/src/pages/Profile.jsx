import { useEffect, useState } from 'react'
import {
    useParams,
    useNavigate,
    useLocation,
} from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import { getUser, getFollowers, getFollowing } from '../api/users'
import { getUserPosts } from '../api/posts'
import { useFeed } from '../context/useFeed'
import styles from './Profile.module.css'

function Profile() {
    const { userId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()

    const {
        me,
        loading: feedLoading,
        isFollowing,
        toggleFollow,
    } = useFeed()

    const [user, setUser] = useState(null)
    const [posts, setPosts] = useState([])
    const [followersCount, setFollowersCount] = useState(0)
    const [followingCount, setFollowingCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [followLoading, setFollowLoading] = useState(false)

    useEffect(() => {
        let active = true

        const loadProfile = async () => {
            setLoading(true)
            setError('')
            setUser(null)
            setPosts([])

            try {
                const [
                    profile,
                    publications,
                    followers,
                    following,
                ] = await Promise.all([
                    getUser(userId),
                    getUserPosts(userId),
                    getFollowers(userId),
                    getFollowing(userId),
                ])

                if (!active) return

                setUser(profile)
                setPosts(publications)
                setFollowersCount(followers.length)
                setFollowingCount(following.length)
            } catch (err) {
                console.error('Profile loading error:', err)

                if (active) {
                    setError('Failed to load profile')
                }
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        }

        loadProfile()

        return () => {
            active = false
        }
    }, [userId])

    const handleFollow = async () => {
        if (followLoading || feedLoading) return

        setFollowLoading(true)

        try {
            await toggleFollow(userId)

            const followers = await getFollowers(userId)
            setFollowersCount(followers.length)
        } catch (err) {
            console.error('Follow error:', err)
        } finally {
            setFollowLoading(false)
        }
    }

    const openPost = (postId) => {
        navigate(`/posts/${postId}`, {
            state: {
                backgroundLocation: location,
                authorId: userId,
            },
        })
    }

    const isOwnProfile =
        String(me?._id) === String(userId)

    return (
        <div className={styles.layout}>
            <Sidebar />

            <main className={styles.main}>
                {loading && (
                    <p className={styles.status}>
                        Loading profile...
                    </p>
                )}

                {error && (
                    <p className={styles.status}>
                        {error}
                    </p>
                )}

                {!loading && !error && user && (
                    <>
                        <header className={styles.profileHeader}>

                            <div className={styles.avatarContainer}>
                                <img
                                    className={styles.avatar}
                                    src={user.profileImage || '/default-avatar.png'}
                                    alt={`${user.username} avatar`}
                                />
                            </div>

                            <div className={styles.profileInfo}>
                                <div className={styles.topRow}>
                                    <h1 className={styles.username}>
                                        {user.username}
                                    </h1>

                                    {!isOwnProfile && (
                                        <div className={styles.buttons}>
                                            <button
                                                type="button"
                                                className={styles.followButton}
                                                onClick={handleFollow}
                                                disabled={
                                                    followLoading ||
                                                    feedLoading
                                                }
                                            >
                                                {isFollowing(userId)
                                                    ? 'Unfollow'
                                                    : 'Follow'}
                                            </button>

                                            <button
                                                type="button"
                                                className={styles.messageButton}
                                            >
                                                Message
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.stats}>
                                    <span>
                                        <strong>{posts.length}</strong>
                                        {' '}posts
                                    </span>

                                    <span>
                                        <strong>{followersCount}</strong>
                                        {' '}followers
                                    </span>

                                    <span>
                                        <strong>{followingCount}</strong>
                                        {' '}following
                                    </span>
                                </div>

                                <div className={styles.description}>
                                    {user.bio && (
                                        <p className={styles.bio}>{user.bio}</p>
                                    )}
                                </div>
                            </div>
                        </header>

                        <div className={styles.divider} />

                        <div className={styles.postsGrid}>
                            {posts.map((post) => (
                                <button
                                    key={post._id}
                                    type="button"
                                    className={styles.postButton}
                                    onClick={() => openPost(post._id)}
                                >
                                    <img
                                        src={post.image}
                                        alt={`Post by ${user.username}`}
                                    />
                                </button>
                            ))}
                        </div>

                        {posts.length === 0 && (
                            <p className={styles.empty}>
                                No posts yet
                            </p>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    )
}

export default Profile
