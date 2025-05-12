import Header from '../home/Header'
import AsideBanner from '../home/AsideBanner'
import Section from '../home/Section'
import CheckoutList from './CheckoutList'
import Footer from '../home/Footer'

const Checkout = () => {
	return (
		<div>
			<AsideBanner />
			<Header />
			<Section />
			<div className='mx-[15%]'>
				<CheckoutList />
			</div>
			<Footer />
		</div>
	)
}

export default Checkout
