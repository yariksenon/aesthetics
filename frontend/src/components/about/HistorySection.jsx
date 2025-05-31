import { Typography } from 'antd'
import { motion } from 'framer-motion'

const { Title, Paragraph } = Typography

const HistorySection = ({ variants }) => {
	return (
		<motion.div variants={variants}>
			<Title level={2} className='mb-6'>
				ИСТОРИЯ
			</Title>
			<Paragraph className='text-lg mb-4 text-gray-700'>
				Aesthetic's Market был основан в 2025 году как небольшой проект
				энтузиастов моды и стиля.
			</Paragraph>
			<Paragraph className='text-lg mb-4 text-gray-700'>
				Сегодня мы - это команда профессионалов, объединённых общей страстью к
				эстетике и качеству.
			</Paragraph>
			<Paragraph className='text-lg text-gray-700'>
				Наш магазин стал местом, где каждый может найти уникальные вещи,
				отражающие его индивидуальность.
			</Paragraph>
		</motion.div>
	)
}

export default HistorySection
