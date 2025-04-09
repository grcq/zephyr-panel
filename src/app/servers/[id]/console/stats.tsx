import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatsContainerProps = {
    serverId: string;
};

export default function StatsContainer({ serverId }: StatsContainerProps) {
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
                    <span className="text-xl font-bold">Running</span>
                </CardContent>
            </Card>
            <Card className="py-2">
                <CardContent className="flex flex-col gap-1">
                    <span className="font-medium text-xs opacity-70">CPU</span>
                    <span className="text-xl font-bold">2.7% / 100%</span>
                </CardContent>
            </Card>
            <Card className="py-2">
                <CardContent className="flex flex-col gap-1">
                    <span className="font-medium text-xs opacity-70">Memory</span>
                    <span className="text-xl font-bold">1.52 GB / 8 GB</span>
                </CardContent>
            </Card>
            <Card className="py-2">
                <CardContent className="flex flex-col gap-1">
                    <span className="font-medium text-xs opacity-70">Disk</span>
                    <span className="text-xl font-bold">1.42 GB / 20 GB</span>
                </CardContent>
            </Card>
        </div>
    );
}