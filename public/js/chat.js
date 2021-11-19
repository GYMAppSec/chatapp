const socket = io()


//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('#txtMsg')
const $messageFormButton = $messageForm.querySelector('#btnMsgSubmit')
const $messages = document.querySelector('#messages')

//Elements
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscoll = () => {

    const $newMessage = $messages.lastElementChild

    //height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages Container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }


}

socket.on('message', (msg) => {
    const html= Mustache.render(messageTemplate, {
        message: msg.text,
        username: msg.username,
        createdAt: moment(msg.createdAt).format('hh:mm:ss a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscoll()
})


socket.on('location', (location) => {
    const html= Mustache.render(locationTemplate, {
        location: location.text,
        username: location.username,
        createdAt: moment(location.createdAt).format('hh:mm:ss a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscoll()
})

socket.on('roomData', ({room, users}) => {

    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    
    $messageFormButton.setAttribute('disabled','disabled')
    const msgValue = $messageFormInput.value
    
    socket.emit('sendMessage', msgValue, (error) => {
        $messageFormButton.removeAttribute('disabled')
        if (error){
            return alert(error)
        }
    })

    $messageFormInput.value = ''
    $messageFormInput.focus()
})


const $sendLocBtn = document.querySelector('#send-location')
$sendLocBtn.addEventListener('click', (e) => {
    $sendLocBtn.setAttribute('disabled','disabled')
    if(!navigator.geolocation){
        return alert('Geolocation is not supporte by your browser.')
    }

    navigator.geolocation.getCurrentPosition ((position) => {
        socket.emit('senderLocation', {latitude: position.coords.latitude, longtitude: position.coords.longitude}, (ackMsg) => {
            $sendLocBtn.removeAttribute('disabled')
            console.log(ackMsg)
        })
    })
})

socket.emit('join', {username, room}, (error) => {
    if (error){
        alert(error)
        location.href = "/"
    }
})