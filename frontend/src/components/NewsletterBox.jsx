import React from 'react'

const NewsletterBow = () => {
  const onSubmitHandler = (event) => {
    event.preventDefault();
  }
  return (
    <div className='text-center'>
        <p className='text-2xl font-medium text-gray-800'> Subscribe now & enjoy <span className="text-pink-600">20% OFF</span> </p> <p className='text-gray-500 mt-3 max-w-xl mx-auto'> Join the <b>Flora Gems</b> community and be the first to know about our new collections, exclusive offers, and sparkling style tips delivered straight to your inbox. </p>
        <form onSubmit={onSubmitHandler} className='w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3'>
          <input className='w-full sm:flex-1 outline-none' type='email' placeholder='Enter your email' required/>
          <button type='submit' className='bg-black text-white text-xs px-10 py-4'> SUBSCRIBE </button>
        </form>
    </div>
  )
}

export default NewsletterBow
