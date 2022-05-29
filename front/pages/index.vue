<template>
  <div class="kkb-container">
    <VirtualList :listData="articles" :size="300">
      <div>ppp</div>
    </VirtualList>
  </div>
</template>

<script>
import VirtualList from '~/components/VirtualList'
export default {
  name: 'IndexPage',
  components: {
    VirtualList,
  },
  data() {
    return {
      articles: [
        {
          _id: 1,
          title: '吃饭1',
        },
        {
          _id: 2,
          title: '睡觉2',
        },
        {
          _id: 3,
          title: '吃饭3',
        },
        {
          _id: 4,
          title: '睡觉4',
        },
        {
          _id: 5,
          title: '吃饭5',
        },
        {
          _id: 6,
          title: '睡觉6',
        },
        {
          _id: 7,
          title: '吃饭7',
        },
        {
          _id: 8,
          title: '睡觉8',
        },
        {
          _id: 11,
          title: '吃饭11',
        },
        {
          _id: 12,
          title: '睡觉12',
        },
        {
          _id: 13,
          title: '吃饭13',
        },
        {
          _id: 14,
          title: '睡觉14',
        },
        {
          _id: 15,
          title: '吃饭15',
        },
        {
          _id: 16,
          title: '睡觉16',
        },
        {
          _id: 17,
          title: '吃饭17',
        },
        {
          _id: 18,
          title: '睡觉18',
        },
      ],
    }
  },
}
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
html {
  height: 100%;
}
body {
  height: 100%;
  margin: 0;
}
</style>
