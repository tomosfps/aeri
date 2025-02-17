export function Card({ title, description, img }: { title: string, description: string, img: string }) {
  return (
    <div className="flex flex-col mb-4 mx-2 rounded-lg bg-white shadow-xl hover:border-pink-500 transition duration-300 border-2 border-transparent">
      <div className={`flex ${img ? 'flex-col md:flex-row-reverse' : ''} items-start w-full`}>
        <div className="p-4 w-full md:w-1/2 mt-4">
          <h2 className="text-xl font-bold mb-2">{title}</h2>
          <p className="text-base">{description}</p>
        </div>
        {img && (
          <img
            src={img}
            alt={title}
            className="w-full md:w-1/2 object-cover mt-4 md:mt-0 p-2 rounded-lg"
          />
        )}
      </div>
    </div>
  );
}