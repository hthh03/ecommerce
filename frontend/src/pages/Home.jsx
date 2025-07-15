import React from 'react'
import Hero from '../components/Hero'
import LastestCollection from '../components/LastestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import NewsletterBow from '../components/NewsletterBow'

const home = () => {
  return (
    <div>
      <Hero />
      <LastestCollection/>
      <BestSeller/>
      <OurPolicy/>
      <NewsletterBow/>
    </div>
  )
}

export default home