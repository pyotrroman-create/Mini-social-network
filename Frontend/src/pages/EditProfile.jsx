import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import { getMe, updateMyProfile, updateMyAvatar } from '../api/users'
import { useFeed } from '../context/useFeed'
import styles from './EditProfile.module.css'

function EditProfile() {
    const navigate = useNavigate()
    const fileInputRef = useRef(null)
    const { updateMe } = useFeed()
    const [profile, setProfile] = useState(null)
    const [username, setUsername] = useState('')
    const [website, setWebsite] = useState('')
    const [bio, setBio] = useState('')
    const [avatarFile, setAvatarFile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        let active = true

        const loadProfile = async () => {
            try {
                const user = await getMe()

                if (!active) return

                setProfile(user)
                setUsername(user.username || '')
                setWebsite(user.website || '')
                setBio(user.bio || '')
            } catch (err) {
                console.error('Failed to load profile:', err)

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
    }, [])

    const handleSave = async (event) => {
        event.preventDefault()

        if (saving) return

        setSaving(true)
        setError('')

        try {
            await updateMyProfile({
                username: username.trim(),
                website: website.trim(),
                bio: bio.trim(),
            })

            if (avatarFile) {
                await updateMyAvatar(avatarFile)
            }

            const updatedUser = await getMe()
            updateMe(updatedUser)

            navigate(`/users/${updatedUser._id}`)
        } catch (err) {
            console.error('Failed to save profile:', err)

            const message =
                err.response?.data?.message ||
                'Failed to save profile'

            setError(message)

            // Синхронизируем контекст даже при частичном сохранении.
            try {
                const currentUser = await getMe()
                updateMe(currentUser)
            } catch (refreshError) {
                console.error('Failed to refresh profile:', refreshError)
            }
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className={styles.layout}>
            <Sidebar />

            <main className={styles.main}>
                <div className={styles.content}>
                    <h1 className={styles.title}>Edit profile</h1>

                    {loading && <p>Loading profile...</p>}

                    {!loading && !profile && (
                        <p role="alert">{error}</p>
                    )}

                    {!loading && profile && (
                        <form
                            className={styles.form}
                            onSubmit={handleSave}
                        >
                            <div className={styles.profileCard}>
                                <img
                                    className={styles.avatar}
                                    src={
                                        profile.profileImage ||
                                        '/default-avatar.png'
                                    }
                                    alt={`${profile.username} avatar`}
                                />

                                <div className={styles.profileDetails}>
                                    <strong>{profile.username}</strong>
                                    <p>{profile.bio}</p>
                                </div>

                                <input
                                    ref={fileInputRef}
                                    className={styles.fileInput}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(event) => {
                                        setAvatarFile(
                                            event.target.files?.[0] || null
                                        )
                                    }}
                                />

                                <button
                                    type="button"
                                    className={styles.photoButton}
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={saving}
                                >
                                    New photo
                                </button>
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="edit-username">
                                    Username
                                </label>

                                <input
                                    id="edit-username"
                                    type="text"
                                    value={username}
                                    onChange={(event) =>
                                        setUsername(event.target.value)
                                    }
                                    maxLength={30}
                                    required
                                    autoComplete="username"
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="edit-website">
                                    Website
                                </label>

                                <input
                                    id="edit-website"
                                    type="url"
                                    value={website}
                                    onChange={(event) =>
                                        setWebsite(event.target.value)
                                    }
                                    maxLength={2048}
                                    placeholder="https://example.com"
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="edit-bio">
                                    About
                                </label>

                                <div className={styles.textareaWrapper}>
                                    <textarea
                                        id="edit-bio"
                                        value={bio}
                                        onChange={(event) =>
                                            setBio(event.target.value)
                                        }
                                        maxLength={150}
                                        rows={3}
                                    />

                                    <span className={styles.counter}>
                                        {bio.length} / 150
                                    </span>
                                </div>
                            </div>

                            {error && (
                                <p className={styles.error} role="alert">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                className={styles.saveButton}
                                disabled={saving || !username.trim()}
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </form>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}

export default EditProfile
