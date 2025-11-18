import Hero from '../components/Hero'
import LastestCollection from '../components/LastestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'

const home = () => {
  return (
    <div>
      <Hero />
      <LastestCollection/>
      <BestSeller/>
      <OurPolicy/>
    </div>
  )
}

export default home