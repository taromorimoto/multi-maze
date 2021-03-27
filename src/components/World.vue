<template>
  <div id="world">
    <h3>Multi-Maze</h3>
    <div id="settings-button" @click.prevent="settingsExpanded = !settingsExpanded">⚙️</div>
    <div id="settings" :class="settingsExpanded ? 'expanded' : ''">
      <ul>
        <li>
          <button @click="restartGame">Restart Game</button>
        </li>
        <li>
          <input type="text" v-model="newUserName" placeholder="Name">
          <button @click="createUser">New player</button>
        </li>
        <li v-for="user in users">
          <input type="text" v-model="user.name" @blur="updateUser(user)">
          <!-- <input type="number" v-model="user.x">
          <input type="number" v-model="user.y"> -->
          <button v-if="user.id !== currentUserId" @click="() => selectPlayer(user.id)">Select player</button>
          <span v-if="user.id === currentUserId">Me!</span>
        </li>
      </ul>
    </div>
    <div
      id="map"
      ref="map"
      v-touch:swipe.left="onMoveLeft"
      v-touch:swipe.right="onMoveRight"
      v-touch:swipe.top="onMoveUp"
      v-touch:swipe.bottom="onMoveDown"
    >
      <div v-if="users.length > 0">
        <maze
          v-if="currentMap"
          :maze-data="deserializeMazeData(currentMap.mazeData)"
          :x-size="sizeX"
          :y-size="sizeY"
          @ready="mazeReady"
        />
        <div id="players">
          <player
            v-for="(user, i) in users"
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
import Vue from 'vue'

import { db } from '../firebase/db'
import config from '../config'

export default {
  name: 'app',
  data () {
    return {
      newUserName: '',
      users: [],
      currentUser: null,
      currentUserId: null,
      currentMap: null,
      currentMapId: 'default',
      maze: null,
      sizeX: 15,
      sizeY: 15,
      settingsExpanded: false,
    }
  },
  mounted () {
    const mapWidth = (this.sizeX * 2 + 1) * config.tileSize
    const mapHeight = (this.sizeY * 2 + 1) * config.tileSize
    const targetWidth = window.innerWidth > 700 ? 700 : window.innerWidth
    const scale = targetWidth / mapWidth
    this.$refs.map.style.transform = `scale(${scale})`
    this.$refs.map.style.width = `${targetWidth}px`
    this.$refs.map.style.height = `${mapHeight * scale}px`

    // document.body.addEventListener('touchmove', function(event) {
    //   event.preventDefault()
    // }, { passive: false })
    document.body.style.overflow = 'hidden'

    // ;['resize', 'orientationchange', 'scroll'].forEach(function(event) {
    //   window.addEventListener(event, function() {
    //     window.scrollTo(0, 0);
    //   });
    // })

    window.addEventListener('keydown', e => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          this.move(0, 1)
          break
        case 'ArrowUp':
          e.preventDefault()
          this.move(0, -1)
          break
        case 'ArrowLeft':
          e.preventDefault()
          this.move(-1, 0)
          break
        case 'ArrowRight':
          e.preventDefault()
          this.move(1, 0)
          break
      }
    })
  },
  updated () {
    if (!this.currentUser && this.users.length > 0) {
      const userId = localStorage.getItem('playerId')
      if (userId) {
        this.selectPlayer(userId)
      }
    }
  },
  methods: {
    getMapRef () {
      return db.collection('maps').doc('default')
    },
    getUsersRef () {
      return this.getMapRef().collection('users')
    },
    async createUser () {
      const userRef = await this.getUsersRef().add({
        name: this.newUserName,
        ...this.maze.entrancePos
      })
      this.newUserName = ''

      console.log('user create!', userRef.id)
      this.currentUserId = userRef.id
    },
    updateCurrentUser () {
      this.getUsersRef().doc(this.currentUser.id).update({...this.currentUser})
      // we can also use `$firestoreRefs.user` to refer to the bound user reference
      // this.$firestoreRefs.user.set(user)
    },
    updateUser (user) {
      this.getUsersRef().doc(user.id).update({...user})
    },
    move (directionX, directionY) {
      const nextX = this.currentUser.x + directionX
      const nextY = this.currentUser.y + directionY

      const tile = this.maze.getTile(nextX, nextY)
      // console.log(tile)

      // Out of bounds
      if (tile === false) {
        return
      }

      // Empty space
      if (tile === true) {
        this.currentUser.x = nextX
        this.currentUser.y = nextY
        this.updateCurrentUser()
        return
      }

      // Hit a wall
      if (tile.includes('wall')) {
        return
      }
    },
    mazeReady (maze) {
      this.maze = maze

      if (!this.currentMap.mazeData) {
        const mazeData = {
          maze: maze.maze,
          entrancePos: maze.entrancePos,
          exitPos: maze.exitPos,
        }
        try {
          db.collection('maps').doc(this.currentMapId).update({
            mazeData: JSON.stringify(mazeData)
          })
        } catch (err) {
          console.error('Failed to serialize maza data', mazeData, err)
        }
      }
    },
    restartGame () {
      this.users.forEach(user => {
        this.getUsersRef().doc(user.id).update({...this.maze.entrancePos})
      })
    },
    onMoveLeft () {
      this.move(-1, 0)
    },
    onMoveRight () {
      this.move(1, 0)
    },
    onMoveUp () {
      this.move(0, -1)
    },
    onMoveDown () {
      this.move(0, 1)
    },
    selectPlayer (userId) {
      this.currentUser = this.users.find(user => user.id === userId)
      this.currentUserId = userId
      localStorage.setItem('playerId', userId)
    },
    deserializeMazeData (serializedMazeData) {
      return serializedMazeData && JSON.parse(serializedMazeData)
    },
  },
  firestore: {
    currentMap: db.collection('maps').doc('default'),
    maps: db.collection('maps'),
    users: db.collection('maps').doc('default').collection('users'),
  },
}
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
