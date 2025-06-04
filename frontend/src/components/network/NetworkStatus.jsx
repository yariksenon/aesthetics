// components/network/NetworkStatus.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const NetworkStatus = ({ children }) => {
	const [isOnline, setIsOnline] = useState(navigator.onLine)
	const navigate = useNavigate()

	useEffect(() => {
		const handleStatusChange = () => {
			const currentStatus = navigator.onLine
			setIsOnline(currentStatus)

			if (!currentStatus) {
				navigate('/offline', { replace: true })
			}
		}

		// Проверка при монтировании
		if (!navigator.onLine) {
			navigate('/offline', { replace: true })
		}

		// Слушатели событий
		window.addEventListener('online', handleStatusChange)
		window.addEventListener('offline', handleStatusChange)

		return () => {
			window.removeEventListener('online', handleStatusChange)
			window.removeEventListener('offline', handleStatusChange)
		}
	}, [navigate])

	return isOnline ? children : null
}

export default NetworkStatus
