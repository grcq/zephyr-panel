'use client';

import ConsoleContainer from "./console";
import { useParams } from "next/navigation";

export default function ConsoleView() {
    const { id } = useParams<{ id: string }>();
    if (!id) return null;

    return (
        <>
            <h1>Server</h1>
            <ConsoleContainer serverId={id} />
        </>
    )
}