import Header from '../home/Header'
import Section from '../home/Section'
import UserProfile from './UserProfile'
import Footer from '../home/Footer'

const Profile = () => {
  return (
    <div>
        <Header />
        <Section />
            <div className="mx-[15%]">
            <UserProfile />
        </div>
        <Footer />
    </div>
);
};

export default Profile;