import React from 'react'
import { Card, Row, Col, Typography, Space } from 'antd'
import { StarOutlined, BulbOutlined, CheckOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

const { Title, Text } = Typography

const PrinciplesSection = ({ itemVariants, cardVariants }) => {
	const principles = [
		{
			key: 'values',
			icon: <StarOutlined className='text-2xl' />,
			title: 'Ценности',
			description: (
				<Space direction='vertical' size={8} className='mt-4'>
					{[
						'Честность перед клиентами',
						'Уважение к индивидуальности',
						'Стремление к совершенству',
					].map(item => (
						<div key={item} className='flex items-start'>
							<CheckOutlined className='text-gray-800 mt-1 mr-2' />
							<Text className='text-gray-700'>{item}</Text>
						</div>
					))}
				</Space>
			),
		},
		{
			key: 'mission',
			icon: <BulbOutlined className='text-2xl' />,
			title: 'Миссия',
			description:
				'Мы создаем пространство, где мода становится искусством, а каждый клиент чувствует нашу заботу и внимание к деталям.',
		},
		{
			key: 'quality',
			icon: <CheckOutlined className='text-2xl' />,
			title: 'Качество',
			description:
				'Мы тщательно отбираем каждый товар, чтобы гарантировать высочайшее качество и соответствие современным трендам.',
		},
	]

	return (
		<motion.div variants={itemVariants}>
			<div className=' mb-[10%]'>
				<Title
					level={2}
					className='text-center mb-16 text-3xl sm:text-4xl font-bold text-gray-800'
				>
					ПРИНЦИПЫ
				</Title>
				<Row gutter={[32, 32]} justify='center'>
					{principles.map(principle => (
						<Col xs={24} sm={12} lg={8} key={principle.key}>
							<motion.div
								variants={cardVariants}
								whileHover={{ y: -8, transition: { duration: 0.3 } }}
							>
								<Card
									className='border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-white'
									bodyStyle={{ padding: 0 }}
								>
									<div className='h-2 bg-gray-800' />
									<div className='p-6 flex flex-col h-[300px]'>
										{' '}
										{/* Фиксированная высота */}
										<div className='w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-gray-100'>
											{React.cloneElement(principle.icon, {
												className: 'text-xl text-gray-800',
											})}
										</div>
										<Title
											level={3}
											className='text-xl font-semibold mb-4 text-gray-800'
										>
											{principle.title}
										</Title>
										<Text className='text-gray-600 flex-grow overflow-hidden'>
											{principle.description}
										</Text>
									</div>
								</Card>
							</motion.div>
						</Col>
					))}
				</Row>
			</div>
		</motion.div>
	)
}

export default PrinciplesSection
