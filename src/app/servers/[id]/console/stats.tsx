import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatsContainerProps = {
    status: string;
    cpu: {
        usage: string;
        max: string;
    }
    memory: {
        usage: string;
        max: string;
    }
    disk: {
        usage: string;
        max: string;
    }
};

export default function StatsContainer({ status, cpu, memory, disk }: StatsContainerProps) {
    return (
        <div className="flex flex-col gap-2 min-w-64">
            <Card className="py-2">
                <CardContent className="flex flex-col gap-1">
                    <span className="font-medium text-xs opacity-70">Address</span>
                    <span className="text-xl font-bold">0.0.0.0:25565</span>
                </CardContent>
            </Card>
            <Card className="py-2">
                <CardContent className="flex flex-col gap-1">
                    <span className="font-medium text-xs opacity-70">Status</span>
                    <span className="text-xl font-bold">{status}</span>
                </CardContent>
            </Card>
            <Card className="py-2">
                <CardContent className="flex flex-col gap-1">
                    <span className="font-medium text-xs opacity-70">CPU</span>
                    <span className="text-xl font-bold">{cpu.usage} / {cpu.max}</span>
                </CardContent>
            </Card>
            <Card className="py-2">
                <CardContent className="flex flex-col gap-1">
                    <span className="font-medium text-xs opacity-70">Memory</span>
                    <span className="text-xl font-bold">{memory.usage} / {memory.max}</span>
                </CardContent>
            </Card>
            <Card className="py-2">
                <CardContent className="flex flex-col gap-1">
                    <span className="font-medium text-xs opacity-70">Disk</span>
                    <span className="text-xl font-bold">{disk.usage} / {disk.max}</span>
                </CardContent>
            </Card>
        </div>
    );
}