import './MissionSection.css'
import Mission from '../../assets/home/About/Mission.jpg'
import { FaCheck } from 'react-icons/fa' // Импортируем иконку галочки из react-icons

const MissionSection = () => {
	return (
		<div className='mission-overlap-container'>
			<div className='mission-text-block'>
				<div className='mission-items'>
					<div className='mission-item'>
						<h1 className='mission-title'>КАКОВА НАША МИССИЯ?</h1>
						<div className='mission-item-header flex items-center '>
							<FaCheck className='check-icon mr-2' /> Развивать успешный бизнес.
						</div>
						<p className='mission-item-text'>
							всегда предлагая клиентам оптимальный ассортимент качественных
							товаров для спорта и активного отдыха при оптимальном уровне
							сервиса в соответствии с изменяющимися потребностями клиентов.
						</p>
					</div>

					<div className='mission-item'>
						<div className='mission-item-header flex items-center'>
							<FaCheck className='check-icon mr-2' /> Способствовать
							оздоровлению нации.
						</div>
						<p className='mission-item-text'>
							продвигая ценности здорового образа жизни, спорта и активного
							отдыха, улучшая качество жизни наших клиентов.
						</p>
					</div>
				</div>
			</div>

			<div className='mission-image-block'>
				<img src={Mission} alt='Наша миссия' />
			</div>
		</div>
	)
}

export default MissionSection
