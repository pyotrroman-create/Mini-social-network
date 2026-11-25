import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react'
import { createPost } from '../api/posts'
import { useFeed } from '../context/useFeed'
import uploadCloudIcon from '../assets/icons/upload-cloud.svg'
import smileIcon from '../assets/icons/smile.svg'
import styles from './CreatePostModal.module.css'

const MAX_CAPTION_LENGTH = 2200
const MAX_IMAGE_SIZE = 2 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function CreatePostModal({ isOpen, onClose }) {
    const { me } = useFeed()
    const [image, setImage] = useState(null)
    const [preview, setPreview] = useState('')
    const [caption, setCaption] = useState('')
    const [showPicker, setShowPicker] = useState(false)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState('')
    const fileInputRef = useRef(null)
    const captionRef = useRef(null)
    const pickerRef = useRef(null)
    const cursorRef = useRef(0)
    const previewUrlRef = useRef('')

    const captionLength = caption.length
    const canShare = Boolean(image && caption.trim() && !sending)

    const resetForm = () => {
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current)
            previewUrlRef.current = ''
        }

        setImage(null)
        setPreview('')
        setCaption('')
        setShowPicker(false)
        setError('')
        cursorRef.current = 0

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleClose = () => {
        if (sending) return

        resetForm()
        onClose()
    }

    useEffect(() => {
        if (!isOpen) return

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (event) => {
            if (event.key !== 'Escape') return

            if (showPicker) {
                setShowPicker(false)
                return
            }

            if (sending) return

            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current)
                previewUrlRef.current = ''
            }

            setImage(null)
            setPreview('')
            setCaption('')
            setError('')
            cursorRef.current = 0

            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }

            onClose()
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, showPicker, sending, onClose])

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
            document.removeEventListener('mousedown', handleOutsideClick)
        }
    }, [showPicker])

    useEffect(() => {
        return () => {
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current)
            }
        }
    }, [])

    const handleImageChange = (event) => {
        const file = event.target.files?.[0]

        if (!file) return

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            setError('Only JPEG, PNG and WebP images are allowed')
            event.target.value = ''
            return
        }

        if (file.size > MAX_IMAGE_SIZE) {
            setError('Image must not exceed 2 MB')
            event.target.value = ''
            return
        }

        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current)
        }

        const objectUrl = URL.createObjectURL(file)

        previewUrlRef.current = objectUrl

        setImage(file)
        setPreview(objectUrl)
        setError('')
    }

    const handleCaptionChange = (event) => {
        const nextCaption = event.target.value

        if (nextCaption.length > MAX_CAPTION_LENGTH) return

        setCaption(nextCaption)
        cursorRef.current =
            event.target.selectionStart ?? nextCaption.length
    }

    const handleEmojiClick = (emojiData) => {
        const emoji = emojiData.emoji
        const position = Math.min(cursorRef.current, caption.length)

        const nextCaption =
            caption.slice(0, position) +
            emoji +
            caption.slice(position)

        if (nextCaption.length > MAX_CAPTION_LENGTH) return

        const nextPosition = position + emoji.length

        setCaption(nextCaption)
        cursorRef.current = nextPosition

        requestAnimationFrame(() => {
            captionRef.current?.focus()
            captionRef.current?.setSelectionRange(
                nextPosition,
                nextPosition
            )
        })
    }

    const handleShare = async () => {
        if (!canShare) return

        setSending(true)
        setError('')
        setShowPicker(false)

        try {
            const post = await createPost(image, caption)

            window.dispatchEvent(
                new CustomEvent('post:created', {
                    detail: { post },
                })
            )

            resetForm()
            onClose()
        } catch (err) {
            console.error('Create post error:', err)
            setError(
                err.response?.data?.message ||
                'Failed to create publication'
            )
        } finally {
            setSending(false)
        }
    }

    if (!isOpen) return null

    return createPortal(
        <div
            className={styles.overlay}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    handleClose()
                }
            }}
        >
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-label="Create new post"
            >
                <header className={styles.header}>
                    <h2 className={styles.title}>Create new post</h2>

                    <button
                        type="button"
                        className={styles.shareButton}
                        onClick={handleShare}
                        disabled={!canShare}
                    >
                        {sending ? 'Sharing...' : 'Share'}
                    </button>
                </header>

                <div className={styles.content}>
                    <div className={styles.imageSection}>
                        {preview ? (
                            <img
                                src={preview}
                                alt="Selected publication"
                                className={styles.previewImage}
                            />
                        ) : (

                            <div className={styles.uploadPlaceholder}>
                                <button
                                    type="button"
                                    className={styles.uploadTrigger}
                                    onClick={() => fileInputRef.current?.click()}
                                    aria-label="Upload photo"
                                >
                                    <img
                                        src={uploadCloudIcon}
                                        alt=""
                                        className={styles.uploadIcon}
                                    />
                                </button>
                            </div>

                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className={styles.fileInput}
                            onChange={handleImageChange}
                        />
                    </div>

                    <div className={styles.details}>
                        <div className={styles.author}>
                            <img
                                src={
                                    me?.profileImage ||
                                    '/default-avatar.png'
                                }
                                alt=""
                                className={styles.avatar}
                            />

                            <span className={styles.username}>
                                {me?.username}
                            </span>
                        </div>

                        <textarea
                            ref={captionRef}
                            className={styles.captionInput}
                            value={caption}
                            maxLength={MAX_CAPTION_LENGTH}
                            onChange={handleCaptionChange}
                            onClick={(event) => {
                                cursorRef.current =
                                    event.target.selectionStart ?? 0
                            }}
                            onKeyUp={(event) => {
                                cursorRef.current =
                                    event.target.selectionStart ?? 0
                            }}
                        />

                        <div className={styles.captionTools}>
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
                                    aria-expanded={showPicker}
                                >
                                    <img src={smileIcon} alt="" />
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

                            <span className={styles.counter}>
                                {captionLength}/{MAX_CAPTION_LENGTH}
                            </span>
                        </div>

                        {error && (
                            <p className={styles.error} role="alert">
                                {error}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}

export default CreatePostModal

