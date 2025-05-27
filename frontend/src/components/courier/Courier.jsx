import Header from '../home/Header'
import AsideBanner from '../home/AsideBanner'
import Section from '../home/Section'
import CourierApplicationForm from './CourierApplicationForm'
import Footer from '../home/Footer'

const Courier = () => {
	return (
		<div>
			<AsideBanner />
			<Header />
			<Section />
			<div className='mx-[15%]'>
				<CourierApplicationForm />
			</div>
			<Footer />
		</div>
	)
}

export default Courier
