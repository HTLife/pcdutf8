<template>
  <div>
    <div id="pointcloud_container" ref="pointcloud_container"/>
  </div>
</template>

<script>

import {
  Color,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  Float32BufferAttribute,
  VertexColors
} from 'three/build/three.module.js'

import Stats from 'three/examples/jsm/libs/stats.module.js'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader.js'

// import { gServerIP, gServerPort } from '../globalvariable.js'

export default {
  name: 'PCDViewer',
  data: function () {
    return {
      renderer: null,
      scene: null,
      camera: null,
      container: null,
      controls: null,
      stats: null,
      loader: null
      // isOpen: lodash.mapValues(windowState, 'isOpen'),
      // isOpen: lodash.mapValues(windowStateVisible, v => true)
    }
  },
  mounted () {
    this.init()
    this.animate()
  },
  methods: {

    init: function () {
      this.container = this.$refs.pointcloud_container

      this.scene = new Scene()
      this.scene.background = new Color(0x000000)
      this.camera = new PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.01, 1000)
      this.camera.position.x = 0
      this.camera.position.z = 200
      this.camera.up.set(0, 0, 1)
      this.scene.add(this.camera)
      this.renderer = new WebGLRenderer({ antialias: true })
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      // document.body.appendChild(this.renderer.domElement)
      this.loader = new PCDLoader()
      // ìmport pcd_file from 'raw-loader!./abc.pcd'

      this.container.appendChild(this.renderer.domElement)

      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      this.controls.target.set(0, 0, 0)
      this.controls.maxDistance = 4000
      this.controls.minDistance = 10
      this.controls.update()

      this.stats = new Stats()
      this.stats.domElement.style.position = 'absolute'// 'fixed' // absolute  relative
      this.stats.domElement.style.left = String(window.innerWidth - 80) + 'px'

      this.container.appendChild(this.stats.dom)

      window.addEventListener('resize', this.onWindowResize, false)
      window.addEventListener('keypress', this.keyboard)

      // this.showPCD('https://raw.githubusercontent.com/PointCloudLibrary/pcl/master/test/bunny.pcd')
      this.showPCD('http://localhost:3010/api/ascii')
      // this.showPCD('http://localhost:3010/api/pcd')
    },
    onWindowResize: function () {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.stats.domElement.style.left = String(window.innerWidth - 80) + 'px'
    },
    keyboard: function (ev) {
      var points = this.scene.getObjectByName('param?file=abc.pcd')
      switch (ev.key || String.fromCharCode(ev.keyCode || ev.charCode)) {
        case '+':
          points.material.size *= 1.2
          points.material.needsUpdate = true
          break
        case '-':
          points.material.size /= 1.2
          points.material.needsUpdate = true
          break
        case 'c':
          points.material.color.setHex(Math.random() * 0xffffff)
          points.material.needsUpdate = true
          break
      }
    },
    animate: function () {
      requestAnimationFrame(this.animate)
      this.controls.update()
      this.renderer.render(this.scene, this.camera)
      this.stats.update()
    },
    toggle () {
      const self = this
      for (const k of Object.keys(self.isOpen)) {
        self.isOpen[k] = !self.isOpen[k]
      }
    },
    hslToRgb: function (h, s, l) {
      var r, g, b

      if (s === 0) {
        r = g = b = l // achromatic
      } else {
        var hue2rgb = function hue2rgb (p, q, t) {
          if (t < 0) t += 1
          if (t > 1) t -= 1
          if (t < 1 / 6) return p + (q - p) * 6 * t
          if (t < 1 / 2) return q
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
          return p
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s
        var p = 2 * l - q
        r = hue2rgb(p, q, h + 1 / 3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1 / 3)
      }

      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
    },
    rgbToHsl: function (r, g, b) {
      r /= 255
      g /= 255
      b /= 255
      var max = Math.max(r, g, b); var min = Math.min(r, g, b)
      var h; var s; var l = (max + min) / 2

      if (max === min) {
        h = s = 0 // achromatic
      } else {
        var d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break
          case g: h = (b - r) / d + 2; break
          case b: h = (r - g) / d + 4; break
        }
        h /= 6
      }

      return [h, s, l]
    },
    loadPoint: function (points) {
      points.material.size = 0.1 // Set point size

      var maxZ = points.geometry.attributes.position.array[2]
      var minZ = maxZ

      // / Chnage color based on point z position
      const pointCount = points.geometry.attributes.position.count
      for (var i = 0; i < pointCount; i++) {
        var posZ = points.geometry.attributes.position.array[(i * 3) + 2]
        if (minZ > posZ) {
          minZ = posZ
        }
        if (maxZ < posZ) {
          maxZ = posZ
        }
      }
      // Compute LUT scaling to fit the full histogram spectrum
      var lutScale = 255.0 / (maxZ - minZ) // max is 255, min is 0

      if (minZ === maxZ) { // In case the cloud is flat on the chosen direction (x,y or z)
        lutScale = 1.0 // Avoid rounding error in boost
      }

      var color = []
      var colorR, colorG, colorB
      for (i = 0; i < pointCount; i++) {
        posZ = points.geometry.attributes.position.array[(i * 3) + 2]
        var value = Math.round((posZ - minZ) * lutScale)

        // Blue -> Green -> Red (~ rainbow)
        colorR = value > 128 ? (value - 128) * 2 : 0 // r[128] = 0, r[255] = 255
        colorG = value < 128 ? 2 * value : 255 - ((value - 128) * 2) // g[0] = 0, g[128] = 255, g[255] = 0
        colorB = value < 128 ? 255 - (2 * value) : 0 // b[0] = 255, b[128] = 0

        var h, l
        [h, , l] = this.rgbToHsl(colorR, colorG, colorB)
        var rgb = this.hslToRgb(h, 100, l)
        colorR = rgb[0]
        colorG = rgb[1]
        colorB = rgb[2]
        color.push(colorB / 255, colorG / 255, colorR / 255)
      }

      if (color.length > 0) {
        points.material.vertexColors = VertexColors
        points.geometry.addAttribute('color', new Float32BufferAttribute(color, 3))
      }

      this.scene.add(points)
      var center = points.geometry.boundingSphere.center
      this.controls.target.set(center.x, center.y, center.z)
      this.controls.update()
    },
    showPCD: function (pcdUrl) {
      console.log(this.loader)
      // 'https://raw.githubusercontent.com/PointCloudLibrary/pcl/master/test/bunny.pcd'
      console.log(pcdUrl)
      this.loader.load(pcdUrl, this.loadPoint)
    },
    test: function (val) {
      console.log(val)
    }
  }
}
</script>

<style>

#pointcloud_container{
  z-index: 0;
}

canvas {
  /* Let Three.js show in full screen */
  /* https://stackoverflow.com/questions/10425310/three-js-full-screen-issue */
  display: block; /* fix necessary to remove space at bottom of canvas */
}

</style>
