import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Row, Col, Typography, Button } from 'antd'

import AsideBanner from '../home/AsideBanner'
import Header from '../home/Header'
import Section from '../home/Section'
import Footer from '../home/Footer'
import MissionSection from '../about/MissionSection'
import PrinciplesSection from '../about/PrinciplesSection'
import BrandCarousel from '../about/BrandCarousel'
import CallToActionSection from '../about/CallToActionSection'
import HistorySection from '../about/HistorySection'

import our_team_1 from '../../assets/home/About/our_team_1.jpg'
import our_team_2 from '../../assets/home/About/our_team_2.jpg'
import our_team_3 from '../../assets/home/About/our_team_3.jpg'
import our_team_4 from '../../assets/home/About/our_team_4.jpg'
import our_team_5 from '../../assets/home/About/our_team_5.jpg'
import our_team_6 from '../../assets/home/About/our_team_6.jpg'

const { Title } = Typography

const teamPhotos = [
	our_team_1,
	our_team_2,
	our_team_3,
	our_team_4,
	our_team_5,
	our_team_6,
]

const About = () => {
	const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

	const nextPhoto = () => {
		setCurrentPhotoIndex(prevIndex =>
			prevIndex === teamPhotos.length - 1 ? 0 : prevIndex + 1
		)
	}

	const prevPhoto = () => {
		setCurrentPhotoIndex(prevIndex =>
			prevIndex === 0 ? teamPhotos.length - 1 : prevIndex - 1
		)
	}

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

	const photoVariants = {
		enter: { opacity: 0, x: 100 },
		center: { opacity: 1, x: 0 },
		exit: { opacity: 0, x: -100 },
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
				<motion.div>
					<div className='mx-[15%]'>
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className='mb-8 py-8'
						>
							<h1 className='text-3xl font-bold m-0'>Наша компания</h1>
						</motion.div>
						<motion.div variants={itemVariants} className='mb-[10%]'>
							<Row gutter={[48, 24]} align='middle'>
								<Col xs={24} lg={12}>
									<div className='relative h-96 w-full'>
										<AnimatePresence mode='wait'>
											<motion.img
												key={currentPhotoIndex}
												src={teamPhotos[currentPhotoIndex]}
												alt={`Наша команда ${currentPhotoIndex + 1}`}
												className='absolute inset-0 w-full h-full object-cover rounded-lg shadow-lg'
												variants={photoVariants}
												initial='enter'
												animate='center'
												exit='exit'
												transition={{ duration: 0.5 }}
											/>
										</AnimatePresence>

										<button
											onClick={prevPhoto}
											className='absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white transition-all z-10'
										>
											<LeftOutlined className='text-xl' />
										</button>

										<button
											onClick={nextPhoto}
											className='absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white transition-all z-10'
										>
											<RightOutlined className='text-xl' />
										</button>

										<div className='absolute bottom-4 left-0 right-0 flex justify-center gap-2'>
											{teamPhotos.map((_, index) => (
												<button
													key={index}
													onClick={() => setCurrentPhotoIndex(index)}
													className={`w-2 h-2 rounded-full transition-all ${
														index === currentPhotoIndex
															? 'bg-white w-4'
															: 'bg-white/50'
													}`}
												/>
											))}
										</div>
									</div>
								</Col>
								<Col xs={24} lg={12}>
									<HistorySection variants={itemVariants} />
								</Col>
							</Row>
						</motion.div>

						<PrinciplesSection />

						<MissionSection />

						<BrandCarousel />

						<CallToActionSection />
					</div>
				</motion.div>
				<Footer />
			</motion.div>
		</AnimatePresence>
	)
}

export default About
