'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export const NetworkVisualization: React.FC = () => {
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!containerRef.current) return

		let isInitialized = false
		const container = containerRef.current
		const width = container.clientWidth
		const height = container.clientHeight

		if (container.childElementCount > 0) {
			isInitialized = true
		}

		if (!isInitialized) {
			const scene = new THREE.Scene()

			const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
			camera.position.z = 2

			const renderer = new THREE.WebGLRenderer({
				antialias: true,
				alpha: true,
			})
			renderer.setSize(width, height)
			renderer.setPixelRatio(window.devicePixelRatio)
			container.appendChild(renderer.domElement)

			const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
			const sphereMaterial = new THREE.MeshBasicMaterial({
				color: 0x6a0dad,
				wireframe: true,
				transparent: true,
				opacity: 0.6,
			})
			const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
			scene.add(sphere)

			const nodeCount = 30
			const nodes = new THREE.Group()
			const nodeObjects: THREE.Mesh[] = []

			for (let i = 0; i < nodeCount; i++) {
				const phi = Math.acos(-1 + (2 * i) / nodeCount)
				const theta = Math.sqrt(nodeCount * Math.PI) * phi

				const x = Math.sin(phi) * Math.cos(theta)
				const y = Math.sin(phi) * Math.sin(theta)
				const z = Math.cos(phi)

				const nodeGeometry = new THREE.SphereGeometry(0.02, 16, 16)
				const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
				const node = new THREE.Mesh(nodeGeometry, nodeMaterial)

				const radius = Math.random() > 0.85 ? 1.05 + Math.random() * 0.15 : 1.05
				node.position.set(x * radius, y * radius, z * radius)
				nodes.add(node)

				nodeObjects.push(node)
			}

			for (let i = 0; i < nodeObjects.length; i++) {
				const node = nodeObjects[i]
				const connectionCount = 2 + Math.floor(Math.random() * 2)

				for (let c = 0; c < connectionCount; c++) {
					const targetIndex = Math.floor(Math.random() * nodeObjects.length)
					if (targetIndex !== i) {
						const targetNode = nodeObjects[targetIndex]

						const lineGeometry = new THREE.BufferGeometry().setFromPoints([
							new THREE.Vector3(node.position.x, node.position.y, node.position.z),
							new THREE.Vector3(
								targetNode.position.x,
								targetNode.position.y,
								targetNode.position.z,
							),
						])

						const lineMaterial = new THREE.LineBasicMaterial({
							color: new THREE.Color(0xf0e6ff),
							transparent: true,
							opacity: 0.35,
						})

						const line = new THREE.Line(lineGeometry, lineMaterial)
						nodes.add(line)
					}
				}
			}

			scene.add(nodes)

			const animate = () => {
				requestAnimationFrame(animate)
				sphere.rotation.y += 0.002
				nodes.rotation.y += 0.002
				renderer.render(scene, camera)
			}

			animate()

			const handleResize = () => {
				const width = container.clientWidth
				const height = container.clientHeight
				camera.aspect = width / height
				camera.updateProjectionMatrix()
				renderer.setSize(width, height)
			}

			window.addEventListener('resize', handleResize)

			return () => {
				window.removeEventListener('resize', handleResize)
				if (container.firstChild) {
					container.removeChild(container.firstChild)
				}
			}
		}
	}, [])

	return <div ref={containerRef} className="w-full h-[300px] sm:h-[400px] md:h-[500px] relative" />
}

export default NetworkVisualization
