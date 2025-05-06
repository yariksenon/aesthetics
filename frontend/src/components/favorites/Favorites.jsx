import FavoritesList from './FavoritesList'
import Header from '../home/Header'
import AsideBanner from '../home/AsideBanner'
import Section from '../home/Section'
import Footer from '../home/Footer'

const Favorites = () => {
	return (
		<div>
			<AsideBanner />
			<Header />
			<Section />
			<div className='mx-[15%]'>
				<FavoritesList />
			</div>
			<Footer />
		</div>
	)
}

export default Favorites
