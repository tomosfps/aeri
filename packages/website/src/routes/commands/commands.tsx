import { CommandLookup } from "@/components/ui/commandLookup";

export default function Commands() {
    return (
        <>
            <main className="w-screen h-max flex flex-col items-center justify-center text-center space-y-6">
                <CommandLookup />
            </main>
        </>
    );
}
