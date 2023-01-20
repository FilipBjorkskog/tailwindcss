import './style.css'
import { supabase } from './supabase.js'

// Auth


//listen to auth events
supabase.auth.onAuthStateChange((event, session) => {
  const loginEl = document.querySelector("#login")
  const logoutEl = document.querySelector('#logout')
  const newTweetEl = document.querySelector("main > div")
  const deleteEl = document.querySelector("div > i")

  if (event == 'SIGNED_IN') {
    console.log('SIGNED_IN', session)
    
    //hide login
    loginEl.classList.add("hidden")

    //show logout
    document.querySelector("#logout > h2").innerText = session.user.email
    logoutEl.classList.remove("hidden")

    //show new tweet
    newTweetEl.classList.remove("hidden")

    deleteEl.classList.add("hidden")
  }

  if (event == "SIGNED_OUT") {
    //hide delete
    

    //hide login
    loginEl.classList.remove("hidden")

    //hide logout
    logoutEl.classList.add("hidden")

    //hide new tweet
    newTweetEl.classList.add("hidden")
  }
})

const form = document.querySelector("form")
form.addEventListener("submit", async function (event) {
  const email = form[0].value
  const password = form[1].value

  event.preventDefault()

  //Login
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    // if no account sign up
    if (signInError.message == 'Invalid login credentials') {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpData.user.id) {
        const { error } = await supabase
          .from('users')
          .insert({ username: signUpData.user.email })

          if(error) console.log(error)
      }

      if (signUpError.message = "User already registered") {
        alert(signUpError.message)
      } else {
        alert(signUpData.message)
      }
    }
  }
})

//sign out
const signOutButton = document.querySelector("#logout > button")

signOutButton.addEventListener("click", async function () {
  const { error } = await supabase.auth.signOut()

  if (error) console.log(error)
})

//Listen for changes to database table
supabase
  .channel('publictweets')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tweets' }, newTweet)
  .subscribe()

let newTweetCount = 0

function newTweet(e) {
  newTweetCount++

  const newTweetsEl = document.querySelector("#new-tweets")

  newTweetsEl.innerText = `Show ${newTweetCount} Tweets`
  newTweetsEl.classList.remove('hidden')
}

//Refresh feed
document.querySelector("#new-tweets").addEventListener("click", function () {
  document.querySelector('#new-tweets').classList.add('hidden')
  document.querySelector('ul').replaceChildren()
  newTweetCount = 0
  getTweets()
})

async function getTweets() {
  // Get data from database
  const { data, error } = await supabase
    .from('tweets')
    .select(`id,
    message,
    created_at,
    users (
     username
    )`
    ).order('created_at', { ascending: false })

  if (error) {
    console.log(error)
  }

  const listEl = document.querySelector('ul')

  const { data: user } = await supabase.auth.getSession()

  // Loop
  for (const i of data) {
    const itemEl = document.createElement('li')
    itemEl.classList.add(`flex`, `gap-4`, `border-b`, `pb-6`)

    itemEl.innerHTML = `
        <div class="w-14 h-14 rounded-full">
          <img
            src="logo.png"
            alt=""
          >
        </div>
        <div>
          <div class="flex gap-2 text-gray-500">
            <span class="font-semibold text-black">${i.users.username}</span>
            <span>${new Date(i.created_at).toLocaleString()}</span>
          </div>
          <p>${i.message}</p>

          <div class="flex items-center gap-2 mt-1">
            <i class="ph-trash text-xl text-blue-500 cursor-pointer ${i.users.username == user.session?.user.email ? '' : 'hidden'} hidden"></i>
          </div>
        </div>
       `

    listEl.appendChild(itemEl)
    // Delete tweet
    itemEl.addEventListener("click", async function () {
      const { error } = await supabase
        .from('tweets')
        .delete()
        .eq('id', i.id)

        // Delete element
        itemEl.remove()

        if(error) console.log(error)
    })
  }
}

getTweets();

// New twoot
document.querySelector("#tweet").addEventListener("click", async function () {
  const text = document.querySelector("textarea")

  const { data, error } = await supabase.auth.getSession()

  if (data.session.user.id) {

    const { error } = await supabase
      .from('tweets')
      .insert({ message: text.value })

    if (error) console.log(error)

    // CLeart finput
    text.value = ' '
  }
})