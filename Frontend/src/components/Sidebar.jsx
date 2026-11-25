import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useFeed } from '../context/useFeed'
import SearchPanel from './SearchPanel'
import styles from './Sidebar.module.css'
import homeIcon from '../assets/icons/home.svg'
import homeActiveIcon from '../assets/icons/home-active.svg'
import searchIcon from '../assets/icons/search.svg'
import searchActiveIcon from '../assets/icons/search-active.svg'
import exploreIcon from '../assets/icons/explore.svg'
import exploreActiveIcon from '../assets/icons/explore-active.svg'
import messagesIcon from '../assets/icons/messages.svg'
import notificationsIcon from '../assets/icons/notifications.svg'
import createIcon from '../assets/icons/create.svg'
import logo from '../assets/ichgram-logo.png'
import CreatePostModal from './CreatePostModal'

const navigation = [
    {
        path: '/',
        label: 'Home',
        icon: homeIcon,
        activeIcon: homeActiveIcon,
    },
    {
        path: '/search',
        label: 'Search',
        icon: searchIcon,
        activeIcon: searchActiveIcon,
    },
    {
        path: '/explore',
        label: 'Explore',
        icon: exploreIcon,
        activeIcon: exploreActiveIcon,
    },
    {
        path: '/messages',
        label: 'Messages',
        icon: messagesIcon,
        beta: true,
    },
    {
        path: '/notifications',
        label: 'Notifications',
        icon: notificationsIcon,
        beta: true,
    },
    {
        path: '/create',
        label: 'Create',
        icon: createIcon,
    },
]

function Sidebar() {
    const { me } = useFeed()
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [isCreateOpen, setIsCreateOpen] = useState(false)

    useEffect(() => {
        if (!isSearchOpen) return

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsSearchOpen(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isSearchOpen])

    const closeSearch = () => {
        setIsSearchOpen(false)
    }

    return (
        <aside className={styles.sidebar}>
            <img
                src={logo}
                alt="ICHGRAM"
                className={styles.logo}
            />

            <nav className={styles.navigation}>
                {navigation.map((item) => {
                    if (item.path === '/search') {
                        return (
                            <button
                                key={item.path}
                                type="button"
                                className={[
                                    styles.link,
                                    isSearchOpen ? styles.active : '',
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                                onClick={() =>
                                    setIsSearchOpen((prev) => !prev)
                                }
                                aria-expanded={isSearchOpen}
                                aria-controls="search-panel"
                            >
                                <img
                                    className={styles.icon}
                                    src={
                                        isSearchOpen
                                            ? searchActiveIcon
                                            : searchIcon
                                    }
                                    alt=""
                                />

                                <span className={styles.label}>
                                    Search
                                </span>
                            </button>
                        )
                    }

                    if (item.path === '/create') {
                        return (
                            <button
                                key={item.path}
                                type="button"
                                className={styles.link}
                                onClick={() => {
                                    closeSearch()
                                    setIsCreateOpen(true)
                                }}
                            >
                                <img
                                    className={styles.icon}
                                    src={item.icon}
                                    alt=""
                                />

                                <span className={styles.label}>
                                    Create
                                </span>
                            </button>
                        )
                    }

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            onClick={closeSearch}
                            className={({ isActive }) =>
                                [
                                    styles.link,
                                    isActive ? styles.active : '',
                                ]
                                    .filter(Boolean)
                                    .join(' ')
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <img
                                        className={styles.icon}
                                        src={
                                            isActive && item.activeIcon
                                                ? item.activeIcon
                                                : item.icon
                                        }
                                        alt=""
                                    />

                                    <span className={styles.label}>
                                        {item.label}
                                    </span>

                                    {item.beta && (
                                        <span className={styles.beta}>
                                            Beta
                                        </span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    )
                })}

                <NavLink
                    to={me?._id ? `/users/${me._id}` : '/'}
                    onClick={closeSearch}
                    className={({ isActive }) =>
                        [
                            styles.link,
                            styles.profileLink,
                            isActive ? styles.active : '',
                        ]
                            .filter(Boolean)
                            .join(' ')
                    }
                >
                    <img
                        className={styles.profileAvatar}
                        src={me?.profileImage || '/default-avatar.png'}
                        alt="My profile"
                    />

                    <span className={styles.label}>
                        Profile
                    </span>
                </NavLink>
            </nav>

            {isSearchOpen && (
                <div id="search-panel">
                    <SearchPanel onClose={closeSearch} />
                </div>
            )}
            <CreatePostModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />
        </aside>
    )
}

export default Sidebar

