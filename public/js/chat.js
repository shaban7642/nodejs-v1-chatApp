const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormButton = $messageForm.querySelector('button')
const $messageFormInput = $messageForm.querySelector('input')
const $sendLocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $location = document.querySelector('#location')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username , room} = Qs.parse(location.search, {ignoreQueryPrefix: true})
const autoscroll = () => {
    // New messages element
    const $newMessage = $messages.lastElementChild

    // Height of new message
    const $newMessageStyles = getComputedStyle($newMessage)
    const $newMessageMargin = parseInt($newMessageStyles.marginBottom)
    const $newMessageHeight = $newMessage.offsetHeight + $newMessageMargin

    // Visible height
    const $visibleHeight = $messages.offsetHeight

    // Height of messages container
    const $containerHeight = $messages.scrollHeight

    // How far have i scrolled ?
    const $scrollOffset = $messages.scrollTop + $visibleHeight

    if($containerHeight - $newMessageHeight <= $scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message' , (message) => {
    const html = Mustache.render(messageTemplate, {
        username:message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    }) 
    $messages.insertAdjacentHTML('beforeend', html)

    console.log(message)

    autoscroll()
})

socket.on('locationMessage' , (message) => {
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    console.log(message)
    autoscroll()
})

socket.on('roomData' , ({room , users}) => {
    const html = Mustache.render(sidebarTemplate , {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit' , (e) => {
    e.preventDefault()

    const message = e.target.elements.message.value
    $messageFormButton.setAttribute('disabled' , 'disabled')

    socket.emit('sendMessage' , message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        
        if(error){
            return console.log(error)
        }
        
        console.log('the message was dilleverd!')
    })
})

$sendLocation.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('geolocation is not suported on your browser')
    }

    $sendLocation.setAttribute('disabled' , 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation' , {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
        }, () => {
            console.log('location shared!')
        })
        $sendLocation.removeAttribute('disabled')

    })
})

socket.emit('join' , {username , room} , (error) => {
    if (error){
        alert(error)
        location.href = '/'
    }
})


// socket.on('countUpdated' , (count) => {
//     console.log('const has been updated' , count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('clicked')
//     socket.emit('increment')
// })