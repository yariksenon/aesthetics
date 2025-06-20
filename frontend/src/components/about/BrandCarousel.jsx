import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, Typography, Empty } from 'antd'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import axios from 'axios'

const { Title, Paragraph, Text } = Typography

const BrandCarousel = () => {
	const [brands, setBrands] = useState([])
	const [currentBrandIndex, setCurrentBrandIndex] = useState(0)

	// Fetch brands from API, limit to 6
	useEffect(() => {
		axios
			.get('http://45.12.74.28:8080/api/v1/admin/brand/approved')
			.then(response => {
				setBrands(response.data.slice(0, 6)) // Limit to 6 brands
			})
			.catch(error => {
				console.error('Error fetching brands:', error)
			})
	}, [])

	const nextBrand = () => {
		setCurrentBrandIndex(prevIndex =>
			prevIndex === brands.length - 1 ? 0 : prevIndex + 1
		)
	}

	const prevBrand = () => {
		setCurrentBrandIndex(prevIndex =>
			prevIndex === 0 ? brands.length - 1 : prevIndex - 1
		)
	}

	// Animation variants
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

	const brandVariants = {
		enter: { opacity: 0, x: 100 },
		center: { opacity: 1, x: 0 },
		exit: { opacity: 0, x: -100 },
	}

	return (
		<motion.div variants={itemVariants} className='mb-[10%]'>
			<Title level={2} className='text-center mb-12 text-white'>
				БРЕНДЫ
			</Title>
			<div className='relative'>
				<AnimatePresence mode='wait'>
					{brands.length > 0 ? (
						<motion.div
							key={currentBrandIndex}
							variants={brandVariants}
							initial='enter'
							animate='center'
							exit='exit'
							transition={{ duration: 0.5 }}
						>
							<Card
								className='shadow-md hover:shadow-lg transition-shadow bg-gray-800 border-gray-700'
								actions={[
									<div className='flex items-center justify-between px-4'>
										<button
											onClick={prevBrand}
											className='bg-gray-700 rounded-full p-2 shadow-md hover:bg-gray-600 transition-all'
										>
											<LeftOutlined className='text-xl text-white' />
										</button>
										<a
											href={brands[currentBrandIndex].website}
											target='_blank'
											rel='noopener noreferrer'
											className='text-white hover:text-black hover:bg-white transition-colors duration-200 px-3 py-1 rounded-md'
										>
											Посетить сайт
										</a>
										<button
											onClick={nextBrand}
											className='bg-gray-700 rounded-full p-2 shadow-md hover:bg-gray-600 transition-all'
										>
											<RightOutlined className='text-xl text-white' />
										</button>
									</div>,
								]}
							>
								<Card.Meta
									title={
										<span className='text-white'>
											{brands[currentBrandIndex].name}
										</span>
									}
									description={
										<div>
											<Paragraph className='text-gray-300'>
												{brands[currentBrandIndex].description}
											</Paragraph>
										</div>
									}
								/>
							</Card>
						</motion.div>
					) : (
						<motion.div
							variants={brandVariants}
							initial='enter'
							animate='center'
							exit='exit'
							transition={{ duration: 0.5 }}
						>
							<Empty
								description='Бренды отсутствуют'
								className='text-gray-300'
							/>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</motion.div>
	)
}

export default BrandCarousel
