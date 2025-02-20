import sad from "@/assets/sad.png";

export default function Fail() {
    return (
        <>
            <main className="w-dvw h-dvh flex flex-col items-center justify-center text-center">
                <img src={sad} alt="Sad Face" width={"200"} height={"200"} />
                <h1 className="text-2xl 1920p:text-4xl 2k:text-6xl text-wrap pb-40">An error occured trying to link your account.</h1>
            </main>
        </>
    );
}
