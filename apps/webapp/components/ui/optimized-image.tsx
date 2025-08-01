import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
	src: string
	alt: string
	width?: number
	height?: number
	className?: string
	priority?: boolean
	fallbackSrc?: string
}

export function OptimizedImage({
	src,
	alt,
	width = 400,
	height = 300,
	className,
	priority = false,
	fallbackSrc = '/placeholder.png',
}: OptimizedImageProps) {
	const [imgSrc, setImgSrc] = useState(src)
	const [isLoading, setIsLoading] = useState(true)

	const handleError = () => {
		if (imgSrc !== fallbackSrc) {
			setImgSrc(fallbackSrc)
		}
	}

	const handleLoad = () => {
		setIsLoading(false)
	}

	return (
		<div className={cn('relative overflow-hidden', className)}>
			<Image
				src={imgSrc}
				alt={alt}
				width={width}
				height={height}
				className={cn('transition-opacity duration-300', isLoading ? 'opacity-0' : 'opacity-100')}
				priority={priority}
				onError={handleError}
				onLoad={handleLoad}
				sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
			/>
			{isLoading && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
		</div>
	)
}
