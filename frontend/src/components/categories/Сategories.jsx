import AsideBanner from '../home/AsideBanner';
import Header from '../home/Header';
import Section from '../home/Section';
import Main from './Main';
import Footer from '../home/Footer';

export const VALID_CATEGORIES = [
  'new',
  'shoes',
  'clothes',
  'training',
  'beauty',
  'discounts',
  'hockey',
  'tennis',
  'rugby',
  'basketball',
  'running',
  'brand',
  'skiing',
  'volleyball',
  'gym',
  'diving',
  'football',
  'winter',
  'summer',
  'spring',
  'autumn',
];

export default function Categories() {
  return (
    <>
      <AsideBanner />
      <Header />
      <Section />
      <Main />
      <Footer />
    </>
  );
}