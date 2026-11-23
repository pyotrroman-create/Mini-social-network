import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import PostCard from '../components/PostCard'
import Footer from '../components/Footer'
import api from '../api/axios'
import styles from './Home.module.css'
import updatesComplete from '../assets/updates-complete.svg'

function Home() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let active = true

        const loadPosts = async () => {
            try {
                const { data } = await api.get('/posts/explore')

                if (active) {
                    setPosts(data.posts)
                }
            } catch (err) {
                console.error('Failed to load posts:', err)

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

    return (
        <div className={styles.layout}>
            <Sidebar />

            <main className={styles.main}>
                {loading && (
                    <p className={styles.status}>Loading posts...</p>
                )}

                {error && (
                    <p className={styles.status}>{error}</p>
                )}

                {!loading && !error && (
                    <>
                        <div className={styles.grid}>
                            {posts.map((post) => (
                                <PostCard
                                    key={post._id}
                                    post={post}
                                />
                            ))}
                        </div>

                        <div className={styles.endMessage}>
                            <img
                                src={updatesComplete}
                                alt=""
                                className={styles.updatesImage}
                            />

                            <h2 className={styles.updatesTitle}>
                                You've seen all the updates
                            </h2>

                            <p className={styles.updatesDescription}>
                                You have viewed all new publications
                            </p>
                        </div>
                    </>
                )}
            </main>

            {!loading && !error && <Footer />}
        </div>
    )
}

export default Home