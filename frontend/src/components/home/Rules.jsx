import { motion, AnimatePresence } from 'framer-motion'
import { Button, Card, Divider, List, Typography, Collapse, Image } from 'antd'
import {
	ArrowLeftOutlined,
	CheckCircleOutlined,
	ShoppingCartOutlined,
	TeamOutlined,
	CommentOutlined,
	StarOutlined,
	SafetyOutlined,
	TrophyOutlined,
	CarOutlined,
	EnvironmentOutlined,
	DollarOutlined,
} from '@ant-design/icons'
import Logo from '../../assets/home/Footer/Logo.svg'

import AsideBanner from './AsideBanner'
import Header from './Header'
import Section from './Section'
import Footer from './Footer'

const { Title, Text, Paragraph } = Typography
const { Panel } = Collapse

const deliveryOptions = [
	{
		title: 'С примеркой',
		icon: <CheckCircleOutlined />,
		features: [
			'Ожидайте курьера на протяжении всего интервала времени',
			'Курьер свяжется с Вами перед доставкой спортивной экипировки',
			'Проверьте и примерьте заказ (до 15 минут)',
			'Возможен частичный или полный возврат товаров',
			'Оплата: наличными или картой курьеру',
			'Дата доставки: в течение 2-5 рабочих дней',
			'Максимум 7 товаров в заказе',
		],
	},
	{
		title: 'Без примерки',
		icon: <ShoppingCartOutlined />,
		features: [
			'Когда уверены в размере спортивной формы или оборудования',
			'Дата доставки: в течение 1-3 рабочих дней',
			'Примерка не предусмотрена',
			'Оплата: наличными или картой курьеру',
		],
	},
	{
		title: 'Экспресс доставка',
		icon: <CarOutlined />,
		features: [
			'Быстрая доставка спортивных товаров в день заказа',
			'Доставка в течение 2 часов после оформления',
			'Дополнительная плата 15 ₽ за срочность',
			'Оплата: наличными или картой курьеру',
		],
	},
]

const brandBenefits = [
	'Оформляйте заявку на добавление спортивных товаров',
	'Мы рассмотрим ваше предложение в течение 2 рабочих дней',
	'После одобрения вы сможете управлять своим ассортиментом спортивной экипировки',
	'Мы берем комиссию 10% с каждой успешной продажи',
]

const communityRules = [
	'Делитесь отзывами о спортивных товарах',
	'Не используйте ненормативную лексику',
	'Публикуйте фото спортивной экипировки в действии',
	'Будьте уважительными к другим спортсменам',
	'За нарушения возможна блокировка аккаунта',
]

function Rules() {
	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.5 }}
			>
				<AsideBanner />
				<Header />
				<Section />
				<div className='mx-[15%]'>
					<motion.div
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.2 }}
					>
						{/* Шапка с кнопкой назад и логотипом */}
						<div className='flex justify-between items-center '>
							<motion.div
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								<Image
									src={Logo}
									alt='Logo'
									preview={false}
									width={120}
									className='cursor-pointer'
									onClick={() => navigate('/')}
								/>
							</motion.div>
						</div>

						{/* Основной заголовок */}
						<Title level={2} className='text-3xl font-bold m-0'>
							Наши условия и сервис
						</Title>

						<Paragraph className='text-lg'>
							Мы — специализированный магазин профессиональной спортивной
							экипировки и товаров для активного образа жизни.
						</Paragraph>

						{/* Условия доставки */}
						<motion.section
							className='mb-12'
							whileInView={{ opacity: 1, y: 0 }}
							initial={{ opacity: 0, y: 20 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5 }}
						>
							<Title level={3} className='mb-6'>
								Условия доставки спортивных товаров
							</Title>
							<Divider />

							<div className='grid md:grid-cols-3 gap-6'>
								{deliveryOptions.map((option, index) => (
									<motion.div
										key={index}
										whileHover={{ y: -5 }}
										transition={{ duration: 0.2 }}
									>
										<Card
											title={
												<div className='flex items-center'>
													{option.icon}
													<span className='ml-2'>{option.title}</span>
												</div>
											}
											bordered={false}
											className='shadow-sm hover:shadow-md transition-shadow'
										>
											<List
												dataSource={option.features}
												renderItem={item => (
													<List.Item>
														<Text>{item}</Text>
													</List.Item>
												)}
											/>
										</Card>
									</motion.div>
								))}
							</div>
						</motion.section>

						{/* Для брендов */}
						<motion.section
							className='mb-12'
							whileInView={{ opacity: 1, y: 0 }}
							initial={{ opacity: 0, y: 20 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: 0.1 }}
						>
							<Title level={3} className='mb-6'>
								<TeamOutlined className='mr-2' />
								Для производителей спортивных товаров
							</Title>
							<Divider />
							<motion.div whileHover={{ scale: 1.01 }}>
								<Card>
									<Paragraph className='mb-4'>
										Спортивные бренды могут размещать свою продукцию на нашей
										платформе:
									</Paragraph>
									<List
										dataSource={brandBenefits}
										renderItem={item => (
											<List.Item>
												<CheckCircleOutlined className='text-green-500 mr-2' />
												{item}
											</List.Item>
										)}
									/>
								</Card>
							</motion.div>
						</motion.section>

						{/* Правила сообщества */}
						<motion.section
							className='mb-12'
							whileInView={{ opacity: 1, y: 0 }}
							initial={{ opacity: 0, y: 20 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: 0.2 }}
						>
							<Title level={3} className='mb-6'>
								<CommentOutlined className='mr-2' />
								Правила спортивного сообщества
							</Title>
							<Divider />
							<motion.div whileHover={{ scale: 1.01 }}>
								<Card>
									<Paragraph className='mb-4'>
										Мы создаем комьюнити для настоящих любителей спорта:
									</Paragraph>
									<List
										dataSource={communityRules}
										renderItem={item => (
											<List.Item>
												<CheckCircleOutlined className='text-green-500 mr-2' />
												{item}
											</List.Item>
										)}
									/>
								</Card>
							</motion.div>
						</motion.section>
					</motion.div>
				</div>
				<Footer />
			</motion.div>
		</AnimatePresence>
	)
}

export default Rules
