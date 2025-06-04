// components/network/Offline.jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Loading from '../loading/Loading'

const Offline = () => {
	const navigate = useNavigate()

	useEffect(() => {
		const checkConnection = () => {
			if (navigator.onLine) {
				navigate(-1) // Возврат на предыдущую страницу
			}
		}

		const interval = setInterval(checkConnection, 5000) // Проверка каждые 5 секунд

		return () => clearInterval(interval)
	}, [navigate])

	return (
		<div className='offline-page'>
			<h1>Отсутствует подключение к интернету</h1>
			<p>Пожалуйста, проверьте ваше интернет-соединение.</p>
			<p>
				Мы автоматически перенаправим вас, как только соединение восстановится.
			</p>
			<div className='loading-wrapper'>
				<Loading />
			</div>
			<style jsx>{`
				.offline-page {
					text-align: center;
					padding: 2rem;
					max-width: 600px;
					margin: 0 auto;
				}
				.loading-wrapper {
					margin: 2rem auto;
					width: 50px;
				}
			`}</style>
		</div>
	)
}

export default Offline
