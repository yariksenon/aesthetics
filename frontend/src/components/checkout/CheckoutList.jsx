import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import {
	Button,
	Card,
	Form,
	Input,
	Radio,
	Spin,
	Typography,
	Divider,
	Image,
	Space,
	Empty,
	AutoComplete,
} from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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
	}) // Default to Grodno
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
			city: 'Гродно',
		})
	}, [form])

	const fetchCartItems = async () => {
		try {
			const { data } = await axios.get(
				`http://localhost:8080/api/v1/cart/${userId}`
			)
			console.log('Cart data:', data) // Debug cart data
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
				`https://nominatim.openstreetmap.org/reverse`,
				{
					params: {
						format: 'json',
						lon: lng,
						lat: lat,
						zoom: 18,
						addressdetails: 1,
					},
					headers: {
						'User-Agent': 'CheckoutApp/1.0 (your.email@example.com)', // Replace with your app details
					},
				}
			)
			const address = response.data.address
			if (address) {
				const fullAddress = [address.road, address.house_number, address.suburb]
					.filter(Boolean)
					.join(', ')
				form.setFieldsValue({
					address: fullAddress || response.data.display_name,
					city: address.city || address.town || 'Гродно', // Default to Grodno
				})
			}
		} catch (error) {
			toast.error('Не удалось получить адрес')
			console.error('Reverse geocode error:', error)
		}
	}

	const handleAddressSearch = async value => {
		if (value.length < 3) {
			setAddressOptions([])
			return
		}
		try {
			const response = await axios.get(
				`https://nominatim.openstreetmap.org/search`,
				{
					params: {
						q: `${value}, Гродно`, // Prioritize Grodno
						format: 'json',
						countrycodes: 'BY',
						addressdetails: 1,
						limit: 5,
						'accept-language': 'ru', // Russian for better labels
						// Bounding box for Grodno (approximate)
						viewbox: '23.7,53.6,24.0,53.8',
						bounded: 1,
					},
					headers: {
						'User-Agent': 'CheckoutApp/1.0 (your.email@example.com)', // Replace with your app details
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
	}

	const handleAddressSelect = async (value, option) => {
		const { lon, lat } = option.data
		const coord = { lng: parseFloat(lon), lat: parseFloat(lat) }
		setSelectedCoordinates(coord)
		if (mapRef.current) {
			mapRef.current.setView([coord.lat, coord.lng], 13)
		}
	}

	const handleSubmit = async values => {
		if (!cartItems.length) {
			toast.error('Ваша корзина пуста')
			return
		}
		if (!selectedCoordinates) {
			toast.error('Пожалуйста, выберите адрес доставки на карте')
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
		<div>
			<Title level={2}>Оформление заказа</Title>

			<div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
				<Form form={form} onFinish={handleSubmit} layout='vertical'>
					<Card
						title='Адрес доставки'
						variant='borderless'
						style={{ marginBottom: 16 }}
					>
						<Form.Item
							name='address'
							label='Адрес'
							rules={[{ required: true, message: 'Введите адрес' }]}
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
							label='Город'
							rules={[{ required: true, message: 'Введите город' }]}
							initialValue='Гродно'
						>
							<Input placeholder='Гродно' />
						</Form.Item>

						{mapError ? (
							<div style={{ color: 'red', marginTop: 16 }}>{mapError}</div>
						) : (
							<MapContainer
								center={[53.6835, 23.8345]} // Grodno, Belarus
								zoom={13}
								style={{ width: '100%', height: '400px', marginTop: 16 }}
								whenCreated={map => {
									mapRef.current = map
									console.log('Map created:', map) // Debug map creation
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
						)}
					</Card>

					<Card
						title='Способ оплаты'
						variant='borderless'
						style={{ marginBottom: 16 }}
					>
						<Form.Item name='paymentMethod' initialValue='cash'>
							<Radio.Group>
								<Radio
									value='cash'
									style={{
										padding: '8px 16px',
										borderRadius: 4,
										width: '100%',
									}}
								>
									Наличными при получении
								</Radio>
								<Radio
									value='card'
									style={{
										padding: '8px 16px',
										borderRadius: 4,
										width: '100%',
									}}
								>
									Картой онлайн
								</Radio>
							</Radio.Group>
						</Form.Item>
					</Card>

					<Card
						title='Дополнительная информация'
						variant='borderless'
						style={{ marginBottom: 16 }}
					>
						<Form.Item name='notes' label='Примечания к заказу'>
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

				<Card title='Ваш заказ' variant='borderless'>
					<div style={{ maxHeight: 400, overflowY: 'auto' }}>
						{cartItems.map(item => (
							<div key={item.id} style={{ marginBottom: 16 }}>
								<Space
									style={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
										width: '100%',
									}}
								>
									<Image
										width={80}
										height={80}
										src={
											item.image_path
												? `http://localhost:8080/static/${item.image_path}`
												: 'error'
										}
										fallback='https://via.placeholder.com/80x80?text=No+Image'
										alt={item.name}
										style={{ objectFit: 'cover' }}
									/>
									<div style={{ flex: 1 }}>
										<Text strong>{item.name}</Text>
										<br />
										<Text type='secondary'>Количество: {item.quantity}</Text>
									</div>
									<Text strong>
										{(item.price * item.quantity).toFixed(2)} руб.
									</Text>
								</Space>
								<Divider style={{ margin: '12px 0' }} />
							</div>
						))}
					</div>
					<Divider />
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
					>
						<Text strong style={{ fontSize: 16 }}>
							Итого к оплате:
						</Text>
						<Title level={4} style={{ margin: 0 }}>
							{total.toFixed(2)} руб.
						</Title>
					</div>
				</Card>
			</div>
		</div>
	)
}

export default CheckoutPage
