<template>
  <div id="world">
    <h3>Multi-Maze: {{ game.player?.name }}</h3>
    <div
      id="settings-button"
      @click.prevent="settingsExpanded = !settingsExpanded"
    >
      {{ settingsExpanded ? '❌' : '⚙️' }}
    </div>
    <div
      id="settings"
      :class="settingsExpanded ? 'expanded' : ''"
    >
      <ul>
        <li>
          <button @click="restartGame">
            Restart Game
          </button>
        </li>
        <li>
          <input
            v-model="newUserName"
            type="text"
            placeholder="Name"
          >
          <button @click="createUser">
            New player
          </button>
        </li>
        <li
          v-for="user in game.users"
          :key="user.id"
        >
          <input
            v-model="user.name"
            type="text"
            @blur="updateUser(user)"
          >
          <button
            v-if="user.id !== game.playerId"
            @click="() => selectPlayer(user.id)"
          >
            Select player
          </button>
          <span v-if="user.id === game.playerId">Me!</span>
        </li>
      </ul>
    </div>
    <div
      id="map"
      ref="map"
    >
      <div v-if="game.users.length > 0">
        <maze
          v-if="game.currentMap"
          :maze-data="deserializeMazeData(game.currentMap.mazeData)"
          :x-size="sizeX"
          :y-size="sizeY"
          @ready="mazeReady"
        />
        <div id="players">
          <player
            v-for="user in game.users"
            :key="user.id"
            :user="user"
            :x="user.x"
            :y="user.y"
          />
        </div>
      </div>
    </div>
    <controls
      @up="onMoveUp"
      @down="onMoveDown"
      @left="onMoveLeft"
      @right="onMoveRight"
    />
  </div>
</template>

<script>
import { defineComponent, onMounted, onUpdated, reactive, ref } from 'vue'

import { db } from '../firebase/db'
import config from '../config'

export default defineComponent({
  name: 'World',
  setup () {
    const map = ref(null)
    const newUserName = ref('')
    const game = reactive({
      users: [],
      player: null,
      playerId: null,
      currentMap: null,
      currentMapId: 'default',
      maze: null,
    })
    let sizeX = 15
    let sizeY = 15
    let settingsExpanded = ref(false)

    onMounted(() => {
      // Scale and fit map to screen.
      const mapWidth = (sizeX * 2 + 1) * config.tileSize
      const mapHeight = (sizeY * 2 + 1) * config.tileSize
      const targetWidth = window.innerWidth > 700 ? 700 : window.innerWidth
      const scale = targetWidth / mapWidth
      map.value.style.transform = `scale(${scale})`
      map.value.style.width = `${targetWidth}px`
      map.value.style.height = `${mapHeight * scale}px`

      window.addEventListener('keydown', e => {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault()
            move(0, 1)
            break
          case 'ArrowUp':
            e.preventDefault()
            move(0, -1)
            break
          case 'ArrowLeft':
            e.preventDefault()
            move(-1, 0)
            break
          case 'ArrowRight':
            e.preventDefault()
            move(1, 0)
            break
        }
      })

      // Sync map
      getMapRef().onSnapshot(snapshot => {
        game.currentMap = snapshot.data()
        game.currentMapId = game.currentMap.id
      })

      // Sync users
      getUsersRef().onSnapshot(snapshot => {
        game.users = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
      })
    })

    onUpdated(() => {
      // Set player from localStorage if not yet set.
      if (!game.player && game.users.length > 0) {
        const userId = localStorage.getItem('playerId')
        if (userId) {
          selectPlayer(userId)
        }
      }
    })

    function getMapRef () {
      return db.collection('games').doc('default')
    }

    function getUsersRef () {
      return getMapRef().collection('users')
    }

    async function createUser () {
      const userRef = await getUsersRef().add({
        name: newUserName.value,
        ...game.maze?.entrancePos,
      })
      newUserName.value = ''

      const user = await getUsersRef().doc(userRef.id).get()

      game.playerId = userRef.id
      game.player = {
        id: game.playerId,
        ...user?.data(),
      }
      localStorage.setItem('playerId', game.playerId)
      console.log('user created!', game.player)
    }

    function updatePlayer () {
      getUsersRef().doc(game.player.id).update({...game.player})
    }

    function updateUser (user) {
      getUsersRef().doc(user.id).update({...user})
    }

    function selectPlayer (userId) {
      game.player = game.users.find(user => user.id === userId)
      game.playerId = userId
      localStorage.setItem('playerId', userId)
    }

    function deserializeMazeData (serializedMazeData) {
      return serializedMazeData && JSON.parse(serializedMazeData)
    }

    function mazeReady (maze) {
      game.maze = maze

      if (!game.currentMap?.mazeData) {
        const mazeData = {
          maze: maze.maze,
          entrancePos: maze.entrancePos,
          exitPos: maze.exitPos,
        }

        try {
          db.collection('games').doc(game.currentMapId).set({
            mazeData: JSON.stringify(mazeData),
          })
        } catch (err) {
          console.error('Failed to serialize maza data', mazeData, err)
        }
      }
    }

    function restartGame () {
      game.users.forEach(user => {
        getUsersRef().doc(user.id).update({...game.maze.entrancePos})
      })
    }

    function move (directionX, directionY) {
      const nextX = game.player.x + directionX
      const nextY = game.player.y + directionY
      const tile = game.maze.getTile(nextX, nextY)

      // Out of bounds
      if (tile === false) {
        return
      }

      // Empty space
      if (tile === true) {
        game.player.x = nextX
        game.player.y = nextY
        updatePlayer()
        return
      }

      // Hit a wall
      if (tile.includes('wall')) {
        return
      }
    }

    function onMoveLeft () {
      move(-1, 0)
    }

    function onMoveRight () {
      move(1, 0)
    }

    function onMoveUp () {
      move(0, -1)
    }

    function onMoveDown () {
      move(0, 1)
    }

    return {
      map,
      game,
      newUserName,
      sizeX,
      sizeY,
      settingsExpanded,

      // Methods
      createUser,
      updateUser,
      selectPlayer,
      deserializeMazeData,
      mazeReady,
      onMoveLeft,
      onMoveRight,
      onMoveUp,
      onMoveDown,
      restartGame,
    }
  },
})
</script>

<style lang="scss">
#world {
  display: flex;
  flex-direction: column;
  align-items: center;
  -webkit-overflow-scrolling: touch;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

#map {
  position: relative;
  transform-origin: 0% 0%;
}

#players {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;
}

#settings-button {
  position: fixed;
  top: 0;
  right: 0;
  padding: 10px;
  font-size: 30px;
  cursor: pointer;
  z-index: 10;
}
#settings {
  display: none;

  &.expanded {
    display: block;
  }
}
</style>
