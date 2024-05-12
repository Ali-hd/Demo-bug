import Link from "next/link"

function HomePage(){
  return <div className="p-5">
      <h5 className="font-bold mb-3">Discover Categories</h5>
      <ul className="flex flex-col gap-2 font-medium">
        <li><Link href="/search/Appliances">Appliances</Link></li>
        <li><Link href="/search/Audio">Audio</Link></li>
        <li><Link href="/search/Cameras">Cameras</Link></li>
      </ul>
  </div>
}

export default HomePage