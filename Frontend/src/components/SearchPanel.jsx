import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { searchUsers } from '../api/users'
import styles from './SearchPanel.module.css'
import searchClearIcon from '../assets/icons/search-clear.svg'

function SearchPanel({ onClose }) {
    const [query, setQuery] = useState('')
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const search = query.trim()

        if (!search) return

        let active = true

        const timeoutId = setTimeout(async () => {
            setLoading(true)
            setError('')

            try {
                const results = await searchUsers(search)

                if (active) {
                    setUsers(results)
                }
            } catch (err) {
                console.error('Failed to search users:', err)

                if (active) {
                    setError('Failed to search users')
                    setUsers([])
                }
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        }, 300)

        return () => {
            active = false
            clearTimeout(timeoutId)
        }
    }, [query])

    const handleQueryChange = (event) => {
        setQuery(event.target.value)
        setUsers([])
        setError('')
        setLoading(false)
    }

    return createPortal(
        <>
            <div
                className={styles.overlay}
                onClick={onClose}
                aria-hidden="true"
            />

            <section
                className={styles.panel}
                aria-label="Search users"
            >
                <h2 className={styles.title}>Search</h2>

                <div className={styles.searchWrapper}>
                    <input
                        className={styles.searchInput}
                        type="search"
                        value={query}
                        onChange={handleQueryChange}
                        placeholder="Search"
                        aria-label="Search by username"
                    />

                        <button
                            type="button"
                            className={styles.clearButton}
                            onClick={() => {
                                setQuery('')
                                setUsers([])
                                setError('')
                                setLoading(false)
                            }}
                            aria-label="Clear search"
                        >
                            <img src={searchClearIcon} alt="" />
                        </button>

                </div>

                <div className={styles.results}>
                    {!query.trim() && (
                        <h3 className={styles.sectionTitle}>
                            Recent
                        </h3>
                    )}

                    {loading && (
                        <p className={styles.status}>Searching...</p>
                    )}

                    {error && (
                        <p className={styles.status} role="alert">
                            {error}
                        </p>
                    )}

                    {!loading &&
                        !error &&
                        query.trim() &&
                        users.length === 0 && (
                            <p className={styles.status}>
                                No users found
                            </p>
                        )}

                    {!loading &&
                        !error &&
                        users.map((user) => (
                            <Link
                                key={user._id}
                                to={`/users/${user._id}`}
                                className={styles.userLink}
                                onClick={onClose}
                            >
                                <img
                                    className={styles.avatar}
                                    src={
                                        user.profileImage ||
                                        '/default-avatar.png'
                                    }
                                    alt=""
                                />

                                <span className={styles.username}>
                                    {user.username}
                                </span>
                            </Link>
                        ))}
                </div>
            </section>
        </>,
        document.body
    )
}

export default SearchPanel
