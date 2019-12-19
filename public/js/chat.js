const socket = io()

const $messageForm = document.querySelector('form')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

const messageTemplate = document.getElementById('message-template').innerHTML
const locationMessageTemplate = document.getElementById('location-message-template').innerHTML
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
  const $newMessage = $messages.lastElementChild

  //message height
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom) + parseInt(newMessageStyles.marginTop)
  //offset height meaning without margin
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  console.log(newMessageHeight)
  //visible height
  const visibleHeight = $messages.offsetHeight

  //height off messages container
  const containerHeight = $messages.scrollHeight

  //distance scrolled from top
  const scrollOffset = $messages.scrollTop + visibleHeight

  if(scrollOffset >= containerHeight - newMessageHeight) {
    $messages.scrollTop = containerHeight
  }
}

socket.on('message', (msg) => {
  const html = Mustache.render(messageTemplate, {
    message: msg.text,
    username: msg.username,
    createdAt: moment(msg.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoScroll()
})

socket.on('locationMessage', (msg) => {
  const html = Mustache.render(locationMessageTemplate, {
    location: msg.text,
    username: msg.username,
    createdAt: moment(msg.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoScroll()
})

socket.on('roomData', ({room, users}) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  })
  document.getElementById('sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault()

  e.target.submit.setAttribute('disabled', 'disabled')

  socket.emit('message', e.target.message.value, (error) => {
    e.target.submit.removeAttribute('disabled')
    e.target.message.value = ''
    e.target.message.focus()
    if(error) {
      return console.log(error)
    }
    console.log('message was delivered')
  })
})

$locationButton.addEventListener('click', (e) => {
    e.preventDefault()
    if(!navigator.geolocation) {
      return alert('Geolocation is not supported by your browser.')
    }
    e.target.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
      socket.emit('location', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }, () => {
        e.target.removeAttribute('disabled')
        console.log('location shared!')
      })
    })
  })

socket.emit('join', { username, room }, (error) => {
  if(error) {
    alert(error)
    location.href = '/'
  }
})
