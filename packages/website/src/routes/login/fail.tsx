export default function Fail() {
    return (
        <>
            <main className="w-dvw h-dvh flex flex-col items-center justify-center text-center space-y-6">
                <p className="text-6xl">:(</p>
                <h1 className="text-2xl 1920p:text-4xl 2k:text-6xl text-wrap">An error occured trying to link your account.</h1>
                <p className="text-gray-600 pb-40">Either try again, or contact the owners on Discord.</p>
            </main>
        </>
    );
}
