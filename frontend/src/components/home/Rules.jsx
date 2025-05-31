import { motion, AnimatePresence } from 'framer-motion'
import { Card, message, List, Typography, Button } from 'antd'
import {
	CheckCircleOutlined,
	ShoppingCartOutlined,
	CommentOutlined,
	SafetyOutlined,
	CarOutlined,
	UserOutlined,
	LockOutlined,
	ShopOutlined,
	SolutionOutlined,
	SyncOutlined,
	CreditCardOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

import AsideBanner from './AsideBanner'
import Header from './Header'
import Section from './Section'
import Footer from './Footer'

const { Title, Text, Paragraph } = Typography

const deliveryOptions = [
	{
		title: 'С примеркой',
		icon: <CheckCircleOutlined />,
		features: [
			'Ожидайте курьера на протяжении всего интервала времени',
			'Курьер свяжется с Вами перед доставкой',
			'Проверьте и примерьте заказ (до 15 минут)',
			'Возможен частичный или полный возврат товаров',
			'Оплата: наличными или картой',
			'Дата доставки: в течение 2-5 рабочих дней',
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
			'Быстрая доставка товаров в день заказа',
			'Доставка в течение 2 часов после оформления',
			'Дополнительная плата 5.29 BYN за срочность',
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
	'Будьте уважительными к другим пользователям',
	'За нарушения возможно удаление аккаунта',
]

const adminRules = [
	'Полный доступ к управлению контентом и пользователями',
	'Модерация отзывов и комментариев',
	'Управление заказами и доставками',
	'Добавление и редактирование товаров',
	'Доступ к статистике и аналитике продаж',
	'Обязанность соблюдать конфиденциальность данных пользователей',
]

const userRules = [
	'Возможность оформлять заказы и отслеживать их статус',
	'Доступ к истории покупок',
	'Возможность оставлять отзывы и оценки товарам',
	'Настройка профиля',
	'Добавлять товары в списки желаний',
]

const guestRules = [
	'Просмотр каталога товаров',
	'Доступ к информации о товарах и брендах',
	'Ограниченный доступ к функциям сайта',
	'Для полного доступа необходимо зарегистрироваться',
	'Возможность использовать поиск по сайту',
]

const courierRules = [
	'Обязательно наличие опрятного внешнего вида',
	'При себе необходимо иметь терминал для безналичной оплаты',
	'Курьер обязан позвонить клиенту за 15-30 минут до доставки',
	'Соблюдать временной интервал доставки (не более 2 часов ожидания)',
	'При доставке с примеркой - предоставить клиенту до 15 минут на примерку',
	'Принимать оплату наличными или картой',
	'Соблюдать правила хранения и транспортировки спортивного инвентаря',
	'Запрещено вскрывать упаковки или повреждать товар',
	'При возврате товара проверить его целостность и комплектацию',
]

const returnPolicy = [
	'Возврат возможен в течение 14 дней с момента получения заказа',
	'Товар должен сохранить товарный вид, ярлыки и упаковку',
	'Для возврата необходимо заполнить заявление в личном кабинете',
	'Деньги возвращаются тем же способом, которым была произведена оплата',
	'Срок возврата денежных средств - до 10 банковских дней',
	'Возврат доставки не производится, кроме случаев доставки бракованного товара',
]

const paymentMethods = [
	'Наличными курьеру при получении заказа',
	'Банковской картой курьеру при получении (через мобильный терминал)',
]

function Rules() {
	const navigate = useNavigate()
	const copyEmail = () => {
		navigator.clipboard.writeText('aesthetics.team.contacts@gmail.com')
		message.success('Email скопирован!')
	}

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
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className='mb-8'
						>
							<h1 className='text-3xl font-bold py-8'>Наши условия</h1>
						</motion.div>
						{/* Условия для гостей */}
						<motion.section
							className='mb-12'
							whileInView={{ opacity: 1, y: 0 }}
							initial={{ opacity: 0, y: 20 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: 0.2 }}
						>
							<Title level={3} className='mb-6'>
								<SolutionOutlined className='mr-2' />
								Условия для поситителей сайта
							</Title>

							<motion.div whileHover={{ scale: 1.01 }}>
								<Card>
									<Paragraph className='mb-4'>
										Посетители могут воспользоваться следующими возможностями:
									</Paragraph>
									<List
										dataSource={guestRules}
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
						{/* Способы оплаты */}
						<motion.section
							className='mb-12'
							whileInView={{ opacity: 1, y: 0 }}
							initial={{ opacity: 0, y: 20 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5 }}
						>
							<Title level={3} className='mb-6'>
								<CreditCardOutlined className='mr-2' />
								Способы оплаты
							</Title>

							<motion.div whileHover={{ scale: 1.01 }}>
								<Card>
									<List
										dataSource={paymentMethods}
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

						{/* Условия для пользователей */}
						<motion.section
							className='mb-12'
							whileInView={{ opacity: 1, y: 0 }}
							initial={{ opacity: 0, y: 20 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: 0.1 }}
						>
							<Title level={3} className='mb-6'>
								<UserOutlined className='mr-2' />
								Условия для зарегистрированных пользователей
							</Title>

							<motion.div whileHover={{ scale: 1.01 }}>
								<Card>
									<Paragraph className='mb-4'>
										Зарегистрированные пользователи получают следующие
										возможности:
									</Paragraph>
									<List
										dataSource={userRules}
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
						{/* Условия доставки */}
						<motion.section
							className='mb-12'
							whileInView={{ opacity: 1, y: 0 }}
							initial={{ opacity: 0, y: 20 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5 }}
						>
							<Title level={3} className='mb-6'>
								<CarOutlined className='mr-2' />
								Условия доставки спортивных товаров
							</Title>

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
											className='shadow-sm hover:shadow-md transition-shadow h-full'
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
								<ShopOutlined className='mr-2' />
								Для брендов спортивных товаров
							</Title>

							<motion.div whileHover={{ scale: 1.01 }}>
								<Card>
									<Paragraph className='mb-4'>
										Бренды могут размещать свою продукцию на нашей платформе:
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
								Правила оставления отзывов
							</Title>

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
						{/* Правила для курьеров */}
						<motion.section
							className='mb-12'
							whileInView={{ opacity: 1, y: 0 }}
							initial={{ opacity: 0, y: 20 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: 0.3 }}
						>
							<Title level={3} className='mb-6'>
								<SafetyOutlined className='mr-2' />
								Правила для курьеров
							</Title>

							<motion.div whileHover={{ scale: 1.01 }}>
								<Card>
									<Paragraph className='mb-4'>
										Для наших курьеров мы установили следующие правила и
										требования:
									</Paragraph>
									<List
										dataSource={courierRules}
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
						<motion.section
							className='mb-12'
							whileInView={{ opacity: 1, y: 0 }}
							initial={{ opacity: 0, y: 20 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5 }}
						></motion.section>
						<motion.section
							className='mb-12 text-center'
							whileInView={{ opacity: 1 }}
							initial={{ opacity: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5 }}
						>
							<motion.div
								whileHover={{ scale: 1.02 }}
								transition={{ duration: 0.3 }}
							>
								<Card
									className='p-8 shadow-lg rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors duration-300'
									hoverable
								>
									<Title level={3} className='text-gray-800 mb-4'>
										<CommentOutlined className='mr-2 text-black-500' />
										Остались вопросы?
									</Title>
									<Paragraph className='mb-6 text-gray-600 text-lg'>
										Если вы не нашли ответ на свой вопрос, наша служба поддержки
										всегда готова помочь!
									</Paragraph>
									<div className='mb-6 p-4 bg-gray-50 rounded-lg'>
										<Text className='text-gray-700 font-semibold'>
											Свяжитесь с нами по email:
										</Text>
										<Text
											className='text-gray-400 font-medium ml-2 hover:text-gray-800 cursor-pointer transition-colors'
											onClick={copyEmail}
										>
											aesthetics.team.contacts@gmail.com
										</Text>
									</div>
									<Button
										type='primary'
										size='large'
										className='bg-black text-white hover:bg-black'
										icon={<SolutionOutlined />}
										onClick={copyEmail}
									>
										Скопировать почту
									</Button>
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
