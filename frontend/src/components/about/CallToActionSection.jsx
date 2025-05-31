import { Card, Typography, Button } from 'antd'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const { Title, Paragraph } = Typography

const CallToActionSection = ({
	variants,
	title = 'ГОТОВЫ НАЧАТЬ?',
	description = 'Присоединяйтесь к нашему сообществу и откройте для себя мир эстетики и стиля',
	buttonText = 'В МАГАЗИН',
	buttonLink = '/',
}) => {
	return (
		<motion.div
			variants={variants}
			initial='hidden'
			whileInView='visible'
			viewport={{ once: true, margin: '-100px' }}
		>
			<Card
				className='text-center p-12 border-0 shadow-xl rounded-2xl overflow-hidden relative'
				style={{
					background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
					border: '1px solid rgba(255, 255, 255, 0.12)',
				}}
			>
				{/* Декоративные элементы */}
				<div className='absolute top-0 left-0 w-full h-full opacity-15 pointer-events-none'>
					<div className='absolute top-20 left-20 w-40 h-40 rounded-full bg-purple-500 blur-3xl'></div>
					<div className='absolute bottom-10 right-10 w-60 h-60 rounded-full bg-blue-500 blur-3xl'></div>
				</div>

				<Title
					level={2}
					className='mb-6 text-4xl font-bold'
					style={{
						color: '#ffffff',
						textShadow: '0 2px 10px rgba(255, 255, 255, 0.3)',
						letterSpacing: '1.5px',
					}}
				>
					{title}
				</Title>

				<Paragraph
					className='text-lg mb-8 max-w-2xl mx-auto text-gray-300 leading-relaxed'
					style={{
						fontSize: '1.1rem',
						textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
					}}
				>
					{description}
				</Paragraph>

				<motion.div
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					transition={{ type: 'spring', stiffness: 400, damping: 10 }}
				>
					<Link to={buttonLink}>
						<Button
							size='large'
							className='h-12 px-8 rounded-lg font-medium text-base border-none'
							style={{
								background: 'linear-gradient(90deg, #ffffff 0%, #e0e0e0 100%)',
								color: '#000000',
								boxShadow: '0 4px 20px rgba(255, 255, 255, 0.3)',
							}}
						>
							{buttonText}
						</Button>
					</Link>
				</motion.div>
			</Card>
		</motion.div>
	)
}

export default CallToActionSection
