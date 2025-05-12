import Header from '../home/Header'
import AsideBanner from '../home/AsideBanner'
import Section from '../home/Section'
import UserProfile from './UserProfile'
import Footer from '../home/Footer'
import ChangePassword from './ChangePassword'

const Profile = () => {
	return (
		<div>
			<AsideBanner />
			<Header />
			<Section />
			<div className='mx-[15%]'>
				<UserProfile />
				<ChangePassword />
			</div>
			<Footer />
		</div>
	)
}

export default Profile
