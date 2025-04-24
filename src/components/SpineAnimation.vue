<template>
  <div ref="container" class="spine-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as PIXI from 'pixi.js'
import '@pixi-spine/loader-3.8'
import { Spine } from '@pixi-spine/all-3.8'
import spineLoader from '../plugins/spineLoader'

const props = defineProps({
  jsonPath: {
    type: String,
    required: true
  },
  animation: {
    type: String,
    default: null
  },
  loop: {
    type: Boolean,
    default: true
  },
  autoUpdate: {
    type: Boolean,
    default: true
  },
  width: {
    type: Number,
    default: 200
  },
  height: {
    type: Number,
    default: 200
  },
  scale: {
    type: Number,
    default: 0.5
  }
})

const container = ref(null)
let app = null
let spineAnimation = null
let animationState = null

watch(() => props.jsonPath, () => {
  if (app) {
    destroyApp()
    setTimeout(() => {
      loadSpineAnimation()
    }, 100)
  }
}, { immediate: false })

const loadSpineAnimation = async () => {
  try {
    if (!container.value) {
      return
    }

    try {
      app = new PIXI.Application({
        width: props.width,
        height: props.height,
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
      })
      
      app.stage.sortableChildren = true;
      
      container.value.innerHTML = ''
      container.value.appendChild(app.view || app.canvas)
    } catch (error) {
      app = new PIXI.Application()
      await app.init({
        width: props.width,
        height: props.height,
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
      })
      
      app.stage.sortableChildren = true;
      
      container.value.innerHTML = ''
      container.value.appendChild(app.canvas || app.view)
    }
    
    try {
      const atlasPath = props.jsonPath.replace('.json', '.atlas')
      
      const resources = await PIXI.Assets.load([props.jsonPath, atlasPath])
      
      const resource = resources[props.jsonPath]
      
      if (!resource || !resource.spineData) {
        throw new Error('Không thể tải tài nguyên Spine hoặc không có spineData')
      }
      
      spineAnimation = new Spine(resource.spineData)
      
      spineAnimation.x = props.width / 2
      spineAnimation.y = props.height / 2
      
      spineAnimation.scale.set(props.scale, props.scale)
      
      app.stage.addChild(spineAnimation)
      
      animationState = spineAnimation.state
      
      const availableAnimations = []
      if (animationState.data && animationState.data.skeletonData && animationState.data.skeletonData.animations) {
        animationState.data.skeletonData.animations.forEach(anim => {
          availableAnimations.push(anim.name)
        })
      }
      
      if (props.animation && animationState.hasAnimation && animationState.hasAnimation(props.animation)) {
        animationState.setAnimation(0, props.animation, props.loop)
      } else if (animationState.data && 
                animationState.data.skeletonData && 
                animationState.data.skeletonData.animations && 
                animationState.data.skeletonData.animations.length > 0) {
        const firstAnimation = animationState.data.skeletonData.animations[0].name
        animationState.setAnimation(0, firstAnimation, props.loop)
      }
      
      if (spineAnimation.autoUpdate !== undefined) {
        spineAnimation.autoUpdate = props.autoUpdate
      }
    } catch (error) {
      throw error
    }
  } catch (error) {
  }
}

const destroyApp = () => {
  if (app) {
    try {
      if (spineAnimation && app.stage) {
        app.stage.removeChild(spineAnimation)
        spineAnimation = null
      }
      
      app.stop()
      
      app.destroy(true, { children: true, texture: true, baseTexture: true })
      
      if (container.value) {
        container.value.innerHTML = ''
      }
    } catch (error) {
    }
    
    app = null
    spineAnimation = null
    animationState = null
  }
}

watch(() => props.animation, (newAnimation) => {
  if (animationState && newAnimation && animationState.hasAnimation && animationState.hasAnimation(newAnimation)) {
    animationState.setAnimation(0, newAnimation, props.loop)
  }
})

onMounted(() => {
  setTimeout(() => {
    loadSpineAnimation()
  }, 100)
})

onBeforeUnmount(() => {
  destroyApp()
})

const createAnimation = (name, loop = true) => {
  if (animationState && animationState.hasAnimation && animationState.hasAnimation(name)) {
    return animationState.setAnimation(0, name, loop)
  }
  return null
}

const addAnimation = (name, loop = true, delay = 0) => {
  if (animationState && animationState.hasAnimation && animationState.hasAnimation(name)) {
    return animationState.addAnimation(0, name, loop, delay)
  }
  return null
}

const stopAnimation = () => {
  if (animationState && animationState.clearTracks) {
    animationState.clearTracks()
  }
}

defineExpose({
  createAnimation,
  addAnimation,
  stopAnimation
})
</script>

<style scoped>
.spine-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible !important;
}
</style> 