export default function Fail() {
    return (
        <>
            <main className="w-dvw h-dvh flex flex-col items-center justify-center text-center space-y-6">
                <p className="text-6xl text-ctext-light">:(</p>
                <h1 className="text-2xl 1920p:text-4xl 2k:text-6xl text-wrap text-ctext-light">An error occured trying to link your account.</h1>
                <p className="text-gray-500/90 pb-40">Either try again, or contact the owners on Discord.</p>
            </main>
        </>
    );
}
