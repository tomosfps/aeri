import { NavLink as Link } from "react-router-dom";

function App() {
    return (
        <main className="h-dvh w-dvw">

            {/* Hero */}
            <div className="h-max flex flex-col items-center bg-pink-50 mx-4 rounded-3xl p-4 space-y-8">
                <h1 className="text-4xl text-center font-bold mx-4 pt-12">The Only Anime Bot You Need</h1>
                <p className="text-center text-base mx-4">With a wide range of features, Aeri is the only bot you need for your server.</p>
                <img src="https://placehold.co/400x500" alt="Image Of Commands" className="rounded-2xl" />

                {/* Hero Buttons */}
                <div className="flex flex-row space-x-8">
                    <Link to="/" className="bg-blue-500 px-4 py-2 rounded-lg">Invite Aeri</Link>
                    <Link to="/" className="bg-blue-500 px-4 py-2 rounded-lg">Commands</Link>
                </div>

            </div>
            
        </main>
    );
}

export default App;
