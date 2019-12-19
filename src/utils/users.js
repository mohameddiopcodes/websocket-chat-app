let users = []

const addUser = ({id, username, room}) => {
  if(!username) {
    username = 'Anonymous'
  } else if(!room) {
    return {
      error: 'Username and room are required.'
    }
  }

  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  const existingUser = users.find(user => {
    return user.username !== 'anonymous' && user.room === room && user.username === username
  })

  if(existingUser) {
    return {
      error: 'Username already taken.'
    }
  }

  const user = { id, username, room }
  users.push(user)
  return { user }
}

const removeUser = (id) => {
  const index = users.findIndex(user => user.id === id)
  if(index !== -1) {
    return { user: users.splice(index, 1)[0] }
  }
  return {
    error: 'No user found.'
  }
}

const getUser = (id) => {
  const user = users.find(user => user.id === id)
  if(user) {
    return user
  }
  return {
    error: 'No user found.'
  }
}

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase()
  const usersInRoom = users.filter(user => user.room === room)
  if(usersInRoom.length > 0) {
    return usersInRoom
  }
  return {
    error: 'No user found.'
  }
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}
