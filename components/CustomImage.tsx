import Image, { ImageProps } from "next/image"
import { useState } from "react"

const CustomImage: React.FC<ImageProps> = ({
  src,
  alt,
  ...props
}) => {
  const [isImgLoaded, setIsImgLoaded] = useState(false)

  return (
    <>
      {isImgLoaded ? null : <div className="bg-gray-200 absolute animate-pulse w-full h-full" />}
      <Image
          {...props}
          className={`transition-opacity ${isImgLoaded ? 'opacity-1' : 'opacity-0'}`}
          src={src}
          alt={alt}
          onLoad={() => setIsImgLoaded(true)}
        />
    </>
  )
}

export default CustomImage
