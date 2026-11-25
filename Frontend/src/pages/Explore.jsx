import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import { getExplorePosts } from '../api/posts'
import styles from './Explore.module.css'

function Explore() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        let active = true

        const loadPosts = async () => {
            try {
                const publications = await getExplorePosts()

                if (active) {
                    setPosts(publications)
                }
            } catch (err) {
                console.error('Failed to load explore posts:', err)

                if (active) {
                    setError('Failed to load posts')
                }
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        }

        loadPosts()

        return () => {
            active = false
        }
    }, [])

    const openPost = (postId) => {
        navigate(`/posts/${postId}`, {
            state: {
                backgroundLocation: location,
            },
        })
    }

    return (
        <div className={styles.layout}>
            <Sidebar />

            <main className={styles.main}>
                {loading && (
                    <p className={styles.status}>
                        Loading posts...
                    </p>
                )}

                {error && (
                    <p className={styles.status} role="alert">
                        {error}
                    </p>
                )}

                {!loading && !error && (
                    <div className={styles.postsGrid}>
                        {posts.map((post) => (
                            <button
                                key={post._id}
                                type="button"
                                className={styles.postButton}
                                onClick={() => openPost(post._id)}
                                aria-label={`Open post by ${post.author?.username || 'user'}`}
                            >
                                <img
                                    className={styles.postImage}
                                    src={post.image}
                                    alt={`Post by ${post.author?.username || 'user'}`}
                                />
                            </button>
                        ))}
                    </div>
                )}
            </main>

            {!loading && !error && <Footer />}
        </div>
    )
}

export default Explore
