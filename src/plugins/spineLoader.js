import * as PIXI from 'pixi.js'
import '@pixi-spine/loader-3.8'
import { Spine } from '@pixi-spine/all-3.8'

const SPINE_PATHS = {
  linhThu: '/spine/linh-thu/shouling_jinhuamaoyao.json',
  linhbao: '/spine/linh-bao/160051.json',
  hentai: '/spine/hentai/hentai1.json'
}

const registerSpineParser = () => {
  try {
    if (PIXI.Assets) {
    } else {
    }
  } catch (error) {
  }
}

const preloadSpineAssets = async () => {
  try {
    const promises = [
      loadSpineResourceDirect(SPINE_PATHS.linhThu),
      loadSpineResourceDirect(SPINE_PATHS.linhbao)
    ]
    
    const results = await Promise.all(promises.map(p => p.catch(err => {
      return null
    })))
    
    if (results.some(result => result !== null)) {
      return true
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}

const loadSpineAsset = async (key) => {
  try {
    const path = SPINE_PATHS[key]
    if (!path) {
      throw new Error(`Không tìm thấy đường dẫn cho tài nguyên Spine: ${key}`)
    }
    
    return await loadSpineResourceDirect(path)
  } catch (error) {
    return null
  }
}

const loadSpineResourceDirect = async (jsonPath) => {
  return new Promise((resolve, reject) => {
    try {
      if (PIXI.Assets) {
        const atlasPath = jsonPath.replace('.json', '.atlas')
        
        PIXI.Assets.load([jsonPath, atlasPath])
          .then(resources => {
            if (resources && resources[jsonPath] && resources[jsonPath].spineData) {
              resolve(resources[jsonPath])
            } else {
              reject(new Error(`Không thể tải spine data từ ${jsonPath}`))
            }
          })
          .catch(error => {
            reject(error)
          })
      } else {
        reject(new Error('PIXI.Assets không tồn tại, vui lòng kiểm tra phiên bản PIXI.js'))
      }
    } catch (error) {
      reject(error)
    }
  })
}

const createSpineAnimation = (container, spineData, options = {}) => {
  const {
    x = 0,
    y = 0,
    scale = 1,
    animation = null,
    loop = true,
    skin = null,
    autoUpdate = true
  } = options

  try {
    const spine = new Spine(spineData)
    
    spine.position.set(x, y)
    spine.scale.set(scale, scale)
    
    if (skin && spine.skeleton.data.findSkin && spine.skeleton.data.findSkin(skin)) {
      spine.skeleton.setSkin(skin)
    }
    
    if (animation && spine.state.hasAnimation && spine.state.hasAnimation(animation)) {
      spine.state.setAnimation(0, animation, loop)
    }
    
    if (spine.autoUpdate !== undefined) {
      spine.autoUpdate = autoUpdate
    }
    
    container.addChild(spine)
    
    return spine
  } catch (error) {
    return null
  }
}

registerSpineParser()

export default {
  SPINE_PATHS,
  preloadSpineAssets,
  loadSpineAsset,
  loadSpineResourceDirect,
  createSpineAnimation
} 
