import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import { motion } from 'framer-motion'
import './custom.css'
import {
	Button,
	Card,
	Form,
	Input,
	Spin,
	Typography,
	Segmented,
	Tabs,
	Divider,
	Image,
	Space,
	Empty,
	AutoComplete,
	Tooltip,
} from 'antd'
import { LoadingOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { debounce } from 'lodash'

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
	iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
	shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const { Title, Text } = Typography

const CheckoutPage = () => {
	const [form] = Form.useForm()
	const navigate = useNavigate()
	const [cartItems, setCartItems] = useState([])
	const [total, setTotal] = useState(0)
	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)
	const [addressOptions, setAddressOptions] = useState([])
	const [selectedCoordinates, setSelectedCoordinates] = useState({
		lat: 53.6835,
		lng: 23.8345,
	})
	const [mapError, setMapError] = useState(null)
	const mapRef = useRef(null)
	const markerRef = useRef(null)
	const userId = localStorage.getItem('userId')

	// Load cart items and check user authentication
	useEffect(() => {
		if (!userId) {
			toast.error('Пожалуйста, войдите в систему')
			navigate('/login')
		} else {
			fetchCartItems()
		}
	}, [userId, navigate])

	// Initialize form with Grodno as default city
	useEffect(() => {
		form.setFieldsValue({
			city: 'Гродна',
		})
	}, [form])

	const fetchCartItems = async () => {
		try {
			const { data } = await axios.get(
				`http://localhost:8080/api/v1/cart/${userId}`
			)
			const items = Array.isArray(data?.items) ? data.items : []
			setCartItems(items)
			setTotal(items.reduce((sum, item) => sum + item.price * item.quantity, 0))
		} catch (error) {
			console.error('Cart fetch error:', error)
			toast.error('Не удалось загрузить корзину')
			setCartItems([])
			setTotal(0)
		} finally {
			setLoading(false)
		}
	}

	// Component to handle map click events
	const MapEvents = () => {
		useMapEvents({
			click(e) {
				const coord = e.latlng
				setSelectedCoordinates({ lng: coord.lng, lat: coord.lat })
				reverseGeocode(coord)
			},
		})
		return null
	}

	const reverseGeocode = async ({ lng, lat }) => {
		try {
			const response = await axios.get(
				`http://localhost:8080/api/v1/reverse-geocode`,
				{
					params: {
						lat,
						lon: lng,
					},
				}
			)

			const address = response.data.address
			if (address && address.country_code !== 'by') {
				toast.error('Доставка возможна только по территории Беларуси')
				setMapError('Доставка возможна только по территории Беларуси')
				return
			}

			if (address) {
				const fullAddress = [
					address.road,
					address.house_number,
					address.neighbourhood,
				]
					.filter(Boolean)
					.join(', ')
				form.setFieldsValue({
					address: fullAddress || response.data.display_name,
					city: address.city || address.town || 'Гродно',
				})
				setMapError(null)
			}
		} catch (error) {
			let message = 'Не удалось получить адрес. Попробуйте снова.'
			if (error.response?.status === 403) {
				message =
					'Доступ к геокодированию запрещен. Пожалуйста, попробуйте позже или свяжитесь с поддержкой.'
			} else if (error.response?.status === 429) {
				message =
					'Слишком много запросов. Пожалуйста, подождите и попробуйте снова.'
			}
			toast.error(message)
			console.error('Reverse geocode error:', error)
		}
	}

	const handleAddressSearch = debounce(async value => {
		if (value.length < 3) {
			setAddressOptions([])
			return
		}
		try {
			const response = await axios.get(
				`http://localhost:8080/api/v1/search-address`,
				{
					params: {
						q: `${value}, Гродно`,
					},
				}
			)
			const suggestions = response.data.map(item => ({
				value: item.display_name,
				data: item,
			}))
			setAddressOptions(suggestions)
		} catch (error) {
			toast.error('Не удалось загрузить предложения адреса')
			console.error('Address search error:', error)
		}
	}, 300)

	const handleAddressSelect = async (value, option) => {
		const { lon, lat, address } = option.data

		if (address?.country_code !== 'by') {
			toast.error('Доставка возможна только по территории Беларуси')
			setMapError('Доставка возможна только по территории Беларуси')
			return
		}

		const coord = { lng: parseFloat(lon), lat: parseFloat(lat) }
		setSelectedCoordinates(coord)
		setMapError(null)
		if (mapRef.current) {
			mapRef.current.setView([coord.lat, coord.lng], 13)
		}
	}

	const handleSubmit = async values => {
		if (!cartItems.length) {
			toast.error('Ваша корзина пуста')
			return
		}

		// Проверка обязательных полей
		if (!values.address || !values.city || !values.paymentMethod) {
			toast.error('Пожалуйста, заполните все обязательные поля')
			return
		}

		if (!selectedCoordinates) {
			toast.error('Пожалуйста, выберите адрес доставки на карте')
			return
		}

		try {
			const response = await axios.get(
				`http://localhost:8080/api/v1/reverse-geocode`,
				{
					params: {
						lat: selectedCoordinates.lat,
						lon: selectedCoordinates.lng,
					},
				}
			)

			if (response.data.address?.country_code !== 'by') {
				toast.error('Доставка возможна только по территории Беларуси')
				return
			}
		} catch (error) {
			let message = 'Не удалось проверить адрес доставки'
			if (error.response?.status === 403) {
				message =
					'Доступ к геокодированию запрещен. Пожалуйста, попробуйте позже или свяжитесь с поддержкой.'
			} else if (error.response?.status === 429) {
				message =
					'Слишком много запросов. Пожалуйста, подождите и попробуйте снова.'
			}
			toast.error(message)
			console.error('Country check error:', error)
			return
		}

		setSubmitting(true)
		try {
			const { data } = await axios.post(
				`http://localhost:8080/api/v1/orders/${userId}`,
				{
					address: values.address,
					city: values.city,
					notes: values.notes,
					payment_provider: values.paymentMethod,
					coordinates: selectedCoordinates,
				}
			)
			toast.success('Заказ успешно оформлен!')
			navigate('/my-order', { state: { orderId: data.order_id } })
		} catch (error) {
			toast.error(
				error.response?.data?.error ||
					error.response?.data?.errors?.join(', ') ||
					'Произошла ошибка при оформлении заказа'
			)
		} finally {
			setSubmitting(false)
		}
	}

	if (loading) {
		return (
			<Spin
				indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
				fullscreen
			/>
		)
	}

	if (!cartItems.length) {
		return (
			<div style={{ textAlign: 'center', marginTop: 48 }}>
				<Empty description='Ваша корзина пуста' />
				<Button
					type='primary'
					onClick={() => navigate('/products')}
					style={{
						background: 'black',
						borderColor: 'black',
						fontWeight: 'bold',
					}}
				>
					Вернуться к покупкам
				</Button>
			</div>
		)
	}

	return (
		<div
			className='container mx-auto py-8'
			style={{ backgroundColor: 'white', color: 'black' }}
		>
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className='mb-8'
			>
				<h1 className='text-3xl font-bold m-0' style={{ color: 'black' }}>
					Оформление заказа
				</h1>
			</motion.div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
				<div className='lg:col-span-2'>
					<Form form={form} onFinish={handleSubmit} layout='vertical'>
						<Card
							title={
								<Space>
									<span style={{ color: 'black' }}>Адрес доставки</span>
									<Tooltip title='Доставка осуществляется только по территории Беларуси'>
										<QuestionCircleOutlined style={{ color: 'black' }} />
									</Tooltip>
								</Space>
							}
							style={{
								marginBottom: 16,
								backgroundColor: 'white',
								color: 'black',
							}}
						>
							<Form.Item
								name='address'
								label={<span style={{ color: 'black' }}>Адрес</span>}
								rules={[{ required: true, message: 'Введите адрес' }]}
								help={
									mapError && <div style={{ color: 'red' }}>{mapError}</div>
								}
							>
								<AutoComplete
									onSearch={handleAddressSearch}
									onSelect={handleAddressSelect}
									options={addressOptions}
									placeholder='Улица, дом, квартира'
								/>
							</Form.Item>

							<Form.Item
								name='city'
								label={<span style={{ color: 'black' }}>Город</span>}
								rules={[{ required: true, message: 'Введите город' }]}
								initialValue='Гродно'
							>
								<Input placeholder='Гродно' />
							</Form.Item>

							<MapContainer
								center={[53.6835, 23.8345]}
								zoom={13}
								style={{ width: '100%', height: '400px', marginTop: 16 }}
								whenCreated={map => {
									mapRef.current = map
								}}
							>
								<TileLayer
									url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
									attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>'
									subdomains='abcd'
									maxZoom={20}
								/>
								<MapEvents />
								{selectedCoordinates && (
									<Marker
										position={[
											selectedCoordinates.lat,
											selectedCoordinates.lng,
										]}
										ref={markerRef}
									/>
								)}
							</MapContainer>
						</Card>

						<Card
							title={
								<span
									style={{ color: '#000', fontWeight: '500', fontSize: '16px' }}
								>
									Способ оплаты
								</span>
							}
							style={{
								marginBottom: 16,
								backgroundColor: '#fff',
								borderRadius: '8px',
								padding: '16px',
								boxShadow: 'none',
								border: '1px solid #f5f5f5',
							}}
							bodyStyle={{ padding: '8px 0 0 0' }}
						>
							<Form.Item
								name='paymentMethod'
								initialValue='cash'
								rules={[{ required: true, message: 'Выберите способ оплаты' }]}
							>
								<Segmented
									options={[
										{ label: 'Наличными при получении', value: 'cash' },
										{ label: 'Картой онлайн', value: 'card' },
									]}
									style={{
										width: '100%',
										backgroundColor: '#fafafa',
										color: '#000',
										height: '44px',
									}}
									block
									size='large'
									className='custom-segmented'
								/>
							</Form.Item>
						</Card>

						<Card
							title={
								<span style={{ color: 'black' }}>
									Дополнительная информация
								</span>
							}
							style={{ marginBottom: 16, backgroundColor: 'white' }}
						>
							<Form.Item
								name='notes'
								label={
									<span style={{ color: 'black' }}>Примечания к заказу</span>
								}
							>
								<Input.TextArea
									rows={3}
									placeholder='Например: код домофона, этаж, удобное время доставки'
								/>
							</Form.Item>
						</Card>

						<Button
							type='primary'
							htmlType='submit'
							loading={submitting}
							block
							size='large'
							style={{
								background: 'black',
								borderColor: 'black',
								fontWeight: 'bold',
								height: 48,
								fontSize: 16,
								marginTop: 16,
							}}
						>
							{submitting ? 'Оформляем заказ...' : 'Подтвердить заказ'}
						</Button>
					</Form>
				</div>

				<div className='lg:col-span-1'>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className='bg-white rounded-lg shadow-md p-6 border border-gray-100 sticky top-4'
					>
						<h2 className='text-xl font-bold mb-4 border-b border-gray-200 pb-2 text-gray-800'>
							Ваш заказ
						</h2>
						<div className='space-y-3 text-gray-600 mb-4 max-h-96 overflow-y-auto'>
							{cartItems.map(item => (
								<div
									key={`${item.product_id}-${item.size_id}`}
									className='flex justify-between py-1 items-center'
								>
									<div className='flex items-center space-x-3'>
										<Image
											src={`http://localhost:8080/static/${item.image_path}`}
											fallback='https://via.placeholder.com/50'
											width={50}
											height={50}
											preview={false}
											className='object-cover rounded'
											onError={() =>
												console.log('Image load error for', item.name)
											}
										/>
										<span className='truncate max-w-[160px] text-gray-700 text-sm'>
											{item.name || 'Товар'} × {item.quantity || 1}
										</span>
									</div>
									<span className='text-gray-800 font-medium text-sm'>
										{(item.price * item.quantity).toFixed(2)} руб.
									</span>
								</div>
							))}
						</div>
						<div className='border-t border-gray-200 mt-4 pt-4 flex justify-between font-bold text-lg text-gray-800'>
							<span>Итого:</span>
							<span>{total.toFixed(2)} руб.</span>
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	)
}

export default CheckoutPage
