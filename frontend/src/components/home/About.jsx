import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Card, Row, Col, Divider, Typography, Button } from 'antd'
import {
	CheckOutlined,
	TeamOutlined,
	StarOutlined,
	BulbOutlined,
} from '@ant-design/icons'

import AsideBanner from './AsideBanner'
import Header from './Header'
import Section from './Section'
import Footer from './Footer'

const { Title, Paragraph, Text } = Typography

const About = () => {
	// Варианты анимации
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.2,
				when: 'beforeChildren',
			},
		},
		exit: { opacity: 0, transition: { duration: 0.5 } },
	}

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: {
				duration: 0.6,
				ease: 'easeOut',
			},
		},
	}

	const cardVariants = {
		hover: {
			y: -10,
			transition: {
				duration: 0.3,
				ease: 'easeOut',
			},
		},
	}

	return (
		<AnimatePresence>
			<motion.div
				initial='hidden'
				animate='visible'
				exit='exit'
				variants={containerVariants}
			>
				<AsideBanner />
				<Header />
				<Section />
				<motion.div className='min-h-screen pt-20 pb-32 px-4 sm:px-8'>
					<div className='mx-[15%]'>
						{/* Заголовок */}
						<motion.div variants={itemVariants} className='text-center mb-16'>
							<Title level={1} className='font-bold mb-4'>
								О НАС
							</Title>
							<Divider className='w-24 bg-black h-1 mx-auto' />
						</motion.div>

						{/* Блок с описанием */}
						<motion.div variants={itemVariants} className='mb-24'>
							<Row gutter={[48, 24]} align='middle'>
								<Col xs={24} lg={12}>
									<Card
										cover={
											<div className='bg-gray-200 h-64 flex items-center justify-center'>
												<TeamOutlined className='text-6xl text-gray-600' />
											</div>
										}
										className='shadow-lg'
									>
										<Paragraph className='text-gray-600'>
											Наша команда
										</Paragraph>
									</Card>
								</Col>
								<Col xs={24} lg={12}>
									<Title level={2} className='mb-6'>
										НАША ИСТОРИЯ
									</Title>
									<Paragraph className='text-lg mb-4 text-gray-700'>
										Aesthetic's Market был основан в 2024 году как небольшой
										проект энтузиастов моды и стиля.
									</Paragraph>
									<Paragraph className='text-lg mb-4 text-gray-700'>
										Сегодня мы - это команда профессионалов, объединённых общей
										страстью к эстетике и качеству.
									</Paragraph>
									<Paragraph className='text-lg text-gray-700'>
										Наш магазин стал местом, где каждый может найти уникальные
										вещи, отражающие его индивидуальность.
									</Paragraph>
								</Col>
							</Row>
						</motion.div>

						{/* Карточки с ценностями */}
						<motion.div variants={itemVariants} className='mb-24'>
							<Title level={2} className='text-center mb-12'>
								НАШИ ПРИНЦИПЫ
							</Title>

							<Row gutter={[24, 24]}>
								{/* Карточка 1 */}
								<Col xs={24} md={12} lg={8}>
									<motion.div variants={cardVariants} whileHover='hover'>
										<Card
											className='h-full shadow-md hover:shadow-lg transition-shadow'
											actions={[
												<StarOutlined key='values' className='text-black' />,
											]}
										>
											<Card.Meta
												avatar={
													<StarOutlined className='text-3xl text-black' />
												}
												title='Ценности'
												description={
													<ul className='space-y-2'>
														<li className='flex items-start'>
															<Text className='text-black mr-2'>•</Text>
															<Text>Честность перед клиентами</Text>
														</li>
														<li className='flex items-start'>
															<Text className='text-black mr-2'>•</Text>
															<Text>Уважение к индивидуальности</Text>
														</li>
														<li className='flex items-start'>
															<Text className='text-black mr-2'>•</Text>
															<Text>Стремление к совершенству</Text>
														</li>
													</ul>
												}
											/>
										</Card>
									</motion.div>
								</Col>

								{/* Карточка 2 */}
								<Col xs={24} md={12} lg={8}>
									<motion.div variants={cardVariants} whileHover='hover'>
										<Card
											className='h-full shadow-md hover:shadow-lg transition-shadow'
											actions={[
												<BulbOutlined key='mission' className='text-black' />,
											]}
										>
											<Card.Meta
												avatar={
													<BulbOutlined className='text-3xl text-black' />
												}
												title='Миссия'
												description='Мы создаем пространство, где мода становится искусством, а каждый клиент чувствует нашу заботу и внимание к деталям.'
											/>
										</Card>
									</motion.div>
								</Col>

								{/* Карточка 3 */}
								<Col xs={24} md={12} lg={8}>
									<motion.div variants={cardVariants} whileHover='hover'>
										<Card
											className='h-full shadow-md hover:shadow-lg transition-shadow'
											actions={[
												<CheckOutlined key='quality' className='text-black' />,
											]}
										>
											<Card.Meta
												avatar={
													<div className='w-10 h-10 bg-black rounded-full flex items-center justify-center'>
														<CheckOutlined className='text-white text-xl' />
													</div>
												}
												title='Качество'
												description='Мы тщательно отбираем каждый товар, чтобы гарантировать высочайшее качество и соответствие современным трендам.'
											/>
										</Card>
									</motion.div>
								</Col>
							</Row>
						</motion.div>

						{/* Призыв к действию */}
						<motion.div variants={itemVariants}>
							<Card className='text-center bg-gradient-to-r from-gray-100 to-gray-200 p-12 border-0 shadow-md'>
								<Title level={2} className='mb-6'>
									ГОТОВЫ НАЧАТЬ?
								</Title>
								<Paragraph className='text-lg mb-8 max-w-2xl mx-auto text-gray-700'>
									Присоединяйтесь к нашему сообществу и откройте для себя мир
									эстетики и стиля
								</Paragraph>
								<Link to='/'>
									<Button
										type='primary'
										size='large'
										className='bg-black hover:bg-gray-800 text-white'
									>
										В МАГАЗИН
									</Button>
								</Link>
							</Card>
						</motion.div>
					</div>
				</motion.div>
				<Footer />
			</motion.div>
		</AnimatePresence>
	)
}

export default About
